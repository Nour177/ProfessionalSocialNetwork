// import { handleLogout } from './acceuil.js';
const API_BASE_URL = 'http://localhost:5000';
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
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    await loadUserProfile();
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
        
        displayUserProfile(userData);
        
        // Charger les posts en parallèle (ne bloque pas l'affichage)
        loadUserPosts(userData).catch(error => {
            console.error('Error loading posts:', error);
        });
        
        // Configurer les event listeners 
        if (!eventListenersSetup) {
            setupEventListeners(userData);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        window.location.href = '/pages/login.html';
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
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && user.profileImagePath) {
        profileImg.src = user.profileImagePath;
    }

    // Image de couverture
    const coverImg = document.querySelector('.image-background');
    if (coverImg && user.coverImagePath) {
        coverImg.src = user.coverImagePath;
    }

    displayExperiences(user.experiences || []);
    displayEducation(user.education || []);
    displaySkills(user.skills || []);
    displayCertifications(user.certifications || []);
}

function displayExperiences(experiences) {
    const experienceContainer = document.getElementById("experience");
    if (!experienceContainer) return;

    experienceContainer.innerHTML = '';

    experiences.forEach((exp, index) => {
        const div = document.createElement("div");
        div.className = "experience-item";
        div.setAttribute("role", "button");
        div.setAttribute("data-bs-toggle", "modal");
        div.setAttribute("data-bs-target", "#editExperienceModal");
        div.setAttribute("data-index", index);

        div.innerHTML = `
            <img src="${exp.logo || '../images/default-c.jpg'}" alt="Company Logo" onerror="this.src='../images/default-c.jpg'">
            <h6 class="mb-0">${exp.role || 'No role specified'}</h6>
            <div class="text-muted small">
                <span>${exp.company || 'No company'}</span>
                ${exp.startYear || exp.endYear ? `
                    <span class="mx-1">•</span>
                    <span>${exp.startYear || ''}${exp.startYear && exp.endYear ? '-' : ''}${exp.endYear || ''}</span>
                ` : ''}
            </div>
            ${exp.description ? `<p class="mb-0">${exp.description}</p>` : ''}
        `;

        experienceContainer.appendChild(div);
    });

    // Bouton pour ajouter une expérience
    const addDiv = document.createElement("div");
    addDiv.className = "experience-item experience-add d-flex align-items-center gap-2 p-3 mb-3 rounded fw-semibold";
    addDiv.setAttribute("role", "button");
    addDiv.setAttribute("data-bs-toggle", "modal");
    addDiv.setAttribute("data-bs-target", "#experienceModal");
    addDiv.innerHTML = `
        <i class="bi bi-plus-square fs-4" style="color: var(--yellow-green);"></i>
        <span>Add Experience</span>
    `;
    experienceContainer.appendChild(addDiv);
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

        div.innerHTML = `
            <div class="card-icons d-flex gap-4">
                <img src="${ed.logo || '../images/graduation-hat.png'}" alt="School Logo" onerror="this.src='../images/default-school.png'">
                <div>
                    <h6 class="mb-0">${ed.fieldOfStudy || ed.degree || 'No degree'}</h6>
                    <small class="text-muted">${ed.school || ed.establishment || ''} ${ed.degree ? '• ' + ed.degree : ''}</small>
                    ${ed.startYear || ed.endYear ? `
                        <p class="mb-0"><small class="text-muted">${ed.startYear || ''}${ed.startYear && ed.endYear ? '-' : ''}${ed.endYear || ''}</small></p>
                    ` : ''}
                </div>
            </div>
            <div class="ms-auto d-flex gap-3">
                <i class="bi bi-pencil" role="button" data-bs-toggle="modal" data-bs-target="#editEducationModal"></i>
                <i class="bi bi-trash" role="button" data-bs-toggle="modal" data-bs-target="#deleteEducationModal"></i>
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

        div.innerHTML = `
            <span>${skill}</span>
            <i class="bi bi-trash ms-auto" role="button" data-bs-toggle="modal" data-bs-target="#deleteSkillModal"></i>
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

        div.innerHTML = `
            <div>
                <h6 class="mb-0">${cert.title || 'No title'}</h6>
                <small>${cert.company || ''} ${cert.year ? '• ' + cert.year : ''}</small>
            </div>
            <div class="ms-auto d-flex gap-3">
                <i class="bi bi-pencil" role="button" data-bs-toggle="modal" data-bs-target="#editCertificationModal"></i>
                <i class="bi bi-trash" role="button" data-bs-toggle="modal" data-bs-target="#deleteCertificationModal"></i>
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

function setupEventListeners(user) {
    if (eventListenersSetup) {
        console.log('Event listeners already setup, skipping...');
        return;
    }
    
    eventListenersSetup = true;
    
    // Edit Photo Modal
    const photoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('photoPreview');
    const savePhotoBtn = document.getElementById('savePhotoBtn');

    if (photoInput && photoPreview && savePhotoBtn) {
        if (user.profileImagePath) {
            photoPreview.src = user.profileImagePath;
        }

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
                savePhotoBtn.disabled = false;
            }
        });

        savePhotoBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const file = photoInput.files[0];
            if (file) {
                await updateProfilePhoto(file);
            }
        });
    }

    // Edit Cover Modal
    const coverInput = document.getElementById('coverInput');
    const coverPreview = document.getElementById('coverPreview');
    const saveCoverBtn = document.getElementById('saveCoverBtn');

    if (coverInput && coverPreview && saveCoverBtn) {
        if (user.coverImagePath) {
            coverPreview.src = user.coverImagePath;
        }

        coverInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
                saveCoverBtn.disabled = false;
            }
        });

        saveCoverBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const file = coverInput.files[0];
            if (file) {
                await updateCoverPhoto(file);
            }
        });
    }

    // Edit Description Modal
    const descriptionTextarea = document.getElementById('descriptionTextarea');
    const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');
    const editInfosModal = document.getElementById('editInfosModal');
    const infos = document.getElementById('infos');

    if (editInfosModal && descriptionTextarea && saveDescriptionBtn) {
        editInfosModal.addEventListener('show.bs.modal', () => {
            descriptionTextarea.value = infos ? infos.textContent : '';
        });

        saveDescriptionBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const newDescription = descriptionTextarea.value;
            await updateDescription(newDescription);
        });
    }
     // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Setup all modals
    setupExperienceModals(user);
    setupEducationModals(user);
    setupAddEducationModal();
    setupDeleteEducationModal();
    setupDeleteExperienceModal();
    setupDeleteSkillModal();
    setupAddSkillModal(user);
    setupAddCertificationModal();
    setupDeleteCertificationModal();
    setupCertificationModals(user);
}

// EXPERIENCE MODALS
function setupExperienceModals(user) {
    const expRole = document.getElementById('expRole');
    const expCompany = document.getElementById('expCompany');
    const expStartYear = document.getElementById('expStartYear');
    const expEndYear = document.getElementById('expEndYear');
    const expDescription = document.getElementById('expDescription');
    const saveExperienceBtn = document.getElementById('saveExperienceBtn');
    const editRoleError = document.getElementById('editRoleError');
    const editCompanyError = document.getElementById('editCompanyError');
    const editStartYearError = document.getElementById('editStartYearError');
    const editEndYearError = document.getElementById('editEndYearError');

    let currentIndex = null;

    if (!window.experienceClickHandler) {
        window.experienceClickHandler = (e) => {
            const expItem = e.target.closest('.experience-item[data-index]');
            if (expItem) {
                const index = parseInt(expItem.getAttribute('data-index'));
                currentIndex = index;
                const exp = currentUser.experiences[index];

                if (expRole) expRole.value = exp.role || '';
                if (expCompany) expCompany.value = exp.company || '';
                if (expStartYear) expStartYear.value = exp.startYear || '';
                if (expEndYear) expEndYear.value = exp.endYear || '';
                if (expDescription) expDescription.value = exp.description || '';
            }
        };
        document.addEventListener('click', window.experienceClickHandler);
    }

    if (saveExperienceBtn) {
        saveExperienceBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (currentIndex === null) return;

            // Validation
            [editRoleError, editCompanyError, editStartYearError, editEndYearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [expRole, expCompany, expStartYear, expEndYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!expRole || !expRole.value.trim()) {
                if (editRoleError) {
                    editRoleError.textContent = "Required";
                    editRoleError.classList.remove('d-none');
                }
                if (expRole) expRole.classList.add('is-invalid');
                hasError = true;
            }

            if (!expCompany || !expCompany.value.trim()) {
                if (editCompanyError) {
                    editCompanyError.textContent = "Required";
                    editCompanyError.classList.remove('d-none');
                }
                if (expCompany) expCompany.classList.add('is-invalid');
                hasError = true;
            }

            if (!expStartYear || !expStartYear.value.trim()) {
                if (editStartYearError) {
                    editStartYearError.textContent = "Required";
                    editStartYearError.classList.remove('d-none');
                }
                if (expStartYear) expStartYear.classList.add('is-invalid');
                hasError = true;
            } else if (expStartYear && (Number(expStartYear.value) > currentYear || Number(expStartYear.value) < 1900)) {
                if (editStartYearError) {
                    editStartYearError.textContent = "Invalid";
                    editStartYearError.classList.remove('d-none');
                }
                expStartYear.classList.add('is-invalid');
                hasError = true;
            }

            if (!expEndYear || !expEndYear.value.trim()) {
                if (editEndYearError) {
                    editEndYearError.textContent = "Required";
                    editEndYearError.classList.remove('d-none');
                }
                if (expEndYear) expEndYear.classList.add('is-invalid');
                hasError = true;
            } else if (expEndYear && (Number(expEndYear.value) > currentYear || Number(expEndYear.value) < 1900 || (expStartYear && Number(expEndYear.value) < Number(expStartYear.value)))) {
                if (editEndYearError) {
                    editEndYearError.textContent = 'Invalid';
                    editEndYearError.classList.remove('d-none');
                }
                expEndYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const updatedExp = {
                role: expRole?.value || '',
                company: expCompany?.value || '',
                startYear: parseInt(expStartYear?.value) || null,
                endYear: parseInt(expEndYear?.value) || null,
                description: expDescription?.value || ''
            };

            await updateExperience(currentIndex, updatedExp);
        });
    }

    // Add Experience
    const addexpRole = document.getElementById('addexpRole');
    const addexpCompany = document.getElementById('addexpCompany');
    const addexpStartYear = document.getElementById('addexpStartYear');
    const addexpEndYear = document.getElementById('addexpEndYear');
    const addexpDescription = document.getElementById('addexpDescription');
    const saveExpBtn = document.getElementById('saveExpBtn');
    const roleError = document.getElementById('roleError');
    const companyError = document.getElementById('companyError');
    const startYearError = document.getElementById('startYearError');
    const endYearError = document.getElementById('endYearError');

    if (saveExpBtn) {
        saveExpBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validation
            [roleError, companyError, startYearError, endYearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [addexpRole, addexpCompany, addexpStartYear, addexpEndYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!addexpRole || !addexpRole.value.trim()) {
                if (roleError) {
                    roleError.textContent = "Required";
                    roleError.classList.remove('d-none');
                }
                if (addexpRole) addexpRole.classList.add('is-invalid');
                hasError = true;
            }

            if (!addexpCompany || !addexpCompany.value.trim()) {
                if (companyError) {
                    companyError.textContent = "Required";
                    companyError.classList.remove('d-none');
                }
                if (addexpCompany) addexpCompany.classList.add('is-invalid');
                hasError = true;
            }

            if (!addexpStartYear || !addexpStartYear.value.trim()) {
                if (startYearError) {
                    startYearError.textContent = "Required";
                    startYearError.classList.remove('d-none');
                }
                if (addexpStartYear) addexpStartYear.classList.add('is-invalid');
                hasError = true;
            } else if (addexpStartYear && (Number(addexpStartYear.value) > currentYear || Number(addexpStartYear.value) < 1900)) {
                if (startYearError) {
                    startYearError.textContent = "Invalid";
                    startYearError.classList.remove('d-none');
                }
                addexpStartYear.classList.add('is-invalid');
                hasError = true;
            }

            if (!addexpEndYear || !addexpEndYear.value.trim()) {
                if (endYearError) {
                    endYearError.textContent = "Required";
                    endYearError.classList.remove('d-none');
                }
                if (addexpEndYear) addexpEndYear.classList.add('is-invalid');
                hasError = true;
            } else if (addexpEndYear && (Number(addexpEndYear.value) > currentYear || Number(addexpEndYear.value) < 1900 || (addexpStartYear && Number(addexpEndYear.value) < Number(addexpStartYear.value)))) {
                if (endYearError) {
                    endYearError.textContent = 'Invalid';
                    endYearError.classList.remove('d-none');
                }
                addexpEndYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const newExp = {
                role: addexpRole?.value || '',
                company: addexpCompany?.value || '',
                startYear: parseInt(addexpStartYear?.value) || null,
                endYear: parseInt(addexpEndYear?.value) || null,
                description: addexpDescription?.value || ''
            };

            await addExperience(newExp);
        });
    }
}

// DELETE EXPERIENCE
function setupDeleteExperienceModal() {
    let currentIndex = null;

    document.addEventListener('click', e => {
        const item = e.target.closest('.experience-item[data-index]');
        if (item) {
            currentIndex = item.getAttribute('data-index');
        }
    });

    const confirmDeleteExperienceBtn = document.getElementById('confirmDeleteExperienceBtn');
    if (confirmDeleteExperienceBtn) {
        confirmDeleteExperienceBtn.addEventListener('click', async () => {
            if (currentIndex === null) return;

            try {
                const res = await fetch(`${API_BASE_URL}/edit/deleteExperience`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, index: parseInt(currentIndex) })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displayExperiences(currentUser.experiences || []);
                    bootstrap.Modal.getInstance(document.getElementById('confirmDeleteExperienceModal')).hide();
                } else {
                    alert('Failed to delete experience');
                }
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error deleting experience');
            }
        });
    }
}

// EDUCATION MODALS
function setupEducationModals(user) {
    const etudDegree = document.getElementById('etudDegree');
    const etudSchool = document.getElementById('etudSchool');
    const etudfieldOfStudy = document.getElementById('etudfieldOfStudy');
    const etudYear = document.getElementById('etudYear');
    const saveEducationBtn = document.getElementById('saveEducationBtn');
    const editSchoolError = document.getElementById('editSchoolError');
    const editFieldError = document.getElementById('editFieldError');
    const editDegreeError = document.getElementById('editDegreeError');
    const editYearError = document.getElementById('editYearError');

    let currentIndex = null;

    if (!window.educationClickHandler) {
        window.educationClickHandler = (e) => {
            const eduItem = e.target.closest('.education-item[data-index]');
            if (eduItem) {
                const index = parseInt(eduItem.getAttribute('data-index'));
                currentIndex = index;
                const edu = currentUser.education[index];

                if (etudDegree) etudDegree.value = edu.degree || '';
                if (etudSchool) etudSchool.value = edu.school || edu.establishment || '';
                if (etudfieldOfStudy) etudfieldOfStudy.value = edu.fieldOfStudy || edu.location || '';
                if (etudYear) etudYear.value = edu.endYear || edu.startYear || edu.year || '';
            }
        };
        document.addEventListener('click', window.educationClickHandler);
    }

    if (saveEducationBtn) {
        saveEducationBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (currentIndex === null) return;

            // Validation
            [editSchoolError, editFieldError, editDegreeError, editYearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [etudSchool, etudfieldOfStudy, etudDegree, etudYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!etudSchool || !etudSchool.value.trim()) {
                if (editSchoolError) {
                    editSchoolError.textContent = "School is required";
                    editSchoolError.classList.remove('d-none');
                }
                if (etudSchool) etudSchool.classList.add('is-invalid');
                hasError = true;
            }

            if (!etudfieldOfStudy || !etudfieldOfStudy.value.trim()) {
                if (editFieldError) {
                    editFieldError.textContent = "Field of study is required";
                    editFieldError.classList.remove('d-none');
                }
                if (etudfieldOfStudy) etudfieldOfStudy.classList.add('is-invalid');
                hasError = true;
            }

            if (!etudDegree || !etudDegree.value.trim()) {
                if (editDegreeError) {
                    editDegreeError.textContent = "Degree is required";
                    editDegreeError.classList.remove('d-none');
                }
                if (etudDegree) etudDegree.classList.add('is-invalid');
                hasError = true;
            }

            if (!etudYear || !etudYear.value.trim()) {
                if (editYearError) {
                    editYearError.textContent = "Year is required";
                    editYearError.classList.remove('d-none');
                }
                if (etudYear) etudYear.classList.add('is-invalid');
                hasError = true;
            } else if (etudYear && (Number(etudYear.value) > currentYear || Number(etudYear.value) < 1900)) {
                if (editYearError) {
                    editYearError.textContent = 'Invalid';
                    editYearError.classList.remove('d-none');
                }
                etudYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const updatedEdu = {
                school: etudSchool?.value || '',
                degree: etudDegree?.value || '',
                fieldOfStudy: etudfieldOfStudy?.value || '',
                endYear: parseInt(etudYear?.value) || null
            };

            await updateEducation(currentIndex, updatedEdu);
        });
    }
}

// ADD EDUCATION
function setupAddEducationModal() {
    const addetudSchool = document.getElementById('addetudSchool');
    const addetudfieldOfStudy = document.getElementById('addetudfieldOfStudy');
    const addetudDegree = document.getElementById('addetudDegree');
    const addetudYear = document.getElementById('addetudYear');
    const saveEtudBtn = document.getElementById('saveEtudBtn');
    const schoolError = document.getElementById('schoolError');
    const fieldError = document.getElementById('fieldError');
    const degreeError = document.getElementById('degreeError');
    const yearError = document.getElementById('yearError');

    if (saveEtudBtn) {
        saveEtudBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validation
            [schoolError, fieldError, degreeError, yearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [addetudSchool, addetudfieldOfStudy, addetudDegree, addetudYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!addetudSchool || !addetudSchool.value.trim()) {
                if (schoolError) {
                    schoolError.textContent = "School is required";
                    schoolError.classList.remove('d-none');
                }
                if (addetudSchool) addetudSchool.classList.add('is-invalid');
                hasError = true;
            }

            if (!addetudfieldOfStudy || !addetudfieldOfStudy.value.trim()) {
                if (fieldError) {
                    fieldError.textContent = "Field of study is required";
                    fieldError.classList.remove('d-none');
                }
                if (addetudfieldOfStudy) addetudfieldOfStudy.classList.add('is-invalid');
                hasError = true;
            }

            if (!addetudDegree || !addetudDegree.value.trim()) {
                if (degreeError) {
                    degreeError.textContent = "Degree is required";
                    degreeError.classList.remove('d-none');
                }
                if (addetudDegree) addetudDegree.classList.add('is-invalid');
                hasError = true;
            }

            if (!addetudYear || !addetudYear.value.trim()) {
                if (yearError) {
                    yearError.textContent = "Year is required";
                    yearError.classList.remove('d-none');
                }
                if (addetudYear) addetudYear.classList.add('is-invalid');
                hasError = true;
            } else if (addetudYear && (Number(addetudYear.value) > currentYear || Number(addetudYear.value) < 1900)) {
                if (yearError) {
                    yearError.textContent = 'Invalid';
                    yearError.classList.remove('d-none');
                }
                addetudYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const education = {
                school: addetudSchool?.value || '',
                fieldOfStudy: addetudfieldOfStudy?.value || '',
                degree: addetudDegree?.value || '',
                endYear: parseInt(addetudYear?.value) || null
            };

            await addEducation(education);
        });
    }
}

// DELETE EDUCATION
function setupDeleteEducationModal() {
    let currentIndex = null;

    document.addEventListener('click', e => {
        const trash = e.target.closest('.bi-trash');
        const item = e.target.closest('.education-item[data-index]');
        if (trash && item) {
            currentIndex = parseInt(item.getAttribute('data-index'));
        }
    });

    const deleteEducationBtn = document.getElementById('deleteEducationBtn');
    if (deleteEducationBtn) {
        deleteEducationBtn.addEventListener('click', async () => {
            if (currentIndex === null) return;

            try {
                const res = await fetch(`${API_BASE_URL}/edit/deleteEducation`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, index: currentIndex })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displayEducation(currentUser.education || []);
                    bootstrap.Modal.getInstance(document.getElementById('deleteEducationModal')).hide();
                } else {
                    alert('Failed to delete education');
                }
            } catch (err) {
                console.error('Error deleting education:', err);
                alert('Error deleting education');
            }
        });
    }
}

// ADD SKILL
function setupAddSkillModal(user) {
    const skillSelect = document.getElementById('skillSelect');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const skillError = document.getElementById('skillError');

    if (addSkillBtn && skillSelect) {
        addSkillBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const newSkill = skillSelect.value.trim();
            if (skillError) {
                skillError.classList.add('d-none');
                skillError.textContent = '';
            }

            if (!newSkill) {
                if (skillError) {
                    skillError.textContent = "Please select a skill";
                    skillError.classList.remove('d-none');
                }
                return;
            }

            if (user.skills && user.skills.includes(newSkill)) {
                if (skillError) {
                    skillError.textContent = "This skill already exists!";
                    skillError.classList.remove('d-none');
                }
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/edit/addSkill`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, skill: newSkill })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displaySkills(currentUser.skills || []);
                    bootstrap.Modal.getInstance(document.getElementById('addSkillModal')).hide();
                    if (skillSelect) skillSelect.value = '';
                } else {
                    if (skillError) {
                        skillError.textContent = "Failed to add skill";
                        skillError.classList.remove('d-none');
                    }
                }
            } catch (err) {
                console.error('Error adding skill:', err);
                if (skillError) {
                    skillError.textContent = "Failed to add skill";
                    skillError.classList.remove('d-none');
                }
            }
        });
    }
}

