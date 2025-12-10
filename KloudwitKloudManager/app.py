from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from models import db, User, CloudProvider, CloudResource, ResourceMetric, CostRecord, Alert, AuditLog
from config import config
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Optional cloud connector imports
try:
    from cloud_connectors.aws_connector import AWSConnector
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    logger.warning("AWS connector not available")

try:
    from cloud_connectors.azure_connector import AzureConnector
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logger.warning("Azure connector not available")

try:
    from cloud_connectors.gcp_connector import GCPConnector
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False
    logger.warning("GCP connector not available")

app = Flask(__name__)
app.config.from_object(config[os.getenv('FLASK_ENV', 'development')])
CORS(app)

# Initialize database
db.init_app(app)

# Scheduler for background tasks
scheduler = BackgroundScheduler()

def init_database():
    """Initialize database with tables"""
    with app.app_context():
        db.create_all()
        logger.info("Database initialized")
        
        # Create default admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@kloudmanager.com',
                is_admin=True
            )
            admin.set_password('admin123')  # Change in production!
            db.session.add(admin)
            db.session.commit()
            logger.info("Default admin user created")

def sync_cloud_resources():
    """Background task to sync cloud resources"""
    with app.app_context():
        logger.info("Starting cloud resources sync...")
        providers = CloudProvider.query.filter_by(is_enabled=True).all()
        
        for provider in providers:
            try:
                provider.sync_status = 'in_progress'
                db.session.commit()
                
                resources = []
                if provider.name == 'AWS' and AWS_AVAILABLE:
                    connector = AWSConnector(
                        app.config['AWS_ACCESS_KEY_ID'],
                        app.config['AWS_SECRET_ACCESS_KEY'],
                        provider.region or app.config['AWS_DEFAULT_REGION']
                    )
                    resources = connector.get_all_resources()
                elif provider.name == 'Azure' and AZURE_AVAILABLE:
                    connector = AzureConnector(
                        app.config['AZURE_SUBSCRIPTION_ID'],
                        app.config['AZURE_TENANT_ID'],
                        app.config['AZURE_CLIENT_ID'],
                        app.config['AZURE_CLIENT_SECRET']
                    )
                    resources = connector.get_all_resources()
                elif provider.name == 'GCP' and GCP_AVAILABLE:
                    connector = GCPConnector(
                        app.config['GCP_PROJECT_ID'],
                        app.config.get('GCP_SERVICE_ACCOUNT_FILE')
                    )
                    resources = connector.get_all_resources()
                
                # Update resources in database
                for resource_data in resources:
                    resource = CloudResource.query.filter_by(
                        provider_id=provider.id,
                        resource_id=resource_data['resource_id']
                    ).first()
                    
                    if resource:
                        # Update existing resource
                        resource.name = resource_data['name']
                        resource.status = resource_data['status']
                        resource.size = resource_data['size']
                        resource.tags = resource_data['tags']
                        resource.metadata = resource_data['metadata']
                    else:
                        # Create new resource
                        resource = CloudResource(
                            provider_id=provider.id,
                            **resource_data
                        )
                        db.session.add(resource)
                
                provider.sync_status = 'success'
                provider.last_sync = datetime.utcnow()
                provider.error_message = None
                
            except Exception as e:
                logger.error(f"Error syncing {provider.name}: {e}")
                provider.sync_status = 'failed'
                provider.error_message = str(e)
            
            finally:
                db.session.commit()
        
        logger.info("Cloud resources sync completed")

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('dashboard.html')

