document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const originalText = btn.textContent;
    btn.textContent = "SENDING...";
    btn.disabled = true;

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
        // 1. Send to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showToast('Message sent successfully!', 'success');
            
            // 2. Save to Database (Backup)
            // We use the simpler object for our API
            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formObject.name,
                    email: formObject.email,
                    message: formObject.message
                })
            }).catch(err => console.error("DB Save Error:", err)); // Non-blocking

            document.getElementById('contact-form').reset();
        } else {
            console.error("Web3Forms Error:", result);
            showToast(result.message || 'Failed to send message', 'error');
        }

    } catch (error) {
        console.error('Network Error:', error);
        showToast('Network error, please try again.', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});