// Support page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeSupport();
});

function initializeSupport() {
    initializeFAQ();
    initializeContactForm();
    initializeSupportCards();
}

// FAQ functionality
function initializeFAQ() {
    initializeFAQSearch();
    initializeFAQCategories();
    initializeFAQAccordion();
}

// FAQ search
function initializeFAQSearch() {
    const searchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.accordion-item');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();
            
            faqItems.forEach(item => {
                const title = item.querySelector('.accordion-title').textContent.toLowerCase();
                const content = item.querySelector('.accordion-content').textContent.toLowerCase();
                
                const matches = title.includes(query) || content.includes(query);
                
                if (matches || query === '') {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show "no results" message if no items are visible
            const visibleItems = Array.from(faqItems).filter(item => 
                item.style.display !== 'none'
            );
            
            if (visibleItems.length === 0 && query !== '') {
                showNoFAQResults(true);
            } else {
                showNoFAQResults(false);
            }
        }, 300);
    });
}

// Show/hide no results message
function showNoFAQResults(show) {
    let noResultsEl = document.getElementById('faq-no-results');
    
    if (show && !noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'faq-no-results';
        noResultsEl.className = 'empty-state';
        noResultsEl.innerHTML = `
            <div class="empty-state-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3 class="empty-state-title">No FAQ Found</h3>
            <p class="empty-state-description">
                Try adjusting your search terms or browse by category.
            </p>
        `;
        
        const accordion = document.getElementById('faq-accordion');
        accordion.appendChild(noResultsEl);
    } else if (!show && noResultsEl) {
        noResultsEl.remove();
    }
}

// FAQ categories
function initializeFAQCategories() {
    const categoryButtons = document.querySelectorAll('.faq-category-btn');
    const faqItems = document.querySelectorAll('.accordion-item');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter FAQ items
            faqItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Clear search
            const searchInput = document.getElementById('faq-search');
            if (searchInput) {
                searchInput.value = '';
            }
            
            showNoFAQResults(false);
        });
    });
}

// FAQ accordion
function initializeFAQAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentNode;
            const content = item.querySelector('.accordion-content');
            const icon = this.querySelector('.accordion-icon');
            
            // Toggle active state
            const isActive = item.classList.contains('active');
            
            // Close all other accordion items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    const otherIcon = otherItem.querySelector('.accordion-icon');
                    otherContent.style.maxHeight = '0';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Contact form
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactSubmission();
    });
    
    // Auto-populate Discord username if user is logged in
    if (window.DiscordAuth && window.DiscordAuth.isAuthenticated()) {
        const user = window.DiscordAuth.getStoredUser();
        const discordInput = document.getElementById('contact-discord');
        if (user && discordInput) {
            discordInput.value = user.username + '#' + user.discriminator;
        }
    }
}

// Handle contact form submission
async function handleContactSubmission() {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        discord: document.getElementById('contact-discord').value,
        serverId: document.getElementById('contact-server-id').value,
        category: document.getElementById('contact-category').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        newsletter: document.getElementById('contact-newsletter').checked,
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // In a real implementation, you would send this to your backend
        // For now, we'll simulate the submission
        await simulateFormSubmission(formData);
        
        // Show success message
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Track submission (for analytics)
        if (window.gtag) {
            gtag('event', 'contact_form_submit', {
                category: formData.category
            });
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('Failed to send message. Please try again or contact us on Discord.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

// Simulate form submission (replace with real implementation)
async function simulateFormSubmission(formData) {
    // In a real implementation, you would:
    // 1. Send to your backend API
    // 2. Have your backend send an email or create a ticket
    // 3. Store in database for tracking
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success most of the time
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Simulated network error'));
            }
        }, 2000);
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Support card interactions
function initializeSupportCards() {
    const supportCards = document.querySelectorAll('.support-card');
    
    supportCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Track clicks for analytics
        card.addEventListener('click', function() {
            const cardType = this.querySelector('h3').textContent;
            
            if (window.gtag) {
                gtag('event', 'support_card_click', {
                    card_type: cardType
                });
            }
        });
    });
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const navbar = document.getElementById('navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Auto-expand FAQ item from URL hash
function handleFAQHash() {
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement && targetElement.classList.contains('accordion-item')) {
            // Scroll to the element
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Expand the accordion item
                const header = targetElement.querySelector('.accordion-header');
                if (header) {
                    header.click();
                }
            }, 100);
        }
    }
}

// Initialize hash handling
window.addEventListener('load', handleFAQHash);
window.addEventListener('hashchange', handleFAQHash);

// Utility functions
function showNotification(message, type = 'info') {
    if (window.LyBoticUtils) {
        window.LyBoticUtils.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Export functions for external use
window.SupportPage = {
    showNotification,
    expandFAQItem: function(itemId) {
        const item = document.getElementById(itemId);
        if (item) {
            const header = item.querySelector('.accordion-header');
            if (header) header.click();
        }
    },
    filterFAQ: function(category) {
        const button = document.querySelector(`[data-category="${category}"]`);
        if (button) button.click();
    },
    searchFAQ: function(query) {
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input'));
        }
    }
};