document.addEventListener('DOMContentLoaded', () => {
  loadMyProfile();
});
const currentYear = new Date().getFullYear();


//FETCH PROFILE
async function loadMyProfile() {
  try {
    const res = await fetch('/api/myProfile');
    if (!res.ok) throw new Error('Failed to fetch profile');

    const user = await res.json();

    renderBasicInfo(user);
    renderExperience(user.experiences);
    renderEducation(user.education);
    renderSkills(user.skills);
    renderCertifications(user.certifications);
    renderPosts(user.posts);

    setupEditInfoModal(user);
    setupExperienceModals(user);
    setupEducationModals(user);
    setupAddExperienceModal();
    setupAddEducationModal();
    setupDeleteEducationModal();
    setupDeleteExperienceModal();
    setupDeleteSkillModal();
    setupAddSkillModal(user);
    setupAddCertificationModal();
    setupDeleteCertificationModal();
    setupCertificationModals(user);


  } catch (err) {
    console.error('Error fetching user data:', err);
  }
}

//BASIC INFO
function renderBasicInfo(user) {
  document.getElementById('nom').textContent =
    `${user.firstname} ${user.lastname}`;

  document.getElementById('position').textContent = user.position;
  document.getElementById('infos').textContent = user.description;
}

// EXPERIENCE
function renderExperience(experiences) {
  const container = document.getElementById('experience');

  experiences.forEach((exp, index) => {
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.dataset.index = index;
    div.dataset.bsToggle = 'modal';
    div.dataset.bsTarget = '#editExperienceModal';

    div.innerHTML = `
      <img src="${exp.logo}">
      <h6>${exp.role}</h6>
      <small>${exp.company} • ${exp.startYear}-${exp.endYear}</small>
      <p>${exp.description}</p>
    `;
    container.appendChild(div);
  });

  container.appendChild(createAddExperienceButton());
}


function createAddExperienceButton() {
  const div = document.createElement('div');
  div.className = 'experience-item experience-add d-flex align-items-center gap-2 p-3 mb-3 rounded fw-semibold';

  div.setAttribute('role', 'button');
  div.dataset.bsToggle = 'modal';
  div.dataset.bsTarget = '#experienceModal';


  // Inner content
  div.innerHTML = `
    <i class="bi bi-plus-square fs-4" style="color: var(--yellow-green);"></i>
    <span>Add Experience</span>
  `;

  

  return div;
}


//EDUCATION
function renderEducation(education) {
  const container = document.getElementById('education');

  education.forEach((ed, index) => {
    const div = document.createElement('div');
    div.className = 'education-item';
    div.dataset.index = index;

    div.innerHTML = `
      <img src="${ed.logo}">
      <div>
        <h6>${ed.fieldOfStudy}</h6>
        <small>${ed.degree} • ${ed.endYear}</small>
        <p>${ed.school}</p>
      </div>
      <div class="ms-auto d-flex gap-3">
    <i class="bi bi-pencil"
       role="button"
       data-bs-toggle="modal"
       data-bs-target="#editEducationModal"></i>

    <i class="bi bi-trash"
       role="button"
       data-bs-toggle="modal"
       data-bs-target="#deleteEducationModal"></i>
  </div>
    `;
    container.appendChild(div);
  });
}


//SKILLS
function renderSkills(skills) {
  const container = document.getElementById('skill');

  skills.forEach((skill, index) => {
    const div = document.createElement('div');
    div.className = 'skill-item';
    div.dataset.index = index;
    div.innerHTML = `
      <span>${skill}</span>
      <i class="bi bi-trash ms-auto"
     role="button"
     data-bs-toggle="modal"
     data-bs-target="#deleteSkillModal"></i>
    `;
    container.appendChild(div);
  });
}

