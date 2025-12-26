$(function () {

    $('#continue-1').on('click', function (e) {
        e.preventDefault();
        if (validStep1()) {
            $('#step-1').addClass('d-none');
            $('#step-2').removeClass('d-none');
        }
    });

    $('#continue-2').on('click', function (e) {
        e.preventDefault();
        if (validateStep2()) {
            console.log("step 2 valid");
            $('#step-2').addClass('d-none');
            $('#step-3').removeClass('d-none');
            
            let welcomeHeader = "Welcome, " + $('#firstname').val() + "! What's your location";
            $('#welcome-header').text(welcomeHeader);
        }
        console.log("continue 2 clicked");
    });

    $('#continue-3').on('click', function (e) {
        e.preventDefault();
        if (validateStep3()) {
            $('#step-3').addClass('d-none');
            $('#step-4').removeClass('d-none');
        }
    });
    $('#continue-4').on('click', function (e) {
        e.preventDefault();
        if (validateStep4()) {
            $('#step-4').addClass('d-none');
            $('#step-5').removeClass('d-none');

            let fullName = $('#firstname').val() + ' ' + $('#lastname').val();
            $('#placeholder-name').text(fullName);
            if (!$('#job-option').hasClass('d-none')) {
                $('#placeholder-school').text($('#recent-job').val());
            } else {
                $('#placeholder-school').text($('#school').val());
            }
            $('#placeholder-location').text($('#location').val());
        }
    });

    $('#student').on('click', function (e) {
        e.preventDefault();
        $('#job-option').addClass('d-none');
        $('#student-option').removeClass('d-none');
    });

    $('#not-student').on('click', function (e) {
        e.preventDefault();
        $('#student-option').addClass('d-none');
        $('#job-option').removeClass('d-none');
    });

    $('#fileInput').on('change', function () {
        const file = this.files[0];
        if (file) {
            previewFile(file);
        }
    });

})

function validStep1() {
    let email = $('#email').val();
    let password = $('#password').val();
    let isValid = true;
    $('.error-message').remove();

    if (!email) {
        $('#email').after('<span class="error-message text-danger">Email is required.</span>');
        isValid = false;
    } else if (!validateEmail(email)) {
        $('#email').after('<span class="error-message text-danger">Invalid email format.</span>');
        isValid = false;
    }

    if (!password) {
        $('#password').after('<span class="error-message text-danger">Password is required.</span>');
        isValid = false;
    } else if (!validatePassword(password)) {
        $('#password').after('<span class="error-message text-danger">Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters</span>');
        isValid = false;
    }
    return isValid;
}

function validateStep2() {
    let firstName = $('#firstname').val();
    let lastName = $('#lastname').val();
    let captchaResponse = grecaptcha.getResponse();
    let isValid = true;

    $('.error-message').remove();
    if (!firstName) {
        $('#firstname').after('<span class="error-message text-danger">First name is required.</span>');
        isValid = false;
    } else if (!validateName(firstName)) {
        $('#firstname').after('<span class="error-message text-danger">Invalid first name format.</span>');
        isValid = false;
    }
    if (!lastName) {
        $('#lastname').after('<span class="error-message text-danger">Last name is required.</span>');
        isValid = false;
    }else if (!validateName(lastName)) {
        $('#lastname').after('<span class="error-message text-danger">Invalid last name format.</span>');
        isValid = false;
    }
    if (captchaResponse.length === 0) {
        $('#captcha').after('<span class="error-message text-danger mb-3">Please verify that you are not a robot.</span>');
        isValid = false;
    }

    return isValid;
}

function validateStep3() {
    let location = $('#location').val();
    let isValid = true;
    $('.error-message').remove();

    if (!location) {
        $('#location').after('<span class="error-message text-danger">Location is required.</span>');
        isValid = false;
    }else if(!validateLocation(location)){
        $('#location').after('<span class="error-message text-danger">Invalid location format.</span>');
        isValid = false;
    }
    return isValid;
}

function validateStep4() {

    $('.error-message').remove();
    isValid = true;
    let validDegrees = ['High School Diploma', "Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate / PhD','Engineering Degree' ,'Other','Technical Diploma','Vocational Training',"Professional Degree"];

    if (!$('#job-option').hasClass('d-none')) {
        let recentJob = $('#recent-job').val();
        if (!recentJob) {
            $('#recent-job').after('<span class="error-message text-danger">Recent job experience is required.</span>');
            isValid = false;
        }else if (!validateName(recentJob)) {
            $('#recent-job').after('<span class="error-message text-danger">Invalid job experience format.</span>');
            isValid = false;
        }
    }else {
        let school = $('#school').val();
        let degree = $('#degree').val();
        let fieldOfStudy = $('#field-of-study').val();
        let start_date = $('#start-year').val();
        let end_date = $('#end-year').val();
        let isValid = true;
        if (!school) {
            $('#school').after('<span class="error-message text-danger">School is required.</span>');
            isValid = false;
        }else if (!validateName(school)) {
            $('#school').after('<span class="error-message text-danger">Invalid school format.</span>');
            isValid = false;
        }
        if (degree && !validDegrees.includes(degree)) {
            $('#degree').after('<span class="error-message text-danger">Please select a valid degree from the list.</span>');
            isValid = false;
        }
        if (fieldOfStudy && !validateName(fieldOfStudy)) {
            $('#field-of-study').after('<span class="error-message text-danger">Invalid field of study format.</span>');
            isValid = false;
        }
        if (!start_date || !end_date) {
            $('#start-year').after('<span class="error-message text-danger"> Please fill in the years.</span>');
            isValid = false;
        }else if ((start_date > new Date().getFullYear()) || start_date < 1950 || end_date > new Date().getFullYear()+7 || end_date < 1950) {
            $('#start-year').after('<span class="error-message text-danger">These dates are not valid.</span>');
            isValid = false;
        }else if (end_date && start_date > end_date) {
            $('#start-year').after('<span class="error-message text-danger">Start year cannot be after end year.</span>');
            isValid = false;
        }
    }
    return isValid;
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

function validateName(name) {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
    return re.test(String(name)) && name.length >= 2 && name.length <= 50;
}

function validateLocation(location) {
    const re = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:(?:[ '.-]|, ?)[A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*$/;
    return re.test(String(location)) && location.length >= 2 && location.length <= 100;
}

function previewFile(file) {
    const reader = new FileReader();
    let previewImage = document.getElementById('previewImage');

    reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.width = "100%";
        previewImage.style.height = "100%";
        previewImage.style.objectFit = "cover";
    };

    reader.readAsDataURL(file);
}

