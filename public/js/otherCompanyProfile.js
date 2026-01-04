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

       

        localStorage.setItem('company', JSON.stringify(companyData));

        // Display company info
        displayCompanyProfile(currentCompany);
        displayDetails(currentCompany);

        const companyVideo = document.querySelector('.profile-video');
        if (companyVideo) {
            if (currentCompany.video) {
            companyVideo.src = currentCompany.video;
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

    // Photo de profil
    const profileImg = document.querySelector('.profile-img2');
    if (profileImg && company.logo) {
        profileImg.src = company.logo;
    }

    // Image de couverture
    const coverImg = document.querySelector('.image-background2');
    if (coverImg && company.cover) {
        coverImg.src = company.cover;
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



