import {validateName,validateLocation,validateDomainName} from './validations.js';
$(function(){
    $('#fileInput').on('change', function () {
        const file = this.files[0];
        if (file) {
            previewFile(file);
        }
    });
    $('#createCompanyForm').on('submit', async function(event){
        event.preventDefault();
        var formData = new FormData(this);
        const data = Object.fromEntries(formData);

        if(!validateForm(formData)){
            console.log('Form is invalid, not submitting.');
            return;
        }
        console.log('formData:', data);
        console.log('Form is valid, submitting...');
        
        formData.append('logo', $('#fileInput')[0].files[0]);

        const response = await fetch('/company/create-company', {
            method: 'POST',
            body: formData
            
        });

        const result = await response.json();

   
        if(result.success){
                $('#formMessage').html('<div class="alert alert-success">Company created successfully!</div>');
                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 2000);
        } else {
            if (result.message.includes('E11000')) {
                if (result.message.includes('domainName')) {
                    result.message = 'Domain name already exists. Please choose another one.';
                } else if (result.message.includes('name')) {
                    result.message = 'Company name already exists. Please choose another one.';
                }
            }
            console.error('Error response:', result);
            $('#formMessage').html('<div class="alert alert-danger">Error creating company: ' + result.message + '</div>');
        }
    });
    
})

function validateForm(formData){
    const name = formData.get('name').trim();
    const industry = formData.get('industry').trim();
    const location = formData.get('headquarters').trim();
    const domainName = formData.get('domainName').trim();
    let isValid = true;
    $('.text-danger').empty();
    if(!name || name === ''){
        isValid = false;
        $('#name').after('<span class="text-danger">Company name is required.</span>');
    }else if(name.length < 2 || name.length > 100){
        isValid = false;
        $('#name').after('<span class="text-danger">Company name must be between 2 and 100 characters.</span>');
    }else if(!validateName(name)){
        isValid = false;
        $('#name').after('<span class="text-danger">Company name contains invalid characters.</span>');
    }
    if(!industry || industry === ''){
        isValid = false;
        $('#industry').after('<span class="text-danger">Industry is required.</span>');
    }else if(industry.length < 2 || industry.length > 100){
        isValid = false;
        $('#industry').after('<span class="text-danger">Industry must be between 2 and 100 characters.</span>');
    }else if(!validateName(industry)){
        isValid = false;
        $('#industry').after('<span class="text-danger">Industry contains invalid characters.</span>');
    }
    if(location && !validateLocation(location)){
        isValid = false;
        $('#headquarters').after('<span class="text-danger">Location contains invalid characters.</span>');
    }
    if(!domainName || domainName === ''){
        isValid = false;
        $('#domainName').after('<span class="text-danger">Domain name is required.</span>');
    }else if(!validateDomainName(domainName)){
        isValid = false;
        $('#domainName').after('<span class="text-danger">Invalid domain name format.</span>');
    }
    return isValid;
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
