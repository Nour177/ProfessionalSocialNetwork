// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000'; // Ajustez selon votre configuration (port)

// État de l'application
let currentUser = null;
let posts = [];

// Vérifier si un post appartient à l'utilisateur actuel
function isCurrentUserPost(author) {
    if (!currentUser) {
        return false;
    }
    const currentUserName = `${currentUser.firstname} ${currentUser.lastname}`;
    return author === currentUserName;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialisation de l'application
async function initializeApp() {
    // Vérifier l'authentification
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        // redirection vers la page de login si non authentifié
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Charger les informations de l'utilisateur
    await loadUserProfile();
    
    // Charger les posts (tous les posts dans la base)
    await loadPosts();
    
    // Configurer les écouteurs d'événements (listeners)
    setupEventListeners();
    
    // Initialiser le champ date de l'événement avec la date actuelle (pour la publication d'événement)
    const eventDateInput = document.getElementById('event-date');
    if (eventDateInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        eventDateInput.value = now.toISOString().slice(0, 16);
    }
}

// Charger le profil utilisateur
async function loadUserProfile() {
    try {
        // Récupérer l'utilisateur depuis le localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!userData) {
            // Si pas d'utilisateur, rediriger vers login
            window.location.href = '/pages/login.html';
            return;
        }
        
        currentUser = userData;
        updateUserProfileUI(userData);
    } catch (error) {
        console.error('Error loading user profile:', error);
        // En cas d'erreur, toujours vers login
        window.location.href = '/pages/login.html';
    }
}

// Mettre à jour l'interface du profil utilisateur avec les données
function updateUserProfileUI(user) {
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-info h6');
    const profileJob = document.querySelector('#company');
    const postAvatar = document.querySelector('.post-avatar');
    
    if (profileAvatar && user.profileImagePath) {
        profileAvatar.src = user.profileImagePath;
    }
    
    if (profileName) {
        profileName.textContent = `${user.firstname} ${user.lastname}`;
    }
    
    if (profileJob && user.recentJob) {
        profileJob.innerHTML = `${user.recentJob}`;
    }
    
    if (postAvatar && user.profileImagePath) {
        postAvatar.src = user.profileImagePath;
    }
}


async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            // différents formats de réponse
            if (data.success && data.posts) {
                posts = data.posts;
            } else if (Array.isArray(data)) {
                posts = data;
            } else if (data.posts) {
                posts = data.posts;
            } else {
                posts = [];
            }
            displayPosts(posts);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erreur lors du chargement des posts:', errorData);
            displayPosts([]);
        }
    } catch (error) {
        console.error('Network error loading posts:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.name,
            API_URL: API_BASE_URL
        });
        
        // message d'erreur 
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
            postsContainer.innerHTML = `
                <div class="card">
                    <div class="card-body text-center text-danger">
                        <p><strong>Network Error</strong></p>
                        <p class="small">Unable to connect to the server.</p>
                        <p class="small">Please check</p>
                    </div>
                </div>
            `;
        }
    }
}

