// Navbar functionality
(function() {
    'use strict';

    function initNavbar() {

        setupLogout();
        highlightActiveNav();
        setupSearch();
        loadNotificationBadges();
    }

    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Clear localStorage
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
            
                try {
                    await fetch('http://localhost:5000/api/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                } catch (error) {
                    console.log('Logout API call failed, continuing with local logout');
                }
                
                // Redirect to login page
                window.location.href = '/pages/login.html';
            });
        }
    }

    function highlightActiveNav() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || currentPath;
    
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class based on current page
        if (currentPage === 'acceuil.html' || currentPage === '' || currentPath.includes('acceuil')) {
            const homeLink = document.getElementById('nav-home');
            if (homeLink) homeLink.classList.add('active');
        } else if (currentPage === 'myProfile.html' || currentPath.includes('myProfile')) {
            const meLink = document.getElementById('nav-me');
            if (meLink) meLink.classList.add('active');
        } else if (currentPage === 'settings.html' || currentPath.includes('settings')) {
            const meLink = document.getElementById('nav-me');
            if (meLink) meLink.classList.add('active');
        } else if (currentPage === 'createCompany.html' || currentPath.includes('createCompany')) {
            const businessLink = document.getElementById('nav-business');
            if (businessLink) businessLink.classList.add('active');
        }
    }

    // Setup search functionality
    function setupSearch() {
        const searchInput = document.getElementById('navbar-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm) {
                        console.log('Searching for:', searchTerm);
                    }
                }
            });
        }
    }

    // Load notification badges 
    function loadNotificationBadges() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user || !user.email) {
            return;
        }

        // Fetch notificationsI
        fetch('http://localhost:5000/api/notifications/count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to fetch notification counts');
        })
        .then(data => {
            // Update network badge
            if (data.networkCount > 0) {
                const networkBadge = document.getElementById('network-badge');
                if (networkBadge) {
                    networkBadge.textContent = data.networkCount;
                    networkBadge.style.display = 'block';
                }
            }
            
            // Update messaging badge
            if (data.messagingCount > 0) {
                const messagingBadge = document.getElementById('messaging-badge');
                if (messagingBadge) {
                    messagingBadge.textContent = data.messagingCount;
                    messagingBadge.style.display = 'block';
                }
            }
            
            // Update notifications badge
            if (data.notificationsCount > 0) {
                const notificationsBadge = document.getElementById('notifications-badge');
                if (notificationsBadge) {
                    notificationsBadge.textContent = data.notificationsCount;
                    notificationsBadge.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.log('Could not load notification counts:', error);
        });
    }

    function waitForNavbar() {
        const navbar = document.querySelector('.linkedin-nav');
        if (navbar) {
            initNavbar();
        } else {
            // Retry after a short delay 
            setTimeout(waitForNavbar, 50);
        }
    }

    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForNavbar);
    } else {
        waitForNavbar();
    }
})();

