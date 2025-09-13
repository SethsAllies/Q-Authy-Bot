// Discord OAuth2 Authentication for GitHub Pages

// Configuration
const DISCORD_CONFIG = {
    clientId: 'YOUR_BOT_CLIENT_ID', // Replace with your bot's client ID
    redirectUri: window.location.origin + '/dashboard.html',
    scopes: ['identify', 'guilds'],
    apiBase: 'https://discord.com/api/v10'
};

// OAuth URLs
const getAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        redirect_uri: DISCORD_CONFIG.redirectUri,
        response_type: 'token', // Implicit flow for client-side apps
        scope: DISCORD_CONFIG.scopes.join(' ')
    });
    
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
};

// Initialize Discord auth
document.addEventListener('DOMContentLoaded', function() {
    initializeDiscordAuth();
});

function initializeDiscordAuth() {
    setupLoginButton();
    setupLogoutButton();
    handleAuthCallback();
}

// Setup login button
function setupLoginButton() {
    const loginBtn = document.getElementById('discord-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = getAuthUrl();
        });
    }
}

// Setup logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Handle OAuth callback
function handleAuthCallback() {
    // Check if we're on the callback page with a token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    
    if (token) {
        // Clear the hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Store token and fetch user data
        localStorage.setItem('discord_token', token);
        fetchUserData(token);
    }
}

// Fetch user data from Discord API
async function fetchUserData(token) {
    try {
        // Show loading
        if (window.Dashboard) {
            window.Dashboard.showLoading();
        }
        
        // Fetch user info
        const userResponse = await fetch(`${DISCORD_CONFIG.apiBase}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        
        // Fetch user guilds
        const guildsResponse = await fetch(`${DISCORD_CONFIG.apiBase}/users/@me/guilds`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!guildsResponse.ok) {
            throw new Error('Failed to fetch guilds');
        }
        
        const guildsData = await guildsResponse.json();
        
        // Filter guilds where user has admin permissions
        const adminGuilds = guildsData.filter(guild => 
            (guild.permissions & 0x8) === 0x8 || // Administrator
            (guild.permissions & 0x20) === 0x20   // Manage Server
        );
        
        // Store user data
        localStorage.setItem('discord_user', JSON.stringify(userData));
        localStorage.setItem('discord_guilds', JSON.stringify(adminGuilds));
        
        // Update UI
        if (window.Dashboard) {
            window.Dashboard.hideLoading();
        }
        
        // Reload page to show dashboard
        window.location.reload();
        
    } catch (error) {
        console.error('Discord auth error:', error);
        
        if (window.Dashboard) {
            window.Dashboard.hideLoading();
            window.Dashboard.showNotification('Failed to authenticate with Discord', 'error');
        }
        
        // Clear stored data on error
        logout();
    }
}

// Logout function
function logout() {
    // Clear stored data
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_guilds');
    
    // Redirect to home page
    window.location.href = '/';
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('discord_token');
    const user = localStorage.getItem('discord_user');
    return !!(token && user);
}

// Get stored user data
function getStoredUser() {
    const userStr = localStorage.getItem('discord_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Get stored guilds
function getStoredGuilds() {
    const guildsStr = localStorage.getItem('discord_guilds');
    return guildsStr ? JSON.parse(guildsStr) : [];
}

// Refresh token if needed
async function refreshTokenIfNeeded() {
    const token = localStorage.getItem('discord_token');
    if (!token) return false;
    
    try {
        // Test if token is still valid
        const response = await fetch(`${DISCORD_CONFIG.apiBase}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            return true; // Token is valid
        } else {
            // Token is invalid, need to re-authenticate
            logout();
            return false;
        }
    } catch (error) {
        console.error('Token validation error:', error);
        logout();
        return false;
    }
}