// Afficher les posts dans le HTML
function displayPosts(postsArray) {
    const postsContainer = document.getElementById('posts-container');
    
    if (!postsContainer) {
        console.error('Conteneur de posts introuvable');
        return;
    }
    
    // Vider le conteneur des posts
    postsContainer.innerHTML = '';
    
    // Afficher chaque post
    if (postsArray.length === 0) {
        postsContainer.innerHTML = '<div class="card"><div class="card-body text-center text-muted">No posts yet. Be the first to post!</div></div>';
        return;
    }
    
    postsArray.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Crée un élément HTML pour un post
function createPostElement(post) {
    const postCard = document.createElement('div');
    postCard.className = 'card post-card mb-3';
    postCard.dataset.postId = post._id || post.id;
    
    const timeAgo = formatTimeAgo(post.createdAt || post.timestamp);
    
    postCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center">
                    <img src="${post.authorAvatar || '/uploads/default-avatar.png'}" 
                         alt="Photo profil" 
                         class="rounded-circle me-2" 
                         style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <h6 class="fw-bold mb-0">${escapeHtml(post.author || 'User')}</h6>
                        <p class="text-muted small mb-0">${timeAgo}</p>
                    </div>
                </div>
                ${isCurrentUserPost(post.author) ? `
                    <div class="dropdown">
                        <button class="btn btn-sm" type="button" id="dropdownMenuButton-${post._id || post.id}" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton-${post._id || post.id}">
                            <li><a class="dropdown-item edit-post-btn" href="#" data-post-id="${post._id || post.id}">
                                <i class="bi bi-pencil"></i> Edit
                            </a></li>
                            <li><a class="dropdown-item delete-post-btn text-danger" href="#" data-post-id="${post._id || post.id}">
                                <i class="bi bi-trash"></i> Delete
                            </a></li>
                        </ul>
                    </div>
                ` : ''}
            </div>
            
            ${post.image ? `<img src="${post.image}" class="img-fluid rounded mb-2" alt="Image du post">` : ''}
            ${post.video ? `<video src="${post.video}" class="img-fluid rounded mb-2" controls></video>` : ''}
            
            <p class="mb-2">${escapeHtml(post.content || '')}</p>
            
            ${post.postType === 'article' && post.article ? `
                <div class="border rounded p-2 mb-2">
                    <h6 class="fw-bold">${escapeHtml(post.article.title || '')}</h6>
                    ${post.article.coverImage ? `<img src="${post.article.coverImage}" class="img-fluid rounded mb-2">` : ''}
                    <p class="small">${escapeHtml(post.article.body || '').substring(0, 200)}...</p>
                </div>
            ` : ''}
            
            ${post.postType === 'event' && post.event ? `
                <div class="border rounded p-2 mb-2">
                    <h6 class="fw-bold"><i class="bi bi-calendar-event"></i> ${escapeHtml(post.event.title || '')}</h6>
                    <p class="small mb-0">${escapeHtml(post.event.description || '')}</p>
                    <p class="small text-muted mb-0"> <i class="bi bi-geo-alt-fill"></i> ${escapeHtml(post.event.location || '')}</p>
                    <p class="small text-muted"> <i class="bi bi-calendar-event-fill"></i> ${formatDate(post.event.date)}</p>
                </div>
            ` : ''}
            
            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <button class="btn btn-sm like-btn ${post.isLiked ? 'text-primary' : 'text-muted'}" 
                        data-post-id="${post._id || post.id}">
                    <i class="bi ${post.isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    <span class="like-count">${post.likes || 0}</span>
                </button>
                
                <button class="btn btn-sm comment-btn text-muted" 
                        data-post-id="${post._id || post.id}">
                    <i class="bi bi-chat"></i>
                    <span class="comment-count">${post.comments ? post.comments.length : 0}</span>
                </button>
                
                <button class="btn btn-sm share-btn text-muted">
                    <i class="bi bi-share"></i>
                </button>
            </div>
            
            <!-- Zone de commentaires -->
            <div class="comments-section mt-3" id="comments-${post._id || post.id}" style="display: none;">
                <div class="comments-list mb-2">
                    ${post.comments && post.comments.length > 0 ? 
                        post.comments.map(comment => `
                            <div class="comment-item mb-2 p-2 bg-light rounded">
                                <strong>${escapeHtml(comment.user || 'User')}:</strong>
                                <span>${escapeHtml(comment.text || '')}</span>
                                <small class="text-muted d-block">${formatTimeAgo(comment.createdAt)}</small>
                            </div>
                        `).join('') : ''
                    }
                </div>
                
                <div class="d-flex align-items-center">
                    <input type="text" 
                           class="form-control form-control-sm comment-input me-2" 
                           placeholder="Write a comment..."
                           data-post-id="${post._id || post.id}">
                    <button class="btn btn-sm btn-primary submit-comment-btn" 
                            data-post-id="${post._id || post.id}">
                        Publish
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return postCard;
}

// Configurer les listners
function setupEventListeners() {
    // Publier un post
    const postInput = document.querySelector('.post-input');
    const publishBtn = document.querySelector('.publish-btn');
    
    if (postInput) {
        // Afficher/masquer le bouton Publier selon le contenu
        postInput.addEventListener('input', (e) => {
            if (publishBtn) {
                publishBtn.style.display = e.target.value.trim() ? 'block' : 'none';
            }
        });
        
        // Publier avec Enter
        postInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                createPost(e.target.value.trim());
                e.target.value = '';
                if (publishBtn) {
                    publishBtn.style.display = 'none';
                }
            }
        });
    }
    
    // Bouton de publication
    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            const input = document.querySelector('.post-input');
            if (input && input.value.trim()) {
                createPost(input.value.trim());
                input.value = '';
                publishBtn.style.display = 'none';
            }
        });
    }
    
    // Boutons pour les types de posts
    const photoBtn = document.querySelector('.btn-photo');
    const videoBtn = document.querySelector('.btn-video');
    const eventBtn = document.querySelector('.btn-event');
    const articleBtn = document.querySelector('.btn-article');
    // si le bouton est présent, on affiche le forlmulaire correspondant
    // formulaire Photo
    if (photoBtn) {
        photoBtn.addEventListener('click', () => {
            hideAllForms();
            showForm('photo-form');
        });
    }
    
    // formulaire Video
    if (videoBtn) {
        videoBtn.addEventListener('click', () => {
            hideAllForms();
            showForm('video-form');
        });
    }
    
    // formulaire Event
    if (eventBtn) {
        eventBtn.addEventListener('click', () => {
            hideAllForms();
            showForm('event-form');
        });
    }
    
    // formulaire Article
    if (articleBtn) {
        articleBtn.addEventListener('click', () => {
            hideAllForms();
            showForm('article-form');
        });
    }
    
    // Boutons Annuler
    document.querySelectorAll('.btn-cancel-form').forEach(btn => {
        btn.addEventListener('click', () => {
            hideAllForms();
        });
    });
    
    // Soumettre formulaire Photo
    const submitPhotoBtn = document.querySelector('.btn-submit-photo');
    if (submitPhotoBtn) {
        submitPhotoBtn.addEventListener('click', async () => {
            const fileInput = document.getElementById('photo-file');
            const description = document.getElementById('photo-description').value;
            
            if (!fileInput.files[0]) {
                alert('Please select an image');
                return;
            }
            
            await createPostWithImage(fileInput.files[0], description);
            hideAllForms();
            resetForm('photo-form');
        });
    }
    
    // Soumettre formulaire Video
    const submitVideoBtn = document.querySelector('.btn-submit-video');
    if (submitVideoBtn) {
        submitVideoBtn.addEventListener('click', async () => {
            const videoUrl = document.getElementById('video-url').value;
            const description = document.getElementById('video-description').value;
            
            if (!videoUrl.trim()) {
                alert('Please enter a video URL');
                return;
            }
            
            await createPost(description, 'video', { video: videoUrl });
            hideAllForms();
            resetForm('video-form');
        });
    }
    
    // Soumettre formulaire Event
    const submitEventBtn = document.querySelector('.btn-submit-event');
    if (submitEventBtn) {
        submitEventBtn.addEventListener('click', async () => {
            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const location = document.getElementById('event-location').value;
            const date = document.getElementById('event-date').value;
            
            if (!title.trim()) {
                alert('Please enter an event title');
                return;
            }
            
            const eventDate = date ? new Date(date) : new Date();
            
            await createPost(description, 'event', {
                event: {
                    title: title,
                    description: description,
                    date: eventDate.toISOString(),
                    location: location
                }
            });
            hideAllForms();
            resetForm('event-form');
        });
    }
    
    // Soumettre formulaire Article
    const submitArticleBtn = document.querySelector('.btn-submit-article');
    if (submitArticleBtn) {
        submitArticleBtn.addEventListener('click', async () => {
            const title = document.getElementById('article-title').value;
            const body = document.getElementById('article-body').value;
            const coverImage = document.getElementById('article-cover-image').value;
            
            if (!title.trim() || !body.trim()) {
                alert('Please fill in the title and content of the article');
                return;
            }
            
            await createPost('', 'article', {
                article: {
                    title: title,
                    body: body,
                    coverImage: coverImage
                }
            });
            hideAllForms();
            resetForm('article-form');
        });
    }
    
    // Déléguation d'événements pour les posts dynamiques
    document.addEventListener('click', (e) => {
        // Like
        if (e.target.closest('.like-btn')) {
            const btn = e.target.closest('.like-btn');
            const postId = btn.dataset.postId;
            toggleLike(postId, btn);
        }
        
        // Commenter
        if (e.target.closest('.comment-btn')) {
            const btn = e.target.closest('.comment-btn');
            const postId = btn.dataset.postId;
            toggleCommentsSection(postId);
        }
        
        // Soumettre un commentaire
        if (e.target.closest('.submit-comment-btn')) {
            const btn = e.target.closest('.submit-comment-btn');
            const postId = btn.dataset.postId;
            const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
            if (input && input.value.trim()) {
                addComment(postId, input.value.trim());
                input.value = '';
            }
        }
        
        // Modifier un post (gérer le clic sur le lien ou l'icône)
        const editBtn = e.target.closest('.edit-post-btn');
        const editLink = e.target.closest('a.edit-post-btn');
        if (editBtn || editLink) {
            e.preventDefault();
            e.stopPropagation();
            const btn = editBtn || editLink;
            const postId = btn ? btn.dataset.postId : null;
            console.log('Edit button clicked, postId:', postId);
            if (postId) {
                // Fermer le dropdown
                const dropdown = btn.closest('.dropdown');
                if (dropdown && typeof bootstrap !== 'undefined') {
                    const dropdownButton = dropdown.querySelector('[data-bs-toggle="dropdown"]');
                    if (dropdownButton) {
                        const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownButton);
                        if (dropdownInstance) {
                            dropdownInstance.hide();
                        }
                    }
                }
                editPost(postId);
            }
        }
        
        // Supprimer un post (gérer le clic sur le lien ou l'icône)
        const deleteBtn = e.target.closest('.delete-post-btn');
        const deleteLink = e.target.closest('a.delete-post-btn');
        if (deleteBtn || deleteLink) {
            e.preventDefault();
            e.stopPropagation();
            const btn = deleteBtn || deleteLink;
            const postId = btn ? btn.dataset.postId : null;
            console.log('Delete button clicked, postId:', postId);
            if (postId) {
                // Fermer le dropdown
                const dropdown = btn.closest('.dropdown');
                if (dropdown && typeof bootstrap !== 'undefined') {
                    const dropdownButton = dropdown.querySelector('[data-bs-toggle="dropdown"]');
                    if (dropdownButton) {
                        const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownButton);
                        if (dropdownInstance) {
                            dropdownInstance.hide();
                        }
                    }
                }
                if (confirm('Are you sure you want to delete this post? This action is irreversible.')) {
                    deletePost(postId);
                }
            }
        }
    });
    
    // Soumettre un commentaire avec Enter
    document.addEventListener('keypress', (e) => {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
            const postId = e.target.dataset.postId;
            if (e.target.value.trim()) {
                addComment(postId, e.target.value.trim());
                e.target.value = '';
            }
        }
    });
}