// DELETE SKILL
function setupDeleteSkillModal() {
    let currentIndex = null;

    document.addEventListener('click', e => {
        const trash = e.target.closest('.bi-trash');
        const item = e.target.closest('.skill-item[data-index]');
        if (trash && item) {
            currentIndex = parseInt(item.getAttribute('data-index'));
        }
    });

    const confirmDeleteSkillBtn = document.getElementById('confirmDeleteSkillBtn');
    if (confirmDeleteSkillBtn) {
        confirmDeleteSkillBtn.addEventListener('click', async () => {
            if (currentIndex === null) return;

            try {
                const res = await fetch(`${API_BASE_URL}/edit/deleteSkill`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, index: currentIndex })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displaySkills(currentUser.skills || []);
                    bootstrap.Modal.getInstance(document.getElementById('deleteSkillModal')).hide();
                } else {
                    alert('Failed to delete skill');
                }
            } catch (err) {
                console.error('Error deleting skill:', err);
                alert('Error deleting skill');
            }
        });
    }
}

// ADD CERTIFICATION
function setupAddCertificationModal() {
    const certTitle = document.getElementById('certTitle');
    const certCompany = document.getElementById('certCompany');
    const certYear = document.getElementById('certYear');
    const addCertificationBtn = document.getElementById('addCertificationBtn');
    const titleError = document.getElementById('titleError');
    const certCompanyError = document.getElementById('certCompanyError');
    const ceryYearError = document.getElementById('ceryYearError');

    if (addCertificationBtn) {
        addCertificationBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validation
            [titleError, certCompanyError, ceryYearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [certTitle, certCompany, certYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!certTitle || !certTitle.value.trim()) {
                if (titleError) {
                    titleError.textContent = "Required";
                    titleError.classList.remove('d-none');
                }
                if (certTitle) certTitle.classList.add('is-invalid');
                hasError = true;
            }

            if (!certCompany || !certCompany.value.trim()) {
                if (certCompanyError) {
                    certCompanyError.textContent = "Required";
                    certCompanyError.classList.remove('d-none');
                }
                if (certCompany) certCompany.classList.add('is-invalid');
                hasError = true;
            }

            if (!certYear || !certYear.value.trim()) {
                if (ceryYearError) {
                    ceryYearError.textContent = "Required";
                    ceryYearError.classList.remove('d-none');
                }
                if (certYear) certYear.classList.add('is-invalid');
                hasError = true;
            } else if (certYear && (Number(certYear.value) > currentYear || Number(certYear.value) < 1900)) {
                if (ceryYearError) {
                    ceryYearError.textContent = 'Invalid';
                    ceryYearError.classList.remove('d-none');
                }
                certYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const certification = {
                title: certTitle?.value || '',
                company: certCompany?.value || '',
                year: Number(certYear?.value) || null
            };

            try {
                const res = await fetch(`${API_BASE_URL}/edit/addCertification`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, certification })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displayCertifications(currentUser.certifications || []);
                    bootstrap.Modal.getInstance(document.getElementById('addCertificationModal')).hide();
                } else {
                    alert('Failed to add certification');
                }
            } catch (err) {
                console.error('Error adding certification:', err);
                alert('Error adding certification');
            }
        });
    }
}

