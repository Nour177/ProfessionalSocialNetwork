// import { handleLogout } from './acceuil.js';
const API_BASE_URL = 'http://localhost:3000';
const currentYear = new Date().getFullYear();

// État de l'application
let currentUser = null;
let eventListenersSetup = false; //pour eviter les refrech plusieurs fois
let isInitializing = false;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (!isInitializing) {
        isInitializing = true;
        initializeApp();
    }
});

// Initialisation de l'application
async function initializeApp() {
    // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // if (!isAuthenticated) {
    //     window.location.href = '/pages/login.html';
    //     return;
    // }

    await loadUserProfile();
}

// Charger le profil utilisateur depuis l'URL ou localStorage
async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile?id=${userId}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            
            const userData = await response.json();
            currentUser = userData;
            displayUserProfile(userData);
        } catch (error) {
            console.error('Error loading profile:', error);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData && userData._id) {
                currentUser = userData;
                displayUserProfile(userData);
            }
        }
    } else {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData && userData._id) {
            currentUser = userData;
            displayUserProfile(userData);
        }
    }
}

// Afficher le profil utilisateur
function displayUserProfile(user) {
    const nom = document.getElementById('nom');
    if (nom) {
        nom.textContent = `${user.firstname || ''} ${user.lastname || ''}`.trim();
    }

    const position = document.getElementById('position');
    if (position) {
        const jobTitle = user.experiences && user.experiences.length > 0
            ? user.experiences[0].role || user.position || user.email
            : user.position || user.email;
        position.textContent = jobTitle;
    }

    const infos = document.getElementById('infos');
    if (infos) {
        infos.textContent = user.description || 'No description available.';
    }

    // Photo de profil
    const profileImg = document.querySelector('.profile-img2');
    if (profileImg) {
        let profilePath = user.profileImagePath || '../images/profile.png';
        if (profilePath && !profilePath.startsWith('/') && !profilePath.startsWith('http') && !profilePath.startsWith('../')) {
            profilePath = '/' + profilePath;
        }
        profileImg.src = profilePath;
        profileImg.onerror = function() {
            this.src = '../images/profile.png';
        };
    }

    // Image de couverture
    const coverImg = document.querySelector('.image-background2');
    if (coverImg) {
        let coverPath = user.coverImagePath || '../images/default-cover.jpg';
        if (coverPath && !coverPath.startsWith('/') && !coverPath.startsWith('http') && !coverPath.startsWith('../')) {
            coverPath = '/' + coverPath;
        }
        coverImg.src = coverPath;
        coverImg.onerror = function() {
            this.src = '../images/default-cover.jpg';
        };
    }

    const profileVideo = document.querySelector('.profile-video');
    if (profileVideo) {
        if (user.videoPath) {
            profileVideo.src = user.videoPath;
            profileVideo.style.display = 'block';
        } else {
            profileVideo.src = '';
            profileVideo.style.display = 'none';
        }
    }

    displayExperiences(user.experiences || []);
    displayEducation(user.education || []);
    displaySkills(user.skills || []);
    displayCertifications(user.certifications || []);

    //posts
    loadUserPosts(user);
}

function displayExperiences(experiences) {
    const experienceContainer = document.getElementById("experience");
    if (!experienceContainer) return;

    experienceContainer.innerHTML = '';

    experiences.forEach((exp, index) => {
        const div = document.createElement("div");
        div.className = "experience-item2";
        div.setAttribute("data-role", exp.role || '');
        div.setAttribute("data-company", exp.company || '');
        div.setAttribute("data-start", exp.startYear || '');
        div.setAttribute("data-end", exp.endYear || '');
        div.setAttribute("data-desc", exp.description || '');

        div.innerHTML = `
<img src="${exp.logo || '../images/default-c.jpg'}" alt="Company Logo" width="200" height="150">
  <h6>${exp.role || 'No role specified'}</h6>
  <div class="text-muted small">
    <span>${exp.company || 'No company'}</span>
    ${exp.startYear || exp.endYear ? `<span class="mx-1">•</span><span>${exp.startYear || ''}-${exp.endYear || ''}</span>` : ''}
  </div>
  ${exp.description ? `<p>${exp.description}</p>` : ''}
`;

        experienceContainer.appendChild(div);
    });

    
}