// Créer un nouveau post (texte simple)
async function createPost(content, postType = 'text', additionalData = {}) {
    if (!content.trim() && postType === 'text') {
        alert('Post content cannot be empty');
        return;
    }
    
    // Pour les tests, utiliser un utilisateur par défaut si pas connecté
    const authorName = currentUser 
        ? `${currentUser.firstname} ${currentUser.lastname}`
        : 'Test User';
    const authorAvatar = currentUser?.profileImagePath || '';
    
    try {
        const postData = {
            author: authorName,
            authorAvatar: authorAvatar,
            content: content || '',
            postType: postType,
            ...additionalData
        };
        
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Post créé avec succès:', result);
            // Recharger les posts pour avoir la version complète du serveur
            await loadPosts();
        } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            alert('Error publishing post: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        alert('Network error while publishing post');
    }
}

// Créer un post avec image
async function createPostWithImage(file, content = '') {
    const authorName = currentUser 
        ? `${currentUser.firstname} ${currentUser.lastname}`
        : 'Test User';
    const authorAvatar = currentUser?.profileImagePath || '';
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('author', authorName);
        formData.append('authorAvatar', authorAvatar);
        formData.append('postType', 'image');
        formData.append('content', content);
        
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Post avec image créé avec succès:', result);
            await loadPosts();
        } else {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            alert('Error publishing post: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur lors de la création du post avec image:', error);
        alert('Network error while publishing post');
    }
}