// EDIT CERTIFICATION
function setupCertificationModals(user) {
    const editTitle = document.getElementById('editTitle');
    const editCompany = document.getElementById('editCompany');
    const editYear = document.getElementById('editYear');
    const editCertificationBtn = document.getElementById('editCertificationBtn');
    const editTitleError = document.getElementById('editTitleError');
    const editCertCompanyError = document.getElementById('editCertCompanyError');
    const editCertYearError = document.getElementById('editCertYearError');

    let currentIndex = null;

    if (!window.certificationClickHandler) {
        window.certificationClickHandler = (e) => {
            const certItem = e.target.closest('.certification-item[data-index]');
            if (certItem) {
                const index = parseInt(certItem.getAttribute('data-index'));
                currentIndex = index;
                const c = currentUser.certifications[index];

                if (editTitle) editTitle.value = c.title || '';
                if (editCompany) editCompany.value = c.company || '';
                if (editYear) editYear.value = c.year || '';
            }
        };
        document.addEventListener('click', window.certificationClickHandler);
    }

    if (editCertificationBtn) {
        editCertificationBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (currentIndex === null) return;

            // Validation
            [editTitleError, editCertCompanyError, editCertYearError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [editTitle, editCompany, editYear].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!editTitle || !editTitle.value.trim()) {
                if (editTitleError) {
                    editTitleError.textContent = "Required";
                    editTitleError.classList.remove('d-none');
                }
                if (editTitle) editTitle.classList.add('is-invalid');
                hasError = true;
            }

            if (!editCompany || !editCompany.value.trim()) {
                if (editCertCompanyError) {
                    editCertCompanyError.textContent = "Required";
                    editCertCompanyError.classList.remove('d-none');
                }
                if (editCompany) editCompany.classList.add('is-invalid');
                hasError = true;
            }

            if (!editYear || !editYear.value.trim()) {
                if (editCertYearError) {
                    editCertYearError.textContent = "Required";
                    editCertYearError.classList.remove('d-none');
                }
                if (editYear) editYear.classList.add('is-invalid');
                hasError = true;
            } else if (editYear && (Number(editYear.value) > currentYear || Number(editYear.value) < 1900)) {
                if (editCertYearError) {
                    editCertYearError.textContent = 'Invalid';
                    editCertYearError.classList.remove('d-none');
                }
                editYear.classList.add('is-invalid');
                hasError = true;
            }

            if (hasError) return;

            const certification = {
                title: editTitle?.value || '',
                company: editCompany?.value || '',
                year: Number(editYear?.value) || null
            };

            try {
                const res = await fetch(`${API_BASE_URL}/edit/editCertification`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, index: currentIndex, certification })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displayCertifications(currentUser.certifications || []);
                    bootstrap.Modal.getInstance(document.getElementById('editCertificationModal')).hide();
                } else {
                    alert('Failed to update certification');
                }
            } catch (err) {
                console.error('Error updating certification:', err);
                alert('Error updating certification');
            }
        });
    }
}

