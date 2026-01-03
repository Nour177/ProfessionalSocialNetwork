// Utility function to load navbar consistently across all pages
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar');
    
    if (!navbarContainer) {
        console.error('Navbar container not found');
        return;
    }

    // Determine the correct path based on current location
    // si on est dans un sous-dossier, on ajuste le chemin
    const currentPath = window.location.pathname;
    let navbarPath = './navbar.html';
    let navbarScriptPath = '../js/navbar.js';
    
    if (!currentPath.includes('/pages/')) {
        navbarPath = '/pages/navbar.html';
        navbarScriptPath = '/js/navbar.js';
    }

    fetch(navbarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load navbar');
            }
            return response.text();
        })
        .then(data => {
            navbarContainer.innerHTML = data;
            const script = document.createElement('script');
            script.src = navbarScriptPath;
            script.onload = () => {
                console.log('Navbar script loaded successfully');
            };
            script.onerror = () => {
                console.error('Failed to load navbar script');
            };
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            navbarContainer.innerHTML = '<div class="alert alert-warning">Failed to load navigation bar</div>';
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}

