from azure.identity import ClientSecretCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.web import WebSiteManagementClient
from azure.mgmt.sql import SqlManagementClient
from azure.mgmt.policyinsights import PolicyInsightsClient
from azure.mgmt.costmanagement import CostManagementClient
from azure.mgmt.costmanagement.models import QueryDefinition, QueryDataset, QueryAggregation, QueryGrouping, TimeframeType
from azure.core.exceptions import AzureError
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AzureConnector:
    """Azure Cloud Connector"""
    
    def __init__(self, subscription_id, tenant_id, client_id, client_secret):
        self.subscription_id = subscription_id
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.credential = None
        self._initialize_credential()
    
    def _initialize_credential(self):
        """Initialize Azure credentials"""
        try:
            if all([self.tenant_id, self.client_id, self.client_secret]):
                self.credential = ClientSecretCredential(
                    tenant_id=self.tenant_id,
                    client_id=self.client_id,
                    client_secret=self.client_secret
                )
        except Exception as e:
            logger.error(f"Failed to initialize Azure credentials: {e}")
            raise
    
    def test_connection(self):
        """Test Azure connection"""
        try:
            if not self.credential:
                return False, "Azure credentials not configured"
            
            resource_client = ResourceManagementClient(self.credential, self.subscription_id)
            # Try to list resource groups
            list(resource_client.resource_groups.list())
            return True, f"Connected to subscription {self.subscription_id}"
        except AzureError as e:
            return False, f"Azure connection failed: {e}"
    
    def get_virtual_machines(self):
        """Get all Virtual Machines"""
        vms = []
        try:
            if not self.credential:
                return vms
            
            compute_client = ComputeManagementClient(self.credential, self.subscription_id)
            
            for vm in compute_client.virtual_machines.list_all():
                # Get instance view for power state
                instance_view = compute_client.virtual_machines.instance_view(
                    vm.id.split('/')[4],  # resource group name
                    vm.name
                )
                
                power_state = 'unknown'
                for status in instance_view.statuses:
                    if status.code.startswith('PowerState/'):
                        power_state = status.code.split('/')[-1]
                
                vms.append({
                    'resource_id': vm.id,
                    'resource_type': 'VM',
                    'name': vm.name,
                    'region': vm.location,
                    'status': power_state,
                    'size': vm.hardware_profile.vm_size,
                    'tags': vm.tags or {},
                    'metadata': {
                        'resource_group': vm.id.split('/')[4],
                        'os_type': vm.storage_profile.os_disk.os_type if vm.storage_profile else 'unknown',
                        'provisioning_state': vm.provisioning_state
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure VMs: {e}")
        
        return vms
    
    def get_storage_accounts(self):
        """Get all Storage Accounts"""
        storage_accounts = []
        try:
            if not self.credential:
                return storage_accounts
            
            storage_client = StorageManagementClient(self.credential, self.subscription_id)
            
            for account in storage_client.storage_accounts.list():
                storage_accounts.append({
                    'resource_id': account.id,
                    'resource_type': 'Storage',
                    'name': account.name,
                    'region': account.location,
                    'status': account.provisioning_state,
                    'size': account.sku.name,
                    'tags': account.tags or {},
                    'metadata': {
                        'resource_group': account.id.split('/')[4],
                        'kind': account.kind,
                        'tier': account.sku.tier,
                        'replication': account.sku.name
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure Storage Accounts: {e}")
        
        return storage_accounts
    
    def get_virtual_networks(self):
        """Get all Virtual Networks"""
        vnets = []
        try:
            if not self.credential:
                return vnets
            
            network_client = NetworkManagementClient(self.credential, self.subscription_id)
            
            for vnet in network_client.virtual_networks.list_all():
                address_spaces = ', '.join(vnet.address_space.address_prefixes) if vnet.address_space else 'N/A'
                
                vnets.append({
                    'resource_id': vnet.id,
                    'resource_type': 'Network',
                    'name': vnet.name,
                    'region': vnet.location,
                    'status': vnet.provisioning_state,
                    'size': address_spaces,
                    'tags': vnet.tags or {},
                    'metadata': {
                        'resource_group': vnet.id.split('/')[4],
                        'address_spaces': vnet.address_space.address_prefixes if vnet.address_space else [],
                        'subnets_count': len(vnet.subnets) if vnet.subnets else 0
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure Virtual Networks: {e}")
        
        return vnets
    
    def get_network_security_groups(self):
        """Get all Network Security Groups"""
        nsgs = []
        try:
            if not self.credential:
                return nsgs
            
            network_client = NetworkManagementClient(self.credential, self.subscription_id)
            
            for nsg in network_client.network_security_groups.list_all():
                rules_count = len(nsg.security_rules) if nsg.security_rules else 0
                
                nsgs.append({
                    'resource_id': nsg.id,
                    'resource_type': 'NSG',
                    'name': nsg.name,
                    'region': nsg.location,
                    'status': nsg.provisioning_state,
                    'size': f'{rules_count} rules',
                    'tags': nsg.tags or {},
                    'metadata': {
                        'resource_group': nsg.id.split('/')[4],
                        'rules_count': rules_count
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure NSGs: {e}")
        
        return nsgs
    
    def get_public_ips(self):
        """Get all Public IP Addresses"""
        public_ips = []
        try:
            if not self.credential:
                return public_ips
            
            network_client = NetworkManagementClient(self.credential, self.subscription_id)
            
            for ip in network_client.public_ip_addresses.list_all():
                public_ips.append({
                    'resource_id': ip.id,
                    'resource_type': 'PublicIP',
                    'name': ip.name,
                    'region': ip.location,
                    'status': ip.provisioning_state,
                    'size': ip.public_ip_allocation_method if ip.public_ip_allocation_method else 'N/A',
                    'tags': ip.tags or {},
                    'metadata': {
                        'resource_group': ip.id.split('/')[4],
                        'ip_address': ip.ip_address if ip.ip_address else 'Not assigned',
                        'sku': ip.sku.name if ip.sku else 'Basic'
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure Public IPs: {e}")
        
        return public_ips
    
    def get_load_balancers(self):
        """Get all Load Balancers"""
        load_balancers = []
        try:
            if not self.credential:
                return load_balancers
            
            network_client = NetworkManagementClient(self.credential, self.subscription_id)
            
            for lb in network_client.load_balancers.list_all():
                load_balancers.append({
                    'resource_id': lb.id,
                    'resource_type': 'LoadBalancer',
                    'name': lb.name,
                    'region': lb.location,
                    'status': lb.provisioning_state,
                    'size': lb.sku.name if lb.sku else 'Basic',
                    'tags': lb.tags or {},
                    'metadata': {
                        'resource_group': lb.id.split('/')[4],
                        'frontend_ip_count': len(lb.frontend_ip_configurations) if lb.frontend_ip_configurations else 0
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure Load Balancers: {e}")
        
        return load_balancers
    
    def get_app_services(self):
        """Get all App Services (Web Apps)"""
        app_services = []
        try:
            if not self.credential:
                return app_services
            
            web_client = WebSiteManagementClient(self.credential, self.subscription_id)
            
            for app in web_client.web_apps.list():
                app_services.append({
                    'resource_id': app.id,
                    'resource_type': 'AppService',
                    'name': app.name,
                    'region': app.location,
                    'status': app.state,
                    'size': app.server_farm_id.split('/')[-1] if app.server_farm_id else 'N/A',
                    'tags': app.tags or {},
                    'metadata': {
                        'resource_group': app.id.split('/')[4],
                        'default_hostname': app.default_host_name,
                        'kind': app.kind
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure App Services: {e}")
        
        return app_services
    
    def get_function_apps(self):
        """Get all Function Apps"""
        function_apps = []
        try:
            if not self.credential:
                return function_apps
            
            web_client = WebSiteManagementClient(self.credential, self.subscription_id)
            
            for app in web_client.web_apps.list():
                # Filter for Function Apps (kind contains 'functionapp')
                if app.kind and 'functionapp' in app.kind.lower():
                    function_apps.append({
                        'resource_id': app.id,
                        'resource_type': 'FunctionApp',
                        'name': app.name,
                        'region': app.location,
                        'status': app.state,
                        'size': app.server_farm_id.split('/')[-1] if app.server_farm_id else 'N/A',
                        'tags': app.tags or {},
                        'metadata': {
                            'resource_group': app.id.split('/')[4],
                            'default_hostname': app.default_host_name,
                            'runtime': app.kind
                        }
                    })
        except AzureError as e:
            logger.error(f"Error fetching Azure Function Apps: {e}")
        
        return function_apps
    
    def get_sql_servers(self):
        """Get all SQL Servers"""
        sql_servers = []
        try:
            if not self.credential:
                return sql_servers
            
            sql_client = SqlManagementClient(self.credential, self.subscription_id)
            
            for server in sql_client.servers.list():
                sql_servers.append({
                    'resource_id': server.id,
                    'resource_type': 'SQLServer',
                    'name': server.name,
                    'region': server.location,
                    'status': server.state if hasattr(server, 'state') else 'Ready',
                    'size': server.version if server.version else 'N/A',
                    'tags': server.tags or {},
                    'metadata': {
                        'resource_group': server.id.split('/')[4],
                        'fqdn': server.fully_qualified_domain_name,
                        'admin_login': server.administrator_login
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure SQL Servers: {e}")
        
        return sql_servers
    
    def get_sql_databases(self):
        """Get all SQL Databases"""
        sql_databases = []
        try:
            if not self.credential:
                return sql_databases
            
            sql_client = SqlManagementClient(self.credential, self.subscription_id)
            
            # Get all SQL servers first
            for server in sql_client.servers.list():
                resource_group = server.id.split('/')[4]
                try:
                    for db in sql_client.databases.list_by_server(resource_group, server.name):
                        # Skip 'master' database
                        if db.name.lower() != 'master':
                            sql_databases.append({
                                'resource_id': db.id,
                                'resource_type': 'SQLDatabase',
                                'name': f"{server.name}/{db.name}",
                                'region': db.location,
                                'status': db.status,
                                'size': db.sku.tier if db.sku else 'N/A',
                                'tags': db.tags or {},
                                'metadata': {
                                    'resource_group': resource_group,
                                    'server_name': server.name,
                                    'database_name': db.name,
                                    'sku': db.sku.name if db.sku else 'N/A'
                                }
                            })
                except Exception as e:
                    logger.warning(f"Could not list databases for server {server.name}: {e}")
        except AzureError as e:
            logger.error(f"Error fetching Azure SQL Databases: {e}")
        
        return sql_databases
    
    def get_disks(self):
        """Get all Managed Disks"""
        disks = []
        try:
            if not self.credential:
                return disks
            
            compute_client = ComputeManagementClient(self.credential, self.subscription_id)
            
            for disk in compute_client.disks.list():
                disks.append({
                    'resource_id': disk.id,
                    'resource_type': 'Disk',
                    'name': disk.name,
                    'region': disk.location,
                    'status': disk.provisioning_state,
                    'size': f"{disk.disk_size_gb}GB" if disk.disk_size_gb else 'N/A',
                    'tags': disk.tags or {},
                    'metadata': {
                        'resource_group': disk.id.split('/')[4],
                        'disk_state': disk.disk_state,
                        'sku': disk.sku.name if disk.sku else 'N/A'
                    }
                })
        except AzureError as e:
            logger.error(f"Error fetching Azure Disks: {e}")
        
        return disks
    
    def get_all_resources(self):
        """Get all Azure resources"""
        resources = []
        
        logger.info("Fetching Azure Virtual Machines...")
        resources.extend(self.get_virtual_machines())
        
        logger.info("Fetching Azure Storage Accounts...")
        resources.extend(self.get_storage_accounts())
        
        logger.info("Fetching Azure Virtual Networks...")
        resources.extend(self.get_virtual_networks())
        
        logger.info("Fetching Azure Network Security Groups...")
        resources.extend(self.get_network_security_groups())
        
        logger.info("Fetching Azure Public IPs...")
        resources.extend(self.get_public_ips())
        
        logger.info("Fetching Azure Load Balancers...")
        resources.extend(self.get_load_balancers())
        
        logger.info("Fetching Azure App Services...")
        resources.extend(self.get_app_services())
        
        logger.info("Fetching Azure Function Apps...")
        resources.extend(self.get_function_apps())
        
        logger.info("Fetching Azure SQL Servers...")
        resources.extend(self.get_sql_servers())
        
        logger.info("Fetching Azure SQL Databases...")
        resources.extend(self.get_sql_databases())
        
        logger.info("Fetching Azure Managed Disks...")
        resources.extend(self.get_disks())
        
        logger.info(f"Total Azure resources found: {len(resources)}")
        return resources
    
    def get_non_compliant_resources(self):
        """Get non-compliant resources from Azure Policy"""
        non_compliant_resources = []
        
        try:
            if not self.credential:
                logger.warning("Azure credentials not configured")
                return non_compliant_resources
            
            policy_client = PolicyInsightsClient(self.credential, self.subscription_id)
            
            # Query for non-compliant policy states
            policy_states = policy_client.policy_states.list_query_results_for_subscription(
                policy_states_resource="latest",
                subscription_id=self.subscription_id
            )
            
            for state in policy_states.value:
                if state.compliance_state == "NonCompliant":
                    resource_info = {
                        'resource_id': state.resource_id,
                        'resource_name': state.resource_id.split('/')[-1] if state.resource_id else 'Unknown',
                        'resource_type': state.resource_type or 'Unknown',
                        'policy_assignment': state.policy_assignment_name or 'Unknown',
                        'policy_definition': state.policy_definition_name or 'Unknown',
                        'compliance_state': state.compliance_state,
                        'timestamp': state.timestamp.isoformat() if state.timestamp else None,
                        'resource_group': state.resource_group or 'Unknown',
                        'resource_location': state.resource_location or 'Unknown'
                    }
                    non_compliant_resources.append(resource_info)
            
            logger.info(f"Found {len(non_compliant_resources)} non-compliant resources")
            
        except Exception as e:
            logger.error(f"Error fetching non-compliant resources: {e}")
        
        return non_compliant_resources
    
    def get_cost_data_last_30_days(self):
        """Get cost data for the last 30 days from Azure Cost Management"""
        cost_data = {
            'total_cost': 0.0,
            'currency': 'USD',
            'cost_by_resource': [],
            'cost_by_service': [],
            'daily_costs': [],
            'period_start': None,
            'period_end': None
        }
        
        try:
            if not self.credential:
                logger.warning("Azure credentials not configured")
                return cost_data
            
            cost_client = CostManagementClient(self.credential)
            
            # Set date range for last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            cost_data['period_start'] = start_date.isoformat()
            cost_data['period_end'] = end_date.isoformat()
            
            # Construct the scope for the subscription
            scope = f"/subscriptions/{self.subscription_id}"
            
            # Query definition for cost by resource
            query_resource = QueryDefinition(
                type="ActualCost",
                timeframe=TimeframeType.CUSTOM,
                time_period={
                    "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                    "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                },
                dataset=QueryDataset(
                    granularity="Daily",
                    aggregation={
                        "totalCost": QueryAggregation(name="PreTaxCost", function="Sum")
                    },
                    grouping=[
                        QueryGrouping(type="Dimension", name="ResourceId"),
                        QueryGrouping(type="Dimension", name="ResourceType")
                    ]
                )
            )
            
            # Execute query for resource costs
            try:
                result_resource = cost_client.query.usage(scope, query_resource)
                
                # Extract currency from the result if available
                try:
                    if hasattr(result_resource, 'properties') and hasattr(result_resource.properties, 'columns'):
                        for column in result_resource.properties.columns:
                            if hasattr(column, 'name') and (column.name == 'Cost' or column.name == 'PreTaxCost' or column.name == 'CostUSD'):
                                if hasattr(column, 'type') and '(' in str(column.type):
                                    # Extract currency from type like "Number(USD)" or "Currency(INR)"
                                    currency_match = str(column.type).split('(')[-1].rstrip(')')
                                    if currency_match and len(currency_match) == 3:
                                        cost_data['currency'] = currency_match
                                        logger.info(f"Detected currency: {currency_match}")
                except Exception as curr_error:
                    logger.warning(f"Could not extract currency: {curr_error}")
                
                if hasattr(result_resource, 'rows') and result_resource.rows:
                    for row in result_resource.rows:
                        if len(row) >= 3:
                            resource_id = row[1] if len(row) > 1 else 'Unknown'
                            resource_type = row[2] if len(row) > 2 else 'Unknown'
                            cost = float(row[0]) if row[0] is not None else 0.0
                            
                            resource_name = resource_id.split('/')[-1] if isinstance(resource_id, str) and '/' in resource_id else resource_id
                            
                            cost_data['cost_by_resource'].append({
                                'resource_id': resource_id,
                                'resource_name': resource_name,
                                'resource_type': resource_type,
                                'cost': round(cost, 2)
                            })
                            cost_data['total_cost'] += cost
            except Exception as e:
                logger.warning(f"Could not fetch resource-level costs: {e}")
            
            # Query for cost by service
            query_service = QueryDefinition(
                type="ActualCost",
                timeframe=TimeframeType.CUSTOM,
                time_period={
                    "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                    "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                },
                dataset=QueryDataset(
                    granularity="None",
                    aggregation={
                        "totalCost": QueryAggregation(name="PreTaxCost", function="Sum")
                    },
                    grouping=[
                        QueryGrouping(type="Dimension", name="ServiceName")
                    ]
                )
            )
            
            try:
                result_service = cost_client.query.usage(scope, query_service)
                
                if hasattr(result_service, 'rows') and result_service.rows:
                    for row in result_service.rows:
                        if len(row) >= 2:
                            service_name = row[1] if len(row) > 1 else 'Unknown'
                            cost = float(row[0]) if row[0] is not None else 0.0
                            
                            cost_data['cost_by_service'].append({
                                'service_name': service_name,
                                'cost': round(cost, 2)
                            })
            except Exception as e:
                logger.warning(f"Could not fetch service-level costs: {e}")
            
            # Query for daily costs
            query_daily = QueryDefinition(
                type="ActualCost",
                timeframe=TimeframeType.CUSTOM,
                time_period={
                    "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                    "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                },
                dataset=QueryDataset(
                    granularity="Daily",
                    aggregation={
                        "totalCost": QueryAggregation(name="PreTaxCost", function="Sum")
                    }
                )
            )
            
            try:
                result_daily = cost_client.query.usage(scope, query_daily)
                
                if hasattr(result_daily, 'rows') and result_daily.rows:
                    for row in result_daily.rows:
                        if len(row) >= 2:
                            cost = float(row[0]) if row[0] is not None else 0.0
                            date = row[1] if len(row) > 1 else None
                            
                            cost_data['daily_costs'].append({
                                'date': str(date),
                                'cost': round(cost, 2)
                            })
            except Exception as e:
                logger.warning(f"Could not fetch daily costs: {e}")
            
            cost_data['total_cost'] = round(cost_data['total_cost'], 2)
            
            logger.info(f"Retrieved cost data: Total {cost_data['currency']} {cost_data['total_cost']} for last 30 days")
            logger.info(f"Cost breakdown: {len(cost_data['cost_by_resource'])} resources, {len(cost_data['cost_by_service'])} services, {len(cost_data['daily_costs'])} days")
            
        except Exception as e:
            logger.error(f"Error fetching cost data: {e}")
        
        return cost_data
