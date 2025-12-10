// Global state
let currentView = 'dashboard';
let currentFilter = 'all';
let refreshInterval;

// Pagination state
let currentPage = 1;
let pageSize = 10;
let totalResources = 0;
let allResources = [];

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
        'providers': { title: 'Cloud Providers', subtitle: 'Configure and manage cloud provider connections' },
        'costs': { title: 'Cost Analysis', subtitle: 'Track and analyze your cloud spending for the last 30 days' },
        'compliance': { title: 'Compliance Status', subtitle: 'View non-compliant resources and policy violations' },
        'alerts': { title: 'System Alerts', subtitle: 'Monitor and manage system alerts' },
        'settings': { title: 'Settings', subtitle: 'Configure application settings' }
    };
    
    document.getElementById('page-title').textContent = titles[view].title;
    document.getElementById('page-subtitle').textContent = titles[view].subtitle;
    
    // Load view-specific data
    switch (view) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'resources':
            loadResources();
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
            
            // Update summary cards
            document.getElementById('total-resources').textContent = data.total_resources;
            document.getElementById('total-providers').textContent = data.total_providers;
            document.getElementById('total-cost').textContent = `$${data.total_cost_30d.toLocaleString()}`;
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
            allResources = result.resources || [];
            totalResources = allResources.length;
            
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
        row.innerHTML = `
            <td>${resource.name}</td>
            <td>${resource.resource_type}</td>
            <td>${resource.provider}</td>
            <td>${resource.region}</td>
            <td><span class="status-badge status-${statusClass}">${resource.status}</span></td>
            <td>${resource.size}</td>
            <td>${new Date(resource.last_updated).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
    
    updatePaginationControls();
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalResources / pageSize);
    const startIndex = totalResources === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalResources);
    
    // Update info
    document.getElementById('page-start').textContent = startIndex;
    document.getElementById('page-end').textContent = endIndex;
    document.getElementById('total-resources').textContent = totalResources;
    document.getElementById('current-page').textContent = currentPage;
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
            
            // Update total cost
            document.getElementById('total-cost').textContent = `$${(costs.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
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
                        <span class="cost-amount">$${service.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                        <span class="cost-amount">$${resource.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
