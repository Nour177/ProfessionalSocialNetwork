var userName = "Aziza Dalleji";
var userPosition = "Software Engineer";
var userInfos = "Lorem ipsum dolor sit amet consectetur adipisicing elit. A natus facere voluptatum, est nemoadipisciasperiores dolorem! Recusandae, sapiente atque. Omnis tempora molestias nesciunt fugit? Cumqueaccusantium iste quam odit.."
const experiences = [
  {
    role: "Web Developer Intern",
    company: "Company Name",
    dates: "2024–2025",
    description: "Developed modern web applications using HTML, CSS, JS, and REST APIs.",
    logo: "../images/fsb.jpg"
  },
  {
    role: "Database Intern",
    company: "Another Company",
    dates: "2023–2024",
    description: "Worked with SQL and NoSQL databases to optimize data storage and retrieval.",
    logo: "../images/fsb.jpg"
  },
  {
    role: "Data Analyst",
    company: "Third Company",
    dates: "2022–2023",
    description: "Analyzed large datasets using MySQL and MongoDB to support business decisions.",
    logo: "../images/fsb.jpg"
  }
];

const educationList = [
  {
    school: "Faculté des Sciences de Bizerte",
    university: "Université de Carthage",
    dates: "2020–2024",
    degree: "Bachelor’s degree in Computer Science",
    logo: "../images/fsb.jpg"
  },
  {
    school: "Lycée Pilote",
    university: "Bizerte",
    dates: "2018–2020",
    degree: "High School Diploma",
    logo: "../images/fsb.jpg"
  }
];

const posts = [
  {
    author: "Aziza",
    date: "Dec 26, 2025",
    profilePic: "../images/profile.png",
    content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, sint quo? Voluptatem ratione minus, deserunt delectus nesciunt laborum, eligendi maxime ut quod debitis exercitationem. Eius eligendi iste dolores voluptatum voluptas!"
  }
];

const skillList = ["java", "python"];


const certificationList = [
  {
    title: "Word",
    company: "Microsoft",
    dates: "2020–2024",

  }
];



















var nom = document.getElementById('nom');
nom.textContent = userName;

var position = document.getElementById('position');
position.textContent = userPosition;

var infos = document.getElementById('infos');
infos.textContent = userInfos;



//experience
const experienceContainer = document.getElementById("experience");
experiences.forEach(exp => {
  const div = document.createElement("div");
  div.className = "experience-item";
  div.setAttribute("role", "button");
  div.setAttribute("data-bs-toggle", "modal");
  div.setAttribute("data-bs-target", "#editExperienceModal");

  div.innerHTML = `
    <img src="${exp.logo}" alt="Company Logo">

    <h6 class="mb-0">${exp.role}</h6>

    <div class="text-muted small">
      <span>${exp.company}</span>
      <span class="mx-1">•</span>
      <span>${exp.dates}</span>
    </div>

    <p class="mb-0">${exp.description}</p>

  `;

  experienceContainer.appendChild(div);
});

const addDiv = document.createElement("div");
addDiv.className = "experience-item d-flex align-items-center p-3 mb-3 experience-add";
addDiv.innerHTML = `
    <img src="../images/add.png" alt="Add Icon">
    <h6 class="mb-0 text-secondary">Add Experience</h6>
  `;
addDiv.setAttribute("role", "button");
addDiv.setAttribute("data-bs-toggle", "modal");
addDiv.setAttribute("data-bs-target", "#experienceModal");
experienceContainer.appendChild(addDiv);




//education
const educationContainer = document.getElementById("education");
educationList.forEach(ed => {
  const div = document.createElement("div");
  div.className = "education-item d-flex align-items-start justify-content-between mb-3 p-2 border rounded";

  div.innerHTML = `
    <div class="card-icons d-flex gap-4">
      <img src="${ed.logo}" alt="School Logo">
      <div>
        <h6 class="mb-0">${ed.school}</h6>
        <small class="text-muted">${ed.university} • ${ed.dates}</small>
        <p class="mb-0">${ed.degree}</p>
      </div>
    </div>
    <a data-bs-toggle="modal" data-bs-target="#editEducationModal" class="ms-2">
      <img src="../images/edit.png" alt="Edit" class="icon-small">
    </a>
  `;

  educationContainer.appendChild(div);
});



//skill
const skillContainer = document.getElementById("skill");
skillList.forEach(s => {
  const div = document.createElement("div");
  div.className = "skill-item d-flex align-items-center justify-content-between mb-3 p-2 border rounded";

  div.innerHTML = `
    <h6 class="mb-0">${s}</h6>
    <a data-bs-toggle="modal" data-bs-target="#deleteSkillModal">
      <img src="../images/delete.png" alt="Edit" class="icon-small" >
    </a>
  `;
  skillContainer.appendChild(div);
});


//certification
const certificationContainer = document.getElementById("certification");
certificationList.forEach(c => {
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
      <img src="../images/delete.png" alt="Edit" class="icon-small">
    </a>
  `;
  certificationContainer.appendChild(div);
});



//post
const container = document.getElementById("posts");

posts.forEach(post => {
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

  infos.textContent = descriptionTextarea.value;

  const modalInstance = bootstrap.Modal.getInstance(editInfosModal);
  modalInstance.hide();

});




//edit Experience Modal
const editExperienceModal = document.getElementById('editExperienceModal');

const expRole = document.getElementById('expRole');
const expCompany = document.getElementById('expCompany');
const expDates = document.getElementById('expDates');
const expDescription = document.getElementById('expDescription');
const saveExperienceBtn = document.getElementById('saveExperienceBtn');


editExperienceModal.addEventListener('show.bs.modal', () => {

});


saveExperienceBtn.addEventListener('click', () => {


  console.log('Updated experience:');

  const modalInstance = bootstrap.Modal.getInstance(editExperienceModal);
  modalInstance.hide();
});





//add experience Modal
const expModal = document.getElementById('experienceModal');
const addexpRole = document.getElementById('expRole');
const addexpCompany = document.getElementById('expCompany');
const addexpDate = document.getElementById('expDate');
const addexpDescription = document.getElementById('expDescription');
const saveExpBtn = document.getElementById('saveExpBtn');

const exp = [];




saveExpBtn.addEventListener('click', () => {
  const newExp = {
    role: addexpRole.value.trim(),
    company: addexpCompany.value.trim(),
    date: addexpDate.value,
    description: addexpDescription.value.trim()
  };

  if (!newExp.role || !newExp.company || !newExp.date) {
    alert('Please fill in all required fields!');
    return;
  }


  experiences.push(newExp);

  const bsModal = bootstrap.Modal.getInstance(expModal);
  bsModal.hide();


});




//add education Modal
const educationModal = document.getElementById('educationModal');
const etablissement = document.getElementById('etablissement');
const edulocation = document.getElementById('location');
const degree = document.getElementById('degree');
const eduDate = document.getElementById('edudate');
const saveEduBtn = document.getElementById('saveEduBtn');

const edu = [];




saveEduBtn.addEventListener('click', () => {
  const newEdu = {
    etablissement: etablissement.value.trim(),
    location: edulocation.value.trim(),
    date: eduDate.value,
    degree: degree.value.trim()
  };

  if (!newEdu.etablissement || !newEdu.location || !newEdu.date || !newEdu.degree) {
    alert('Please fill in all required fields!');
    return;
  }


  educationList.push(newEdu);

  const bsModal = bootstrap.Modal.getInstance(educationModal);
  bsModal.hide();


});





