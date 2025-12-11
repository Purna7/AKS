// Global state
let currentView = 'dashboard';
let currentFilter = 'all';
let refreshInterval;
let currentCurrency = 'USD'; // Default currency
let currentCurrencySymbol = '$'; // Default symbol

// Pagination state
let currentPage = 1;
let pageSize = 10;
let totalResources = 0;
let allResources = [];

// Currency symbol mapping
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'CHF',
        'SEK': 'kr',
        'NOK': 'kr',
        'DKK': 'kr',
        'BRL': 'R$',
        'ZAR': 'R',
        'RUB': '₽',
        'KRW': '₩',
        'SGD': 'S$',
        'NZD': 'NZ$',
        'MXN': 'MX$',
        'HKD': 'HK$',
        'TRY': '₺',
        'PLN': 'zł',
        'THB': '฿'
    };
    return symbols[currency] || currency + ' ';
}

function formatCurrency(amount, decimals = 2) {
    return `${currentCurrencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadDashboardData();
    startAutoRefresh();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.getAttribute('data-type');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadResources();
        });
    });
}

function switchView(view) {
    currentView = view;
    
    // Hide all views
    document.querySelectorAll('.view-content').forEach(v => {
        v.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Update header
    const titles = {
        'dashboard': { title: 'Multi-Cloud Dashboard', subtitle: 'Real-time overview of your cloud resources' },
        'resources': { title: 'Cloud Resources', subtitle: 'Manage all your cloud resources in one place' },
        'github': { title: 'GitHub Actions', subtitle: 'Monitor and manage your GitHub workflows and action runs' },
        'azuredevops': { title: 'Azure DevOps Pipelines', subtitle: 'Monitor and manage your Azure DevOps pipelines and runs' },
        'providers': { title: 'Cloud Providers', subtitle: 'Configure and manage cloud provider connections' },
        'costs': { title: 'Cost Analysis', subtitle: 'Track and analyze your cloud spending for the last 30 days' },
        'compliance': { title: 'Compliance Status', subtitle: 'View non-compliant resources and policy violations' },
        'alerts': { title: 'System Alerts', subtitle: 'Monitor and manage system alerts' },
        'settings': { title: 'Settings', subtitle: 'Configure application settings' }
    };
    
    document.getElementById('page-title').textContent = titles[view].title;
    document.getElementById('page-subtitle').textContent = titles[view].subtitle;
    
    // Update breadcrumb
    document.getElementById('breadcrumb-current').textContent = titles[view].title;
    
    // Load view-specific data
    switch (view) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'resources':
            loadResources();
            break;
        case 'github':
            loadGitHubActionsView();
            break;
        case 'azuredevops':
            loadADOPipelinesView();
            break;
        case 'providers':
            loadProviders();
            break;
        case 'costs':
            loadCosts();
            break;
        case 'compliance':
            loadCompliance();
            break;
        case 'alerts':
            loadAllAlerts();
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        updateSyncStatus('Syncing...', true);
        
        const response = await fetch('/api/dashboard/summary');
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Update currency if provided
            if (data.currency) {
                currentCurrency = data.currency;
                currentCurrencySymbol = getCurrencySymbol(data.currency);
            }
            
            // Update summary cards
            document.getElementById('total-resources').textContent = data.total_resources;
            document.getElementById('total-providers').textContent = data.total_providers;
            document.getElementById('total-cost').textContent = formatCurrency(data.total_cost_30d, 0);
            document.getElementById('total-alerts').textContent = data.alerts_count;
            
            // Update resource distribution
            const totalResources = data.total_resources || 1;
            document.getElementById('vm-count').textContent = data.resource_counts.vms;
            document.getElementById('vm-bar').style.width = `${(data.resource_counts.vms / totalResources) * 100}%`;
            
            document.getElementById('storage-count').textContent = data.resource_counts.storage;
            document.getElementById('storage-bar').style.width = `${(data.resource_counts.storage / totalResources) * 100}%`;
            
            document.getElementById('network-count').textContent = data.resource_counts.networks;
            document.getElementById('network-bar').style.width = `${(data.resource_counts.networks / totalResources) * 100}%`;
            
            document.getElementById('database-count').textContent = data.resource_counts.databases;
            document.getElementById('database-bar').style.width = `${(data.resource_counts.databases / totalResources) * 100}%`;
            
            // Update status counts
            document.getElementById('running-count').textContent = data.status_counts.running;
            document.getElementById('stopped-count').textContent = data.status_counts.stopped;
            
            // Update provider cards
            updateProviderCards(data.provider_counts);
            
            // Load GitHub Actions
            loadGitHubActions();
            
            // Load recent alerts
            loadRecentAlerts();
            
            updateSyncStatus('Synced', false);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        updateSyncStatus('Error', false);
    }
}

function updateProviderCards(providerCounts) {
    const providersGrid = document.getElementById('providers-grid');
    providersGrid.innerHTML = '';
    
    const providers = [
        { name: 'AWS', icon: '☁️', color: '#FF9900', key: 'aws' },
        { name: 'Azure', icon: '☁️', color: '#0089D6', key: 'azure' },
        { name: 'GCP', icon: '☁️', color: '#4285F4', key: 'gcp' }
    ];
    
    providers.forEach(provider => {
        const count = providerCounts[provider.key] || 0;
        const card = document.createElement('div');
        card.className = 'provider-card';
        card.style.cursor = 'pointer';
        card.onclick = () => switchView('providers');
        card.innerHTML = `
            <h4>${provider.icon} ${provider.name}</h4>
            <div class="provider-count">${count}</div>
            <div class="provider-label">Resources</div>
        `;
        providersGrid.appendChild(card);
    });
}

// Load Resources
async function loadResources() {
    try {
        let url = '/api/resources';
        if (currentFilter !== 'all') {
            url += `?type=${currentFilter}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            // Filter out GitHub Actions from Resources view
            allResources = (result.resources || []).filter(resource => 
                resource.resource_type !== 'GitHub Action' && resource.type !== 'GitHub Action'
            );
            totalResources = allResources.length;
            
            console.log('Loaded resources:', {
                total: result.resources.length,
                afterFilter: totalResources,
                allResources: allResources.length
            });
            
            // Reset to first page when filter changes
            currentPage = 1;
            
            displayPage();
        }
    } catch (error) {
        console.error('Error loading resources:', error);
    }
}

