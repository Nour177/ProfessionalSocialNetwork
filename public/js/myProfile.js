console.log(
  "AUTH:",
  localStorage.getItem("isAuthenticated"),
  "USER:",
  localStorage.getItem("user")
);

const API_BASE_URL = 'http://localhost:5000';

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
            ? user.experiences[0].role || user.email 
            : user.email;
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
    addDiv.className = "experience-item d-flex align-items-center p-3 mb-3 experience-add";
    addDiv.innerHTML = `
    <i class="bi bi-plus-square icon-small"></i>
    <h6 class="mb-0 text-secondary">Add Experience</h6>
  `;
    addDiv.setAttribute("role", "button");
    addDiv.setAttribute("data-bs-toggle", "modal");
    addDiv.setAttribute("data-bs-target", "#experienceModal");
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
                <img src="${ed.logo || '../images/default-school.png'}" alt="School Logo" onerror="this.src='../images/default-school.png'">
      <div>
                    <h6 class="mb-0">${ed.degree || 'No degree'}</h6>
                    <small class="text-muted">${ed.school || ed.establishment || ''} ${ed.fieldOfStudy ? '• ' + ed.fieldOfStudy : ''}</small>
                    ${ed.startYear || ed.endYear ? `
                        <p class="mb-0"><small class="text-muted">${ed.startYear || ''}${ed.startYear && ed.endYear ? '-' : ''}${ed.endYear || ''}</small></p>
                    ` : ''}
      </div>
    </div>
    <a data-bs-toggle="modal" data-bs-target="#editEducationModal" class="ms-2">
      <i class="bi bi-pencil icon-small"></i>
    </a>
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
        div.setAttribute("data-skill-index", index);

      div.innerHTML = `
            <h6 class="mb-0">${skill}</h6>
            <a data-bs-toggle="modal" data-bs-target="#deleteSkillModal" class="ms-2">
      <i class="bi bi-trash icon-small"></i>
    </a>
  `;
      skillContainer.appendChild(div);
    });
}