//CERTIFICATIONS
function renderCertifications(certifications) {
  const container = document.getElementById('certification');

  certifications.forEach((c, index) => {
    const div = document.createElement('div');
    div.className = 'certification-item';
    div.dataset.index = index;
    div.innerHTML = `
      <div>
        <h6>${c.title}</h6>
        <small>${c.company} • ${c.year}</small>
      </div>
      <div class="ms-auto d-flex gap-3">
    <i class="bi bi-pencil"
       role="button"
       data-bs-toggle="modal"
       data-bs-target="#editCertificationModal"></i>

    <i class="bi bi-trash"
       role="button"
       data-bs-toggle="modal"
       data-bs-target="#deleteCertificationModal"></i>
  </div>

    `;
    container.appendChild(div);
  });
}

//POSTS
function renderPosts(posts) {
  const container = document.getElementById('posts');

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-item p-3 mb-3';
    div.style = 'background:#f8f9fa;border-radius:12px';

    div.innerHTML = `
      <div class="d-flex align-items-center mb-2">
        <img src="${post.profilePic}"
             class="rounded-circle"
             width="40">
        <div class="ms-2">
          <strong>${post.author}</strong>
          <small class="text-muted d-block">${post.date}</small>
        </div>
      </div>
      <p>${post.content}</p>
    `;
    container.appendChild(div);
  });
}

//EDIT INFO MODAL
function setupEditInfoModal() {
  const textarea = document.getElementById('descriptionTextarea');
  const infos = document.getElementById('infos');
  const saveBtn = document.getElementById('saveDescriptionBtn');
  const modal = document.getElementById('editInfosModal');

  modal.addEventListener('show.bs.modal', () => {
    textarea.value = infos.textContent;
  });

  saveBtn.addEventListener('click', async () => {
    
    const newDescription = textarea.value;
    infos.textContent = newDescription;
  

    await fetch('/edit/editInfos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDescription })
    });

    bootstrap.Modal.getInstance(modal).hide();
  });
}

//EXPERIENCE MODALS
function setupExperienceModals(user) {
  let currentIndex = null;

  document.addEventListener('click', e => {
    const item = e.target.closest('.experience-item');
    if (!item || !item.dataset.index) return;
    currentIndex = item.dataset.index;
    const exp = user.experiences[currentIndex];
    console.log(currentIndex)

    expRole.value = exp.role;
    expCompany.value = exp.company;
    expStartYear.value = exp.startYear;
    expEndYear.value = exp.endYear;
    expDescription.value = exp.description;
  });

  saveExperienceBtn.addEventListener('click', async () => {
    [editRoleError, editCompanyError, editStartYearError, editEndYearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [expRole, expCompany, expStartYear, expEndYear].forEach(input => {
      input.classList.remove('is-invalid'); 
    });

    let hasError = false;

    if (!expRole.value.trim()) {
      editRoleError.textContent = "Required";
      editRoleError.classList.remove('d-none');
      expRole.classList.add('is-invalid');
      hasError = true;
    }

    if (!expCompany.value.trim()) {
      editCompanyError.textContent = "Required";
      editCompanyError.classList.remove('d-none');
      expCompany.classList.add('is-invalid');
      hasError = true;
    }

    if (!expStartYear.value.trim()) {
      editStartYearError.textContent = "Required";
      editStartYearError.classList.remove('d-none');
      expStartYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(expStartYear.value) > currentYear || Number(expStartYear.value)<1900) {
      editStartYearError.textContent = `Invalid`;
      editStartYearError.classList.remove('d-none');
      expStartYear.classList.add('is-invalid');
      hasError = true;
    }

    if (!expEndYear.value.trim()) {
      editEndYearError.textContent = "Required";
      editEndYearError.classList.remove('d-none');
      expEndYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(expEndYear.value) > currentYear || Number(expEndYear.value)<1900 || Number(expEndYear.value)<Number(addexpStartYear.value)) {
      editEndYearError.textContent = 'Invalid';
      editEndYearError.classList.remove('d-none');
      expEndYear.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;
    
    const updatedExp = {
      role: expRole.value,
      company: expCompany.value,
      startYear: expStartYear.value,
      endYear: expEndYear.value,
      description: expDescription.value
    };

    await fetch('/edit/editExperience', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, experience: updatedExp })
    });

    location.reload();
  });
}

