const API_BASE_URL = 'http://localhost:3000';

let searchResults = {
    profiles: [],
    jobs: [],
    companies: []
};


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
   
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        searchInput.value = query;
        performSearch(query);
    }
});

async function performSearch(query) {
    try {
        const newUrl = `/search?q=${encodeURIComponent(query)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

       
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        
        if (data.success) {
            searchResults = {
                profiles: data.profiles || [],
                jobs: data.jobs || [],
                companies: data.companies || []
            };
            
            displayResults();
        } else {
            showError('Search failed. Please try again.');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('An error occurred while searching. Please try again.');
    }
}

function displayResults() {
    
    document.getElementById('all-count').textContent = 
        searchResults.profiles.length + searchResults.jobs.length + searchResults.companies.length;
    document.getElementById('profiles-count').textContent = searchResults.profiles.length;
    document.getElementById('jobs-count').textContent = searchResults.jobs.length;
    document.getElementById('companies-count').textContent = searchResults.companies.length;

    // Display results
    displayAllResults();
    displayProfiles();
    displayJobs();
    displayCompanies();
}

function displayAllResults() {
    const container = document.getElementById('all-results');
    
    if (searchResults.profiles.length === 0 && 
        searchResults.jobs.length === 0 && 
        searchResults.companies.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No results found. Try a different search term.</div>';
        return;
    }

    let html = '';

    // Profiles
    if (searchResults.profiles.length > 0) {
        html += '<h5 class="mb-3">People</h5>';
        html += searchResults.profiles.slice(0, 3).map(profile => createProfileCard(profile)).join('');
        if (searchResults.profiles.length > 3) {
            html += `<a href="#profiles" class="btn btn-link" data-bs-toggle="tab" data-bs-target="#profiles">See all ${searchResults.profiles.length} people</a>`;
        }
        html += '<hr class="my-4">';
    }

    // Jobs 
    if (searchResults.jobs.length > 0) {
        html += '<h5 class="mb-3">Jobs</h5>';
        html += searchResults.jobs.slice(0, 3).map(job => createJobCard(job)).join('');
        if (searchResults.jobs.length > 3) {
            html += `<a href="#jobs" class="btn btn-link" data-bs-toggle="tab" data-bs-target="#jobs">See all ${searchResults.jobs.length} jobs</a>`;
        }
        html += '<hr class="my-4">';
    }

    // Companies 
    if (searchResults.companies.length > 0) {
        html += '<h5 class="mb-3">Companies</h5>';
        html += searchResults.companies.slice(0, 3).map(company => createCompanyCard(company)).join('');
        if (searchResults.companies.length > 3) {
            html += `<a href="#companies" class="btn btn-link" data-bs-toggle="tab" data-bs-target="#companies">See all ${searchResults.companies.length} companies</a>`;
        }
    }

    container.innerHTML = html;
}

function displayProfiles() {
    const container = document.getElementById('profiles-results');
    
    if (searchResults.profiles.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No people found.</div>';
        return;
    }

    container.innerHTML = searchResults.profiles.map(profile => createProfileCard(profile)).join('');
}

function displayJobs() {
    const container = document.getElementById('jobs-results');
    
    if (searchResults.jobs.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No jobs found.</div>';
        return;
    }

    container.innerHTML = searchResults.jobs.map(job => createJobCard(job)).join('');
}

function displayCompanies() {
    const container = document.getElementById('companies-results');
    
    if (searchResults.companies.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No companies found.</div>';
        return;
    }

    container.innerHTML = searchResults.companies.map(company => createCompanyCard(company)).join('');
}

function createProfileCard(profile) {
    const imagePath = profile.profileImagePath || '/images/profile.png';
    return `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <img src="${imagePath}" 
                         alt="${profile.fullName}" 
                         class="rounded-circle me-3" 
                         style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--sage-green);"
                         onerror="this.src='/images/profile.png'">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            <a href="/profile/${profile._id}" class="text-decoration-none" style="color: var(--hunter-green); font-weight: 600;">
                                ${profile.fullName}
                            </a>
                        </h6>
                        ${profile.description ? `<p class="text-muted small mb-1">${profile.description}</p>` : ''}
                        ${profile.location ? `<p class="text-muted small mb-0"><i class="bi bi-geo-alt"></i> ${profile.location}</p>` : ''}
                        ${profile.skills && profile.skills.length > 0 ? 
                            `<div class="mt-2">
                                ${profile.skills.slice(0, 3).map(skill => `<span class="badge me-1" style="background-color: var(--sage-green); color: white;">${skill}</span>`).join('')}
                            </div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createJobCard(job) {
    return `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <h6 class="mb-2">
                    <a href="/jobs/${job._id}" class="text-decoration-none" style="color: var(--hunter-green); font-weight: 600;">
                        ${job.title}
                    </a>
                </h6>
                <p class="text-muted mb-2">
                    <i class="bi bi-building" style="color: var(--sage-green);"></i> ${job.companyName}
                    ${job.location ? ` • <i class="bi bi-geo-alt" style="color: var(--sage-green);"></i> ${job.location}` : ''}
                </p>
                <span class="badge me-2" style="background-color: var(--hunter-green); color: white;">${job.employmentType}</span>
                ${job.description ? `<p class="text-muted small mt-2">${job.description}</p>` : ''}
            </div>
        </div>
    `;
}

function createCompanyCard(company) {
    const logoPath = company.logo || '/images/default-c.png';
    return `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <img src="${logoPath}" 
                         alt="${company.name}" 
                         class="rounded-circle me-3" 
                         style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--sage-green);"
                         onerror="this.src='/images/default-c.png'">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">
                            <a href="/company/${company._id}" class="text-decoration-none" style="color: var(--hunter-green); font-weight: 600;">
                                ${company.name}
                            </a>
                        </h6>
                        ${company.industry ? `<p class="text-muted small mb-1">${company.industry}</p>` : ''}
                        ${company.location ? `<p class="text-muted small mb-1"><i class="bi bi-geo-alt" style="color: var(--sage-green);"></i> ${company.location}</p>` : ''}
                        ${company.description ? `<p class="text-muted small mb-0">${company.description}</p>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showLoading() {
    const containers = ['all-results', 'profiles-results', 'jobs-results', 'companies-results'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
    });
}

function showError(message) {
    const container = document.getElementById('all-results');
    if (container) {
        container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
}
