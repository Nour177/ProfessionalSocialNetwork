const API_BASE_URL = 'http://localhost:3000';

// state
let currentUser = null;
let pendingInvitations = [];
let suggestions = [];
let networkConnections = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});


async function initializeApp() {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Charger les informations de l'utilisateur
    await loadUserProfile();
    
    // Charger les données du réseau
    await loadNetworkData();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
}


async function loadUserProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!userData) {
            window.location.href = '/pages/login.html';
            return;
        }
        
        currentUser = userData;
        updateUserProfileUI(userData);
    } catch (error) {
        console.error('Error loading user profile:', error);
        window.location.href = '/pages/login.html';
    }
}


function updateUserProfileUI(user) {
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-info h6');
    const profileJob = document.querySelector('#company');
    
    if (profileAvatar) {
        setImageWithFallback(profileAvatar, user.profileImagePath, '../images/profile.png');
        profileAvatar.alt = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Profile picture';
    }
    
    if (profileName) {
        profileName.textContent = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'User';
    }
    
    if (profileJob) {
        let jobText = '';
        if (user.recentJob) {
            jobText = user.recentJob;
        } else if (user.experiences && user.experiences.length > 0) {
            const firstExp = user.experiences[0];
            const jobTitle = firstExp.role || '';
            const company = firstExp.company || '';
            if (jobTitle && company) {
                jobText = `${jobTitle} at ${company}`;
            } else if (jobTitle) {
                jobText = jobTitle;
            } else if (company) {
                jobText = company;
            }
        }
        if (jobText) {
            profileJob.textContent = jobText;
        }
    }
}

// Charger les données du réseau
async function loadNetworkData() {
    try {
        console.log('Loading network data...');
        
        await Promise.all([
            loadPendingInvitations(),
            loadSuggestions(),
            loadNetworkConnections()
        ]);
        
        // Mettre à jour les stats
        updateNetworkStats();
    } catch (error) {
        console.error('Error loading network data:', error);
        updateNetworkStats();
    }
}

