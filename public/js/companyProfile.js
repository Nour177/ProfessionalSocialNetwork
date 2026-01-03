const API_BASE_URL = 'http://localhost:3000';

// App state
let currentAdmin = null;
let currentCompany = null;
let companyEventListenersSetup = false;

// Init
document.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/pages/login.html';
        return;
    }
    initializeApp();
});

// Initialize app
async function initializeApp() {
    try {
        const adminData = JSON.parse(localStorage.getItem('user'));
        if (!adminData) return window.location.href = '/pages/login.html';

        currentAdmin = adminData;

        // Fetch company data for this admin
        const res = await fetch(`${API_BASE_URL}/api/companies/admin/${adminData._id}`);
        if (!res.ok) throw new Error('Failed to fetch company');

        const companyData = await res.json();
        currentCompany = companyData;
        localStorage.setItem('company', JSON.stringify(companyData));

        // Display company info
        displayCompanyProfile(currentCompany);

        // Load posts and jobs
        await loadCompanyPosts(currentCompany);
        await loadCompanyJobs(currentCompany);

        // Setup event listeners once
        setupCompanyEventListeners(currentCompany);

    } catch (err) {
        console.error('Error initializing app:', err);
        window.location.href = '/pages/login.html';
    }
}

/* ==========================
   DISPLAY COMPANY INFO
========================== */
function displayCompanyProfile(company) {
    if (!company) return;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '';
    };

    setText('companyName', company.name || 'Company Name');
    setText('companyIndustry', company.industry || 'Industry');
    setText('companyLocation', company.location || 'Location');
    setText('companySize', company.organizationSize || '');
    setText('companyDescription', company.description || 'No description available.');
    
    const website = document.getElementById('companyWebsite');
    if (website && company.website) {
        website.href = company.website;
        website.textContent = company.website;
    }

    const logoImg = document.querySelector('.profile-img');
    if (logoImg && company.logo) logoImg.src = company.logo;

    const coverImg = document.querySelector('.image-background');
    if (coverImg && company.coverImagePath) coverImg.src = company.coverImagePath;
}

/* ==========================
   POSTS
========================== */
async function loadCompanyPosts(company) {
    const container = document.getElementById("posts");
    if (container) container.innerHTML = '<p class="text-center text-muted"><i class="bi bi-hourglass-split"></i> Loading posts...</p>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        let allPosts = Array.isArray(data) ? data : (data.posts || []);
        const companyPosts = allPosts.filter(post => post.author?.trim() === company.name?.trim());

        displayCompanyPosts(companyPosts, company);
    } catch (err) {
        console.error('Error loading posts:', err);
        if (container) container.innerHTML = `<div class="alert alert-warning">Unable to load posts. <small>${err.message}</small></div>`;
    }
}

