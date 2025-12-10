from google.cloud import compute_v1, storage
from google.auth import default
from google.auth.exceptions import DefaultCredentialsError
import os
import logging

logger = logging.getLogger(__name__)

class GCPConnector:
    """GCP Cloud Connector"""
    
    def __init__(self, project_id, service_account_file=None):
        self.project_id = project_id
        self.service_account_file = service_account_file
        self._setup_credentials()
    
    def _setup_credentials(self):
        """Setup GCP credentials"""
        try:
            if self.service_account_file and os.path.exists(self.service_account_file):
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.service_account_file
        except Exception as e:
            logger.error(f"Failed to setup GCP credentials: {e}")
    
    def test_connection(self):
        """Test GCP connection"""
        try:
            credentials, project = default()
            return True, f"Connected to project {self.project_id}"
        except DefaultCredentialsError:
            return False, "GCP credentials not found or invalid"
        except Exception as e:
            return False, f"GCP connection failed: {e}"
    
    def get_compute_instances(self):
        """Get all Compute Engine instances"""
        instances = []
        try:
            instance_client = compute_v1.InstancesClient()
            
            # Get list of zones
            zones_client = compute_v1.ZonesClient()
            zones_request = compute_v1.ListZonesRequest(project=self.project_id)
            zones = zones_client.list(request=zones_request)
            
            for zone in zones:
                try:
                    request = compute_v1.ListInstancesRequest(
                        project=self.project_id,
                        zone=zone.name
                    )
                    
                    for instance in instance_client.list(request=request):
                        instances.append({
                            'resource_id': str(instance.id),
                            'resource_type': 'VM',
                            'name': instance.name,
                            'region': zone.name,
                            'status': instance.status,
                            'size': instance.machine_type.split('/')[-1] if instance.machine_type else 'unknown',
                            'tags': {label.key: label.value for label in instance.labels.items()} if instance.labels else {},
                            'metadata': {
                                'zone': zone.name,
                                'self_link': instance.self_link,
                                'creation_timestamp': instance.creation_timestamp
                            }
                        })
                except Exception as e:
                    logger.warning(f"Error fetching instances in zone {zone.name}: {e}")
        except Exception as e:
            logger.error(f"Error fetching GCP Compute instances: {e}")
        
        return instances
    
    def get_storage_buckets(self):
        """Get all Cloud Storage buckets"""
        buckets = []
        try:
            storage_client = storage.Client(project=self.project_id)
            
            for bucket in storage_client.list_buckets():
                buckets.append({
                    'resource_id': bucket.name,
                    'resource_type': 'Storage',
                    'name': bucket.name,
                    'region': bucket.location,
                    'status': 'active',
                    'size': bucket.storage_class,
                    'tags': bucket.labels or {},
                    'metadata': {
                        'storage_class': bucket.storage_class,
                        'time_created': bucket.time_created.isoformat() if bucket.time_created else None,
                        'versioning_enabled': bucket.versioning_enabled
                    }
                })
        except Exception as e:
            logger.error(f"Error fetching GCP Storage buckets: {e}")
        
        return buckets
    
    def get_networks(self):
        """Get all VPC networks"""
        networks = []
        try:
            networks_client = compute_v1.NetworksClient()
            request = compute_v1.ListNetworksRequest(project=self.project_id)
            
            for network in networks_client.list(request=request):
                networks.append({
                    'resource_id': str(network.id),
                    'resource_type': 'Network',
                    'name': network.name,
                    'region': 'global',
                    'status': 'active',
                    'size': network.i_pv4_range if network.i_pv4_range else 'auto',
                    'tags': {},
                    'metadata': {
                        'auto_create_subnetworks': network.auto_create_subnetworks,
                        'self_link': network.self_link,
                        'creation_timestamp': network.creation_timestamp
                    }
                })
        except Exception as e:
            logger.error(f"Error fetching GCP Networks: {e}")
        
        return networks
    
    def get_all_resources(self):
        """Get all GCP resources"""
        resources = []
        resources.extend(self.get_compute_instances())
        resources.extend(self.get_storage_buckets())
        resources.extend(self.get_networks())
        return resources
    
    def get_cost_data(self, start_date, end_date):
        """Get cost data (placeholder - requires BigQuery billing export setup)"""
        logger.info("GCP BigQuery billing export integration pending")
        return []