// Charger les invitations en attente
async function loadPendingInvitations() {
    try {
        if (!currentUser || !currentUser.email) {
            console.error('No current user found');
            pendingInvitations = [];
            displayPendingInvitations();
            return;
        }

        console.log('Loading pending invitations for:', currentUser.email);
        const response = await fetch(`${API_BASE_URL}/api/network/invitations?email=${encodeURIComponent(currentUser.email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            pendingInvitations = data.invitations || [];
            console.log('Pending invitations loaded:', pendingInvitations);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error loading invitations:', response.status, errorData);
            pendingInvitations = [];
        }
        
        displayPendingInvitations();
    } catch (error) {
        console.error('Error loading pending invitations:', error);
        pendingInvitations = [];
        displayPendingInvitations();
    }
}

// Afficher les invitations en attente
function displayPendingInvitations() {
    const container = document.querySelector('#pendingInvitations .card-body');
    if (!container) return;
    
    if (pendingInvitations.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">No pending invitations</p>';
        return;
    }
    
    container.innerHTML = pendingInvitations.map(invitation => `
        <div class="network-card mb-3" data-invitation-id="${invitation.id}">
            <div class="card-body d-flex align-items-center">
                <img src="${normalizeImagePath(invitation.avatar, '../images/default-avatar.png')}" alt="${invitation.name}" class="network-avatar me-3" onerror="this.src='../images/default-avatar.png'" />
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${invitation.name}</h6>
                    <small class="text-muted">${invitation.job}</small>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-success btn-sm accept-invitation" data-email="${invitation.email}">
                        <i class="bi bi-check-lg"></i> Accept
                    </button>
                    <button class="btn btn-outline-secondary btn-sm decline-invitation" data-email="${invitation.email}">
                        <i class="bi bi-x-lg"></i> Decline
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Charger les suggestions
async function loadSuggestions() {
    try {
        if (!currentUser || !currentUser.email) {
            console.error('No current user found');
            suggestions = [];
            displaySuggestions();
            return;
        }

        console.log('Loading suggestions for:', currentUser.email);
        const response = await fetch(`${API_BASE_URL}/api/network/suggestions?email=${encodeURIComponent(currentUser.email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            suggestions = data.suggestions || [];
            console.log('Suggestions loaded:', suggestions);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error loading suggestions:', response.status, errorData);
            suggestions = [];
        }
        
        displaySuggestions();
        updateNetworkStats();
    } catch (error) {
        console.error('Error loading suggestions:', error);
        suggestions = [];
        displaySuggestions();
        updateNetworkStats();
    }
}

// Afficher les suggestions
function displaySuggestions() {
    const container = document.querySelector('#suggestions .horizontal-scroll');
    if (!container) {
        console.error('Suggestions container not found');
        return;
    }
    
    console.log('Displaying suggestions:', suggestions);
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mb-0">No suggestions available</p>';
        return;
    }
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="network-card" style="min-width: 280px;" data-suggestion-id="${suggestion.id}">
            <div class="card-body d-flex flex-column align-items-center text-center">
                <img src="${normalizeImagePath(suggestion.avatar, '../images/default-avatar.png')}" alt="${suggestion.name}" class="network-avatar mb-2" onerror="this.src='../images/default-avatar.png'" />
                <h6 class="mb-1 fw-bold">${suggestion.name}</h6>
                <small class="text-muted mb-2">${suggestion.job || 'No job title'}</small>
                <button class="btn btn-outline-primary btn-sm w-100 connect-user" data-email="${suggestion.email}">
                    <i class="bi bi-person-plus"></i> Connect
                </button>
            </div>
        </div>
    `).join('');
    
    // Ouvrir automatiquement la section suggestions si il y a des données 
    const suggestionsCollapse = document.getElementById('suggestions');
    if (suggestionsCollapse && suggestions.length > 0) {
        const bsCollapse = new bootstrap.Collapse(suggestionsCollapse, {
            toggle: false
        });
        bsCollapse.show();
    }
}

// Charger les connexions du réseau
async function loadNetworkConnections() {
    try {
        if (!currentUser || !currentUser.email) {
            console.error('No current user found');
            networkConnections = [];
            displayNetworkConnections();
            return;
        }

        console.log('Loading connections for:', currentUser.email);
        const response = await fetch(`${API_BASE_URL}/api/network/connections?email=${encodeURIComponent(currentUser.email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            networkConnections = data.connections || [];
            console.log('Connections loaded:', networkConnections);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error loading connections:', response.status, errorData);
            networkConnections = [];
        }
        
        displayNetworkConnections();
    } catch (error) {
        console.error('Error loading network connections:', error);
        networkConnections = [];
        displayNetworkConnections();
    }
}

// Afficher les connexions du réseau
function displayNetworkConnections() {
    const container = document.querySelector('#yourNetwork .card-body .row');
    if (!container) return;
    
    if (networkConnections.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center mb-0">No connections yet</p></div>';
        return;
    }
    
    container.innerHTML = networkConnections.map(connection => `
        <div class="col">
            <div class="network-card" data-connection-id="${connection.id}">
                <div class="card-body d-flex align-items-center">
                    <img src="${normalizeImagePath(connection.avatar, '../images/default-avatar.png')}" alt="${connection.name}" class="network-avatar me-3" onerror="this.src='../images/default-avatar.png'" />
                    <div class="flex-grow-1">
                        <h6 class="mb-0 fw-bold">${connection.name}</h6>
                        <small class="text-muted">${connection.job}</small>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm ms-2 message-user" data-email="${connection.email}">
                        <i class="bi bi-chat-dots"></i> Message
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Mettre à jour les statistiques du réseau
function updateNetworkStats() {
    // Mettre à jour Connections
    const connectionsSpan = document.getElementById('stats-connections');
    if (connectionsSpan) {
        connectionsSpan.textContent = networkConnections.length;
    }
    
    // Mettre à jour Pending
    const pendingSpan = document.getElementById('stats-pending');
    if (pendingSpan) {
        pendingSpan.textContent = pendingInvitations.length;
    }
    
    // Mettre à jour Suggestions
    const suggestionsSpan = document.getElementById('stats-suggestions');
    if (suggestionsSpan) {
        suggestionsSpan.textContent = suggestions.length;
    }
    
    console.log('Stats updated:', {
        connections: networkConnections.length,
        pending: pendingInvitations.length,
        suggestions: suggestions.length
    });
}

// Configurer les listeners 
function setupEventListeners() {
    // Délégation d'événements pour les boutons dynamiques
    document.addEventListener('click', async (e) => {
        // Accepter une inv
        if (e.target.closest('.accept-invitation')) {
            const button = e.target.closest('.accept-invitation');
            const email = button.getAttribute('data-email');
            await handleAcceptInvitation(email);
        }
        
        // Refuser une inv
        if (e.target.closest('.decline-invitation')) {
            const button = e.target.closest('.decline-invitation');
            const email = button.getAttribute('data-email');
            await handleDeclineInvitation(email);
        }
        
        // Se connecter avec un utilisateur
        if (e.target.closest('.connect-user')) {
            const button = e.target.closest('.connect-user');
            const email = button.getAttribute('data-email');
            await handleConnectUser(email, button);
        }
        
        // Envoyer un message
        if (e.target.closest('.message-user')) {
            const button = e.target.closest('.message-user');
            const email = button.getAttribute('data-email');
            handleMessageUser(email);
        }
    });
    
    // Gérer l'animation des chevrons dans les sections collapsibles
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function() {
            const button = this.querySelector('.btn-toggle');
            const icon = button?.querySelector('i');
            if (icon) {
                setTimeout(() => {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    if (isExpanded) {
                        icon.style.transform = 'rotate(180deg)';
                    } else {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }, 10);
            }
        });
    });
}

// Gérer l'acceptation d'une invitation
async function handleAcceptInvitation(email) {
    try {
        if (!currentUser || !currentUser.email) {
            showNotification('User not authenticated', 'error');
            return;
        }

        // Trouver l'invitation correspondante
        const invitation = pendingInvitations.find(inv => inv.email === email);
        if (!invitation || !invitation.connectionId) {
            showNotification('Invitation not found', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/network/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                connectionId: invitation.connectionId
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Retirer l'invitation de la liste
            pendingInvitations = pendingInvitations.filter(inv => inv.email !== email);
            displayPendingInvitations();
            
            // Recharger les connexions
            await loadNetworkConnections();
            updateNetworkStats();
            
            showNotification('Invitation accepted successfully!', 'success');
        } else {
            showNotification(data.message || 'Error accepting invitation', 'error');
        }
    } catch (error) {
        console.error('Error accepting invitation:', error);
        showNotification('Error accepting invitation', 'error');
    }
}

// Gérer le refus d'une invitation
async function handleDeclineInvitation(email) {
    try {
        if (!currentUser || !currentUser.email) {
            showNotification('User not authenticated', 'error');
            return;
        }

        // Trouver l'invitation correspondante
        const invitation = pendingInvitations.find(inv => inv.email === email);
        if (!invitation || !invitation.connectionId) {
            showNotification('Invitation not found', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/network/decline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                connectionId: invitation.connectionId
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Retirer l'invitation de la liste
            pendingInvitations = pendingInvitations.filter(inv => inv.email !== email);
            displayPendingInvitations();
            updateNetworkStats();
            
            showNotification('Invitation declined', 'info');
        } else {
            showNotification(data.message || 'Error declining invitation', 'error');
        }
    } catch (error) {
        console.error('Error declining invitation:', error);
        showNotification('Error declining invitation', 'error');
    }
}

// Gérer la connexion avec un utilisateur
async function handleConnectUser(email, button) {
    try {
        if (!currentUser || !currentUser.email) {
            showNotification('User not authenticated', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/network/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                recipientEmail: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Désactiver le bouton et changer le texte
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-hourglass-split"></i> Pending';
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-outline-secondary');
            
            // Retirer de la liste des suggestions
            suggestions = suggestions.filter(sug => sug.email !== email);
            displaySuggestions();
            updateNetworkStats();
            
            showNotification('Connection request sent!', 'success');
        } else {
            showNotification(data.message || 'Error sending connection request', 'error');
        }
    } catch (error) {
        console.error('Error connecting with user:', error);
        showNotification('Error sending connection request', 'error');
        if (button) button.disabled = false;
    }
}

// Gérer l'envoi d'un message
function handleMessageUser(email) {
    //messagerie 
    console.log('Opening message interface for:', email);
    showNotification('Message feature coming soon!', 'info');
    
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer une toast simple
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

