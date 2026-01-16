// Navbar functionality
(function() {
    'use strict';

    function initNavbar() {

        setupLogout();
        highlightActiveNav();
        setupSearch();
        loadNotificationBadges();
        setupNotificationsDropdown();
        
        // Refresh tous les 30 seconds
        setInterval(() => {
            loadNotificationBadges();
        }, 30000);
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
                    await fetch('http://localhost:3000/api/logout', {
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
        const searchDropdown = document.getElementById('search-results-dropdown');
        const searchForm = document.getElementById('search-form');
        const searchIcon = document.getElementById('search-icon');
        const searchContainer = searchInput ? searchInput.closest('.position-relative') : null;
        let searchTimeout;

        function handleSearch() {
            if (!searchInput) {
                console.warn('Search input not available in handleSearch');
                return;
            }
            const searchTerm = searchInput.value.trim();
            console.log('Handling search for:', searchTerm);
            if (searchTerm) {
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
            }
        }

        if (!searchInput) {
            console.warn('Search input not found in setupSearch');
            return;
        }

        if (!searchDropdown) {
            console.warn('Search dropdown not found in setupSearch');
            return;
        }

        console.log('Setting up search functionality');

        // user types
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (searchTerm.length >= 2) {
                searchTimeout = setTimeout(() => {
                    performSearch(searchTerm);
                }, 300); // Wait 300 ms
            } else {
                hideSearchResults();
            }
        });

        // Handle Enter key and redirect to full search page
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });

        // Handle form submission
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSearch();
            });
        }

        // Handle click on search icon
        if (searchIcon) {
            searchIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Search icon clicked');
                handleSearch();
            });
        } else {
            console.warn('Search icon not found');
        }

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (searchContainer && !searchContainer.contains(e.target)) {
                hideSearchResults();
            }
        });

        // Show dropdown when input is focused and has content
        searchInput.addEventListener('focus', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length >= 2) {
                performSearch(searchTerm);
            }
        });
    }

    async function performSearch(query) {
        const searchDropdown = document.getElementById('search-results-dropdown');
        const searchContent = document.getElementById('search-results-content');
        
        if (!searchDropdown || !searchContent) return;

        try {
            searchContent.innerHTML = '<div class="p-3 text-center"><div class="spinner-border spinner-border-sm" role="status"></div></div>';
            searchDropdown.style.display = 'block';

            const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            
            if (data.success) {
                displaySearchResults(data, searchContent);
            } else {
                searchContent.innerHTML = '<div class="p-3 text-muted">No results found</div>';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchContent.innerHTML = '<div class="p-3 text-danger">Error searching. Please try again.</div>';
        }
    }

    function displaySearchResults(data, container) {
        const profiles = data.profiles || [];
        const jobs = data.jobs || [];
        const companies = data.companies || [];
        
        if (profiles.length === 0 && jobs.length === 0 && companies.length === 0) {
            container.innerHTML = '<div class="p-3 text-muted">No results found</div>';
            return;
        }

        let html = '';

        // Profiles section limit 5
        if (profiles.length > 0) {
            html += '<h6 class="dropdown-header">People</h6>';
            profiles.slice(0, 5).forEach(profile => {
                // Normalize image path
                let imagePath = profile.profileImagePath || '/images/profile.png';
                if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                    imagePath = '/' + imagePath;
                }
                html += `
                    <a href="/profile/${profile._id}" class="dropdown-item d-flex align-items-center text-decoration-none">
                        <img src="${imagePath}" 
                             alt="${profile.fullName}" 
                             class="rounded-circle me-2" 
                             style="width: 40px; height: 40px; object-fit: cover;"
                             onerror="this.src='/images/profile.png'">
                        <div class="flex-grow-1">
                            <div class="fw-semibold">${profile.fullName}</div>
                            ${profile.location ? `<small class="text-muted">${profile.location}</small>` : ''}
                        </div>
                    </a>
                `;
            });
            if (profiles.length > 5) {
                html += `<a href="/search?q=${encodeURIComponent(data.query)}&type=profiles" class="dropdown-item text-center text-primary">
                    <small>See all ${profiles.length} people</small>
                </a>`;
            }
            html += '<div class="dropdown-divider"></div>';
        }

        // Jobs section
        if (jobs.length > 0) {
            html += '<h6 class="dropdown-header">Jobs</h6>';
            jobs.slice(0, 5).forEach(job => {
                html += `
                    <a href="/jobs/${job._id}" class="dropdown-item text-decoration-none">
                        <div class="fw-semibold">${job.title}</div>
                        <small class="text-muted">${job.companyName}${job.location ? ` • ${job.location}` : ''}</small>
                    </a>
                `;
            });
            if (jobs.length > 5) {
                html += `<a href="/search?q=${encodeURIComponent(data.query)}&type=jobs" class="dropdown-item text-center text-primary">
                    <small>See all ${jobs.length} jobs</small>
                </a>`;
            }
            html += '<div class="dropdown-divider"></div>';
        }

        // Companies section
        if (companies.length > 0) {
            html += '<h6 class="dropdown-header">Companies</h6>';
            companies.slice(0, 5).forEach(company => {
                // Normalize logo path
                let logoPath = company.logo || '/images/default-c.png';
                if (logoPath && !logoPath.startsWith('/') && !logoPath.startsWith('http')) {
                    logoPath = '/' + logoPath;
                }
                html += `
                    <a href="/company/${company._id}" class="dropdown-item d-flex align-items-center text-decoration-none">
                        <img src="${logoPath}" 
                             alt="${company.name}" 
                             class="rounded-circle me-2" 
                             style="width: 40px; height: 40px; object-fit: cover;"
                             onerror="this.src='/images/default-c.png'">
                        <div class="flex-grow-1">
                            <div class="fw-semibold">${company.name}</div>
                            ${company.industry ? `<small class="text-muted">${company.industry}</small>` : ''}
                        </div>
                    </a>
                `;
            });
            if (companies.length > 5) {
                html += `<a href="/search?q=${encodeURIComponent(data.query)}&type=companies" class="dropdown-item text-center text-primary">
                    <small>See all ${companies.length} companies</small>
                </a>`;
            }
        }

        // Add "View all results" link
        if (profiles.length + jobs.length + companies.length > 0) {
            html += '<div class="dropdown-divider"></div>';
            html += `<a href="/search?q=${encodeURIComponent(data.query)}" class="dropdown-item text-center text-primary fw-semibold">
                View all results
            </a>`;
        }

        container.innerHTML = html;
    }

    function hideSearchResults() {
        const searchDropdown = document.getElementById('search-results-dropdown');
        if (searchDropdown) {
            searchDropdown.style.display = 'none';
        }
    }

    // Load notification badges 
    function loadNotificationBadges() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user || !user.email) {
            return;
        }

        // Fetch notification count
        fetch('http://localhost:3000/api/notifications/count', {
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
            // if (data.messagingCount > 0) {
            //     const messagingBadge = document.getElementById('messaging-badge');
            //     if (messagingBadge) {
            //         messagingBadge.textContent = data.messagingCount;
            //         messagingBadge.style.display = 'block';
            //     }
            // }
            
            // Update notifications badge
            const notificationsBadge = document.getElementById('notifications-badge');
            if (notificationsBadge) {
                if (data.notificationsCount > 0) {
                    notificationsBadge.textContent = data.notificationsCount;
                    notificationsBadge.style.display = 'block';
                } else {
                    notificationsBadge.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.log('Could not load notification counts:', error);
        });
    }

    //notifications dropdown
    function loadNotificationsDropdown() {
        const notificationsList = document.getElementById('notifications-list');
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        
        if (!notificationsList) return;

        fetch('http://localhost:3000/api/notifications?limit=5', {
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
            throw new Error('Failed to fetch notifications');
        })
        .then(data => {
            if (data.success && data.notifications) {
                displayNotifications(data.notifications, notificationsList);
                
                //mark all as read button
                if (markAllReadBtn) {
                    markAllReadBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await markAllNotificationsAsRead();
                    });
                }
            } else {
                notificationsList.innerHTML = '<div class="text-center p-3 text-muted"><small>No notifications</small></div>';
            }
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            notificationsList.innerHTML = '<div class="text-center p-3 text-danger"><small>Error loading notifications</small></div>';
        });
    }

    function displayNotifications(notifications, container) {
        if (!notifications || notifications.length === 0) {
            container.innerHTML = '<div class="text-center p-3 text-muted"><small>No notifications</small></div>';
            return;
        }

        let html = '';
        notifications.forEach(notif => {
            const senderImage = notif.sender?.profileImagePath || '/images/profile.png';
            const senderName = notif.sender?.fullName || 'Someone';
            const isUnread = !notif.read;
            
            html += `
                <li>
                    <a href="${notif.link || '#'}" class="dropdown-item ${isUnread ? 'bg-light' : ''}" data-notification-id="${notif._id}">
                        <div class="d-flex align-items-start">
                            <img src="${senderImage}" 
                                 alt="${senderName}" 
                                 class="rounded-circle me-2" 
                                 style="width: 40px; height: 40px; object-fit: cover;"
                                 onerror="this.src='/images/profile.png'">
                            <div class="flex-grow-1">
                                <div class="fw-semibold small">${notif.title}</div>
                                <div class="text-muted small">${notif.message}</div>
                                <div class="text-muted" style="font-size: 0.7rem;">
                                    ${formatNotificationTime(notif.createdAt)}
                                </div>
                            </div>
                            ${isUnread ? '<span class="badge bg-primary rounded-circle" style="width: 8px; height: 8px; padding: 0;"></span>' : ''}
                        </div>
                    </a>
                </li>
            `;
        });
        
        container.innerHTML = html;

        container.querySelectorAll('[data-notification-id]').forEach(item => {
            item.addEventListener('click', async (e) => {
                const notificationId = item.getAttribute('data-notification-id');
                if (notificationId) {
                    await markNotificationAsRead(notificationId);
                }
            });
        });
    }

    async function markNotificationAsRead(notificationId) {
        try {
            await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            // Reload badges and dropdown
            loadNotificationBadges();
            loadNotificationsDropdown();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async function markAllNotificationsAsRead() {
        try {
            await fetch('http://localhost:3000/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            // Reload badges and dropdown
            loadNotificationBadges();
            loadNotificationsDropdown();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    function formatNotificationTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Setup notifications dropdown when navbar is clicked
    function setupNotificationsDropdown() {
        const notificationsLink = document.getElementById('nav-notifications');
        if (notificationsLink) {
            notificationsLink.addEventListener('shown.bs.dropdown', () => {
                loadNotificationsDropdown();
            });
        }
    }

    function waitForNavbar() {
        const searchInput = document.getElementById('navbar-search');
        const searchDropdown = document.getElementById('search-results-dropdown');
        
        if (searchInput && searchDropdown) {
            console.log('Navbar elements found, initializing...');
            initNavbar();
        } else {
            // Retry 
            setTimeout(waitForNavbar, 100);
        }
    }

    // Start waiting for navbar elements to be present
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(waitForNavbar, 100);
        });
    } else {
        setTimeout(waitForNavbar, 100);
    }
})();