// Afficher les certifs
function displayCertifications(certifications) {
    const certificationContainer = document.getElementById("certification");
    if (!certificationContainer) return;

    const existingContent = certificationContainer.querySelector('.card-title');
    if (existingContent) {
        const itemsToRemove = certificationContainer.querySelectorAll('.skill-item');
        itemsToRemove.forEach(item => item.remove());
    }

    certifications.forEach((cert, index) => {
      const div = document.createElement("div");
      div.className = "skill-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";
        div.setAttribute("data-cert-index", index);

      div.innerHTML = `
    <div class="card-icons d-flex gap-4">
      <div>
                    <h6 class="mb-0">${cert.title || 'No title'}</h6>
                    <small>${cert.company || ''}</small>
                    ${cert.year ? `<small class="text-muted">${cert.year}</small>` : ''}
      </div>
    </div>
    <a data-bs-toggle="modal" data-bs-target="#deletecertificationModal" class="ms-2">
      <i class="bi bi-trash icon-small"></i>
    </a>
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
            // Comparer avec et sans espaces pour plus de flexibilité
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
    const editPhotoModal = document.getElementById('editPhotoModal');

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
            e.preventDefault(); // Empêcher tout comportement par défaut
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
    const editCoverModal = document.getElementById('editCoverModal');

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

    // Edit Experience Modal
    setupExperienceModals(user);

    // Add/Edit Education Modals
    setupEducationModals(user);
}

function setupExperienceModals(user) {
    const editExperienceModal = document.getElementById('editExperienceModal');
    const editExperienceForm = document.getElementById('editExperienceForm');
    const expRole = document.getElementById('expRole');
    const expCompany = document.getElementById('expCompany');
    const expStartYear = document.getElementById('expStartYear');
    const expEndYear = document.getElementById('expEndYear');
    const expDescription = document.getElementById('expDescription');
    const saveExperienceBtn = document.getElementById('saveExperienceBtn');

    if (editExperienceForm) {
        editExperienceForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    let currentExpIndex = null;


    if (!window.experienceClickHandler) {
        window.experienceClickHandler = (e) => {
            const expItem = e.target.closest('.experience-item[data-index]');
            if (expItem && editExperienceModal) {
                const index = parseInt(expItem.getAttribute('data-index'));
                currentExpIndex = index;
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
            if (currentExpIndex === null) return;

      const updatedExp = {
                role: expRole?.value || '',
                company: expCompany?.value || '',
                startYear: parseInt(expStartYear?.value) || null,
                endYear: parseInt(expEndYear?.value) || null,
                description: expDescription?.value || ''
            };

            await updateExperience(currentExpIndex, updatedExp);
        });
    }

    const addExperienceForm = document.getElementById('addExperienceForm') || document.querySelector('#experienceModal form');
    const addexpRole = document.getElementById('addexpRole');
    const addexpCompany = document.getElementById('addexpCompany');
    const addexpStartYear = document.getElementById('addexpStartYear');
    const addexpEndYear = document.getElementById('addexpEndYear');
    const addexpDescription = document.getElementById('addexpDescription');
    const saveExpBtn = document.getElementById('saveExpBtn');

    if (addExperienceForm) {
        addExperienceForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    if (saveExpBtn) {
        saveExpBtn.addEventListener('click', async (e) => {
            e.preventDefault();
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

function setupEducationModals(user) {
    // Add Education Modal
    const addEducationForm = document.getElementById('addEducationForm') || document.querySelector('#addEductionModal form');
    const addetudEstablishment = document.getElementById('addetudEstablishment');
    const addetudLocation = document.getElementById('addetudLocation');
    const addetudDegree = document.getElementById('addetudDegree');
    const addetudYear = document.getElementById('addetudYear');
    const saveEtudBtn = document.getElementById('saveEtudBtn');

    if (addEducationForm) {
        addEducationForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    if (saveEtudBtn) {
        saveEtudBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const newEdu = {
                school: addetudEstablishment?.value || '',
                degree: addetudDegree?.value || '',
                fieldOfStudy: addetudLocation?.value || '',
                startYear: parseInt(addetudYear?.value) || null,
                endYear: null
            };

            await addEducation(newEdu);
        });
    }

    
    const editEducationModal = document.getElementById('editEducationModal');
    const editEducationForm = document.getElementById('editEducationForm') || document.querySelector('#editEducationModal form');
    const etudDegree = document.getElementById('etudDegree');
    const etudEstablishment = document.getElementById('etudEstablishment');
    const etudLocation = document.getElementById('etudLocation');
    const etudYear = document.getElementById('etudYear');
    const saveEducationBtn = document.getElementById('saveEducationBtn');


    if (editEducationForm) {
        editEducationForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    let currentEduIndex = null;

    if (!window.educationClickHandler) {
        window.educationClickHandler = (e) => {
            const eduItem = e.target.closest('.education-item[data-index]');
            if (eduItem && editEducationModal) {
                const index = parseInt(eduItem.getAttribute('data-index'));
                currentEduIndex = index;
                const edu = currentUser.education[index];

                if (etudDegree) etudDegree.value = edu.degree || '';
                if (etudEstablishment) etudEstablishment.value = edu.school || edu.establishment || '';
                if (etudLocation) etudLocation.value = edu.fieldOfStudy || edu.location || '';
                if (etudYear) etudYear.value = edu.startYear || edu.year || '';
            }
        };
        document.addEventListener('click', window.educationClickHandler);
    }

    if (saveEducationBtn) {
        saveEducationBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            if (currentEduIndex === null) return;

            const updatedEdu = {
                school: etudEstablishment?.value || '',
                degree: etudDegree?.value || '',
                fieldOfStudy: etudLocation?.value || '',
                startYear: parseInt(etudYear?.value) || null,
                endYear: null
            };

            await updateEducation(currentEduIndex, updatedEdu);
        });
    }
}

// Fonctions API pour mettre à jour le profil

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
            
            // Mettre à jour l'image dans le DOM au lieu de recharger la page
            const profileImg = document.querySelector('.profile-img');
            if (profileImg && updatedUser.profileImagePath) {
                profileImg.src = updatedUser.profileImagePath;
            }
            
            // Mettre à jour le localStorage seulement (ne pas recharger tout le profil)
            // Cela évite de réinitialiser les event listeners
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
            modalInstance.hide();
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
            // Mettre à jour les données utilisateur et recharger l'affichage
            if (data.user) {
                const updatedUser = data.user;
                delete updatedUser.password;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                currentUser = updatedUser;
            }
            displayExperiences(currentUser.experiences || []);
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
        } else {
            alert('Failed to update education: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating education:', error);
        alert('Network error. Please try again.');
    }
}