// Afficher un formulaire
function showForm(formId) {
    const container = document.getElementById('post-forms-container');
    const form = document.getElementById(formId);
    
    if (container && form) {
        container.style.display = 'block';
        form.style.display = 'block';
        
        // Scroll vers le formulaire
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Masquer tous les formulaires
function hideAllForms() {
    const container = document.getElementById('post-forms-container');
    const forms = document.querySelectorAll('.post-form');
    
    if (container) {
        container.style.display = 'none';
    }
    
    forms.forEach(form => {
        form.style.display = 'none';
    });
}

// Réinitialiser un formulaire
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Toggle like sur un post
async function toggleLike(postId, buttonElement) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const likeIcon = buttonElement.querySelector('i');
            const likeCount = buttonElement.querySelector('.like-count');
            
            // Mettre à jour l'interface
            if (data.liked) {
                likeIcon.classList.remove('bi-heart');
                likeIcon.classList.add('bi-heart-fill');
                buttonElement.classList.remove('text-muted');
                buttonElement.classList.add('text-primary');
            } else {
                likeIcon.classList.remove('bi-heart-fill');
                likeIcon.classList.add('bi-heart');
                buttonElement.classList.remove('text-primary');
                buttonElement.classList.add('text-muted');
            }
            
            if (likeCount) {
                likeCount.textContent = data.likes || 0;
            }
        } else {
            console.error('Erreur lors du like');
        }
    } catch (error) {
        console.error('Erreur réseau lors du like:', error);
    }
}

