// Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Global variables
let currentUser = null;
let userGuilds = [];
let selectedGuild = null;

function initializeDashboard() {
    initializeSidebar();
    initializeQuickActions();
    initializeServerSelectors();
    checkAuthStatus();
}

// Initialize sidebar navigation
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
                loadSectionData(sectionId);
            }
        });
    });
}

// Initialize quick action cards
function initializeQuickActions() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
}

// Handle quick actions
function handleQuickAction(action) {
    switch (action) {
        case 'setup-automod':
            navigateToSection('automod');
            break;
        case 'configure-modmail':
            navigateToSection('modmail');
            break;
        case 'setup-economy':
            navigateToSection('economy');
            break;
        case 'view-analytics':
            navigateToSection('analytics');
            break;
    }
}

// Navigate to a specific section
function navigateToSection(sectionId) {
    const sidebarLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (sidebarLink) {
        sidebarLink.click();
    }
}

// Initialize server selectors
function initializeServerSelectors() {
    const automodSelect = document.getElementById('automod-server-select');
    const settingsSelect = document.getElementById('settings-server-select');
    
    if (automodSelect) {
        automodSelect.addEventListener('change', function() {
            const guildId = this.value;
            if (guildId) {
                selectedGuild = userGuilds.find(g => g.id === guildId);
                loadAutoModData(guildId);
                document.getElementById('automod-content').style.display = 'block';
            } else {
                document.getElementById('automod-content').style.display = 'none';
            }
        });
    }
    
    if (settingsSelect) {
        settingsSelect.addEventListener('change', function() {
            const guildId = this.value;
            if (guildId) {
                selectedGuild = userGuilds.find(g => g.id === guildId);
                loadSettingsData(guildId);
                document.getElementById('settings-content').style.display = 'block';
            } else {
                document.getElementById('settings-content').style.display = 'none';
            }
        });
    }
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('discord_token');
    const user = localStorage.getItem('discord_user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showDashboard();
        loadUserGuilds();
    } else {
        showLogin();
    }
}

// Show login section
function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

// Show dashboard section
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    
    // Update user info in navigation
    updateUserInfo();
    
    // Load initial data
    loadDashboardOverview();
}

// Update user info in navigation
function updateUserInfo() {
    if (!currentUser) return;
    
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (userMenu && userAvatar && userName) {
        userMenu.style.display = 'flex';
        userAvatar.src = `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`;
        userAvatar.alt = `${currentUser.username}'s avatar`;
        userName.textContent = currentUser.username;
    }
}

// Load user guilds
async function loadUserGuilds() {
    try {
        showLoading();
        
        // In a real implementation, this would fetch from Discord API
        // For now, we'll simulate the data
        const mockGuilds = [
            {
                id: '123456789',
                name: 'My Test Server',
                icon: null,
                permissions: 8,
                memberCount: 250
            },
            {
                id: '987654321',
                name: 'Gaming Community',
                icon: null,
                permissions: 8,
                memberCount: 1500
            }
        ];
        
        userGuilds = mockGuilds;
        populateServerSelectors();
        populateServersGrid();
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load guilds:', error);
        showNotification('Failed to load servers', 'error');
        hideLoading();
    }
}

// Populate server selectors
function populateServerSelectors() {
    const selectors = ['automod-server-select', 'settings-server-select'];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (!selector) return;
        
        // Clear existing options except the first one
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Add guild options
        userGuilds.forEach(guild => {
            const option = document.createElement('option');
            option.value = guild.id;
            option.textContent = guild.name;
            selector.appendChild(option);
        });
    });
}

// Populate servers grid
function populateServersGrid() {
    const serversGrid = document.getElementById('servers-grid');
    const noServers = document.getElementById('no-servers');
    
    if (!serversGrid) return;
    
    if (userGuilds.length === 0) {
        serversGrid.style.display = 'none';
        noServers.style.display = 'block';
        return;
    }
    
    serversGrid.style.display = 'grid';
    noServers.style.display = 'none';
    serversGrid.innerHTML = '';
    
    userGuilds.forEach(guild => {
        const serverCard = createServerCard(guild);
        serversGrid.appendChild(serverCard);
    });
}

// Create server card element
function createServerCard(guild) {
    const card = document.createElement('div');
    card.className = 'server-card';
    card.setAttribute('data-guild-id', guild.id);
    
    const iconUrl = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null;
    
    card.innerHTML = `
        <div class="server-icon">
            ${iconUrl ? `<img src="${iconUrl}" alt="${guild.name} icon">` : `<i class="fas fa-server"></i>`}
        </div>
        <h3 class="server-name">${guild.name}</h3>
        <div class="server-info">
            <span class="server-members">
                <i class="fas fa-users"></i> ${guild.memberCount || 0} members
            </span>
            <div class="server-status">
                <span class="status-dot" style="background: #57f287;"></span>
                Online
            </div>
        </div>
        <div class="server-actions">
            <button class="btn btn-primary btn-small" onclick="configureServer('${guild.id}')">
                <i class="fas fa-cog"></i> Configure
            </button>
            <button class="btn btn-secondary btn-small" onclick="viewAnalytics('${guild.id}')">
                <i class="fas fa-chart-bar"></i> Analytics
            </button>
        </div>
    `;
    
    return card;
}

