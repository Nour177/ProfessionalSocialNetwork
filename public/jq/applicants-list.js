$(document).ready(function() {

    $('#status-dropdown').each(function() {
        updateColor($(this));
    });

    $('#status-dropdown').on('change', function() {
        const $dropdown = $(this); 
        const appId = $dropdown.data('app-id'); 
        const newStatus = $dropdown.val();

        $dropdown.prop('disabled', true);

        $.ajax({
            url: '/applications/update-status',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ appId: appId, status: newStatus }),
            
            success: function(response) {
                if (response.success) {
                    updateColor($dropdown);
                } else {
                    alert('Error: ' + response.message);
                }
            },
            
            error: function(xhr, status, error) {
                console.error("Update failed:", error);
                alert("Connection failed. Please try again.");
            },
            
            complete: function() {
                $dropdown.prop('disabled', false);
            }
        });
    });

    function updateColor($element) {
        const status = $element.val();

        $element.removeClass('text-success text-danger text-warning text-primary border-success border-danger border-warning border-primary');

        switch(status) {
            case 'Accepted':
                $element.addClass('text-success border-success'); 
                break;
            case 'Rejected':
                $element.addClass('text-danger border-danger');   
                break;
            case 'Interviewing':
                $element.addClass('text-warning border-warning');
                break;
            default: 
                $element.addClass('text-primary border-primary');
        }
    }
});