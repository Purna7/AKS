"""Enable Azure provider and test connection"""
import os
os.environ['FLASK_ENV'] = 'development'

from models import db, CloudProvider
from app import app
from cloud_connectors.azure_connector import AzureConnector

def enable_azure():
    with app.app_context():
        # Get Azure provider
        azure = CloudProvider.query.filter_by(name='Azure').first()
        if not azure:
            print("❌ Azure provider not found in database")
            return
        
        # Enable it
        azure.is_enabled = True
        azure.sync_status = 'ready'
        db.session.commit()
        print("✅ Azure provider enabled in database")
        
        # Test connection
        print("\n🔍 Testing Azure connection...")
        try:
            connector = AzureConnector(
                subscription_id=os.getenv('AZURE_SUBSCRIPTION_ID'),
                tenant_id=os.getenv('AZURE_TENANT_ID'),
                client_id=os.getenv('AZURE_CLIENT_ID'),
                client_secret=os.getenv('AZURE_CLIENT_SECRET')
            )
            
            success, message = connector.test_connection()
            if success:
                print(f"✅ {message}")
                
                # Try to get some resources
                print("\n📦 Fetching Azure resources...")
                vms = connector.get_virtual_machines()
                print(f"   Virtual Machines: {len(vms)}")
                
                storage = connector.get_storage_accounts()
                print(f"   Storage Accounts: {len(storage)}")
                
                vnets = connector.get_virtual_networks()
                print(f"   Virtual Networks: {len(vnets)}")
                
                azure.sync_status = 'success'
                azure.error_message = None
            else:
                print(f"❌ {message}")
                azure.sync_status = 'error'
                azure.error_message = message
            
            db.session.commit()
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            azure.sync_status = 'error'
            azure.error_message = str(e)
            db.session.commit()

if __name__ == '__main__':
    enable_azure()
