import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from cloud_connectors.azure_connector import AzureConnector
    
    connector = AzureConnector(
        os.getenv('AZURE_SUBSCRIPTION_ID'),
        os.getenv('AZURE_TENANT_ID'),
        os.getenv('AZURE_CLIENT_ID'),
        os.getenv('AZURE_CLIENT_SECRET')
    )
    
    success, message = connector.test_connection()
    
    if success:
        print('SUCCESS')
    else:
        print(f'FAILED: {message}')
        
except Exception as e:
    print(f'ERROR: {str(e)}')
