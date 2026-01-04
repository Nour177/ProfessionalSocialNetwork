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

        setupVideoUploader('uploadVideoBtn', 'videoInput', 'videoPreviewContainer');

        // Setup event listeners once
        setupCompanyEventListeners(currentCompany);

    } catch (err) {
        console.error('Error initializing app:', err);
        window.location.href = '/pages/login.html';
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
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && company.logo) {
        profileImg.src = company.logo;
    }

    // Image de couverture
    const coverImg = document.querySelector('.image-background');
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









function setupCompanyEventListeners(company) {
    if (companyEventListenersSetup) return;
    companyEventListenersSetup = true;

    // Edit Logo Modal
    const logoInput = document.getElementById('LogoInput');
    const logoPreview = document.getElementById('logoPreview');
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
    const coverInput = document.getElementById('coverInput');
    const coverPreview = document.getElementById('coverPreview');
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
    const descriptionTextarea = document.getElementById('descriptionTextarea');
    const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');
    const editInfosModal = document.getElementById('editInfosModal');
    const infos = document.getElementById('companyDescription');

    if (editInfosModal && descriptionTextarea && saveDescriptionBtn) {
        editInfosModal.addEventListener('show.bs.modal', () => {
            descriptionTextarea.value = infos ? infos.textContent : '';
        });

        saveDescriptionBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const newDescription = descriptionTextarea.value;
            await updateCompanyDescription(newDescription);
        });
    }

    setupDetailsModals(company);

}

// API Functions

async function updateCompanyLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('companyId', currentCompany._id);

    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/logo`, { method: 'PUT', body: formData });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.querySelector('.profile-img').src = currentCompany.logo;
            bootstrap.Modal.getInstance(document.getElementById('editLogoModal'))?.hide();
        } else alert(data.message || 'Failed to update logo');
    } catch (err) { console.error(err); alert('Network error while updating logo'); }
}

async function updateCompanyCover(file) {
    const formData = new FormData();
    formData.append('cover', file);
    formData.append('companyId', currentCompany._id);

    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/cover`, { method: 'PUT', body: formData });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.querySelector('.image-background').src = currentCompany.coverImagePath;
            bootstrap.Modal.getInstance(document.getElementById('editCoverModal'))?.hide();
        } else alert(data.message || 'Failed to update cover');
    } catch (err) { console.error(err); alert('Network error while updating cover'); }
}

