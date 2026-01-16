const API_BASE_URL = 'http://localhost:3000';

let notifications = [];

document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }
});

async function loadNotifications() {
    const container = document.getElementById('notifications-container');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        
        if (data.success && data.notifications) {
            notifications = data.notifications;
            displayNotifications(notifications);
        } else {
            container.innerHTML = '<div class="text-center p-4 text-muted"><p>No notifications yet</p></div>';
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<div class="alert alert-danger m-3">Error loading notifications. Please try again later.</div>';
    }
}

function displayNotifications(notificationsList) {
    const container = document.getElementById('notifications-container');
    
    if (!notificationsList || notificationsList.length === 0) {
        container.innerHTML = '<div class="text-center p-4 text-muted"><p>No notifications yet</p></div>';
        return;
    }

    let html = '';
    notificationsList.forEach(notif => {
        const senderImage = notif.sender?.profileImagePath || '/images/profile.png';
        const senderName = notif.sender?.fullName || 'Someone';
        const isUnread = !notif.read;
        const notificationClass = isUnread ? 'bg-light border-start border-primary border-3' : '';
        
        html += `
            <div class="notification-item p-3 border-bottom ${notificationClass}" data-notification-id="${notif._id}">
                <div class="d-flex align-items-start">
                    <img src="${senderImage}" 
                         alt="${senderName}" 
                         class="rounded-circle me-3" 
                         style="width: 50px; height: 50px; object-fit: cover;"
                         onerror="this.src='/images/profile.png'">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1" style="color: var(--hunter-green);">${notif.title}</h6>
                                <p class="mb-1 text-muted">${notif.message}</p>
                                <small class="text-muted">${formatNotificationTime(notif.createdAt)}</small>
                            </div>
                            ${isUnread ? '<span class="badge bg-primary rounded-circle ms-2" style="width: 10px; height: 10px; padding: 0;"></span>' : ''}
                        </div>
                        ${notif.link ? `
                            <div class="mt-2">
                                <a href="${notif.link}" class="btn btn-sm btn-outline-primary" style="border-color: var(--hunter-green); color: var(--hunter-green);">
                                    View
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    // Add click handlers to mark as read
    container.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                const notificationId = item.getAttribute('data-notification-id');
                if (notificationId) {
                    await markAsRead(notificationId);
                }
            }
        });
    });
}

async function markAsRead(notificationId) {
    try {
        await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        // Reload notifications
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllAsRead() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            // Reload notifications
            loadNotifications();
        }
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
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
