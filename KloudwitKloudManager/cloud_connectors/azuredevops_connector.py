"""Azure DevOps Connector for retrieving pipelines and pipeline runs"""
import logging
import requests
import base64
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class AzureDevOpsConnector:
    """Connector for Azure DevOps API to fetch pipelines and pipeline runs"""
    
    def __init__(self, organization: str, personal_access_token: str, project: Optional[str] = None):
        """
        Initialize Azure DevOps connector
        
        Args:
            organization: Azure DevOps organization name
            personal_access_token: Personal Access Token (PAT)
            project: Project name (optional, if not provided will get all projects)
        """
        self.organization = organization
        self.pat = personal_access_token
        self.project = project
        self.base_url = f"https://dev.azure.com/{organization}"
        
        # Create authorization header (PAT needs to be base64 encoded)
        pat_bytes = f":{personal_access_token}".encode('ascii')
        base64_pat = base64.b64encode(pat_bytes).decode('ascii')
        
        self.headers = {
            "Authorization": f"Basic {base64_pat}",
            "Content-Type": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def test_connection(self) -> tuple:
        """Test Azure DevOps API connection"""
        try:
            url = f"{self.base_url}/_apis/projects?api-version=7.0"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                project_count = data.get('count', 0)
                return True, f"Connected to {self.organization} ({project_count} projects)"
            elif response.status_code == 203:
                # 203 Non-Authoritative Information - often means proxy/gateway modified response
                try:
                    data = response.json()
                    if 'count' in data:
                        project_count = data.get('count', 0)
                        return True, f"Connected to {self.organization} ({project_count} projects) [via proxy]"
                except:
                    pass
                return False, f"Authentication issue (203): Verify your PAT and organization name. URL: {self.base_url}"
            elif response.status_code == 401:
                return False, f"Authentication failed: Invalid PAT or expired token"
            elif response.status_code == 404:
                return False, f"Organization '{self.organization}' not found. Check organization name."
            else:
                error_msg = f"Failed to connect: HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if 'message' in error_data:
                        error_msg += f" - {error_data['message']}"
                except:
                    error_msg += f" - {response.text[:200]}"
                return False, error_msg
        except Exception as e:
            logger.error(f"Azure DevOps connection test failed: {e}")
            return False, f"Connection error: {str(e)}"
    
    def get_projects(self) -> List[Dict[str, Any]]:
        """Get all accessible projects"""
        try:
            url = f"{self.base_url}/_apis/projects?api-version=7.0"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                projects = data.get('value', [])
                logger.info(f"Retrieved {len(projects)} projects from Azure DevOps")
                return projects
            else:
                logger.warning(f"Failed to get projects: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching Azure DevOps projects: {e}")
            return []
    
    def get_pipelines(self, project_name: str) -> List[Dict[str, Any]]:
        """Get all pipelines for a project"""
        try:
            url = f"{self.base_url}/{project_name}/_apis/pipelines?api-version=7.0"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('value', [])
            else:
                logger.warning(f"Failed to get pipelines for {project_name}: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching pipelines for {project_name}: {e}")
            return []
    
    def get_pipeline_runs(self, project_name: str, pipeline_id: Optional[int] = None, 
                         days: int = 30) -> List[Dict[str, Any]]:
        """Get pipeline runs for a project or specific pipeline"""
        try:
            all_runs = []
            
            if pipeline_id:
                # Get runs for specific pipeline
                url = f"{self.base_url}/{project_name}/_apis/pipelines/{pipeline_id}/runs?api-version=7.0"
                response = self.session.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    runs = data.get('value', [])
                    
                    # Filter by date
                    cutoff_date = datetime.utcnow() - timedelta(days=days)
                    filtered_runs = [
                        run for run in runs 
                        if datetime.fromisoformat(run.get('createdDate', '').replace('Z', '+00:00')) > cutoff_date
                    ]
                    all_runs.extend(filtered_runs)
            else:
                # Get all pipelines and their runs
                pipelines = self.get_pipelines(project_name)
                for pipeline in pipelines:
                    runs = self.get_pipeline_runs(project_name, pipeline['id'], days)
                    all_runs.extend(runs)
            
            return all_runs
            
        except Exception as e:
            logger.error(f"Error fetching pipeline runs for {project_name}: {e}")
            return []
    
    def get_build_pipeline_runs(self, project_name: str, definition_id: Optional[int] = None,
                                days: int = 30) -> List[Dict[str, Any]]:
        """Get build pipeline runs (classic and YAML builds)"""
        try:
            # Calculate date range
            min_time = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            url = f"{self.base_url}/{project_name}/_apis/build/builds?api-version=7.0"
            params = {
                'minTime': min_time,
                '$top': 100
            }
            
            if definition_id:
                params['definitions'] = definition_id
            
            response = self.session.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('value', [])
            else:
                logger.warning(f"Failed to get build runs for {project_name}: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching build runs for {project_name}: {e}")
            return []
    
    def discover_resources(self) -> List[Dict[str, Any]]:
        """Discover all Azure DevOps resources (pipelines across projects)"""
        resources = []
        
        try:
            # Get all projects or use specified project
            if self.project:
                projects = [{'name': self.project}]
            else:
                projects = self.get_projects()
            
            for project in projects:
                project_name = project['name']
                
                # Get both modern pipelines and classic builds
                pipelines = self.get_pipelines(project_name)
                
                for pipeline in pipelines:
                    pipeline_id = pipeline['id']
                    pipeline_name = pipeline['name']
                    
                    # Get recent runs for this pipeline
                    runs = self.get_pipeline_runs(project_name, pipeline_id, days=7)
                    
                    # Determine status based on latest run
                    status = 'Unknown'
                    last_run_date = None
                    success_count = 0
                    failure_count = 0
                    in_progress_count = 0
                    
                    if runs:
                        for run in runs:
                            result = run.get('result', '').lower()
                            state = run.get('state', '').lower()
                            
                            if state == 'completed':
                                if result == 'succeeded':
                                    success_count += 1
                                elif result in ['failed', 'canceled', 'partiallySucceeded']:
                                    failure_count += 1
                            else:
                                in_progress_count += 1
                        
                        latest_run = runs[0]
                        state = latest_run.get('state', 'unknown')
                        result = latest_run.get('result', 'unknown')
                        
                        if state.lower() == 'completed':
                            status = result.capitalize()
                        else:
                            status = state.capitalize()
                        
                        last_run_date = latest_run.get('createdDate')
                    
                    resources.append({
                        'resource_id': f"{self.organization}/{project_name}/{pipeline_id}",
                        'resource_type': 'ADO Pipeline',
                        'name': f"{project_name}/{pipeline_name}",
                        'region': 'Azure DevOps Cloud',
                        'status': status,
                        'size': f"{len(runs)} runs (7d)",
                        'tags': {
                            'organization': self.organization,
                            'project': project_name,
                            'pipeline_id': pipeline_id,
                            'pipeline_name': pipeline_name,
                            'folder': pipeline.get('folder', '/'),
                            'revision': pipeline.get('revision', 1)
                        },
                        'metadata': {
                            'organization': self.organization,
                            'project': project_name,
                            'pipeline_id': pipeline_id,
                            'pipeline_name': pipeline_name,
                            'folder': pipeline.get('folder', '/'),
                            'revision': pipeline.get('revision', 1),
                            'total_runs': len(runs),
                            'success_runs': success_count,
                            'failure_runs': failure_count,
                            'in_progress_runs': in_progress_count,
                            'last_run': last_run_date,
                            'pipeline_url': pipeline.get('_links', {}).get('web', {}).get('href', '')
                        }
                    })
            
            logger.info(f"Discovered {len(resources)} Azure DevOps Pipelines")
            return resources
            
        except Exception as e:
            logger.error(f"Error discovering Azure DevOps resources: {e}")
            return []
    
    def get_pipeline_usage_stats(self, days: int = 30) -> Dict[str, Any]:
        """Get Azure DevOps pipeline usage statistics"""
        stats = {
            'total_pipelines': 0,
            'total_runs': 0,
            'successful_runs': 0,
            'failed_runs': 0,
            'in_progress_runs': 0,
            'canceled_runs': 0,
            'total_duration_minutes': 0,
            'pipelines_by_project': {},
            'runs_by_status': {},
            'runs_by_result': {},
            'period_days': days
        }
        
        try:
            # Get all projects
            if self.project:
                projects = [{'name': self.project}]
            else:
                projects = self.get_projects()
            
            for project in projects:
                project_name = project['name']
                
                pipelines = self.get_pipelines(project_name)
                stats['total_pipelines'] += len(pipelines)
                
                # Get all runs for this project
                runs = self.get_pipeline_runs(project_name, days=days)
                
                stats['pipelines_by_project'][project_name] = {
                    'pipeline_count': len(pipelines),
                    'run_count': len(runs)
                }
                
                for run in runs:
                    stats['total_runs'] += 1
                    
                    # Count by state
                    state = run.get('state', 'unknown').lower()
                    stats['runs_by_status'][state] = stats['runs_by_status'].get(state, 0) + 1
                    
                    if state == 'completed':
                        result = run.get('result', 'unknown').lower()
                        stats['runs_by_result'][result] = stats['runs_by_result'].get(result, 0) + 1
                        
                        if result == 'succeeded':
                            stats['successful_runs'] += 1
                        elif result in ['failed', 'partiallysucceeded']:
                            stats['failed_runs'] += 1
                        elif result == 'canceled':
                            stats['canceled_runs'] += 1
                    else:
                        stats['in_progress_runs'] += 1
                    
                    # Calculate duration if available
                    if 'finishedDate' in run and 'createdDate' in run:
                        try:
                            start = datetime.fromisoformat(run['createdDate'].replace('Z', '+00:00'))
                            end = datetime.fromisoformat(run['finishedDate'].replace('Z', '+00:00'))
                            duration_minutes = (end - start).total_seconds() / 60
                            stats['total_duration_minutes'] += duration_minutes
                        except:
                            pass
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting Azure DevOps usage stats: {e}")
            return stats
    
    def trigger_pipeline(self, project_name: str, pipeline_id: int, branch: str = 'main',
                        variables: Optional[Dict[str, str]] = None) -> tuple:
        """Trigger a pipeline run"""
        try:
            url = f"{self.base_url}/{project_name}/_apis/pipelines/{pipeline_id}/runs?api-version=7.0"
            
            payload = {
                'resources': {
                    'repositories': {
                        'self': {
                            'refName': f'refs/heads/{branch}'
                        }
                    }
                }
            }
            
            if variables:
                payload['variables'] = variables
            
            response = self.session.post(url, json=payload)
            
            if response.status_code in [200, 201]:
                data = response.json()
                run_id = data.get('id')
                return True, f"Pipeline triggered successfully (Run ID: {run_id})"
            else:
                return False, f"Failed to trigger pipeline: {response.status_code} - {response.text}"
                
        except Exception as e:
            logger.error(f"Error triggering pipeline: {e}")
            return False, str(e)
    
    def _paginated_request(self, url: str, params: Optional[Dict] = None) -> List[Dict]:
        """Make paginated requests to Azure DevOps API"""
        all_items = []
        
        try:
            while url:
                response = self.session.get(url, params=params)
                
                if response.status_code != 200:
                    logger.warning(f"Request failed with status {response.status_code}")
                    break
                
                data = response.json()
                items = data.get('value', [])
                all_items.extend(items)
                
                # Check for next page
                url = data.get('nextLink')
                params = None  # params only for first request
            
            return all_items
            
        except Exception as e:
            logger.error(f"Error in paginated request: {e}")
            return all_items
