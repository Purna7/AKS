"""Simple runner for KloudwitKloud Manager without scheduler issues"""
import os
os.environ['FLASK_ENV'] = 'development'

from flask import Flask, render_template, jsonify
from models import db, User, CloudProvider, CloudResource, Alert
from config import config
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try importing cloud connectors
AWS_AVAILABLE = False
AZURE_AVAILABLE = False
GCP_AVAILABLE = False

try:
    from cloud_connectors.aws_connector import AWSConnector
    AWS_AVAILABLE = True
except Exception as e:
    logger.warning(f"AWS connector not available: {e}")

try:
    from cloud_connectors.azure_connector import AzureConnector
    AZURE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Azure connector not available: {e}")

try:
    from cloud_connectors.gcp_connector import GCPConnector
    GCP_AVAILABLE = True
except Exception as e:
    logger.warning(f"GCP connector not available: {e}")

app = Flask(__name__)
app.config.from_object(config['development'])
db.init_app(app)

# Simple in-memory cache for cost data
cost_cache = {
    'data': None,
    'timestamp': None,
    'ttl': 3600  # Cache for 1 hour
}

def init_db():
    """Initialize database"""
    with app.app_context():
        db.create_all()
        logger.info("Database initialized")
        
        # Create default admin user
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@kloudmanager.com',
                password_hash=generate_password_hash('admin123'),
                is_active=True,
                is_admin=True,
                created_at=datetime.utcnow()
            )
            db.session.add(admin)
            db.session.commit()
            logger.info("Default admin user created")
        
        # Create default providers
        for provider_name in ['AWS', 'Azure', 'GCP']:
            if not CloudProvider.query.filter_by(name=provider_name).first():
                provider = CloudProvider(
                    name=provider_name,
                    display_name=f'{provider_name} Cloud',
                    is_enabled=False,
                    sync_status='pending'
                )
                db.session.add(provider)
        db.session.commit()
        logger.info("Cloud providers initialized")

@app.route('/')
def index():
    """Dashboard homepage"""
    return render_template('dashboard.html')