// Configure server
function configureServer(guildId) {
    const guild = userGuilds.find(g => g.id === guildId);
    if (guild) {
        selectedGuild = guild;
        navigateToSection('settings');
        
        // Set the server selector
        const settingsSelect = document.getElementById('settings-server-select');
        if (settingsSelect) {
            settingsSelect.value = guildId;
            settingsSelect.dispatchEvent(new Event('change'));
        }
    }
}

// View analytics
function viewAnalytics(guildId) {
    const guild = userGuilds.find(g => g.id === guildId);
    if (guild) {
        selectedGuild = guild;
        navigateToSection('analytics');
    }
}

// Load section data
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'overview':
            loadDashboardOverview();
            break;
        case 'servers':
            // Already loaded with user guilds
            break;
        case 'automod':
            // Loaded when server is selected
            break;
        case 'settings':
            // Loaded when server is selected
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
    }
}

// Load dashboard overview
function loadDashboardOverview() {
    // Update stats
    document.getElementById('server-count').textContent = userGuilds.length;
    
    const totalMembers = userGuilds.reduce((sum, guild) => sum + (guild.memberCount || 0), 0);
    document.getElementById('member-count').textContent = totalMembers.toLocaleString();
    
    // Mock data for other stats
    document.getElementById('automod-rules').textContent = '12';
    document.getElementById('tickets-count').textContent = '3';
    
    // Animate counters
    animateCounters();
}

// Load AutoMod data
async function loadAutoModData(guildId) {
    try {
        showLoading();
        
        // Mock AutoMod rules data
        const mockRules = [
            {
                id: '1',
                name: 'Anti-Spam Protection',
                type: 'Spam',
                enabled: true
            },
            {
                id: '2',
                name: 'Bad Words Filter',
                type: 'Keyword',
                enabled: true
            },
            {
                id: '3',
                name: 'Mention Spam Protection',
                type: 'Mention Spam',
                enabled: false
            }
        ];
        
        populateAutoModRules(mockRules);
        hideLoading();
    } catch (error) {
        console.error('Failed to load AutoMod data:', error);
        showNotification('Failed to load AutoMod data', 'error');
        hideLoading();
    }
}

// Populate AutoMod rules
function populateAutoModRules(rules) {
    const rulesList = document.getElementById('automod-rules-list');
    if (!rulesList) return;
    
    rulesList.innerHTML = '';
    
    rules.forEach(rule => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';
        
        ruleItem.innerHTML = `
            <div class="rule-info">
                <h4>${rule.name}</h4>
                <p>Type: ${rule.type} | Status: ${rule.enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div class="rule-actions">
                <button class="btn btn-secondary btn-small" onclick="editRule('${rule.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-error btn-small" onclick="deleteRule('${rule.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        rulesList.appendChild(ruleItem);
    });
}

// Load settings data
async function loadSettingsData(guildId) {
    try {
        showLoading();
        
        // Mock settings data
        const mockSettings = {
            prefix: '!',
            language: 'en',
            // Add more settings as needed
        };
        
        populateSettings(mockSettings);
        hideLoading();
    } catch (error) {
        console.error('Failed to load settings:', error);
        showNotification('Failed to load settings', 'error');
        hideLoading();
    }
}

// Populate settings
function populateSettings(settings) {
    const prefixInput = document.getElementById('command-prefix');
    const languageSelect = document.getElementById('default-language');
    
    if (prefixInput) prefixInput.value = settings.prefix || '!';
    if (languageSelect) languageSelect.value = settings.language || 'en';
}

// Load analytics data
function loadAnalyticsData() {
    // Mock analytics implementation
    showNotification('Analytics feature coming soon!', 'info');
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-content h3');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/,/g, ''));
        if (isNaN(target)) return;
        
        const duration = 1000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    if (window.LyBoticUtils) {
        window.LyBoticUtils.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Rule management functions
function editRule(ruleId) {
    showNotification('Rule editing feature coming soon!', 'info');
}

function deleteRule(ruleId) {
    if (confirm('Are you sure you want to delete this rule?')) {
        showNotification('Rule deleted successfully!', 'success');
        // Implement actual deletion logic
    }
}

// Settings save handlers
document.addEventListener('click', function(e) {
    if (e.target.id === 'save-general') {
        saveGeneralSettings();
    }
});

function saveGeneralSettings() {
    const prefix = document.getElementById('command-prefix').value;
    const language = document.getElementById('default-language').value;
    
    // Implement actual save logic
    showNotification('Settings saved successfully!', 'success');
}

// Tab functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tab-button')) {
        const tabId = e.target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabId}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
});

// Export functions for external use
window.Dashboard = {
    navigateToSection,
    configureServer,
    viewAnalytics,
    showLoading,
    hideLoading,
    showNotification
};