// Display current page of resources
function displayPage() {
    const tbody = document.getElementById('resources-table-body');
    tbody.innerHTML = '';
    
    if (totalResources === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No resources found</td></tr>';
        updatePaginationControls();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalResources);
    const pageResources = allResources.slice(startIndex, endIndex);
    
    // Display resources for current page
    pageResources.forEach(resource => {
        const row = document.createElement('tr');
        const statusClass = resource.status.toLowerCase().replace(/[^a-z]/g, '-');
        
        // Add refresh button for Azure VMs
        const isAzureVM = resource.resource_type === 'VM' && resource.provider === 'Azure';
        const azureResourceId = resource.resource_id || '';  // Full Azure resource ID
        
        row.innerHTML = `
            <td>${resource.name}</td>
            <td>${resource.resource_type}</td>
            <td>${resource.provider}</td>
            <td>${resource.region}</td>
            <td>
                <span class="status-badge status-${statusClass}" id="status-${resource.id}">${resource.status}</span>
                ${isAzureVM ? `<button class="btn-refresh" onclick='refreshVMStatus(${JSON.stringify(azureResourceId)}, ${resource.id}, this)' title="Refresh Status">🔄</button>` : ''}
            </td>
            <td>${resource.size}</td>
            <td>
                <span id="updated-${resource.id}">${resource.last_updated ? new Date(resource.last_updated).toLocaleString() : 'N/A'}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updatePaginationControls();
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = totalResources === 0 ? 0 : Math.ceil(totalResources / pageSize);
    const startIndex = totalResources === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = totalResources === 0 ? 0 : Math.min(currentPage * pageSize, totalResources);
    
    console.log('Pagination update:', {
        totalResources,
        totalPages,
        currentPage,
        startIndex,
        endIndex,
        pageSize
    });
    
    // Update info
    document.getElementById('page-start').textContent = startIndex;
    document.getElementById('page-end').textContent = endIndex;
    document.getElementById('total-resources').textContent = totalResources;
    document.getElementById('current-page').textContent = totalResources === 0 ? 0 : currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    // Enable/disable buttons
    const firstBtn = document.getElementById('first-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const lastBtn = document.getElementById('last-page');
    
    if (firstBtn) {
        firstBtn.disabled = currentPage === 1;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
        lastBtn.disabled = currentPage >= totalPages;
    }
}

// Pagination functions
function nextPage() {
    const totalPages = Math.ceil(totalResources / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        displayPage();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPage();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(totalResources / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayPage();
    }
}

function goToLastPage() {
    const totalPages = Math.ceil(totalResources / pageSize);
    currentPage = totalPages;
    displayPage();
}

function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size').value);
    currentPage = 1;
    displayPage();
}

// Load Providers
async function loadProviders() {
    try {
        const response = await fetch('/api/providers');
        const result = await response.json();
        
        if (result.success) {
            console.log('Providers loaded:', result.providers);
        }
    } catch (error) {
        console.error('Error loading providers:', error);
    }
}

// Load Recent Alerts
async function loadRecentAlerts() {
    try {
        const response = await fetch('/api/alerts?unresolved=true');
        const result = await response.json();
        
        if (result.success) {
            const alertsList = document.getElementById('alerts-list');
            alertsList.innerHTML = '';
            
            if (!result.alerts || result.alerts.length === 0) {
                alertsList.innerHTML = '<p>No active alerts</p>';
                return;
            }
            
            result.alerts.slice(0, 5).forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert-item ${alert.severity}`;
                alertDiv.innerHTML = `
                    <div class="alert-content">
                        <h5>${alert.title}</h5>
                        <p>${alert.message || ''}</p>
                    </div>
                    <div class="alert-time">${formatTime(alert.created_at)}</div>
                `;
                alertsList.appendChild(alertDiv);
            });
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Load All Alerts
async function loadAllAlerts() {
    try {
        const response = await fetch('/api/alerts');
        const result = await response.json();
        
        if (result.success) {
            const alertsList = document.getElementById('all-alerts-list');
            alertsList.innerHTML = '';
            
            if (!result.alerts || result.alerts.length === 0) {
                alertsList.innerHTML = '<p>No alerts found</p>';
                return;
            }
            
            result.alerts.forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert-item ${alert.severity}`;
                alertDiv.innerHTML = `
                    <div class="alert-content">
                        <h5>${alert.title}</h5>
                        <p>${alert.message || ''}</p>
                        <small>${alert.is_resolved ? '✓ Resolved' : '⚠ Unresolved'}</small>
                    </div>
                    <div class="alert-time">${formatTime(alert.created_at)}</div>
                `;
                alertsList.appendChild(alertDiv);
            });
        }
    } catch (error) {
        console.error('Error loading all alerts:', error);
    }
}

// Load Costs
async function loadCosts() {
    try {
        const response = await fetch('/api/costs?days=30');
        const result = await response.json();
        
        if (result.success) {
            // Simple placeholder - in production, use Chart.js or similar
            console.log('Cost data:', result.data);
        }
    } catch (error) {
        console.error('Error loading costs:', error);
    }
}

// Test Connection
async function testConnection(provider) {
    try {
        const statusDiv = document.getElementById(`${provider.toLowerCase()}-status`);
        statusDiv.textContent = 'Testing connection...';
        statusDiv.className = 'connection-status';
        
        const response = await fetch(`/api/test-connection/${provider}`);
        const result = await response.json();
        
        if (result.success) {
            statusDiv.textContent = `✓ ${result.message}`;
            statusDiv.className = 'connection-status success';
        } else {
            statusDiv.textContent = `✗ ${result.message}`;
            statusDiv.className = 'connection-status error';
        }
    } catch (error) {
        const statusDiv = document.getElementById(`${provider.toLowerCase()}-status`);
        statusDiv.textContent = `✗ Connection failed: ${error.message}`;
        statusDiv.className = 'connection-status error';
    }
}

// Refresh Data
async function refreshData() {
    const refreshIcon = document.getElementById('refresh-icon');
    refreshIcon.classList.add('loading');
    
    try {
        // Trigger sync
        await fetch('/api/sync', { method: 'POST' });
        
        // Reload current view data
        await loadDashboardData();
        
        if (currentView === 'resources') {
            await loadResources();
        }
    } catch (error) {
        console.error('Error refreshing data:', error);
    } finally {
        refreshIcon.classList.remove('loading');
    }
}

// Auto Refresh
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        if (currentView === 'dashboard') {
            loadDashboardData();
        }
    }, 30000); // 30 seconds
}

// Update Sync Status
function updateSyncStatus(text, isActive) {
    document.getElementById('sync-status-text').textContent = text;
    const dot = document.getElementById('sync-status-dot');
    
    if (isActive) {
        dot.style.background = 'var(--warning-color)';
    } else if (text === 'Synced') {
        dot.style.background = 'var(--success-color)';
    } else {
        dot.style.background = 'var(--danger-color)';
    }
}

// Load Compliance Data
async function loadCompliance() {
    try {
        updateSyncStatus('Loading compliance data...', true);
        
        // Load non-compliant resources
        const complianceResponse = await fetch('/api/compliance');
        const complianceResult = await complianceResponse.json();
        
        if (complianceResult.success) {
            const nonCompliantResources = complianceResult.non_compliant_resources || [];
            const count = complianceResult.total_count || 0;
            
            // Update compliance count
            document.getElementById('compliance-count').textContent = `${count} Non-Compliant Resource${count !== 1 ? 's' : ''}`;
            
            // Populate compliance table
            const tableBody = document.getElementById('compliance-table-body');
            const emptyState = document.getElementById('compliance-empty');
            
            if (nonCompliantResources.length === 0) {
                tableBody.innerHTML = '';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                tableBody.innerHTML = nonCompliantResources.map(resource => `
                    <tr>
                        <td><strong>${resource.resource_name || 'Unknown'}</strong></td>
                        <td>${resource.resource_type || 'Unknown'}</td>
                        <td>${resource.resource_group || 'Unknown'}</td>
                        <td>${resource.resource_location || 'Unknown'}</td>
                        <td>${resource.policy_assignment || 'Unknown'}</td>
                        <td>${resource.policy_definition || 'Unknown'}</td>
                        <td><span class="status-badge status-error">${resource.compliance_state || 'Non-Compliant'}</span></td>
                    </tr>
                `).join('');
            }
        }
        
        updateSyncStatus('Synced', false);
        
    } catch (error) {
        console.error('Error loading compliance data:', error);
        updateSyncStatus('Sync Error', false);
    }
}

// Load Cost Data
async function loadCosts() {
    try {
        updateSyncStatus('Loading cost data...', true);
        
        // Load cost data for last 30 days
        const costResponse = await fetch('/api/costs/last-30-days');
        const costResult = await costResponse.json();
        
        if (costResult.success) {
            const costs = costResult.costs || {};
            
            // Update currency if provided
            if (costs.currency) {
                currentCurrency = costs.currency;
                currentCurrencySymbol = getCurrencySymbol(costs.currency);
            }
            
            // Update total cost
            document.getElementById('total-cost').textContent = formatCurrency(costs.total_cost || 0);
            
            // Update period
            if (costs.period_start && costs.period_end) {
                const startDate = new Date(costs.period_start).toLocaleDateString();
                const endDate = new Date(costs.period_end).toLocaleDateString();
                document.getElementById('cost-period').textContent = `${startDate} - ${endDate}`;
            }
            
            // Populate cost by service
            const costByService = document.getElementById('cost-by-service');
            const services = costs.cost_by_service || [];
            
            if (services.length === 0) {
                costByService.innerHTML = '<p class="empty-message">No service cost data available</p>';
            } else {
                // Sort by cost descending and take top 10
                const topServices = services.sort((a, b) => b.cost - a.cost).slice(0, 10);
                costByService.innerHTML = topServices.map(service => `
                    <div class="cost-item">
                        <span class="cost-name">${service.service_name}</span>
                        <span class="cost-amount">${formatCurrency(service.cost)}</span>
                    </div>
                `).join('');
            }
            
            // Populate cost by resource
            const costByResource = document.getElementById('cost-by-resource');
            const resources = costs.cost_by_resource || [];
            
            if (resources.length === 0) {
                costByResource.innerHTML = '<p class="empty-message">No resource cost data available</p>';
            } else {
                // Sort by cost descending and take top 10
                const topResources = resources.sort((a, b) => b.cost - a.cost).slice(0, 10);
                costByResource.innerHTML = topResources.map(resource => `
                    <div class="cost-item">
                        <div class="cost-resource-info">
                            <span class="cost-name">${resource.resource_name || 'Unknown'}</span>
                            <span class="cost-type">${resource.resource_type || ''}</span>
                        </div>
                        <span class="cost-amount">${formatCurrency(resource.cost)}</span>
                    </div>
                `).join('');
            }
        }
        
        updateSyncStatus('Synced', false);
        
    } catch (error) {
        console.error('Error loading cost data:', error);
        updateSyncStatus('Sync Error', false);
    }
}

// Utility Functions
function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Theme Management Functions
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

// Initialize theme on page load
loadTheme();

// GitHub Actions Functions
async function discoverGitHubResources() {
    // Try to find status divs in current view
    const statusDiv = document.getElementById('github-status') || document.getElementById('github-main-status');
    const statsDiv = document.getElementById('github-stats');
    
    try {
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="loading">🔄 Discovering GitHub Actions...</div>';
        }
        if (statsDiv) {
            statsDiv.innerHTML = '';
        }
        
        const response = await fetch('/api/github/discover');
        const result = await response.json();
        
        if (result.success) {
            if (statusDiv) {
                statusDiv.innerHTML = `<div class="success">✅ ${result.message}</div>`;
            }
            
            // Load usage stats if on GitHub view
            if (currentView === 'github') {
                await loadGitHubUsageStats();
                await loadGitHubActionsView();
            } else {
                // Load usage stats for providers view
                await loadGitHubStats();
            }
            
            // Refresh dashboard if that's current view
            if (currentView === 'dashboard') {
                loadDashboardData();
            }
        } else {
            if (statusDiv) {
                statusDiv.innerHTML = `<div class="error">❌ Error: ${result.error}</div>`;
            }
        }
    } catch (error) {
        console.error('Error discovering GitHub resources:', error);
        if (statusDiv) {
            statusDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
        }
    }
}

async function loadGitHubStats() {
    const statsDiv = document.getElementById('github-stats');
    
    try {
        const response = await fetch('/api/github/usage-stats?days=30');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.stats;
            statsDiv.innerHTML = `
                <div class="github-stats">
                    <h4>📊 Usage Stats (Last 30 Days)</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Workflows:</span>
                            <span class="stat-value">${stats.total_workflows}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Runs:</span>
                            <span class="stat-value">${stats.total_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Successful:</span>
                            <span class="stat-value success">${stats.successful_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Failed:</span>
                            <span class="stat-value error">${stats.failed_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Duration:</span>
                            <span class="stat-value">${Math.round(stats.total_duration_minutes)} min</span>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading GitHub stats:', error);
    }
}

// Store all GitHub actions for filtering
let allGitHubActions = [];

async function loadGitHubActionsView() {
    const mainViewDiv = document.getElementById('github-actions-main-view');
    const refreshIcon = document.getElementById('github-view-refresh-icon');
    const repoFilter = document.getElementById('repo-filter');
    
    try {
        // Show loading state
        if (refreshIcon) refreshIcon.textContent = '⏳';
        mainViewDiv.innerHTML = '<div class="loading">Loading GitHub Actions...</div>';
        
        // Fetch GitHub Action resources
        const response = await fetch('/api/resources?type=GitHub Action');
        const result = await response.json();
        
        if (result.success && result.resources.length > 0) {
            allGitHubActions = result.resources;
            
            // Populate repository filter
            populateRepoFilter(result.resources);
            
            displayGitHubActionsGrid(result.resources, mainViewDiv);
        } else {
            allGitHubActions = [];
            mainViewDiv.innerHTML = `
                <div class="github-empty-state">
                    <p>No GitHub Actions found</p>
                    <p>Click <strong>Discover Actions</strong> above to fetch your workflows</p>
                </div>
            `;
            // Reset filter
            if (repoFilter) {
                repoFilter.innerHTML = '<option value="all">All Repositories</option>';
            }
        }
        
        if (refreshIcon) refreshIcon.textContent = '🔄';
    } catch (error) {
        console.error('Error loading GitHub Actions view:', error);
        mainViewDiv.innerHTML = `
            <div class="error-state">
                <p>❌ Error loading GitHub Actions: ${error.message}</p>
            </div>
        `;
        if (refreshIcon) refreshIcon.textContent = '🔄';
    }
}

function populateRepoFilter(actions) {
    const repoFilter = document.getElementById('repo-filter');
    if (!repoFilter) return;
    
    // Get unique repositories (use tags.repository which has owner/repo format)
    const repositories = [...new Set(actions.map(action => {
        // Try metadata first, then tags, then fall back to extracting from name
        return action.metadata?.repository || 
               action.tags?.repository || 
               action.name?.split('/')[0] || 
               'Unknown';
    }))].filter(repo => repo !== 'Unknown').sort();
    
    // Build options HTML with icons
    let optionsHtml = '<option value="all">🔍 All Repositories</option>';
    repositories.forEach(repo => {
        optionsHtml += `<option value="${repo}">📦 ${repo}</option>`;
    });
    
    repoFilter.innerHTML = optionsHtml;
}

function filterGitHubActionsByRepo() {
    const repoFilter = document.getElementById('repo-filter');
    const mainViewDiv = document.getElementById('github-actions-main-view');
    
    if (!repoFilter || !mainViewDiv) return;
    
    const selectedRepo = repoFilter.value;
    
    if (selectedRepo === 'all') {
        // Show all actions
        displayGitHubActionsGrid(allGitHubActions, mainViewDiv);
    } else {
        // Filter by selected repository (check all possible locations)
        const filteredActions = allGitHubActions.filter(action => {
            const repo = action.metadata?.repository || 
                        action.tags?.repository || 
                        action.name?.split('/')[0] || 
                        'Unknown';
            return repo === selectedRepo;
        });
        
        if (filteredActions.length > 0) {
            displayGitHubActionsGrid(filteredActions, mainViewDiv);
        } else {
            mainViewDiv.innerHTML = `
                <div class="github-empty-state">
                    <p>No workflows found for repository: <strong>${selectedRepo}</strong></p>
                </div>
            `;
        }
    }
}

async function loadGitHubUsageStats() {
    const statsDiv = document.getElementById('github-usage-stats');
    
    try {
        statsDiv.innerHTML = '<div class="loading">Loading usage statistics...</div>';
        
        const response = await fetch('/api/github/usage-stats?days=30');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.stats;
            statsDiv.innerHTML = `
                <div class="github-stats">
                    <h4>📊 Usage Statistics (Last 30 Days)</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Workflows:</span>
                            <span class="stat-value">${stats.total_workflows}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Runs:</span>
                            <span class="stat-value">${stats.total_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Successful:</span>
                            <span class="stat-value success">${stats.successful_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Failed:</span>
                            <span class="stat-value error">${stats.failed_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">In Progress:</span>
                            <span class="stat-value">${stats.in_progress_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Duration:</span>
                            <span class="stat-value">${Math.round(stats.total_duration_minutes)} min</span>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading GitHub usage stats:', error);
        statsDiv.innerHTML = `<div class="error-state"><p>❌ Error loading statistics</p></div>`;
    }
}

function displayGitHubActionsGrid(actions, containerDiv) {
    // Group by repository (use consistent field across metadata/tags)
    const byRepo = {};
    actions.forEach(action => {
        const repo = action.metadata?.repository || 
                     action.tags?.repository || 
                     action.name?.split('/')[0] || 
                     'Unknown';
        if (!byRepo[repo]) {
            byRepo[repo] = [];
        }
        byRepo[repo].push(action);
    });
    
    // Build HTML
    let html = '<div class="github-repos-grid">';
    
    for (const [repo, workflows] of Object.entries(byRepo)) {
        const totalRuns = workflows.reduce((sum, w) => sum + (w.metadata?.total_runs || 0), 0);
        const successRuns = workflows.reduce((sum, w) => sum + (w.metadata?.success_runs || 0), 0);
        const failureRuns = workflows.reduce((sum, w) => sum + (w.metadata?.failure_runs || 0), 0);
        const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
        
        // Get repository URL from first workflow
        const repoUrl = workflows[0]?.metadata?.repository_url || `https://github.com/${repo}`;
        
        html += `
            <div class="github-repo-card">
                <div class="repo-header">
                    <h4>📦 <a href="${repoUrl}" target="_blank" class="repo-link">${repo}</a></h4>
                    <span class="workflow-count">${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <span class="stat-label">Total Runs</span>
                        <span class="stat-value">${totalRuns}</span>
                    </div>
                    <div class="repo-stat">
                        <span class="stat-label">Success Rate</span>
                        <span class="stat-value success">${successRate}%</span>
                    </div>
                </div>
                <div class="workflows-list">
        `;
        
        // Add workflows
        workflows.forEach(workflow => {
            const status = workflow.status.toLowerCase();
            const statusClass = status === 'success' ? 'success' : 
                               status === 'failure' ? 'failed' : 
                               status === 'in_progress' ? 'running' : 'unknown';
            
            const workflowName = workflow.metadata?.workflow_name || workflow.name;
            const lastRun = workflow.metadata?.last_run ? 
                new Date(workflow.metadata.last_run).toLocaleString() : 'Never';
            const workflowUrl = workflow.metadata?.workflow_url || '#';
            const owner = workflow.metadata?.owner || repo.split('/')[0];
            const repoName = workflow.metadata?.repository_name || repo.split('/')[1] || repo;
            const workflowId = workflow.metadata?.workflow_id || '';
            
            html += `
                <div class="workflow-item" onclick="showWorkflowLogs('${owner}', '${repoName}', ${workflowId}, '${workflowName.replace(/'/g, "\\'")}'  , '${workflowUrl}')" style="cursor: pointer;">
                    <div class="workflow-info">
                        <span class="workflow-name">⚡ ${workflowName}</span>
                        <span class="workflow-status status-${statusClass}">${workflow.status}</span>
                    </div>
                    <div class="workflow-meta">
                        <span class="workflow-runs">${workflow.size}</span>
                        <span class="workflow-last-run">Last: ${lastRun}</span>
                        <button onclick="event.stopPropagation(); quickTriggerWorkflow('${owner}', '${repoName}', ${workflowId}, this)" class="workflow-quick-trigger" title="Quick trigger on main branch">▶️</button>
                        <a href="${workflowUrl}" target="_blank" class="workflow-link" onclick="event.stopPropagation()" title="View on GitHub">🔗</a>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    containerDiv.innerHTML = html;
}

async function loadGitHubActions() {
    const dashboardDiv = document.getElementById('github-actions-dashboard');
    const refreshIcon = document.getElementById('github-refresh-icon');
    
    try {
        // Show loading state
        if (refreshIcon) refreshIcon.textContent = '⏳';
        dashboardDiv.innerHTML = '<div class="loading">Loading GitHub Actions...</div>';
        
        // Fetch GitHub Action resources
        const response = await fetch('/api/resources?type=GitHub Action');
        const result = await response.json();
        
        if (result.success && result.resources.length > 0) {
            displayGitHubActionsGrid(result.resources, dashboardDiv);
        } else {
            dashboardDiv.innerHTML = `
                <div class="github-empty-state">
                    <p>No GitHub Actions found</p>
                    <p>Go to <strong>Providers</strong> → <strong>GitHub Actions</strong> and click <strong>Discover Actions</strong></p>
                </div>
            `;
        }
        
        refreshIcon.textContent = '🔄';
    } catch (error) {
        console.error('Error loading GitHub Actions:', error);
        dashboardDiv.innerHTML = `
            <div class="error-state">
                <p>❌ Error loading GitHub Actions: ${error.message}</p>
            </div>
        `;
        refreshIcon.textContent = '🔄';
    }
}

async function showWorkflowLogs(owner, repo, workflowId, workflowName, workflowUrl) {
    const modal = document.getElementById('github-logs-modal');
    const titleEl = document.getElementById('modal-workflow-title');
    const infoEl = document.getElementById('modal-workflow-info');
    const runsEl = document.getElementById('modal-runs-list');
    
    // Show modal
    modal.style.display = 'block';
    
    // Update title
    titleEl.innerHTML = `⚡ ${workflowName}`;
    
    // Show workflow info with trigger button
    infoEl.innerHTML = `
        <div class=\"workflow-details\">
            <div class=\"detail-item\">
                <strong>Repository:</strong> ${owner}/${repo}
            </div>
            <div class=\"detail-item\">
                <strong>Workflow ID:</strong> ${workflowId}
            </div>
            <div class=\"detail-item\">
                <label for=\"workflow-branch\"><strong>Branch:</strong></label>
                <input type=\"text\" id=\"workflow-branch\" value=\"main\" class=\"branch-input\" placeholder=\"main\" />
            </div>
            <div class=\"detail-item\">
                <button onclick=\"triggerWorkflow('${owner}', '${repo}', ${workflowId})\" class=\"btn btn-sm btn-success\" id=\"trigger-workflow-btn\">
                    ▶️ Trigger Workflow
                </button>
                <a href=\"${workflowUrl}\" target=\"_blank\" class=\"btn btn-sm btn-primary\">
                    🔗 View on GitHub
                </a>
            </div>
        </div>
        <div id=\"trigger-status\" class=\"trigger-status\"></div>
    `;
    
    // Load runs
    runsEl.innerHTML = '<div class=\"loading\">Loading workflow runs...</div>';
    
    try {
        const response = await fetch(`/api/github/workflow-runs/${owner}/${repo}/${workflowId}?days=30`);
        const result = await response.json();
        
        if (result.success && result.runs.length > 0) {
            let runsHtml = '<div class=\"runs-timeline\">';
            
            result.runs.forEach(run => {
                const status = run.status;
                const conclusion = run.conclusion || 'in_progress';
                const statusClass = conclusion === 'success' ? 'success' : 
                                  conclusion === 'failure' ? 'failed' : 
                                  status === 'in_progress' ? 'running' : 'unknown';
                
                const createdAt = new Date(run.created_at).toLocaleString();
                const updatedAt = new Date(run.updated_at).toLocaleString();
                const duration = run.run_started_at && run.updated_at ? 
                    calculateDuration(run.run_started_at, run.updated_at) : 'N/A';
                
                const commitMsg = run.head_commit?.message || 'No commit message';
                const commitShort = commitMsg.split('\\n')[0].substring(0, 60);
                const actor = run.actor?.login || 'Unknown';
                
                runsHtml += `
                    <div class=\"run-item\">
                        <div class=\"run-header\">
                            <span class=\"run-number\">#${run.run_number}</span>
                            <span class=\"run-status status-${statusClass}\">${conclusion || status}</span>
                            <span class=\"run-duration\">⏱️ ${duration}</span>
                        </div>
                        <div class=\"run-details\">
                            <div class=\"run-commit\">💬 ${commitShort}</div>
                            <div class=\"run-meta\">
                                <span>👤 ${actor}</span>
                                <span>📅 ${createdAt}</span>
                                <span>🔄 ${run.run_attempt || 1} attempt(s)</span>
                            </div>
                        </div>
                        <div class=\"run-actions\">
                            <a href=\"${run.html_url}\" target=\"_blank\" class=\"btn btn-sm btn-secondary\">
                                View Full Logs on GitHub
                            </a>
                        </div>
                    </div>
                `;
            });
            
            runsHtml += '</div>';
            runsEl.innerHTML = runsHtml;
        } else {
            runsEl.innerHTML = '<div class=\"empty-state\"><p>No recent runs found for this workflow</p></div>';
        }
    } catch (error) {
        console.error('Error loading workflow runs:', error);
        runsEl.innerHTML = `<div class=\"error-state\"><p>❌ Error loading runs: ${error.message}</p></div>`;
    }
}

function closeGitHubLogsModal() {
    const modal = document.getElementById('github-logs-modal');
    modal.style.display = 'none';
}

async function quickTriggerWorkflow(owner, repo, workflowId, buttonElement) {
    const originalContent = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = '⏳';
    
    try {
        const response = await fetch('/api/github/trigger-workflow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: owner,
                repo: repo,
                workflow_id: workflowId,
                ref: 'main'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            buttonElement.innerHTML = '✓';
            buttonElement.style.color = 'var(--success-color)';
            setTimeout(() => {
                buttonElement.innerHTML = originalContent;
                buttonElement.disabled = false;
                buttonElement.style.color = '';
            }, 2000);
        } else {
            buttonElement.innerHTML = '❌';
            buttonElement.style.color = 'var(--danger-color)';
            setTimeout(() => {
                buttonElement.innerHTML = originalContent;
                buttonElement.disabled = false;
                buttonElement.style.color = '';
                alert(`Failed to trigger workflow: ${result.error}\n\nMake sure the workflow has 'workflow_dispatch' trigger configured.`);
            }, 2000);
        }
    } catch (error) {
        console.error('Error triggering workflow:', error);
        buttonElement.innerHTML = '❌';
        buttonElement.style.color = 'var(--danger-color)';
        setTimeout(() => {
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
            buttonElement.style.color = '';
        }, 2000);
    }
}

async function triggerWorkflow(owner, repo, workflowId) {
    const triggerBtn = document.getElementById('trigger-workflow-btn');
    const statusDiv = document.getElementById('trigger-status');
    const branchInput = document.getElementById('workflow-branch');
    const branch = branchInput.value.trim() || 'main';
    
    // Disable button and show loading
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = '⏳ Triggering...';
    statusDiv.innerHTML = '';
    
    try {
        const response = await fetch('/api/github/trigger-workflow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner: owner,
                repo: repo,
                workflow_id: workflowId,
                ref: branch
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            statusDiv.innerHTML = `
                <div class="success-message">
                    ✅ ${result.message}
                    <br/>
                    <small>Refresh the runs list in a few seconds to see the new run.</small>
                </div>
            `;
            triggerBtn.innerHTML = '✓ Triggered';
            
            // Reload runs after 3 seconds
            setTimeout(() => {
                showWorkflowLogs(owner, repo, workflowId, 'Workflow', '#');
            }, 3000);
        } else {
            statusDiv.innerHTML = `
                <div class="error-message">
                    ❌ ${result.error}
                    <br/>
                    <small>Make sure the workflow has 'workflow_dispatch' trigger configured.</small>
                </div>
            `;
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = '▶️ Trigger Workflow';
        }
    } catch (error) {
        console.error('Error triggering workflow:', error);
        statusDiv.innerHTML = `
            <div class="error-message">
                ❌ Error: ${error.message}
            </div>
        `;
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = '▶️ Trigger Workflow';
    }
}

function calculateDuration(startTime, endTime) {
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        
        if (diffMins > 0) {
            return `${diffMins}m ${diffSecs}s`;
        } else {
            return `${diffSecs}s`;
        }
    } catch (e) {
        return 'N/A';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('github-logs-modal');
    if (event.target === modal) {
        closeGitHubLogsModal();
    }
}

// Refresh VM status
async function refreshVMStatus(azureResourceId, dbResourceId, button) {
    const originalText = button.innerHTML;
    button.innerHTML = '⏳';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/resources/refresh-vm-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resource_id: azureResourceId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update status badge
            const statusBadge = document.getElementById(`status-${dbResourceId}`);
            if (statusBadge) {
                const statusClass = result.resource.status.toLowerCase().replace(/[^a-z]/g, '-');
                statusBadge.className = `status-badge status-${statusClass}`;
                statusBadge.textContent = result.resource.status;
            }
            
            // Update last updated time
            const updatedSpan = document.getElementById(`updated-${dbResourceId}`);
            if (updatedSpan) {
                updatedSpan.textContent = new Date(result.resource.last_updated).toLocaleString();
            }
            
            // Show success feedback
            button.innerHTML = '✓';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to refresh status');
        }
    } catch (error) {
        console.error('Error refreshing VM status:', error);
        button.innerHTML = '✗';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
        alert('Failed to refresh VM status: ' + error.message);
    }
}

// Refresh all VMs status
async function refreshAllVMs() {
    const btn = document.getElementById('refresh-all-vms-btn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Refreshing...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/resources/refresh-all-vms', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            btn.innerHTML = `✓ Updated ${result.updated_count} VMs`;
            
            // Reload resources to show updated status
            await loadResources();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        } else {
            throw new Error(result.error || 'Failed to refresh VMs');
        }
    } catch (error) {
        console.error('Error refreshing all VMs:', error);
        btn.innerHTML = '✗ Failed';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
        alert('Failed to refresh VMs: ' + error.message);
    }
}

// ==================== Azure DevOps Functions ====================

// Azure DevOps Pipeline Discovery
async function discoverADOPipelines() {
    const statusDiv = document.getElementById('azuredevops-status') || document.getElementById('ado-discover-status');
    const statsDiv = document.getElementById('azuredevops-stats');
    
    try {
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="loading">🔄 Discovering Azure DevOps Pipelines...</div>';
        }
        if (statsDiv) {
            statsDiv.innerHTML = '';
        }
        
        const response = await fetch('/api/azuredevops/discover', {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            if (statusDiv) {
                statusDiv.innerHTML = `<div class="success">✅ ${result.message}</div>`;
            }
            
            // Load usage stats if on Azure DevOps view
            if (currentView === 'azuredevops') {
                await loadADOUsageStats();
                await loadADOPipelinesView();
            } else {
                // Load usage stats for providers view
                await loadADOStats();
            }
            
            // Refresh dashboard if that's current view
            if (currentView === 'dashboard') {
                loadDashboardData();
            }
        } else {
            if (statusDiv) {
                statusDiv.innerHTML = `<div class="error">❌ Error: ${result.error}</div>`;
            }
        }
    } catch (error) {
        console.error('Error discovering Azure DevOps pipelines:', error);
        if (statusDiv) {
            statusDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
        }
    }
}

// Load Azure DevOps stats for providers view
async function loadADOStats() {
    const statsDiv = document.getElementById('azuredevops-stats');
    if (!statsDiv) return;
    
    try {
        const response = await fetch('/api/azuredevops/usage-stats?days=30');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.stats;
            const successRate = stats.total_runs > 0 
                ? ((stats.successful_runs / stats.total_runs) * 100).toFixed(1)
                : 0;
            
            statsDiv.innerHTML = `
                <div class="github-stats">
                    <h4>📊 Usage Stats (Last 30 Days)</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Total Pipelines:</span>
                            <span class="stat-value">${stats.total_pipelines}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Runs:</span>
                            <span class="stat-value">${stats.total_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Successful:</span>
                            <span class="stat-value success">${stats.successful_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Failed:</span>
                            <span class="stat-value error">${stats.failed_runs}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Success Rate:</span>
                            <span class="stat-value">${successRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Duration:</span>
                            <span class="stat-value">${Math.round(stats.total_duration_minutes)} min</span>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading Azure DevOps stats:', error);
    }
}

// Load Azure DevOps usage stats for main view
async function loadADOUsageStats() {
    try {
        const response = await fetch('/api/azuredevops/usage-stats?days=30');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.stats;
            const successRate = stats.total_runs > 0 
                ? ((stats.successful_runs / stats.total_runs) * 100).toFixed(1)
                : 0;
            
            // Update stat displays
            document.getElementById('ado-total-pipelines').textContent = stats.total_pipelines;
            document.getElementById('ado-total-runs').textContent = stats.total_runs;
            document.getElementById('ado-success-rate').textContent = `${successRate}%`;
        }
    } catch (error) {
        console.error('Error loading Azure DevOps usage stats:', error);
    }
}

// Store all ADO pipelines for filtering
let allADOPipelines = [];

// Load Azure DevOps pipelines view
async function loadADOPipelinesView() {
    const mainViewDiv = document.getElementById('ado-pipelines-main-view');
    const projectFilter = document.getElementById('ado-project-filter');
    
    try {
        // Show loading state
        mainViewDiv.innerHTML = '<div class="loading">Loading Azure DevOps Pipelines...</div>';
        
        // Fetch ADO Pipeline resources
        const response = await fetch('/api/resources?type=ADO Pipeline');
        const result = await response.json();
        
        if (result.success && result.resources.length > 0) {
            allADOPipelines = result.resources;
            
            // Populate project filter
            populateADOProjectFilter(result.resources);
            
            displayADOPipelinesGrid(result.resources, mainViewDiv);
        } else {
            allADOPipelines = [];
            mainViewDiv.innerHTML = `
                <div class="github-empty-state">
                    <p>No Azure DevOps Pipelines found</p>
                    <p>Click <strong>Discover Pipelines</strong> above to fetch your pipelines</p>
                </div>
            `;
            // Reset filter
            if (projectFilter) {
                projectFilter.innerHTML = '<option value="">All Projects</option>';
            }
        }
    } catch (error) {
        console.error('Error loading Azure DevOps pipelines view:', error);
        mainViewDiv.innerHTML = `
            <div class="error-state">
                <p>❌ Error loading Azure DevOps Pipelines: ${error.message}</p>
            </div>
        `;
    }
}

// Populate project filter dropdown
function populateADOProjectFilter(pipelines) {
    const projectFilter = document.getElementById('ado-project-filter');
    if (!projectFilter) return;
    
    // Get unique projects
    const projects = [...new Set(pipelines.map(p => p.tags?.project).filter(Boolean))];
    
    projectFilter.innerHTML = '<option value="">All Projects</option>';
    projects.sort().forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        projectFilter.appendChild(option);
    });
}

// Filter ADO pipelines by project
function filterADOPipelinesByProject() {
    const projectFilter = document.getElementById('ado-project-filter');
    const mainViewDiv = document.getElementById('ado-pipelines-main-view');
    
    if (!projectFilter || !mainViewDiv) return;
    
    const selectedProject = projectFilter.value;
    
    let filteredPipelines = allADOPipelines;
    if (selectedProject) {
        filteredPipelines = allADOPipelines.filter(p => p.tags?.project === selectedProject);
    }
    
    displayADOPipelinesGrid(filteredPipelines, mainViewDiv);
}

// Display ADO pipelines in grid
function displayADOPipelinesGrid(pipelines, container) {
    if (!pipelines || pipelines.length === 0) {
        container.innerHTML = `
            <div class="github-empty-state">
                <p>No pipelines match the selected filters</p>
            </div>
        `;
        return;
    }
    
    // Group by project
    const pipelinesByProject = {};
    pipelines.forEach(pipeline => {
        const project = pipeline.tags?.project || 'Unknown';
        if (!pipelinesByProject[project]) {
            pipelinesByProject[project] = [];
        }
        pipelinesByProject[project].push(pipeline);
    });
    
    let html = '<div class="github-actions-grid">';
    
    Object.keys(pipelinesByProject).sort().forEach(project => {
        html += `
            <div class="repo-section">
                <h4 class="repo-name">📁 ${project}</h4>
                <div class="workflows-grid">
        `;
        
        pipelinesByProject[project].forEach(pipeline => {
            const metadata = pipeline.resource_metadata || {};
            const statusClass = getStatusClass(pipeline.status);
            const lastRun = metadata.last_run ? new Date(metadata.last_run).toLocaleString() : 'Never';
            
            html += `
                <div class="workflow-card">
                    <div class="workflow-header">
                        <h5>${pipeline.tags?.pipeline_name || pipeline.name}</h5>
                        <span class="status-badge ${statusClass}">${pipeline.status}</span>
                    </div>
                    <div class="workflow-meta">
                        <div class="meta-item">
                            <span class="meta-label">Pipeline ID:</span>
                            <span class="meta-value">${pipeline.tags?.pipeline_id || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Folder:</span>
                            <span class="meta-value">${pipeline.tags?.folder || '/'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Total Runs (7d):</span>
                            <span class="meta-value">${metadata.total_runs || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Success:</span>
                            <span class="meta-value success">${metadata.success_runs || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Failed:</span>
                            <span class="meta-value error">${metadata.failure_runs || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">In Progress:</span>
                            <span class="meta-value">${metadata.in_progress_runs || 0}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Last Run:</span>
                            <span class="meta-value">${lastRun}</span>
                        </div>
                    </div>
                    <div class="workflow-actions">
                        ${metadata.pipeline_url ? `<a href="${metadata.pipeline_url}" target="_blank" class="btn btn-sm btn-secondary">View in Azure DevOps</a>` : ''}
                        <button class="btn btn-sm btn-primary" onclick="triggerADOPipeline('${pipeline.tags?.project}', ${pipeline.tags?.pipeline_id}, '${pipeline.tags?.pipeline_name}')">
                            ▶️ Trigger Run
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Trigger Azure DevOps pipeline
async function triggerADOPipeline(project, pipelineId, pipelineName) {
    if (!confirm(`Trigger pipeline "${pipelineName}" in project "${project}"?`)) {
        return;
    }
    
    const branch = prompt('Enter branch name:', 'main');
    if (!branch) return;
    
    try {
        const response = await fetch('/api/azuredevops/trigger-pipeline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project: project,
                pipeline_id: pipelineId,
                branch: branch
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ ${result.message}`);
            // Reload pipelines to get updated status
            setTimeout(() => loadADOPipelinesView(), 2000);
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error triggering pipeline:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Helper function to get status class
function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'succeeded' || statusLower === 'success') return 'status-success';
    if (statusLower === 'failed' || statusLower === 'failure') return 'status-failed';
    if (statusLower === 'canceled' || statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'inprogress' || statusLower === 'running') return 'status-running';
    return 'status-unknown';
}