@app.route('/api/dashboard/summary')
def get_dashboard_summary():
    """Get dashboard summary statistics"""
    try:
        providers = CloudProvider.query.filter_by(is_enabled=True).all()
        resources = CloudResource.query.all()
        
        # Count resources by type
        vms = CloudResource.query.filter_by(resource_type='VM').count()
        storage = CloudResource.query.filter_by(resource_type='Storage').count()
        networks = CloudResource.query.filter_by(resource_type='Network').count()
        databases = CloudResource.query.filter_by(resource_type='Database').count()
        
        # Count by status
        running = CloudResource.query.filter_by(status='running').count()
        stopped = CloudResource.query.filter(CloudResource.status.in_(['stopped', 'deallocated'])).count()
        
        # Count by provider
        provider_counts = {}
        for provider in providers:
            count = CloudResource.query.filter_by(provider_id=provider.id).count()
            provider_counts[provider.name] = count
        
        # Recent alerts
        recent_alerts = Alert.query.filter_by(is_resolved=False).order_by(Alert.created_at.desc()).limit(5).all()
        
        # Costs (last 30 days)
        thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
        total_cost = db.session.query(db.func.sum(CostRecord.cost)).filter(
            CostRecord.date >= thirty_days_ago
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'total_resources': len(resources),
                'total_providers': len(providers),
                'resource_counts': {
                    'vms': vms,
                    'storage': storage,
                    'networks': networks,
                    'databases': databases
                },
                'status_counts': {
                    'running': running,
                    'stopped': stopped
                },
                'provider_counts': provider_counts,
                'total_cost_30d': round(total_cost, 2),
                'alerts_count': len(recent_alerts),
                'last_sync': max([p.last_sync for p in providers if p.last_sync], default=None).isoformat() if any(p.last_sync for p in providers) else None
            }
        })
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/providers')
def get_providers():
    """Get all cloud providers"""
    try:
        providers = CloudProvider.query.all()
        return jsonify({
            'success': True,
            'data': [{
                'id': p.id,
                'name': p.name,
                'display_name': p.display_name,
                'is_enabled': p.is_enabled,
                'region': p.region,
                'last_sync': p.last_sync.isoformat() if p.last_sync else None,
                'sync_status': p.sync_status
            } for p in providers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resources')
def get_resources():
    """Get all cloud resources"""
    try:
        provider_id = request.args.get('provider_id', type=int)
        resource_type = request.args.get('type')
        
        query = CloudResource.query
        if provider_id:
            query = query.filter_by(provider_id=provider_id)
        if resource_type:
            query = query.filter_by(resource_type=resource_type)
        
        resources = query.order_by(CloudResource.name).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': r.id,
                'provider': r.provider.name,
                'resource_id': r.resource_id,
                'resource_type': r.resource_type,
                'name': r.name,
                'region': r.region,
                'status': r.status,
                'size': r.size,
                'tags': r.tags,
                'metadata': r.metadata,
                'last_updated': r.last_updated.isoformat()
            } for r in resources]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/alerts')
def get_alerts():
    """Get system alerts"""
    try:
        unresolved_only = request.args.get('unresolved', 'false').lower() == 'true'
        
        query = Alert.query
        if unresolved_only:
            query = query.filter_by(is_resolved=False)
        
        alerts = query.order_by(Alert.created_at.desc()).limit(50).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': a.id,
                'severity': a.severity,
                'alert_type': a.alert_type,
                'title': a.title,
                'message': a.message,
                'is_resolved': a.is_resolved,
                'created_at': a.created_at.isoformat()
            } for a in alerts]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/costs')
def get_costs():
    """Get cost data"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        costs = CostRecord.query.filter(CostRecord.date >= start_date).order_by(CostRecord.date).all()
        
        # Aggregate by date
        daily_costs = {}
        for cost in costs:
            date_str = cost.date.isoformat()
            if date_str not in daily_costs:
                daily_costs[date_str] = 0
            daily_costs[date_str] += cost.cost
        
        return jsonify({
            'success': True,
            'data': [{'date': date, 'cost': round(cost, 2)} for date, cost in daily_costs.items()]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync', methods=['POST'])
def trigger_sync():
    """Manually trigger cloud resources sync"""
    try:
        sync_cloud_resources()
        return jsonify({'success': True, 'message': 'Sync triggered successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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
            return jsonify({'success': False, 'error': 'Invalid provider name'}), 400
        
        success, message = connector.test_connection()
        return jsonify({'success': success, 'message': message})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    init_database()
    
    # Initialize default providers
    with app.app_context():
        for provider_name in ['AWS', 'Azure', 'GCP']:
            if not CloudProvider.query.filter_by(name=provider_name).first():
                provider = CloudProvider(
                    name=provider_name,
                    display_name=f"{provider_name} Cloud",
                    is_enabled=False,
                    sync_status='pending'
                )
                db.session.add(provider)
        db.session.commit()
    
    # Schedule background sync
    scheduler.add_job(
        func=sync_cloud_resources,
        trigger='interval',
        seconds=app.config['REFRESH_INTERVAL']
    )
    scheduler.start()
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