function displayCompanyPosts(posts, company) {
    const container = document.getElementById("posts");
    if (!container) return;

    container.innerHTML = '';
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4"><i class="bi bi-inbox"></i> No posts yet. Start sharing updates!</p>';
        return;
    }

    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    sortedPosts.forEach(post => {
        try {
            const div = document.createElement("div");
            div.className = "post-item mb-3 p-3";
            div.style = "background:#f8f9fa; border-radius:12px;";

            const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';
            let contentHTML = `<p>${escapeHtml(post.content || '')}</p>`;

            if (post.postType === 'image' && post.image) {
                contentHTML = `${post.content ? `<p>${escapeHtml(post.content)}</p>` : ''}<img src="${post.image}" class="img-fluid rounded mb-2" style="max-height:400px;object-fit:cover;" onerror="this.style.display='none'">`;
            } else if (post.postType === 'video' && post.video) {
                contentHTML = `${post.content ? `<p>${escapeHtml(post.content)}</p>` : ''}<div class="ratio ratio-16x9 mb-2"><iframe src="${post.video}" frameborder="0" allowfullscreen></iframe></div>`;
            }

            const avatar = post.authorAvatar || company.logo || '../images/company.png';
            div.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <img src="${avatar}" alt="Company" style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:10px;" onerror="this.src='../images/company.png'">
                    <div>
                        <strong>${escapeHtml(post.author || company.name)}</strong><br>
                        <small class="text-muted">${postDate}</small>
                    </div>
                </div>
                ${contentHTML}
                <div class="d-flex justify-content-start gap-3 text-muted mt-2" style="font-size:14px;">
                    <span><i class="bi bi-hand-thumbs-up"></i> ${post.likes?.length || 0} Like${post.likes?.length !== 1 ? 's' : ''}</span>
                    <span><i class="bi bi-chat"></i> ${post.comments?.length || 0} Comment${post.comments?.length !== 1 ? 's' : ''}</span>
                </div>
            `;
            container.appendChild(div);
        } catch (err) {
            console.error('Error displaying post:', err, post);
        }
    });
}

/* ==========================
   JOBS
========================== */
async function loadCompanyJobs(company) {
    const container = document.getElementById("jobs");
    if (container) container.innerHTML = '<p class="text-center text-muted"><i class="bi bi-hourglass-split"></i> Loading jobs...</p>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/jobs`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        let allJobs = Array.isArray(data) ? data : (data.jobs || []);
        const companyJobs = allJobs.filter(job => job.author?.trim() === company.name?.trim());

        displayCompanyJobs(companyJobs, company);
    } catch (err) {
        console.error('Error loading jobs:', err);
        if (container) container.innerHTML = `<div class="alert alert-warning">Unable to load jobs. <small>${err.message}</small></div>`;
    }
}

function displayCompanyJobs(jobs, company) {
    const container = document.getElementById("jobs");
    if (!container) return;

    container.innerHTML = '';
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4"><i class="bi bi-inbox"></i> No job postings yet.</p>';
        return;
    }

    const sortedJobs = [...jobs].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    sortedJobs.forEach(job => {
        const div = document.createElement("div");
        div.className = "job-item mb-3 p-3";
        div.style = "background:#f8f9fa; border-radius:12px;";

        const jobDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : 'Recently';

        div.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <img src="${company.logo || '../images/company.png'}" alt="Company" style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:10px;" onerror="this.src='../images/company.png'">
                <div>
                    <strong>${escapeHtml(job.title || 'Job')}</strong><br>
                    <small class="text-muted">${jobDate} • ${escapeHtml(company.name)}</small>
                </div>
            </div>
            <p>${escapeHtml(job.description || '')}</p>
            ${job.location ? `<p class="small text-muted"><i class="bi bi-geo-alt"></i> ${escapeHtml(job.location)}</p>` : ''}
            ${job.salary ? `<p class="small text-muted"><i class="bi bi-cash"></i> ${escapeHtml(job.salary)}</p>` : ''}
            ${job.employmentType ? `<p class="small text-muted"><i class="bi bi-briefcase"></i> ${escapeHtml(job.employmentType)}</p>` : ''}
            ${job.applyLink ? `<a href="${job.applyLink}" target="_blank" class="btn btn-sm btn-primary mt-2">Apply Now</a>` : ''}
        `;
        container.appendChild(div);
    });
}

/* ==========================
   EVENT LISTENERS
========================== */
function setupCompanyEventListeners(company) {
    if (companyEventListenersSetup) return;
    companyEventListenersSetup = true;

    // Logo
    const logoInput = document.getElementById('companyLogoInput');
    const logoPreview = document.getElementById('companyLogoPreview');
    const saveLogoBtn = document.getElementById('saveLogoBtn');
    if (logoInput && logoPreview && saveLogoBtn) {
        if (company.logo) logoPreview.src = company.logo;
        logoInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => (logoPreview.src = ev.target.result);
                reader.readAsDataURL(file);
                saveLogoBtn.disabled = false;
            }
        });
        saveLogoBtn.addEventListener('click', async e => {
            e.preventDefault();
            const file = logoInput.files[0];
            if (file) await updateCompanyLogo(file);
        });
    }

    // Cover
    const coverInput = document.getElementById('companyCoverInput');
    const coverPreview = document.getElementById('companyCoverPreview');
    const saveCoverBtn = document.getElementById('saveCoverBtn');
    if (coverInput && coverPreview && saveCoverBtn) {
        if (company.coverImagePath) coverPreview.src = company.coverImagePath;
        coverInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => (coverPreview.src = ev.target.result);
                reader.readAsDataURL(file);
                saveCoverBtn.disabled = false;
            }
        });
        saveCoverBtn.addEventListener('click', async e => {
            e.preventDefault();
            const file = coverInput.files[0];
            if (file) await updateCompanyCover(file);
        });
    }

    // Description
    const descriptionTextarea = document.getElementById('companyDescriptionTextarea');
    const saveDescriptionBtn = document.getElementById('saveCompanyDescriptionBtn');
    const descriptionDisplay = document.getElementById('companyDescription');
    if (descriptionTextarea && saveDescriptionBtn && descriptionDisplay) {
        saveDescriptionBtn.addEventListener('click', async e => {
            e.preventDefault();
            const newDescription = descriptionTextarea.value;
            await updateCompanyDescription(newDescription);
        });
    }

    // Logout
    const logoutBtn = document.getElementById('companyLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', e => { e.preventDefault(); handleLogout(); });
}

/* ==========================
   HELPER API FUNCTIONS
========================== */
async function updateCompanyLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('companyId', currentCompany._id);

    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/logo`, { method:'PUT', body: formData });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.getElementById('companyLogoPreview').src = currentCompany.logo;
            bootstrap.Modal.getInstance(document.getElementById('editCompanyLogoModal'))?.hide();
        } else alert(data.message || 'Failed to update logo');
    } catch(err) { console.error(err); alert('Network error while updating logo'); }
}

async function updateCompanyCover(file) {
    const formData = new FormData();
    formData.append('cover', file);
    formData.append('companyId', currentCompany._id);

    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/cover`, { method:'PUT', body: formData });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.getElementById('companyCoverPreview').src = currentCompany.coverImagePath;
            bootstrap.Modal.getInstance(document.getElementById('editCompanyCoverModal'))?.hide();
        } else alert(data.message || 'Failed to update cover');
    } catch(err) { console.error(err); alert('Network error while updating cover'); }
}

async function updateCompanyDescription(newDescription) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/description`, {
            method:'PUT',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({ companyId: currentCompany._id, description: newDescription })
        });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.getElementById('companyDescriptionDisplay').textContent = newDescription;
            bootstrap.Modal.getInstance(document.getElementById('editCompanyDescriptionModal'))?.hide();
        } else alert(data.message || 'Failed to update description');
    } catch(err) { console.error(err); alert('Network error while updating description'); }
}

/* ==========================
   UTILS
========================== */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