// DELETE CERTIFICATION
function setupDeleteCertificationModal() {
    let currentIndex = null;

    document.addEventListener('click', e => {
        const trash = e.target.closest('.bi-trash');
        const item = e.target.closest('.certification-item[data-index]');
        if (trash && item) {
            currentIndex = parseInt(item.getAttribute('data-index'));
        }
    });

    const confirmDeleteCertificationBtn = document.getElementById('confirmDeleteCertificationBtn');
    if (confirmDeleteCertificationBtn) {
        confirmDeleteCertificationBtn.addEventListener('click', async () => {
            if (currentIndex === null) return;

            try {
                const res = await fetch(`${API_BASE_URL}/edit/deleteCertification`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, index: currentIndex })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.user) {
                        const updatedUser = data.user;
                        delete updatedUser.password;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        currentUser = updatedUser;
                    }
                    displayCertifications(currentUser.certifications || []);
                    bootstrap.Modal.getInstance(document.getElementById('deleteCertificationModal')).hide();
                } else {
                    alert('Failed to delete certification');
                }
            } catch (err) {
                console.error('Error deleting certification:', err);
                alert('Error deleting certification');
            }
        });
    }
}

// API Functions
async function updateProfilePhoto(file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('email', currentUser.email);

    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/profile-photo`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        if (data.success && data.user) {
            const updatedUser = data.user;
            delete updatedUser.password;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            currentUser = updatedUser;
            
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editPhotoModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
            
            const profileImg = document.querySelector('.profile-img');
            if (profileImg && updatedUser.profileImagePath) {
                profileImg.src = updatedUser.profileImagePath;
            }
        } else {
            alert('Failed to update profile photo: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating profile photo:', error);
        alert('Network error. Please try again.');
    }
}

async function updateCoverPhoto(file) {
    const formData = new FormData();
    formData.append('coverImage', file);
    formData.append('email', currentUser.email);

    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/cover-photo`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        if (data.success && data.user) {
            const updatedUser = data.user;
            delete updatedUser.password;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            currentUser = updatedUser;
            
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editCoverModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
            
            const coverImg = document.querySelector('.image-background');
            if (coverImg && updatedUser.coverImagePath) {
                coverImg.src = updatedUser.coverImagePath;
            }
        } else {
            alert('Failed to update cover photo: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating cover photo:', error);
        alert('Network error. Please try again.');
    }
}