function displayEducation(education) {
    const educationContainer = document.getElementById("education");
    if (!educationContainer) return;

    const existingContent = educationContainer.querySelector('.card-title');
    if (existingContent) {
        const itemsToRemove = educationContainer.querySelectorAll('.education-item');
        itemsToRemove.forEach(item => item.remove());
    }

    education.forEach((ed, index) => {
        const div = document.createElement("div");
        div.className = "education-item d-flex align-items-start justify-content-between mb-3 p-2 border rounded";
        div.setAttribute("data-index", index);

        // Add data attributes for PDF reading
        div.setAttribute("data-field", ed.fieldOfStudy || ed.degree || '');
        div.setAttribute("data-school", ed.school || ed.establishment || '');
        div.setAttribute("data-degree", ed.degree || '');
        div.setAttribute("data-start", ed.startYear || '');
        div.setAttribute("data-end", ed.endYear || '');

        div.innerHTML = `
    <div class="card-icons d-flex gap-4">
        <img src="${ed.logo || '../images/graduation-hat.png'}" alt="School Logo" onerror="this.src='../images/default-school.png'" width="50" height="50">
        <div>
            <h6 class="mb-0">${ed.fieldOfStudy || ed.degree || 'No degree'}</h6>
            <small class="text-muted">${ed.school || ed.establishment || ''} ${ed.degree ? '• ' + ed.degree : ''}</small>
            ${ed.startYear || ed.endYear ? `<p class="mb-0"><small class="text-muted">${ed.startYear || ''}${ed.startYear && ed.endYear ? '-' : ''}${ed.endYear || ''}</small></p>` : ''}
        </div>
    </div>
    
`;


        educationContainer.appendChild(div);
    });
}

function displaySkills(skills) {
    const skillContainer = document.getElementById("skill");
    if (!skillContainer) return;

    const existingContent = skillContainer.querySelector('.card-title');
    if (existingContent) {
        const itemsToRemove = skillContainer.querySelectorAll('.skill-item');
        itemsToRemove.forEach(item => item.remove());
    }

    skills.forEach((skill, index) => {
        const div = document.createElement("div");
        div.className = "skill-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";
        div.setAttribute("data-index", index);

        // store skill in a data attribute for PDF
        div.setAttribute("data-skill", skill);

        div.innerHTML = `
    <span>${skill}</span>
`;

        skillContainer.appendChild(div);
    });
}

function displayCertifications(certifications) {
    const certificationContainer = document.getElementById("certification");
    if (!certificationContainer) return;

    const existingContent = certificationContainer.querySelector('.card-title');
    if (existingContent) {
        const itemsToRemove = certificationContainer.querySelectorAll('.certification-item');
        itemsToRemove.forEach(item => item.remove());
    }

    certifications.forEach((cert, index) => {
        const div = document.createElement("div");
        div.className = "certification-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";
        div.setAttribute("data-index", index);

        // store cert info for PDF
        div.setAttribute("data-title", cert.title || '');
        div.setAttribute("data-company", cert.company || '');
        div.setAttribute("data-year", cert.year || '');

        div.innerHTML = `
    <div>
        <h6 class="mb-0">${cert.title || 'No title'}</h6>
        <small>${cert.company || ''} ${cert.year ? '• ' + cert.year : ''}</small>
    </div>
    
`;

        certificationContainer.appendChild(div);
    });
}

