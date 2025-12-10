import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AWSConnector:
    """AWS Cloud Connector"""
    
    def __init__(self, access_key_id, secret_access_key, region='us-east-1'):
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.region = region
        self.session = None
        self._initialize_session()
    
    def _initialize_session(self):
        """Initialize AWS session"""
        try:
            if self.access_key_id and self.secret_access_key:
                self.session = boto3.Session(
                    aws_access_key_id=self.access_key_id,
                    aws_secret_access_key=self.secret_access_key,
                    region_name=self.region
                )
            else:
                # Use default credentials
                self.session = boto3.Session(region_name=self.region)
        except Exception as e:
            logger.error(f"Failed to initialize AWS session: {e}")
            raise
    
    def test_connection(self):
        """Test AWS connection"""
        try:
            sts = self.session.client('sts')
            identity = sts.get_caller_identity()
            return True, f"Connected as {identity['Arn']}"
        except NoCredentialsError:
            return False, "No AWS credentials found"
        except ClientError as e:
            return False, f"AWS connection failed: {e}"
    
    def get_ec2_instances(self):
        """Get all EC2 instances"""
        instances = []
        try:
            ec2 = self.session.client('ec2')
            response = ec2.describe_instances()
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instances.append({
                        'resource_id': instance['InstanceId'],
                        'resource_type': 'VM',
                        'name': self._get_tag_value(instance.get('Tags', []), 'Name') or instance['InstanceId'],
                        'region': self.region,
                        'status': instance['State']['Name'],
                        'size': instance['InstanceType'],
                        'tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])},
                        'metadata': {
                            'platform': instance.get('Platform', 'Linux'),
                            'launch_time': instance['LaunchTime'].isoformat(),
                            'vpc_id': instance.get('VpcId'),
                            'subnet_id': instance.get('SubnetId'),
                            'private_ip': instance.get('PrivateIpAddress'),
                            'public_ip': instance.get('PublicIpAddress')
                        }
                    })
        except ClientError as e:
            logger.error(f"Error fetching EC2 instances: {e}")
        
        return instances
    
    def get_s3_buckets(self):
        """Get all S3 buckets"""
        buckets = []
        try:
            s3 = self.session.client('s3')
            response = s3.list_buckets()
            
            for bucket in response['Buckets']:
                bucket_name = bucket['Name']
                try:
                    # Get bucket size and object count
                    cloudwatch = self.session.client('cloudwatch')
                    metrics = cloudwatch.get_metric_statistics(
                        Namespace='AWS/S3',
                        MetricName='BucketSizeBytes',
                        Dimensions=[
                            {'Name': 'BucketName', 'Value': bucket_name},
                            {'Name': 'StorageType', 'Value': 'StandardStorage'}
                        ],
                        StartTime=datetime.utcnow() - timedelta(days=1),
                        EndTime=datetime.utcnow(),
                        Period=86400,
                        Statistics=['Average']
                    )
                    
                    size_bytes = metrics['Datapoints'][0]['Average'] if metrics['Datapoints'] else 0
                    
                    buckets.append({
                        'resource_id': bucket_name,
                        'resource_type': 'Storage',
                        'name': bucket_name,
                        'region': self._get_bucket_region(s3, bucket_name),
                        'status': 'active',
                        'size': self._format_size(size_bytes),
                        'tags': {},
                        'metadata': {
                            'creation_date': bucket['CreationDate'].isoformat(),
                            'size_bytes': size_bytes
                        }
                    })
                except Exception as e:
                    logger.warning(f"Error getting metrics for bucket {bucket_name}: {e}")
                    buckets.append({
                        'resource_id': bucket_name,
                        'resource_type': 'Storage',
                        'name': bucket_name,
                        'region': 'unknown',
                        'status': 'active',
                        'size': 'N/A',
                        'tags': {},
                        'metadata': {
                            'creation_date': bucket['CreationDate'].isoformat()
                        }
                    })
        except ClientError as e:
            logger.error(f"Error fetching S3 buckets: {e}")
        
        return buckets
    
    def get_rds_instances(self):
        """Get all RDS instances"""
        databases = []
        try:
            rds = self.session.client('rds')
            response = rds.describe_db_instances()
            
            for db in response['DBInstances']:
                databases.append({
                    'resource_id': db['DBInstanceIdentifier'],
                    'resource_type': 'Database',
                    'name': db['DBInstanceIdentifier'],
                    'region': self.region,
                    'status': db['DBInstanceStatus'],
                    'size': db['DBInstanceClass'],
                    'tags': {},
                    'metadata': {
                        'engine': db['Engine'],
                        'engine_version': db['EngineVersion'],
                        'storage_gb': db['AllocatedStorage'],
                        'multi_az': db['MultiAZ'],
                        'endpoint': db.get('Endpoint', {}).get('Address')
                    }
                })
        except ClientError as e:
            logger.error(f"Error fetching RDS instances: {e}")
        
        return databases
    
    def get_vpcs(self):
        """Get all VPCs"""
        vpcs = []
        try:
            ec2 = self.session.client('ec2')
            response = ec2.describe_vpcs()
            
            for vpc in response['Vpcs']:
                vpcs.append({
                    'resource_id': vpc['VpcId'],
                    'resource_type': 'Network',
                    'name': self._get_tag_value(vpc.get('Tags', []), 'Name') or vpc['VpcId'],
                    'region': self.region,
                    'status': vpc['State'],
                    'size': vpc['CidrBlock'],
                    'tags': {tag['Key']: tag['Value'] for tag in vpc.get('Tags', [])},
                    'metadata': {
                        'cidr_block': vpc['CidrBlock'],
                        'is_default': vpc['IsDefault']
                    }
                })
        except ClientError as e:
            logger.error(f"Error fetching VPCs: {e}")
        
        return vpcs
    
    def get_all_resources(self):
        """Get all AWS resources"""
        resources = []
        resources.extend(self.get_ec2_instances())
        resources.extend(self.get_s3_buckets())
        resources.extend(self.get_rds_instances())
        resources.extend(self.get_vpcs())
        return resources
    
    def get_cost_data(self, start_date, end_date):
        """Get cost and usage data"""
        try:
            ce = self.session.client('ce')
            response = ce.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['UnblendedCost'],
                GroupBy=[{'Type': 'SERVICE', 'Key': 'SERVICE'}]
            )
            return response['ResultsByTime']
        except ClientError as e:
            logger.error(f"Error fetching cost data: {e}")
            return []
    
    @staticmethod
    def _get_tag_value(tags, key):
        """Get tag value by key"""
        for tag in tags:
            if tag['Key'] == key:
                return tag['Value']
        return None
    
    @staticmethod
    def _get_bucket_region(s3_client, bucket_name):
        """Get bucket region"""
        try:
            response = s3_client.get_bucket_location(Bucket=bucket_name)
            location = response['LocationConstraint']
            return location if location else 'us-east-1'
        except:
            return 'unknown'
    
    @staticmethod
    def _format_size(bytes_size):
        """Format bytes to human-readable size"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} PB"
