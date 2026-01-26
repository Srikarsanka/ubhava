// EmailJS Configuration
// Initialize EmailJS with your public key
(function() {
    emailjs.init("IBcupjq3vfhwdHFcN"); // Your EmailJS public key
})();

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';
    formStatus.textContent = '';
    formStatus.style.color = '#4a0101';
    
    // Get form data
    const formData = {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        message: document.getElementById('message').value,
        to_name: 'UDBHAVA Team',
        to_email: 'sankasrikar048@gmail.com' // Your email where you'll receive messages
    };
    
    // Send email using EmailJS
    emailjs.send('service_61gqecw', 'template_5xxq65d', formData)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            
            // Show success message
            formStatus.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
            formStatus.style.color = '#28a745';
            
            // Reset form
            document.getElementById('contact-form').reset();
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'SUBMIT';
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000);
            
        }, function(error) {
            console.log('FAILED...', error);
            
            // Show error message
            formStatus.textContent = '✗ Failed to send message. Please try again or email us directly.';
            formStatus.style.color = '#dc3545';
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'SUBMIT';
        });
});