//ADD EXPERIENCE
function setupAddExperienceModal() {
  saveExpBtn.addEventListener('click', async () => {
    [roleError, companyError, startYearError, endYearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [addexpRole, addexpCompany, addexpStartYear, addexpEndYear].forEach(input => {
      input.classList.remove('is-invalid'); 
    });

    let hasError = false;

    if (!addexpRole.value.trim()) {
      roleError.textContent = "Required";
      roleError.classList.remove('d-none');
      addexpRole.classList.add('is-invalid');
      hasError = true;
    }

    if (!addexpCompany.value.trim()) {
      companyError.textContent = "Required";
      companyError.classList.remove('d-none');
      addexpCompany.classList.add('is-invalid');
      hasError = true;
    }

    if (!addexpStartYear.value.trim()) {
      startYearError.textContent = "Required";
      startYearError.classList.remove('d-none');
      addexpStartYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(addexpStartYear.value) > currentYear || Number(addexpStartYear.value)<1900) {
      startYearError.textContent = `Invalid`;
      startYearError.classList.remove('d-none');
      addexpStartYear.classList.add('is-invalid');
      hasError = true;
    }

    if (!addexpEndYear.value.trim()) {
      endYearError.textContent = "Required";
      endYearError.classList.remove('d-none');
      addexpEndYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(addexpEndYear.value) > currentYear || Number(addexpEndYear.value)<1900 || Number(addexpEndYear.value)<Number(addexpStartYear.value)) {
      endYearError.textContent = 'Invalid';
      endYearError.classList.remove('d-none');
      addexpEndYear.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;
    
    const experience = {
      role: addexpRole.value,
      company: addexpCompany.value,
      startYear: addexpStartYear.value,
      endYear: addexpEndYear.value,
      description: addexpDescription.value
    };

    await fetch('/edit/addExperience', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experience })
    });

    location.reload();
  });
}

// DELETE EXPERIENCE
function setupDeleteExperienceModal() {
  let currentIndex = null;

  document.addEventListener('click', e => {
    const item = e.target.closest('.experience-item');

    if (!item) return;
    currentIndex = item.dataset.index;
  });

  confirmDeleteExperienceBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;

    try {
      const res = await fetch('/edit/deleteExperience', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex })
      });

      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert('Failed to delete experience');
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  });
}