// API helper functions
const DiscordAPI = {
    // Make authenticated request to Discord API
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('discord_token');
        if (!token) {
            throw new Error('No Discord token found');
        }
        
        const response = await fetch(`${DISCORD_CONFIG.apiBase}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, logout user
                logout();
                throw new Error('Authentication expired');
            }
            throw new Error(`Discord API error: ${response.status}`);
        }
        
        return response.json();
    },
    
    // Get current user
    async getCurrentUser() {
        return this.request('/users/@me');
    },
    
    // Get user guilds
    async getUserGuilds() {
        return this.request('/users/@me/guilds');
    },
    
    // Get guild information
    async getGuild(guildId) {
        return this.request(`/guilds/${guildId}`);
    },
    
    // Get guild channels
    async getGuildChannels(guildId) {
        return this.request(`/guilds/${guildId}/channels`);
    },
    
    // Get guild roles
    async getGuildRoles(guildId) {
        return this.request(`/guilds/${guildId}/roles`);
    },
    
    // Get guild members (requires bot token, not user token)
    async getGuildMembers(guildId, limit = 100) {
        return this.request(`/guilds/${guildId}/members?limit=${limit}`);
    }
};

// Mock API for development/demo purposes
const MockDiscordAPI = {
    async getCurrentUser() {
        return {
            id: '123456789',
            username: 'TestUser',
            discriminator: '0001',
            avatar: 'a1b2c3d4e5f6',
            email: 'test@example.com',
            verified: true
        };
    },
    
    async getUserGuilds() {
        return [
            {
                id: '987654321',
                name: 'My Test Server',
                icon: null,
                permissions: 8,
                features: [],
                approximate_member_count: 250
            },
            {
                id: '111222333',
                name: 'Gaming Community',
                icon: 'guild_icon_hash',
                permissions: 8,
                features: ['COMMUNITY'],
                approximate_member_count: 1500
            }
        ];
    },
    
    async getGuild(guildId) {
        const guilds = await this.getUserGuilds();
        return guilds.find(g => g.id === guildId) || null;
    }
};

// Bot management API calls (these would typically go through your own backend)
const BotAPI = {
    baseUrl: 'YOUR_BACKEND_API_URL', // Replace with your backend URL
    
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('discord_token');
        if (!token) {
            throw new Error('No Discord token found');
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Bot API error: ${response.status}`);
        }
        
        return response.json();
    },
    
    // Get bot settings for a guild
    async getGuildSettings(guildId) {
        return this.request(`/guilds/${guildId}/settings`);
    },
    
    // Update bot settings for a guild
    async updateGuildSettings(guildId, settings) {
        return this.request(`/guilds/${guildId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    },
    
    // Get AutoMod rules for a guild
    async getAutoModRules(guildId) {
        return this.request(`/guilds/${guildId}/automod/rules`);
    },
    
    // Create AutoMod rule
    async createAutoModRule(guildId, rule) {
        return this.request(`/guilds/${guildId}/automod/rules`, {
            method: 'POST',
            body: JSON.stringify(rule)
        });
    },
    
    // Delete AutoMod rule
    async deleteAutoModRule(guildId, ruleId) {
        return this.request(`/guilds/${guildId}/automod/rules/${ruleId}`, {
            method: 'DELETE'
        });
    },
    
    // Get guild analytics
    async getGuildAnalytics(guildId) {
        return this.request(`/guilds/${guildId}/analytics`);
    }
};

// Export for use in other scripts
window.DiscordAuth = {
    isAuthenticated,
    getStoredUser,
    getStoredGuilds,
    logout,
    refreshTokenIfNeeded,
    DiscordAPI,
    MockDiscordAPI,
    BotAPI
};

// Error handling for OAuth popup
window.addEventListener('error', function(event) {
    if (event.message.includes('oauth') || event.message.includes('discord')) {
        console.error('Discord OAuth error:', event.error);
        if (window.Dashboard) {
            window.Dashboard.showNotification('Authentication error occurred', 'error');
        }
    }
});

// Handle page visibility changes (for token refresh)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && isAuthenticated()) {
        refreshTokenIfNeeded();
    }
});