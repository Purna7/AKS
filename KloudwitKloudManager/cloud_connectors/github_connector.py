"""GitHub Connector for retrieving GitHub Actions and workflow runs"""
import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class GitHubConnector:
    """Connector for GitHub API to fetch Actions and workflow runs"""
    
    def __init__(self, token: str, organization: Optional[str] = None, username: Optional[str] = None):
        """
        Initialize GitHub connector
        
        Args:
            token: GitHub Personal Access Token
            organization: GitHub organization name (optional)
            username: GitHub username for personal repos (optional)
        """
        self.token = token
        self.organization = organization
        self.username = username
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def test_connection(self) -> tuple:
        """Test GitHub API connection"""
        try:
            response = self.session.get(f"{self.base_url}/user")
            if response.status_code == 200:
                user_data = response.json()
                return True, f"Connected as {user_data.get('login', 'Unknown')}"
            else:
                return False, f"Failed to authenticate: {response.status_code}"
        except Exception as e:
            logger.error(f"GitHub connection test failed: {e}")
            return False, str(e)
    
    def get_repositories(self) -> List[Dict[str, Any]]:
        """Get all accessible repositories"""
        repositories = []
        
        try:
            # Get organization repos if organization is specified
            if self.organization:
                url = f"{self.base_url}/orgs/{self.organization}/repos"
                repos = self._paginated_request(url)
                repositories.extend(repos)
            
            # Get user repos if username is specified
            if self.username:
                url = f"{self.base_url}/users/{self.username}/repos"
                repos = self._paginated_request(url)
                repositories.extend(repos)
            
            # If neither specified, get authenticated user's repos
            if not self.organization and not self.username:
                url = f"{self.base_url}/user/repos"
                repos = self._paginated_request(url)
                repositories.extend(repos)
            
            logger.info(f"Retrieved {len(repositories)} repositories from GitHub")
            return repositories
            
        except Exception as e:
            logger.error(f"Error fetching GitHub repositories: {e}")
            return []
    
    def get_workflows(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Get all workflows for a repository"""
        try:
            url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows"
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('workflows', [])
            else:
                logger.warning(f"Failed to get workflows for {owner}/{repo}: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching workflows for {owner}/{repo}: {e}")
            return []
    
    def get_workflow_runs(self, owner: str, repo: str, workflow_id: Optional[int] = None, 
                         days: int = 30) -> List[Dict[str, Any]]:
        """Get workflow runs for a repository or specific workflow"""
        try:
            # Calculate date range
            created_after = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            if workflow_id:
                url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
            else:
                url = f"{self.base_url}/repos/{owner}/{repo}/actions/runs"
            
            params = {
                'created': f'>{created_after}',
                'per_page': 100
            }
            
            runs = self._paginated_request(url, params=params)
            
            # Extract runs from response
            if runs and isinstance(runs, list) and len(runs) > 0:
                if isinstance(runs[0], dict) and 'workflow_runs' in runs[0]:
                    all_runs = []
                    for page in runs:
                        all_runs.extend(page.get('workflow_runs', []))
                    return all_runs
            
            return runs
            
        except Exception as e:
            logger.error(f"Error fetching workflow runs for {owner}/{repo}: {e}")
            return []
    
    def discover_resources(self) -> List[Dict[str, Any]]:
        """Discover all GitHub resources (repositories with Actions enabled)"""
        resources = []
        
        try:
            repositories = self.get_repositories()
            
            for repo in repositories:
                owner = repo['owner']['login']
                repo_name = repo['name']
                
                # Get workflows for this repository
                workflows = self.get_workflows(owner, repo_name)
                
                if workflows:
                    # Repository has Actions enabled
                    for workflow in workflows:
                        # Get recent runs for this workflow
                        runs = self.get_workflow_runs(owner, repo_name, workflow['id'], days=7)
                        
                        # Determine status based on latest run
                        status = 'unknown'
                        last_run_date = None
                        success_count = 0
                        failure_count = 0
                        
                        if runs:
                            for run in runs:
                                if run['status'] == 'completed':
                                    if run['conclusion'] == 'success':
                                        success_count += 1
                                    elif run['conclusion'] in ['failure', 'cancelled', 'timed_out']:
                                        failure_count += 1
                            
                            latest_run = runs[0]
                            status = latest_run.get('status', 'unknown')
                            if status == 'completed':
                                status = latest_run.get('conclusion', 'completed')
                            last_run_date = latest_run.get('updated_at')
                        
                        resources.append({
                            'resource_id': f"{owner}/{repo_name}/{workflow['id']}",
                            'resource_type': 'GitHub Action',
                            'name': f"{repo_name}/{workflow['name']}",
                            'region': 'GitHub Cloud',
                            'status': status.capitalize(),
                            'size': f"{len(runs)} runs (7d)",
                            'tags': {
                                'repository': f"{owner}/{repo_name}",
                                'owner': owner,
                                'workflow_id': workflow['id'],
                                'workflow_path': workflow['path'],
                                'workflow_state': workflow['state']
                            },
                            'metadata': {
                                'repository': f"{owner}/{repo_name}",
                                'repository_name': repo_name,
                                'owner': owner,
                                'workflow_id': workflow['id'],
                                'workflow_name': workflow['name'],
                                'workflow_path': workflow['path'],
                                'workflow_state': workflow['state'],
                                'total_runs': len(runs),
                                'success_runs': success_count,
                                'failure_runs': failure_count,
                                'last_run': last_run_date,
                                'repository_url': repo['html_url'],
                                'workflow_url': workflow['html_url']
                            }
                        })
            
            logger.info(f"Discovered {len(resources)} GitHub Actions")
            return resources
            
        except Exception as e:
            logger.error(f"Error discovering GitHub resources: {e}")
            return []
    
    def get_workflow_usage_stats(self, days: int = 30) -> Dict[str, Any]:
        """Get GitHub Actions usage statistics"""
        stats = {
            'total_workflows': 0,
            'total_runs': 0,
            'successful_runs': 0,
            'failed_runs': 0,
            'in_progress_runs': 0,
            'total_duration_minutes': 0,
            'workflows_by_repository': {},
            'runs_by_status': {},
            'runs_by_conclusion': {},
            'period_days': days
        }
        
        try:
            repositories = self.get_repositories()
            
            for repo in repositories:
                owner = repo['owner']['login']
                repo_name = repo['name']
                
                workflows = self.get_workflows(owner, repo_name)
                stats['total_workflows'] += len(workflows)
                
                # Get all runs for this repository
                runs = self.get_workflow_runs(owner, repo_name, days=days)
                
                repo_key = f"{owner}/{repo_name}"
                stats['workflows_by_repository'][repo_key] = {
                    'workflow_count': len(workflows),
                    'run_count': len(runs)
                }
                
                for run in runs:
                    stats['total_runs'] += 1
                    
                    # Count by status
                    status = run.get('status', 'unknown')
                    stats['runs_by_status'][status] = stats['runs_by_status'].get(status, 0) + 1
                    
                    if status == 'completed':
                        conclusion = run.get('conclusion', 'unknown')
                        stats['runs_by_conclusion'][conclusion] = stats['runs_by_conclusion'].get(conclusion, 0) + 1
                        
                        if conclusion == 'success':
                            stats['successful_runs'] += 1
                        elif conclusion in ['failure', 'cancelled', 'timed_out']:
                            stats['failed_runs'] += 1
                    elif status == 'in_progress':
                        stats['in_progress_runs'] += 1
                    
                    # Calculate duration
                    if run.get('run_started_at') and run.get('updated_at'):
                        try:
                            start = datetime.fromisoformat(run['run_started_at'].replace('Z', '+00:00'))
                            end = datetime.fromisoformat(run['updated_at'].replace('Z', '+00:00'))
                            duration = (end - start).total_seconds() / 60
                            stats['total_duration_minutes'] += duration
                        except Exception:
                            pass
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting GitHub Actions usage stats: {e}")
            return stats
    
    def trigger_workflow(self, owner: str, repo: str, workflow_id: int, ref: str = 'main', 
                        inputs: Optional[Dict[str, Any]] = None) -> tuple:
        """
        Trigger a workflow dispatch event
        
        Args:
            owner: Repository owner
            repo: Repository name
            workflow_id: Workflow ID or filename
            ref: Git reference (branch, tag, or commit SHA)
            inputs: Optional inputs for the workflow
        
        Returns:
            Tuple of (success: bool, message: str)
        """
        try:
            url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
            
            payload = {
                'ref': ref
            }
            
            if inputs:
                payload['inputs'] = inputs
            
            response = self.session.post(url, json=payload)
            
            if response.status_code == 204:
                logger.info(f"Successfully triggered workflow {workflow_id} for {owner}/{repo}")
                return True, f"Workflow triggered successfully on branch '{ref}'"
            elif response.status_code == 404:
                return False, "Workflow not found or does not have workflow_dispatch trigger"
            elif response.status_code == 422:
                return False, "Invalid request. Check if the workflow has workflow_dispatch event configured"
            else:
                error_msg = response.json().get('message', f'HTTP {response.status_code}')
                return False, f"Failed to trigger workflow: {error_msg}"
                
        except Exception as e:
            logger.error(f"Error triggering workflow {workflow_id} for {owner}/{repo}: {e}")
            return False, str(e)
    
    def _paginated_request(self, url: str, params: Optional[Dict] = None) -> List[Any]:
        """Handle paginated GitHub API requests"""
        results = []
        page = 1
        per_page = 100
        
        if params is None:
            params = {}
        
        params['per_page'] = per_page
        
        try:
            while True:
                params['page'] = page
                response = self.session.get(url, params=params)
                
                if response.status_code != 200:
                    logger.warning(f"Request failed with status {response.status_code}")
                    break
                
                data = response.json()
                
                # Handle different response formats
                if isinstance(data, list):
                    if not data:
                        break
                    results.extend(data)
                elif isinstance(data, dict):
                    # Check for workflow_runs or workflows key
                    if 'workflow_runs' in data:
                        runs = data['workflow_runs']
                        if not runs:
                            break
                        results.extend(runs)
                    elif 'workflows' in data:
                        workflows = data['workflows']
                        if not workflows:
                            break
                        results.extend(workflows)
                    else:
                        # If it's a dict but not paginated, return as is
                        results.append(data)
                        break
                else:
                    break
                
                # Check if there are more pages
                if 'Link' not in response.headers:
                    break
                
                links = response.headers['Link']
                if 'rel="next"' not in links:
                    break
                
                page += 1
                
                # Safety limit
                if page > 100:
                    logger.warning("Reached pagination limit of 100 pages")
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Error in paginated request: {e}")
            return results
