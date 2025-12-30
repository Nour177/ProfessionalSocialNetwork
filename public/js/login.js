// Gérer la soumission du formulaire de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Stocker les données utilisateur dans localStorage
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                        localStorage.setItem('isAuthenticated', 'true');
                        
                        // Rediriger vers la page d'accueil
                        window.location.href = '/pages/acceuil.html';
                    } else {
                        alert('Login successful but user data not received');
                    }
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Network error. Please try again.');
            }
        });
    }
});

