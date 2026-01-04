import { validateName, validateLocation } from "./validations.js";
$(function(){

    $('#jobPostForm').on('submit', async function(event){
        console.log('i am working');
        event.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        console.log('Form Data:', data);

        if (!validateForm(data)) {
            return;
        }
        const url = $(this).attr('action');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success) {
            if (response.status === 404) {
                $('#formMessages').html(`<div class="alert alert-danger">${result.message}</div>`);
            }
            if (response.status === 403) {
                $('#formMessages').html(`<div class="alert alert-danger">${result.message}</div>`);
            }
        } else {
            window.location.href = result.redirectUrl;
        }
    });

    $('#applyBtn').on('click', async function() {

        const jobId = $(this).data('job-id');
        const btn = $(this);

        // Disable button to prevent double clicks
        btn.prop('disabled', true).text('Sending...');

        try {
            const response = await fetch('/applications/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: jobId })
            });

            const result = await response.json();

            if (result.success) {
                btn.html('<i class="bi bi-check-circle-fill"></i> Applied');
            } else {
                $('#formMessages').html(`<div class="alert alert-danger">${result.message}</div>`);
                btn.prop('disabled', false).text('Apply Now'); // Re-enable if error
            }

        } catch (error) {
            $('#formMessages').html(`<div class="alert alert-danger">Something went wrong</div>`);
            console.error(error);
            btn.prop('disabled', false).text('Apply Now');
        }
    });
});

function validateForm(data) {
    let isValid = true;
    $('.text-danger').empty();
    if(!data.companyName || data.companyName.trim() === ''){
        isValid = false;
        $('#companyName').after('<span class="text-danger">Company name is required.</span>');
    }else if(data.companyName.length < 2 || data.companyName.length > 100){
        isValid = false;
        $('#companyName').after('<span class="text-danger">Company name must be between 2 and 100 characters.</span>');
    }else if(!validateName(data.companyName)){
        isValid = false;
        $('#companyName').after('<span class="text-danger">Company name contains invalid characters.</span>');
    }
    if (!data.title || data.title.trim() === '') {
        isValid = false;
        $('#title').after('<span class="text-danger">Job title is required.</span>');
    }else if(data.title.length < 2 || data.title.length > 100){
        isValid = false;
        $('#title').after('<span class="text-danger">Job title must be between 2 and 100 characters.</span>');
    }else if(!validateName(data.title)){
        isValid = false;
        $('#title').after('<span class="text-danger">Job title contains invalid characters.</span>');
    }
    if (!data.location || data.location.trim() === '') {
        isValid = false;
        $('#location').after('<span class="text-danger">Location is required.</span>');
    }else if(data.location.length < 2 || data.location.length > 100){
        isValid = false;
        $('#location').after('<span class="text-danger">Location must be between 2 and 100 characters.</span>');
    }else if(!validateLocation(data.location)){
        isValid = false;
        $('#location').after('<span class="text-danger">Location contains invalid characters.</span>');
    }
    if (!data.employmentType || data.employmentType.trim() === '') {
        isValid = false;
        $('#employmentType').after('<span class="text-danger">Employment type is required.</span>');
    }
    if (!data.description || data.description.trim() === '') {
        isValid = false;
        $('#description').after('<span class="text-danger">Job description is required.</span>');
    }else if(data.description.length < 10 || data.description.length > 1000){
        isValid = false;
        $('#description').after('<span class="text-danger">Job description must be between 10 and 1000 characters.</span>');
    }
    return isValid;
}