// Toggle la section des commentaires
function toggleCommentsSection(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        const isVisible = commentsSection.style.display !== 'none';
        commentsSection.style.display = isVisible ? 'none' : 'block';
        
        // Focus sur l'input si on ouvre
        if (!isVisible) {
            const input = commentsSection.querySelector('.comment-input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
}

// Ajouter un commentaire
async function addComment(postId, commentText) {
    if (!commentText.trim()) {
        return;
    }
    
    // Pour les tests
    const userName = currentUser 
        ? `${currentUser.firstname} ${currentUser.lastname}`
        : 'Test User';
    
    try {
        const commentData = {
            text: commentText,
            user: userName
        };
        
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Commentaire ajouté avec succès:', result);
            // Recharger les posts pour afficher le nouveau commentaire
            await loadPosts();
            
            // Rouvrir la section des commentaires
            toggleCommentsSection(postId);
            setTimeout(() => toggleCommentsSection(postId), 100);
        } else {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            alert('Error adding comment: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Network error while adding comment');
    }
}

// Fonctions utilitaires (pour les posts )
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'A moment ago';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'A few seconds ago';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('fr-FR');
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modifier un post
async function editPost(postId) {
    try {
        // Récupérer le post actuel
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
        if (!response.ok) {
            alert('Error retrieving post');
            return;
        }
        
        const result = await response.json();
        const post = result.post;
        
        if (!post) {
            alert('Post non trouvé');
            return;
        }
        
        // Afficher un formulaire de modification selon le type de post
        if (post.postType === 'text') {
            const newContent = prompt('Edit content:', post.content || '');
            if (newContent !== null) {
                await updatePost(postId, { content: newContent });
            }
        } else if (post.postType === 'image') {
            const newContent = prompt('Edit description:', post.content || '');
            if (newContent !== null) {
                // Demander si l'utilisateur veut changer l'image
                const changeImage = confirm('Do you want to change the image?');
                if (changeImage) {
                    // Créer un input file temporaire
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    fileInput.click();
                    
                    fileInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            await updatePostWithImage(postId, file, newContent);
                        } else {
                            await updatePost(postId, { content: newContent });
                        }
                        document.body.removeChild(fileInput);
                    }, { once: true });
                } else {
                    await updatePost(postId, { content: newContent });
                }
            }
        } else if (post.postType === 'video') {
            const newContent = prompt('Edit description:', post.content || '');
            const newVideo = prompt('Edit video URL:', post.video || '');
            if (newContent !== null || newVideo !== null) {
                await updatePost(postId, { 
                    content: newContent !== null ? newContent : post.content,
                    video: newVideo !== null ? newVideo : post.video
                });
            }
        } else if (post.postType === 'article') {
            const newTitle = prompt('Edit title:', post.article?.title || '');
            if (newTitle === null) return;
            
            const newBody = prompt('Edit content:', post.article?.body || '');
            if (newBody === null) return;
            
            const newCoverImage = prompt('Edit cover image URL:', post.article?.coverImage || '');
            
            await updatePost(postId, {
                article: {
                    title: newTitle,
                    body: newBody,
                    coverImage: newCoverImage !== null ? newCoverImage : (post.article?.coverImage || '')
                }
            });
        } else if (post.postType === 'event') {
            const newTitle = prompt('Edit title:', post.event?.title || '');
            if (newTitle === null) return;
            
            const newDescription = prompt('Edit description:', post.event?.description || '');
            if (newDescription === null) return;
            
            const newLocation = prompt('Edit location:', post.event?.location || '');
            const newDate = prompt('Edit date (YYYY-MM-DD):', post.event?.date ? new Date(post.event.date).toISOString().split('T')[0] : '');
            
            await updatePost(postId, {
                event: {
                    title: newTitle,
                    description: newDescription,
                    location: newLocation !== null ? newLocation : (post.event?.location || ''),
                    date: newDate !== null ? newDate : (post.event?.date || new Date().toISOString())
                }
            });
        }
    } catch (error) {
        console.error('Erreur lors de la modification du post:', error);
            alert('Error editing post');
    }
}

// Mettre à jour un post
async function updatePost(postId, updateData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Post modifié avec succès:', result);
            // Recharger les posts
            await loadPosts();
        } else {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            alert('Error editing: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur réseau lors de la modification:', error);
        alert('Network error while editing post');
    }
}

// Mettre à jour un post avec une nouvelle image
async function updatePostWithImage(postId, file, content) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        if (content !== undefined) {
            formData.append('content', content);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Post avec image modifié avec succès:', result);
            await loadPosts();
        } else {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            alert('Error editing: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur réseau lors de la modification:', error);
        alert('Network error while editing post');
    }
}

// Supprimer un post
async function deletePost(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Post supprimé avec succès:', result);
            // Recharger les posts
            await loadPosts();
        } else {
            const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            alert('Error deleting: ' + (error.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur réseau lors de la suppression:', error);
        alert('Network error while deleting post');
    }
}

// Exporter les fonctions (en cas de necessité)
window.acceuilApp = {
    loadPosts,
    createPost,
    toggleLike,
    addComment,
    editPost,
    deletePost
};