async function updateDescription(newDescription) {
    try {
        const response = await fetch(`${API_BASE_URL}/edit/editInfos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: currentUser.email,
                newDescription: newDescription 
            })
        });

        const data = await response.json();
        if (data.success) {
            currentUser.description = newDescription;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            const infos = document.getElementById('infos');
            if (infos) {
                infos.textContent = newDescription;
            }
            
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editInfosModal'));
            if (modalInstance) {
                modalInstance.hide();
            }
        } else {
            alert('Failed to update description: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating description:', error);
        alert('Network error. Please try again.');
    }
}

async function updateExperience(index, experience) {
    try {
        const response = await fetch(`${API_BASE_URL}/edit/editExperience`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                index: index, 
                experience: experience 
            })
        });

        const data = await response.json();
        if (data.success) {
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            displayExperiences(currentUser.experiences || []);
            bootstrap.Modal.getInstance(document.getElementById('editExperienceModal')).hide();
        } else {
            alert('Failed to update experience: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating experience:', error);
        alert('Network error. Please try again.');
    }
}

async function addExperience(experience) {
    try {
        const response = await fetch(`${API_BASE_URL}/edit/addExperience`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                experience: experience 
            })
        });

        const data = await response.json();
        if (data.success) {
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            displayExperiences(currentUser.experiences || []);
            bootstrap.Modal.getInstance(document.getElementById('experienceModal')).hide();
        } else {
            alert('Failed to add experience: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding experience:', error);
        alert('Network error. Please try again.');
    }
}

async function addEducation(education) {
    try {
        const response = await fetch(`${API_BASE_URL}/edit/addEducation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                education: education 
            })
        });

        const data = await response.json();
        if (data.success) {
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            displayEducation(currentUser.education || []);
            bootstrap.Modal.getInstance(document.getElementById('addEductionModal')).hide();
        } else {
            alert('Failed to add education: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding education:', error);
        alert('Network error. Please try again.');
    }
}

async function updateEducation(index, education) {
    try {
        const response = await fetch(`${API_BASE_URL}/edit/editEducation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUser.email,
                index: index, 
                education: education 
            })
        });

        const data = await response.json();
        if (data.success) {
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            displayEducation(currentUser.education || []);
            bootstrap.Modal.getInstance(document.getElementById('editEducationModal')).hide();
        } else {
            alert('Failed to update education: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating education:', error);
        alert('Network error. Please try again.');
    }
}


// Get elements
const uploadBtn = document.getElementById('uploadVideoBtn');
const videoInput = document.getElementById('cvVideoInput');
const previewContainer = document.getElementById('videoPreviewContainer');

// When button clicked, open file selector
uploadBtn.addEventListener('click', () => {
    videoInput.click();
});

// When user selects a video
videoInput.addEventListener('change', () => {
    const file = videoInput.files[0];
    if (!file) return;

    // Clear previous preview
    previewContainer.innerHTML = '';

    // Create video element
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.width = 300; // adjust size
    video.height = 200;

    previewContainer.appendChild(video);
});