async function updateCompanyDescription(newDescription) {

    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/description`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId: currentCompany._id, description: newDescription })
        });
        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.getElementById('companyDescription').textContent = newDescription;
            bootstrap.Modal.getInstance(document.getElementById('editInfosModal'))?.hide();
        } else alert(data.message || 'Failed to update description');
    } catch (err) { console.error(err); alert('Network error while updating description'); }
}



function setupDetailsModals(company) {
    const industry = document.getElementById('industry');
    const headquarters = document.getElementById('headquarters');
    const companySize = document.getElementById('companySize');
    const companyType = document.getElementById('companyType');
    const saveDetailsBtn = document.getElementById('saveDetailsBtn');
    const editIndustryError = document.getElementById('editIndustryError');
    const editHeadquartersError = document.getElementById('editHeadquartersError');
    const editCompanySizeError = document.getElementById('editCompanySizeError');
    const editCompanyTypeError = document.getElementById('editCompanyTypeError');
    const ediDetailsModal = document.getElementById('ediDetailsModal');

    let currentIndex = null;


    if (ediDetailsModal && saveDetailsBtn && industry && headquarters && companySize && companyType
    ) {
        ediDetailsModal.addEventListener('show.bs.modal', () => {
            industry.value = company?.industry ?? '';
            headquarters.value = company?.location ?? '';
            companySize.value = company?.organizationSize ?? '';
            companyType.value = company?.organizationType ?? '';
        });



        saveDetailsBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // Validation
            [editIndustryError, editHeadquartersError, editCompanySizeError, editCompanyTypeError].forEach(err => {
                if (err) {
                    err.classList.add('d-none');
                    err.textContent = '';
                }
            });

            [industry, headquarters, companySize, companyType].forEach(input => {
                if (input) input.classList.remove('is-invalid');
            });

            let hasError = false;

            if (!industry || !industry.value.trim()) {
                if (editIndustryError) {
                    editIndustryError.textContent = "Required";
                    editIndustryError.classList.remove('d-none');
                }
                if (industry) industry.classList.add('is-invalid');
                hasError = true;
            }

            if (!headquarters || !headquarters.value.trim()) {
                if (editHeadquartersError) {
                    editHeadquartersError.textContent = "Required";
                    editHeadquartersError.classList.remove('d-none');
                }
                if (headquarters) headquarters.classList.add('is-invalid');
                hasError = true;
            }

            if (!companySize) {
                if (editCompanySizeError) {
                    editCompanySizeError.textContent = "Please select a company size";
                    editCompanySizeError.classList.remove('d-none');
                }
                return;
            }

            if (!companyType) {
                if (editCompanyTypeError) {
                    editCompanyTypeError.textContent = "Please select a company type";
                    editCompanyTypeError.classList.remove('d-none');
                }
                return;
            }

            if (hasError) return;

            const updatedDetails = {
                industry: industry?.value || '',
                location: headquarters?.value || '',
                organizationSize: companySize?.value || null,
                organizationType: companyType?.value || null,
            };

            await updateDetails(updatedDetails);
        });
    }

}


async function updateDetails(details) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/companies/details`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId: currentCompany._id, details: details })

        });

        const data = await res.json();
        if (data.success && data.company) {
            currentCompany = data.company;
            localStorage.setItem('company', JSON.stringify(currentCompany));
            document.getElementById('industry').textContent = details.industry;
            bootstrap.Modal.getInstance(document.getElementById('ediDetailsModal'))?.hide();
            document.getElementById('detailIndustry').textContent = details.industry;
            document.getElementById('detailLocation').textContent = details.location;
            document.getElementById('detailSize').textContent = details.organizationSize;
            document.getElementById('detailType').textContent = details.organizationType;
        } else alert(data.message || 'Failed to update details');
    } catch (error) {
        console.error('Error updating details:', error);
        alert('Network error. Please try again.');
    }
}



function setupVideoUploader(uploadBtnId, videoInputId, previewContainerId) {
    const uploadBtn = document.getElementById(uploadBtnId);
    const videoInput = document.getElementById(videoInputId);
    const previewContainer = document.getElementById(previewContainerId);

    if (!uploadBtn || !videoInput || !previewContainer) return;

    uploadBtn.addEventListener('click', () => {
        videoInput.click();
    });

    videoInput.addEventListener('change', () => {
        const file = videoInput.files[0];
        if (!file) return;

        previewContainer.innerHTML = '';

        // Create video preview
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.width = 400;
        video.height = 300;
        previewContainer.appendChild(video);

        const msgEl = document.createElement('div');
        msgEl.id = 'videoUploadMsg';
        msgEl.style.marginTop = '10px';
        msgEl.style.color = 'green';
        previewContainer.appendChild(msgEl);

        // Create Save button
        let saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Video';
        saveBtn.id = 'saveVideoBtn';
        saveBtn.classList.add('btn', 'btn-primary', 'mt-2');
        previewContainer.appendChild(saveBtn);

        // Save button click event
        saveBtn.addEventListener('click', async () => {
            const formData = new FormData();
            formData.append('videoFile', file);
            formData.append('id', currentCompany._id);

            try {
                const response = await fetch(`${API_BASE_URL}/api/settings/company-video`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (data.success && data.company) {
                    currentCompany = data.company;
                    localStorage.setItem('company', JSON.stringify(currentCompany));
                    // Show success message below video
                    msgEl.textContent = ' Video uploaded successfully!';




                    // update video preview on profile page
                    const profileVideo = document.querySelector('.profile-video');
                    if (profileVideo && currentCompany.video) {
                        profileVideo.src = currentCompany.video;
                    }
                } else {
                    alert('Failed to update video: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error uploading video:', error);
                alert('Network error. Please try again.');
            }
        });
    });
}