//ADD EDUCATION
function setupAddEducationModal() {
  
  saveEtudBtn.addEventListener('click', async () => {
    [schoolError, fieldError, degreeError, yearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [addetudSchool, addetudfieldOfStudy, addetudDegree, addetudYear].forEach(input => {
      input.classList.remove('is-invalid'); // Bootstrap danger class
    });

    let hasError = false;

    if (!addetudSchool.value.trim()) {
      schoolError.textContent = "School is required";
      schoolError.classList.remove('d-none');
      addetudSchool.classList.add('is-invalid');
      hasError = true;
    }

    if (!addetudfieldOfStudy.value.trim()) {
      fieldError.textContent = "Field of study is required";
      fieldError.classList.remove('d-none');
      addetudfieldOfStudy.classList.add('is-invalid');
      hasError = true;
    }

    if (!addetudDegree.value.trim()) {
      degreeError.textContent = "Degree is required";
      degreeError.classList.remove('d-none');
      addetudDegree.classList.add('is-invalid');
      hasError = true;
    }

    if (!addetudYear.value.trim()) {
      yearError.textContent = "Year is required";
      yearError.classList.remove('d-none');
      addetudYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(addetudYear.value) > currentYear || Number(addetudYear.value) <1900) {
      yearError.textContent = 'Invalid';
      yearError.classList.remove('d-none');
      addetudYear.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;

    
    const education = {
      school: addetudSchool.value,
      fieldOfStudy: addetudfieldOfStudy.value,
      degree: addetudDegree.value,
      endYear: addetudYear.value
    };
    console.log(education)
    await fetch('/edit/addEducation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ education })
    });
        location.reload();

  });
}

//EDIT EDUCATION
function setupEducationModals(user) {
  let currentIndex = null;

  document.addEventListener('click', e => {
    const item = e.target.closest('.education-item');
    if (!item) return;
    currentIndex = item.dataset.index;
    const ed = user.education[currentIndex];

    etudDegree.value = ed.degree;
    etudSchool.value = ed.school;
    etudfieldOfStudy.value = ed.fieldOfStudy;
    etudYear.value = ed.endYear;
  });

  saveEducationBtn.addEventListener('click', async () => {
    [editSchoolError, editFieldError, editDegreeError, editYearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [etudSchool, etudfieldOfStudy, etudDegree, etudYear].forEach(input => {
      input.classList.remove('is-invalid');
    });

    let hasError = false;

    if (!etudSchool.value.trim()) {
      editSchoolError.textContent = "School is required";
      editSchoolError.classList.remove('d-none');
      etudSchool.classList.add('is-invalid');
      hasError = true;
    }

    if (!etudfieldOfStudy.value.trim()) {
      editFieldError.textContent = "Field of study is required";
      editFieldError.classList.remove('d-none');
      etudfieldOfStudy.classList.add('is-invalid');
      hasError = true;
    }

    if (!etudDegree.value.trim()) {
      editDegreeError.textContent = "Degree is required";
      editDegreeError.classList.remove('d-none');
      etudDegree.classList.add('is-invalid');
      hasError = true;
    }

    if (!etudYear.value.trim()) {
      editYearError.textContent = "Year is required";
      editYearError.classList.remove('d-none');
      etudYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(etudYear.value) > currentYear || Number(etudYear.value) <1900) {
      editYearError.textContent = 'Invalid';
      editYearError.classList.remove('d-none');
      etudYear.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;
    
    const education = {
      degree: etudDegree.value,
      school: etudSchool.value,
      fieldOfStudy: etudfieldOfStudy.value,
      endYear: etudYear.value
    };
    console.log(education)
    await fetch('/edit/editEducation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, education })
    });

    location.reload();

  });
}

// DELETE EDUCATION
function setupDeleteEducationModal() {
  let currentIndex = null;

  document.addEventListener('click', e => {
    const trash = e.target.closest('.bi-trash');
    const item = e.target.closest('.education-item');

    if (!trash || !item) return;
    currentIndex = item.dataset.index;
  });

  deleteEducationBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;

    try {
      const res = await fetch('/edit/deleteEducation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex })
      });

      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert('Failed to delete education');
      }
    } catch (err) {
      console.error('Error deleting education:', err);
    }
  });
}

//ADD SKILL
function setupAddSkillModal(user) {
  const skillError = document.getElementById('skillError');

  addSkillBtn.addEventListener('click', async (e) => {
    const newSkill = skillSelect.value.trim();
    skillError.classList.add('d-none');
    skillError.textContent = '';

    if (!newSkill) {
      skillError.textContent = "Please select a skill";
      skillError.classList.remove('d-none');
      return;
    }

    if (user.skills.includes(newSkill)) {
      skillError.textContent = "This skill already exists!";
      skillError.classList.remove('d-none');
      return;
    }

    const res = await fetch('/edit/addSkill', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill: newSkill })
    });

    if (!res.ok) {
      skillError.textContent = "Failed to add skill";
      skillError.classList.remove('d-none');
      return;
    }

    location.reload();
  });
}


// DELETE SKILL
function setupDeleteSkillModal() {

  let currentIndex = null;

  document.addEventListener('click', e => {
    const trash = e.target.closest('.bi-trash');
    const item = e.target.closest('.skill-item');

    if (!trash || !item) return;
    currentIndex = item.dataset.index;
    console.log(currentIndex);
  });

  confirmDeleteSkillBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;

    try {
      const res = await fetch('/edit/deleteSkill', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex })
      });

      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert('Failed to delete skill');
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  });
}



