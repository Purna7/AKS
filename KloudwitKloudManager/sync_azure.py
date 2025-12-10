"""Sync Azure resources to database"""
import os
os.environ['FLASK_ENV'] = 'development'

from models import db, CloudProvider, CloudResource
from app import app
from cloud_connectors.azure_connector import AzureConnector
from datetime import datetime

def sync_azure_resources():
    with app.app_context():
        # Get Azure provider
        azure = CloudProvider.query.filter_by(name='Azure').first()
        if not azure or not azure.is_enabled:
            print("❌ Azure provider not enabled")
            return
        
        print(f"🔄 Syncing Azure resources...")
        azure.sync_status = 'in_progress'
        azure.last_sync = datetime.utcnow()
        db.session.commit()
        
        try:
            # Initialize connector
            connector = AzureConnector(
                subscription_id=os.getenv('AZURE_SUBSCRIPTION_ID'),
                tenant_id=os.getenv('AZURE_TENANT_ID'),
                client_id=os.getenv('AZURE_CLIENT_ID'),
                client_secret=os.getenv('AZURE_CLIENT_SECRET')
            )
            
            # Get all resources
            resources = connector.get_all_resources()
            print(f"📦 Found {len(resources)} resources")
            
            # Clear old Azure resources
            CloudResource.query.filter_by(provider_id=azure.id).delete()
            
            # Add new resources
            for resource_data in resources:
                resource = CloudResource(
                    provider_id=azure.id,
                    resource_id=resource_data['resource_id'],
                    resource_type=resource_data['resource_type'],
                    name=resource_data['name'],
                    region=resource_data['region'],
                    status=resource_data['status'],
                    size=resource_data.get('size'),
                    tags=resource_data.get('tags'),
                    resource_metadata=resource_data.get('metadata')
                )
                db.session.add(resource)
                print(f"   ✅ {resource_data['resource_type']}: {resource_data['name']}")
            
            azure.sync_status = 'success'
            azure.error_message = None
            db.session.commit()
            
            print(f"\n✅ Successfully synced {len(resources)} Azure resources to database")
            
        except Exception as e:
            print(f"❌ Error syncing resources: {str(e)}")
            azure.sync_status = 'error'
            azure.error_message = str(e)
            db.session.commit()

if __name__ == '__main__':
    sync_azure_resources()
