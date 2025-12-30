
fetch('/api/myProfile')
  .then(response => response.json())
  .then(user => {








    var nom = document.getElementById('nom');
    nom.textContent = user.firstname + " " + user.lastname;

    var position = document.getElementById('position');
    position.textContent = user.email;

    var infos = document.getElementById('infos');
    infos.textContent = user.description;



    //experience
    const experienceContainer = document.getElementById("experience");
    user.experiences.forEach((exp, index) => {
      const div = document.createElement("div");
      div.className = "experience-item";
      div.setAttribute("role", "button");
      div.setAttribute("data-bs-toggle", "modal");
      div.setAttribute("data-bs-target", "#editExperienceModal");
      div.setAttribute("data-index", index);

      div.innerHTML = `
    <img src="${exp.logo}" alt="Company Logo">

    <h6 class="mb-0">${exp.role}</h6>

    <div class="text-muted small">
      <span>${exp.company}</span>
      <span class="mx-1">•</span>
      <span>${exp.startYear}-${exp.endYear}</span>
      <span></span>

    </div>

    <p class="mb-0">${exp.description}</p>

  `;

      experienceContainer.appendChild(div);
    });

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




    //education
    const educationContainer = document.getElementById("education");
    user.education.forEach((ed, index) => {
      const div = document.createElement("div");
      div.className = "education-item d-flex align-items-start justify-content-between mb-3 p-2 border rounded";
      div.setAttribute("data-index", index);

      div.innerHTML = `
    <div class="card-icons d-flex gap-4">
      <img src="${ed.logo}" alt="School Logo">
      <div>
        <h6 class="mb-0">${ed.degree}</h6>
        <small class="text-muted">${ed.location} • ${ed.year}</small>
        <p class="mb-0">${ed.establishment}</p>
      </div>
    </div>
    <a data-bs-toggle="modal" data-bs-target="#editEducationModal" class="ms-2">
      <i class="bi bi-pencil icon-small"></i>
    </a>
  `;

      educationContainer.appendChild(div);
    });



    //skill
    const skillContainer = document.getElementById("skill");
    user.skills.forEach(s => {
      const div = document.createElement("div");
      div.className = "skill-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";

      div.innerHTML = `
    <h6 class="mb-0">${s}</h6>
    <a data-bs-toggle="modal" data-bs-target="#deleteSkillModal">
      <i class="bi bi-trash icon-small"></i>
    </a>
  `;
      skillContainer.appendChild(div);
    });


    //certification
    const certificationContainer = document.getElementById("certification");
    user.certifications.forEach(c => {
      const div = document.createElement("div");
      div.className = "skill-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";

      div.innerHTML = `
    <div class="card-icons d-flex gap-4">
      <div>
        <h6 class="mb-0">${c.title}</h6>
        <small>${c.company} </small>
        <small class="text-muted">${c.date} </small>
      </div>
    </div>
    <a data-bs-toggle="modal" data-bs-target="#deletecertificationModal" class="ms-2">
      <i class="bi bi-trash icon-small"></i>
    </a>
  `;
      certificationContainer.appendChild(div);
    });



    //post
    const container = document.getElementById("posts");

    user.posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post-item mb-3 p-3";
      div.style = "background:#f8f9fa; border-radius:12px;";

      div.innerHTML = `
      <div class="d-flex align-items-center mb-2">
        <img src="${post.profilePic}" alt="Profile"
             style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:10px;">
        <div>
          <strong>${post.author}</strong><br>
          <small class="text-muted">${post.date}</small>
        </div>
      </div>
      <p>${post.content}</p>
      <div class="d-flex justify-content-start gap-3 text-muted" style="font-size:14px;">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>🔄 Share</span>
      </div>
    `;

      container.appendChild(div);
    });










    //edit Photo Modal
    const photoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('photoPreview');
    const saveBtn = document.getElementById('savePhotoBtn');
    const editPhotoModal = document.getElementById('editPhotoModal');


    let originalPhotoSrc = photoPreview.src;

    photoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        saveBtn.disabled = false;
      } else {
        photoPreview.src = originalPhotoSrc;
        saveBtn.disabled = true;
      }
    });

    saveBtn.addEventListener('click', () => {
      console.log('Profile photo saved!');

      const modalInstance = bootstrap.Modal.getInstance(editPhotoModal);
      modalInstance.hide();
    });



    //edit cover Modal
    const coverInput = document.getElementById('coverInput');
    const coverPreview = document.getElementById('coverPreview');
    const saveCoverBtn = document.getElementById('saveCoverBtn');
    const editCoverModal = document.getElementById('editCoverModal');


    let originalCoverSrc = photoPreview.src;

    coverInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          coverPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        saveCoverBtn.disabled = false;
      } else {
        photoPreview.src = originalCoverSrc;
        saveCoverBtn.disabled = true;
      }
    });

    saveCoverBtn.addEventListener('click', () => {
      console.log('Cover photo saved!');

      const modalInstance = bootstrap.Modal.getInstance(editCoverModal);
      modalInstance.hide();
    });



    //edit Infos Modal
    const descriptionTextarea = document.getElementById('descriptionTextarea');
    const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');

    const editInfosModal = document.getElementById('editInfosModal');
    editInfosModal.addEventListener('show.bs.modal', () => {
      descriptionTextarea.value = infos.textContent;
    });

    saveDescriptionBtn.addEventListener('click', () => {
      const newDescription = descriptionTextarea.value;
      infos.textContent = newDescription;

      fetch('/edit/editInfos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newDescription })
      })
        .then(res => res.json())
        .catch(err => console.error('Error updating description:', err));

      const modalInstance = bootstrap.Modal.getInstance(editInfosModal);
      modalInstance.hide();

    });




    //edit Experience Modal
    const editExperienceModal = document.getElementById('editExperienceModal');

    const expRole = document.getElementById('expRole');
    const expCompany = document.getElementById('expCompany');
    const expStartYear = document.getElementById('expStartYear');
    const expEndYear = document.getElementById('expEndYear');
    const expDescription = document.getElementById('expDescription');
    const saveExperienceBtn = document.getElementById('saveExperienceBtn');

    let currentIndex = null;

    document.querySelectorAll('.experience-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = item.getAttribute('data-index');
        currentIndex = index;
        const exp = user.experiences[index];

        expRole.value = exp.role;
        expCompany.value = exp.company;
        expStartYear.value = exp.startYear;
        expEndYear.value = exp.endYear;
        expDescription.value = exp.description;
      });
    });




    saveExperienceBtn.addEventListener('click', () => {
      const updatedExp = {
        role: expRole.value,
        company: expCompany.value,
        startYear: expStartYear.value,
        endYear: expEndYear.value,
        description: expDescription.value
      };

      fetch('/edit/editExperience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex, experience: updatedExp })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to update experience');
        }
    })
    .catch(err => console.error(err));
      console.log('Updated experience:');

      const modalInstance = bootstrap.Modal.getInstance(editExperienceModal);
      modalInstance.hide();
    });





    //add experience Modal
    const addexpModal = document.getElementById('experienceModal');
    const addexpRole = document.getElementById('addexpRole');
    const addexpCompany = document.getElementById('addexpCompany');
    const addexpStartYear = document.getElementById('addexpStartYear');
    const addexpEndYear = document.getElementById('addexpEndYear');
    const addexpDescription = document.getElementById('addexpDescription');
    const saveExpBtn = document.getElementById('saveExpBtn');


    saveExpBtn.addEventListener('click', () => {
      const updatedExp = {
        role: addexpRole.value,
        company: addexpCompany.value,
        startYear: addexpStartYear.value,
        endYear: addexpEndYear.value,
        description: addexpDescription.value
      };
      console.log(updatedExp);
      fetch('/edit/addExperience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: updatedExp })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to update experience');
        }
    })
    .catch(err => console.error(err));
      console.log('Added experience:');

      const modalInstance = bootstrap.Modal.getInstance(addexpModal);
      modalInstance.hide();
    });


    //add education Modal
    const addEductionModal = document.getElementById('addEductionModal');
    const addetudEstablishment = document.getElementById('addetudEstablishment');
    const addetudLocation = document.getElementById('addetudLocation');
    const addetudDegree = document.getElementById('addetudDegree');
    const addetudYear = document.getElementById('addetudYear');
    const saveEtudBtn = document.getElementById('saveEtudBtn');


    saveEtudBtn.addEventListener('click', () => {
      const updatedEtud = {
        establishment: addetudEstablishment.value,
        location: addetudLocation.value,
        degree: addetudDegree.value,
        year: addetudYear.value,
      };
      console.log(updatedEtud);
      fetch('/edit/addEducation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ education: updatedEtud })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to update education');
        }
    })
    .catch(err => console.error(err));

      const modalInstance = bootstrap.Modal.getInstance(addEductionModal);
      modalInstance.hide();
    });


    //edit Experience Modal
    const editEducationModal = document.getElementById('editEducationModal');

    const etudDegree = document.getElementById('etudDegree');
    const etudEstablishment = document.getElementById('etudEstablishment');
    const etudLocation = document.getElementById('etudLocation');
    const etudYear = document.getElementById('etudYear');
    const saveEducationBtn = document.getElementById('saveEducationBtn');

    let currentPosition = null;

    document.querySelectorAll('.education-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = item.getAttribute('data-index');
        currentPosition = index;
        const etud = user.education[index];

        etudDegree.value = etud.degree;
        etudEstablishment.value = etud.establishment;
        etudLocation.value = etud.location;
        etudYear.value = etud.year;
      });
    });




    saveEducationBtn.addEventListener('click', () => {
      const updatedEtud = {
        degree: etudDegree.value,
        establishment: etudEstablishment.value,
        location: etudLocation.value,
        year: etudYear.value,
      };

      fetch('/edit/editEducation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentPosition, education: updatedEtud })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to update education');
        }
    })
    .catch(err => console.error(err));
      console.log('Updated experience:');

      const modalInstance = bootstrap.Modal.getInstance(editEducationModal);
      modalInstance.hide();
    });


    












  })
  .catch(err => console.error('Error fetching user data:', err));