@app.route('/api/dashboard/summary')
def dashboard_summary():
    """Get dashboard summary statistics - optimized for speed"""
    try:
        # Single query to get all resources at once
        all_resources = CloudResource.query.all()
        total_resources = len(all_resources)
        
        total_providers = CloudProvider.query.filter_by(is_enabled=True).count()
        total_alerts = Alert.query.filter_by(is_resolved=False).count()
        
        # Don't fetch cost data here - it's too slow
        # Cost will be fetched only when user visits Costs page
        total_cost = 0.0
        
        # Count everything in a single pass through resources
        vm_count = 0
        storage_count = 0
        network_count = 0
        database_count = 0
        running_count = 0
        stopped_count = 0
        provider_counts = {'azure': 0, 'aws': 0, 'gcp': 0}
        
        for resource in all_resources:
            # Count by type
            res_type = resource.resource_type
            if res_type == 'VM':
                vm_count += 1
            elif res_type == 'Storage':
                storage_count += 1
            elif res_type in ['Network', 'VNet', 'NSG', 'PublicIP', 'LoadBalancer']:
                network_count += 1
            elif res_type in ['SQLServer', 'SQLDatabase', 'Database']:
                database_count += 1
            
            # Count by status
            status_lower = (resource.status or '').lower()
            if status_lower in ['running', 'succeeded', 'active', 'available']:
                running_count += 1
            elif status_lower in ['stopped', 'deallocated', 'failed', 'unavailable']:
                stopped_count += 1
            
            # Count by provider (resource.provider is a relationship object)
            if resource.provider:
                provider_name = resource.provider.name.lower()
                if provider_name in provider_counts:
                    provider_counts[provider_name] += 1
        
        return jsonify({
            'success': True,
            'data': {
                'total_resources': total_resources,
                'total_providers': total_providers,
                'total_alerts': total_alerts,
                'alerts_count': total_alerts,
                'total_cost': total_cost,
                'total_cost_30d': total_cost,
                'resource_counts': {
                    'vms': vm_count,
                    'storage': storage_count,
                    'networks': network_count,
                    'databases': database_count
                },
                'status_counts': {
                    'running': running_count,
                    'stopped': stopped_count
                },
                'provider_counts': provider_counts
            }
        })
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/providers')
def get_providers():
    """Get all cloud providers"""
    try:
        providers = CloudProvider.query.all()
        return jsonify({
            'success': True,
            'providers': [{
                'id': p.id,
                'name': p.name,
                'display_name': p.display_name,
                'is_enabled': p.is_enabled,
                'sync_status': p.sync_status,
                'last_sync': p.last_sync.isoformat() if p.last_sync else None
            } for p in providers]
        })
    except Exception as e:
        logger.error(f"Error getting providers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resources')
def get_resources():
    """Get cloud resources"""
    try:
        from flask import request
        
        # Get filter parameter
        resource_type = request.args.get('type')
        
        # Build query
        query = CloudResource.query
        if resource_type and resource_type != 'all':
            query = query.filter_by(resource_type=resource_type)
        
        resources = query.all()
        
        return jsonify({
            'success': True,
            'resources': [{
                'id': r.id,
                'name': r.name,
                'resource_type': r.resource_type,
                'type': r.resource_type,
                'status': r.status,
                'provider': r.provider.name if r.provider else 'Unknown',
                'region': r.region or 'N/A',
                'size': r.size or 'N/A',
                'last_updated': r.last_updated.isoformat() if r.last_updated else None
            } for r in resources]
        })
    except Exception as e:
        logger.error(f"Error getting resources: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/alerts')
def get_alerts():
    """Get system alerts"""
    try:
        alerts = Alert.query.filter_by(is_resolved=False).order_by(Alert.created_at.desc()).limit(10).all()
        return jsonify({
            'success': True,
            'alerts': [{
                'id': a.id,
                'severity': a.severity,
                'title': a.title,
                'message': a.message,
                'created_at': a.created_at.isoformat() if a.created_at else None
            } for a in alerts]
        })
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/costs')
def get_costs():
    """Get cost data"""
    return jsonify({
        'success': True,
        'costs': []  # Placeholder
    })

@app.route('/api/test-connection/<provider_name>')
def test_connection(provider_name):
    """Test connection to a cloud provider"""
    try:
        if provider_name.upper() == 'AWS' and AWS_AVAILABLE:
            connector = AWSConnector(
                app.config['AWS_ACCESS_KEY_ID'],
                app.config['AWS_SECRET_ACCESS_KEY'],
                app.config['AWS_DEFAULT_REGION']
            )
        elif provider_name.upper() == 'AZURE' and AZURE_AVAILABLE:
            connector = AzureConnector(
                app.config['AZURE_SUBSCRIPTION_ID'],
                app.config['AZURE_TENANT_ID'],
                app.config['AZURE_CLIENT_ID'],
                app.config['AZURE_CLIENT_SECRET']
            )
        elif provider_name.upper() == 'GCP' and GCP_AVAILABLE:
            connector = GCPConnector(
                app.config['GCP_PROJECT_ID'],
                app.config.get('GCP_SERVICE_ACCOUNT_FILE')
            )
        elif not AWS_AVAILABLE and provider_name.upper() == 'AWS':
            return jsonify({'success': False, 'error': 'AWS connector not available'}), 503
        elif not AZURE_AVAILABLE and provider_name.upper() == 'AZURE':
            return jsonify({'success': False, 'error': 'Azure connector not available'}), 503
        elif not GCP_AVAILABLE and provider_name.upper() == 'GCP':
            return jsonify({'success': False, 'error': 'GCP connector not available'}), 503
        else:
            return jsonify({'success': False, 'error': f'Unknown provider: {provider_name}'}), 400
        
        # Test connection
        success, message = connector.test_connection()
        return jsonify({
            'success': success,
            'message': message
        })
    
    except Exception as e:
        logger.error(f"Error testing connection: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/compliance')
def get_compliance():
    """Get non-compliant resources from all enabled providers"""
    try:
        all_non_compliant = []
        
        # Get Azure non-compliant resources
        azure_provider = CloudProvider.query.filter_by(name='Azure', is_enabled=True).first()
        if azure_provider and AZURE_AVAILABLE:
            try:
                connector = AzureConnector(
                    app.config['AZURE_SUBSCRIPTION_ID'],
                    app.config['AZURE_TENANT_ID'],
                    app.config['AZURE_CLIENT_ID'],
                    app.config['AZURE_CLIENT_SECRET']
                )
                azure_non_compliant = connector.get_non_compliant_resources()
                for resource in azure_non_compliant:
                    resource['provider'] = 'Azure'
                all_non_compliant.extend(azure_non_compliant)
            except Exception as e:
                logger.error(f"Error fetching Azure compliance data: {e}")
        
        return jsonify({
            'success': True,
            'non_compliant_resources': all_non_compliant,
            'total_count': len(all_non_compliant)
        })
    
    except Exception as e:
        logger.error(f"Error fetching compliance data: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/costs/last-30-days')
def get_costs_last_30_days():
    """Get cost data for the last 30 days from all enabled providers - with caching"""
    try:
        # Check cache first
        current_time = time.time()
        if cost_cache['data'] and cost_cache['timestamp']:
            if (current_time - cost_cache['timestamp']) < cost_cache['ttl']:
                logger.info("Returning cached cost data")
                return jsonify({
                    'success': True,
                    'costs': cost_cache['data'],
                    'cached': True
                })
        
        logger.info("Fetching fresh cost data from Azure (this may take a moment...)")
        
        all_costs = {
            'total_cost': 0.0,
            'currency': 'USD',
            'cost_by_resource': [],
            'cost_by_service': [],
            'daily_costs': [],
            'cost_by_provider': []
        }
        
        # Get Azure costs
        azure_provider = CloudProvider.query.filter_by(name='Azure', is_enabled=True).first()
        if azure_provider and AZURE_AVAILABLE:
            try:
                connector = AzureConnector(
                    app.config['AZURE_SUBSCRIPTION_ID'],
                    app.config['AZURE_TENANT_ID'],
                    app.config['AZURE_CLIENT_ID'],
                    app.config['AZURE_CLIENT_SECRET']
                )
                azure_costs = connector.get_cost_data_last_30_days()
                
                all_costs['total_cost'] += azure_costs.get('total_cost', 0.0)
                all_costs['cost_by_resource'].extend(azure_costs.get('cost_by_resource', []))
                all_costs['cost_by_service'].extend(azure_costs.get('cost_by_service', []))
                
                # Merge daily costs
                for daily in azure_costs.get('daily_costs', []):
                    existing = next((d for d in all_costs['daily_costs'] if d['date'] == daily['date']), None)
                    if existing:
                        existing['cost'] += daily['cost']
                    else:
                        all_costs['daily_costs'].append(daily)
                
                all_costs['cost_by_provider'].append({
                    'provider': 'Azure',
                    'cost': azure_costs.get('total_cost', 0.0)
                })
                
                all_costs['period_start'] = azure_costs.get('period_start')
                all_costs['period_end'] = azure_costs.get('period_end')
            except Exception as e:
                logger.error(f"Error fetching Azure cost data: {e}")
        
        # Sort daily costs by date
        all_costs['daily_costs'].sort(key=lambda x: x['date'])
        
        # Round total cost
        all_costs['total_cost'] = round(all_costs['total_cost'], 2)
        
        # Update cache
        cost_cache['data'] = all_costs
        cost_cache['timestamp'] = current_time
        logger.info(f"Cost data cached for {cost_cache['ttl']} seconds")
        
        return jsonify({
            'success': True,
            'costs': all_costs,
            'cached': False
        })
    
    except Exception as e:
        logger.error(f"Error fetching cost data: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    logger.info("Starting Flask application on http://localhost:5000")
    
    # Use waitress for better Windows compatibility
    from waitress import serve
    print("\n" + "="*60)
    print("KloudwitKloud Manager is running!")
    print("="*60)
    print("  Dashboard: http://localhost:5000")
    print("  Username:  admin")
    print("  Password:  admin123")
    print("="*60 + "\n")
    serve(app, host='0.0.0.0', port=5000, threads=4)
