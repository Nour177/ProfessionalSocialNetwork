const API_BASE_URL = 'http://localhost:3000';

// App state
let currentCompany = null;
let companyEventListenersSetup = false;

// Init
document.addEventListener('DOMContentLoaded', () => {
    
    initializeApp();
});

// Initialize app
async function initializeApp() {
    await loadCompanyProfile();
}

// Charger le profil de la company
async function loadCompanyProfile() {
    // Check if there's a companyId in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('companyId');
    
    if (companyId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch company');
            }
            
            const companyData = await response.json();
            currentCompany = companyData;
            localStorage.setItem('company', JSON.stringify(companyData));
            
            displayCompanyProfile(currentCompany);
            displayDetails(currentCompany);
            displayCompanyVideo(currentCompany);
        } catch (error) {
            console.error('Error loading company:', error);
            // Fallback to localStorage
            const companyData = JSON.parse(localStorage.getItem('company') || '{}');
            if (companyData && companyData._id) {
                currentCompany = companyData;
                displayCompanyProfile(currentCompany);
                displayDetails(currentCompany);
                displayCompanyVideo(currentCompany);
            }
        }
    } else {
        const companyData = JSON.parse(localStorage.getItem('company') || '{}');
        if (companyData && companyData._id) {
            currentCompany = companyData;
            displayCompanyProfile(currentCompany);
            displayDetails(currentCompany);
            displayCompanyVideo(currentCompany);
        }
    }
}

function displayCompanyVideo(company) {
    const companyVideo = document.querySelector('.profile-video');
    if (companyVideo) {
        if (company && company.video) {
            let videoPath = company.video;
            if (videoPath && !videoPath.startsWith('/') && !videoPath.startsWith('http') && !videoPath.startsWith('../')) {
                videoPath = '/' + videoPath;
            }
            companyVideo.src = videoPath;
            companyVideo.style.display = 'block';
        } else {
            companyVideo.src = '';
            companyVideo.style.display = 'none';
        }
    }
}

// display company profile

function displayCompanyProfile(company) {
    if (!company) return;

    const companyName = document.getElementById('companyName');
    if (companyName) {
        companyName.textContent = `${company.name || ''} `.trim();
    }

    const companyIndustry = document.getElementById('companyIndustry');
    if (companyIndustry) {
        companyIndustry.textContent = `${company.industry || ''} `.trim();

    }

    const companyDescription = document.getElementById('companyDescription');
    if (companyDescription) {
        companyDescription.textContent = company.description || 'No description available.';
    }

    // Photo de profil (logo)
    const profileImg = document.querySelector('.profile-img2');
    if (profileImg) {
        let logoPath = company.logo || '../images/default-c.png';
        if (logoPath && !logoPath.startsWith('/') && !logoPath.startsWith('http') && !logoPath.startsWith('../')) {
            logoPath = '/' + logoPath;
        }
        profileImg.src = logoPath;
        profileImg.onerror = function() {
            this.src = '../images/default-c.png';
        };
    }

    // Image de couverture
    const coverImg = document.querySelector('.image-background2');
    if (coverImg) {
        let coverPath = company.cover || '../images/default-cover.jpg';
        if (coverPath && !coverPath.startsWith('/') && !coverPath.startsWith('http') && !coverPath.startsWith('../')) {
            coverPath = '/' + coverPath;
        }
        coverImg.src = coverPath;
        coverImg.onerror = function() {
            this.src = '../images/default-cover.jpg';
        };
    }

}

function displayDetails(company) {
    if (!company) return;




    const detailIndustry = document.getElementById('detailIndustry');
    if (detailIndustry) {
        detailIndustry.textContent = `${company.industry || ''} `.trim();
    }

    const detailLocation = document.getElementById('detailLocation');
    if (detailLocation) {
        detailLocation.textContent = `${company.location || ''} `.trim();
    }

    const detailSize = document.getElementById('detailSize');
    if (detailSize) {
        detailSize.textContent = `${company.organizationSize || ''} `.trim();
    }

    const detailType = document.getElementById('detailType');
    if (detailType) {
        detailType.textContent = `${company.organizationType || ''} `.trim();
    }

}



