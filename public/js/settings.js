// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000';

// État de l'application
let currentUser = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialisation de l'application
async function initializeApp() {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Charger les informations de l'utilisateur
    await loadUserProfile();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
}

// Charger le profil utilisateur depuis localStorage
async function loadUserProfile() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!userData) {
            window.location.href = '/pages/login.html';
            return;
        }
        
        currentUser = userData;
        populateSettingsForms(userData);
        updateProfileCard(userData);
    } catch (error) {
        console.error('Error loading user profile:', error);
        window.location.href = '/pages/login.html';
    }
}

// Remplir les formulaires avec les données utilisateur
function populateSettingsForms(user) {
    // Profile Settings
    const firstnameInput = document.getElementById('profile-firstname');
    const lastnameInput = document.getElementById('profile-lastname');
    const companyInput = document.getElementById('profile-company');
    
    if (firstnameInput) {
        firstnameInput.value = user.firstname || '';
    }
    
    if (lastnameInput) {
        lastnameInput.value = user.lastname || '';
    }
    
    if (companyInput) {
        // Get company from first experience if available
        let company = '';
        if (user.experiences && user.experiences.length > 0) {
            // Try to get company from first experience
            company = user.experiences[0].company || '';
            // If no company in first experience, search for any experience with a company
            if (!company) {
                const expWithCompany = user.experiences.find(exp => exp.company);
                if (expWithCompany) {
                    company = expWithCompany.company;
                }
            }
        }
        companyInput.value = company;
        console.log('Company loaded:', company, 'from user:', user);
    }
    
    // Account Settings
    const emailInput = document.getElementById('account-email');
    if (emailInput) {
        emailInput.value = user.email || '';
    }
    
    // Privacy Settings (if stored in user object)
    const publicProfileCheckbox = document.getElementById('privacy-public-profile');
    const allowSearchEnginesCheckbox = document.getElementById('privacy-allow-search');
    
    if (publicProfileCheckbox) {
        publicProfileCheckbox.checked = user.publicProfile !== false; // Default to true
    }
    
    if (allowSearchEnginesCheckbox) {
        allowSearchEnginesCheckbox.checked = user.allowSearchEngines === true;
    }
}

// Mettre à jour la carte de profil dans la sidebar
function updateProfileCard(user) {
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-info h6');
    const profileJob = document.querySelector('.profile-info small');
    
    if (profileAvatar) {
        setImageWithFallback(profileAvatar, user.profileImagePath, '../images/profile.png');
        profileAvatar.alt = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Profile picture';
    }
    
    if (profileName) {
        profileName.textContent = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'User';
    }
    
    if (profileJob) {
        // Use recentJob if available (same as acceuil.js), otherwise get from experiences
        let jobText = '';
        
        if (user.recentJob) {
            // Use recentJob directly (same as acceuil.js)
            jobText = user.recentJob;
        } else if (user.experiences && user.experiences.length > 0) {
            // Fallback to first experience
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
        
        profileJob.textContent = jobText || 'No job title';
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Profile Settings Save Button
    const profileSaveBtn = document.querySelector('#profile-settings .btn.publish-btn');
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', handleProfileUpdate);
    }
    
    // Account Settings Update Button
    const accountUpdateBtn = document.querySelector('#account-settings .btn.publish-btn');
    if (accountUpdateBtn) {
        accountUpdateBtn.addEventListener('click', handleAccountUpdate);
    }
    
    // Privacy Settings Save Button
    const privacySaveBtn = document.querySelector('#privacy-settings .btn.publish-btn');
    if (privacySaveBtn) {
        privacySaveBtn.addEventListener('click', handlePrivacyUpdate);
    }
}

// Gérer la mise à jour du profil
async function handleProfileUpdate() {
    const firstnameInput = document.getElementById('profile-firstname');
    const lastnameInput = document.getElementById('profile-lastname');
    const companyInput = document.getElementById('profile-company');
    
    if (!firstnameInput || !lastnameInput || !companyInput) {
        alert('Form fields not found');
        return;
    }
    
    const firstname = firstnameInput.value.trim();
    const lastname = lastnameInput.value.trim();
    const company = companyInput.value.trim();
    
    if (!firstname) {
        alert('First name is required');
        return;
    }
    
    // Si lastname est vide, utiliser firstname comme fallback (évite les erreurs de validation)
    const validLastname = lastname || firstname;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: currentUser.email,
                firstname: firstname,
                lastname: validLastname,
                company: company
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update localStorage with new user data
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
                updateProfileCard(updatedUser);
            }
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Network error. Please try again.');
    }
}

// Gérer la mise à jour du compte
async function handleAccountUpdate() {
    const emailInput = document.getElementById('account-email');
    const passwordInput = document.getElementById('account-password');
    
    if (!emailInput) {
        alert('Email field not found');
        return;
    }
    
    const newEmail = emailInput.value.trim();
    const newPassword = passwordInput.value;
    
    if (!newEmail) {
        alert('Email is required');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Prepare update data
    const updateData = {
        email: currentUser.email, // Current email for identification
        newEmail: newEmail !== currentUser.email ? newEmail : undefined,
        password: newPassword || undefined
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 1) {
        alert('No changes to update');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/account`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update localStorage with new user data
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
                
                // Clear password field
                if (passwordInput) {
                    passwordInput.value = '';
                }
            }
            alert('Account updated successfully!');
        } else {
            alert('Failed to update account: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating account:', error);
        alert('Network error. Please try again.');
    }
}

// Gérer la mise à jour de la confidentialité
async function handlePrivacyUpdate() {
    const publicProfileCheckbox = document.getElementById('privacy-public-profile');
    const allowSearchEnginesCheckbox = document.getElementById('privacy-allow-search');
    
    if (!publicProfileCheckbox || !allowSearchEnginesCheckbox) {
        alert('Privacy settings fields not found');
        return;
    }
    
    const publicProfile = publicProfileCheckbox.checked;
    const allowSearchEngines = allowSearchEnginesCheckbox.checked;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/privacy`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: currentUser.email,
                publicProfile: publicProfile,
                allowSearchEngines: allowSearchEngines
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update localStorage with new user data
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            alert('Privacy settings updated successfully!');
        } else {
            alert('Failed to update privacy settings: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        alert('Network error. Please try again.');
    }
}

