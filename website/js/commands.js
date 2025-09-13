// Commands page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeCommandsPage();
});

function initializeCommandsPage() {
    initializeSearch();
    initializeFilters();
    initializeLoadMore();
    handleUrlParams();
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('command-search');
    const commandCards = document.querySelectorAll('.command-card');
    const noResults = document.getElementById('no-results');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();
            let visibleCount = 0;
            
            commandCards.forEach(card => {
                const commandName = card.querySelector('.command-name').textContent.toLowerCase();
                const commandDescription = card.querySelector('.command-description').textContent.toLowerCase();
                const commandAliases = Array.from(card.querySelectorAll('.command-alias'))
                    .map(alias => alias.textContent.toLowerCase())
                    .join(' ');
                
                const matches = commandName.includes(query) || 
                              commandDescription.includes(query) || 
                              commandAliases.includes(query);
                
                if (matches && !card.classList.contains('filtered-out')) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
            
            updateCommandCount();
        }, 300);
    });
}

// Filter functionality
function initializeFilters() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const commandCards = document.querySelectorAll('.command-card');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter commands
            let visibleCount = 0;
            commandCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('filtered-out');
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.classList.add('filtered-out');
                    card.style.display = 'none';
                }
            });
            
            // Clear search if category filter is applied
            const searchInput = document.getElementById('command-search');
            if (searchInput && category !== 'all') {
                searchInput.value = '';
            }
            
            // Re-run search if there's a query
            if (searchInput && searchInput.value.trim()) {
                searchInput.dispatchEvent(new Event('input'));
            }
            
            updateCommandCount();
            updateUrlParams(category);
        });
    });
}

// Load more functionality (for pagination if needed)
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const commandsGrid = document.getElementById('commands-grid');
    let currentPage = 1;
    const commandsPerPage = 20;
    
    if (!loadMoreBtn) return;
    
    // Initially hide commands beyond first page
    const allCommands = document.querySelectorAll('.command-card');
    if (allCommands.length > commandsPerPage) {
        showCommandsPage(1);
        document.querySelector('.load-more-container').style.display = 'block';
    }
    
    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        showCommandsPage(currentPage);
        
        // Hide load more button if all commands are shown
        if (currentPage * commandsPerPage >= allCommands.length) {
            document.querySelector('.load-more-container').style.display = 'none';
        }
    });
}

function showCommandsPage(page) {
    const commandCards = document.querySelectorAll('.command-card');
    const startIndex = 0;
    const endIndex = page * 20;
    
    commandCards.forEach((card, index) => {
        if (index < endIndex) {
            card.style.display = 'block';
        }
    });
}

// Handle URL parameters for deep linking
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || window.location.hash.replace('#', '');
    const search = urlParams.get('search');
    
    // Set category filter
    if (category && category !== 'all') {
        const categoryButton = document.querySelector(`[data-category="${category}"]`);
        if (categoryButton) {
            categoryButton.click();
        }
    }
    
    // Set search query
    if (search) {
        const searchInput = document.getElementById('command-search');
        if (searchInput) {
            searchInput.value = search;
            searchInput.dispatchEvent(new Event('input'));
        }
    }
}

// Update URL parameters
function updateUrlParams(category) {
    const url = new URL(window.location);
    
    if (category && category !== 'all') {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    
    window.history.replaceState({}, '', url);
}

// Update command count in tab buttons
function updateCommandCount() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const activeTab = document.querySelector('.tab-button.active');
    const activeCategory = activeTab.getAttribute('data-category');
    
    tabButtons.forEach(button => {
        const category = button.getAttribute('data-category');
        let count = 0;
        
        if (category === 'all') {
            count = document.querySelectorAll('.command-card:not([style*="display: none"])').length;
        } else {
            count = document.querySelectorAll(`.command-card[data-category="${category}"]:not([style*="display: none"])`).length;
        }
        
        // Update button text with count
        const buttonText = button.textContent.split('(')[0].trim();
        button.textContent = `${buttonText} (${count})`;
    });
}

// Command card interactions
document.addEventListener('click', function(e) {
    if (e.target.closest('.command-card')) {
        const card = e.target.closest('.command-card');
        const commandName = card.querySelector('.command-name').textContent;
        
        // Copy command to clipboard
        if (window.LyBoticUtils) {
            window.LyBoticUtils.copyToClipboard(commandName).then(() => {
                window.LyBoticUtils.showNotification(`Copied "${commandName}" to clipboard!`, 'success');
            });
        }
        
        // Add visual feedback
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
});

// Export functions for external use
window.CommandsPage = {
    filterByCategory: function(category) {
        const button = document.querySelector(`[data-category="${category}"]`);
        if (button) button.click();
    },
    
    searchCommands: function(query) {
        const searchInput = document.getElementById('command-search');
        if (searchInput) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input'));
        }
    },
    
    getVisibleCommands: function() {
        return document.querySelectorAll('.command-card:not([style*="display: none"])');
    }
};