// DELETE CERTIFICATION
function setupDeleteCertificationModal() {
  let currentIndex = null;
  document.addEventListener('click', e => {
    const trash = e.target.closest('.bi-trash');
    const item = e.target.closest('.certification-item');

    if (!trash || !item) return;
    currentIndex = item.dataset.index;
    console.log(currentIndex);
  });

  confirmDeleteCertificationBtn.addEventListener('click', async () => {
    if (currentIndex === null) return;

    try {
      const res = await fetch('/edit/deleteCertification', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex })
      });

      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert('Failed to delete certification');
      }
    } catch (err) {
      console.error('Error deleting certification:', err);
    }
  });
}

//ADD CERTIFICATION
function setupAddCertificationModal() {
  addCertificationBtn.addEventListener('click', async () => {
    [titleError, certCompanyError, ceryYearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [certTitle, certCompany, certYear].forEach(input => {
      input.classList.remove('is-invalid'); 
    });

    let hasError = false;

    if (!certTitle.value.trim()) {
      titleError.textContent = "Required";
      titleError.classList.remove('d-none');
      certTitle.classList.add('is-invalid');
      hasError = true;
    }

    if (!certCompany.value.trim()) {
      certCompanyError.textContent = "Required";
      certCompanyError.classList.remove('d-none');
      certCompany.classList.add('is-invalid');
      hasError = true;
    }

    if (!certYear.value.trim()) {
      ceryYearError.textContent = "Required";
      ceryYearError.classList.remove('d-none');
      certYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(certYear.value) > currentYear || Number(certYear.value)<1900) {
      ceryYearError.textContent = `Invalid`;
      ceryYearError.classList.remove('d-none');
      certYear.classList.add('is-invalid');
      hasError = true;
    }
    if (hasError) return;


    const certification = {
      title: certTitle.value,
      company: certCompany.value,
      year: Number(certYear.value)
    };

    await fetch('/edit/addCertification', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certification })
    });
    location.reload();

  });
}

//EDIT CERTIFICATION
function setupCertificationModals(user) {
  let currentIndex = null;

  document.addEventListener('click', e => {
    const item = e.target.closest('.certification-item');
    if (!item) return;

    currentIndex = item.dataset.index;
    const c = user.certifications[currentIndex];
    editTitle.value = c.title;
    editCompany.value = c.company;
    editYear.value = c.year;
  });

  editCertificationBtn.addEventListener('click', async () => {
    [editTitleError, editCertCompanyError, editCertYearError].forEach(err => {
      err.classList.add('d-none');
      err.textContent = '';
    });

    [editTitle, editCompany, editYear].forEach(input => {
      input.classList.remove('is-invalid'); 
    });

    let hasError = false;

    if (!editTitle.value.trim()) {
      editTitleError.textContent = "Required";
      editTitleError.classList.remove('d-none');
      editTitle.classList.add('is-invalid');
      hasError = true;
    }

    if (!editCompany.value.trim()) {
      editCertCompanyError.textContent = "Required";
      editCertCompanyError.classList.remove('d-none');
      editCompany.classList.add('is-invalid');
      hasError = true;
    }

    if (!editYear.value.trim()) {
      editCertYearError.textContent = "Required";
      editCertYearError.classList.remove('d-none');
      editYear.classList.add('is-invalid');
      hasError = true;
    } else if (Number(editYear.value) > currentYear || Number(editYear.value)<1900) {
      editCertYearError.textContent = `Invalid`;
      editCertYearError.classList.remove('d-none');
      editYear.classList.add('is-invalid');
      hasError = true;
    }
    if (hasError) return;
    
    const certification = {
      title: editTitle.value,
      company: editCompany.value,
      year: Number(editYear.value)
    };

    await fetch('/edit/editCertification', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, certification })
    });

    location.reload();
  });
}






function isYearValid(input) {
  const currentYear = new Date().getFullYear();
  const year = Number(input.value);
  return year && year <= currentYear;
}