// Charger les posts du user 
async function loadUserPosts(user) {
    const container = document.getElementById("posts");
    if (container) {
        container.innerHTML = '<p class="text-center text-muted"><i class="bi bi-hourglass-split"></i> Loading posts...</p>';
    }

    try {
        console.log('Loading posts for user:', user);
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Posts API response:', data);

        let allPosts = [];

        if (data.success && data.posts) {
            allPosts = data.posts;
        } else if (Array.isArray(data)) {
            allPosts = data;
        } else if (data.posts) {
            allPosts = data.posts;
        }

        console.log('Total posts loaded:', allPosts.length);

        // Filtrer les posts de l'utilisateur actuel
        const userFullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();

        console.log('Filtering posts for user:', userFullName);

        const userPosts = allPosts.filter(post => {
            if (!post.author) return false;
            const postAuthor = post.author.trim();
            return postAuthor === userFullName;
        });

        console.log('User posts found:', userPosts.length);
        displayUserPosts(userPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Unable to load posts. Please try again later.
                    <br><small>Error: ${error.message}</small>
                </div>
            `;
        }
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function displayUserPosts(posts) {
    const container = document.getElementById("posts");
    if (!container) {
        console.error('Posts container not found');
        return;
    }

    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4"><i class="bi bi-inbox"></i> No posts yet. Start sharing your thoughts!</p>';
        return;
    }

    console.log('Displaying', posts.length, 'posts');

    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    sortedPosts.forEach((post, index) => {
        try {
            const div = document.createElement("div");
            div.className = "post-item mb-3 p-3";
            div.style = "background:#f8f9fa; border-radius:12px;";

            const postDate = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Recently';

            let postContent = '';

            if (post.postType === 'image' && post.image) {
                postContent = `
                    ${post.content ? `<p>${escapeHtml(post.content)}</p>` : ''}
                    <img src="${post.image}" alt="Post image" class="img-fluid rounded mb-2" style="max-height: 400px; object-fit: cover;" onerror="this.style.display='none'">
                `;
            } else if (post.postType === 'video' && post.video) {
                postContent = `
                    ${post.content ? `<p>${escapeHtml(post.content)}</p>` : ''}
                    <div class="ratio ratio-16x9 mb-2">
                        <iframe src="${post.video}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            } else if (post.postType === 'article' && post.article) {
                const article = typeof post.article === 'string' ? JSON.parse(post.article) : post.article;
                postContent = `
                    <h6>${escapeHtml(article.title || 'Article')}</h6>
                    ${article.coverImage ? `<img src="${article.coverImage}" alt="Cover" class="img-fluid rounded mb-2" onerror="this.style.display='none'">` : ''}
                    <p>${escapeHtml(article.body || post.content || '')}</p>
                `;
            } else if (post.postType === 'event' && post.event) {
                const event = typeof post.event === 'string' ? JSON.parse(post.event) : post.event;
                postContent = `
                    <h6>${escapeHtml(event.title || 'Event')}</h6>
                    <p>${escapeHtml(event.description || post.content || '')}</p>
                    ${event.location ? `<p class="small text-muted"><i class="bi bi-geo-alt"></i> ${escapeHtml(event.location)}</p>` : ''}
                    ${event.date ? `<p class="small text-muted"><i class="bi bi-calendar"></i> ${new Date(event.date).toLocaleString()}</p>` : ''}
                `;
            } else {
                postContent = `<p>${escapeHtml(post.content || '')}</p>`;
            }

            const authorName = escapeHtml(post.author || `${currentUser.firstname} ${currentUser.lastname}`);
            const avatarSrc = post.authorAvatar || currentUser.profileImagePath || '../images/profile.png';

            div.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <img src="${avatarSrc}" alt="Profile"
                         style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:10px;" 
                         onerror="this.src='../images/profile.png'">
                    <div>
                        <strong>${authorName}</strong><br>
                        <small class="text-muted">${postDate}</small>
                    </div>
                </div>
                ${postContent}
                <div class="d-flex justify-content-start gap-3 text-muted mt-2" style="font-size:14px;">
                    <span><i class="bi bi-hand-thumbs-up"></i> ${post.likes ? post.likes.length : 0} Like${post.likes && post.likes.length !== 1 ? 's' : ''}</span>
                    <span><i class="bi bi-chat"></i> ${post.comments ? post.comments.length : 0} Comment${post.comments && post.comments.length !== 1 ? 's' : ''}</span>
                </div>
            `;

            container.appendChild(div);
        } catch (error) {
            console.error('Error displaying post:', error, post);
        }
    });

    console.log('Posts displayed successfully');
}