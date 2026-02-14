// Handle notify me form submissions with AJAX
document.addEventListener('DOMContentLoaded', function() {
  // Handle all notify me forms
  document.addEventListener('submit', async function(e) {
    const form = e.target;
    
    // Check if this is a notify me form
    if (!form.classList.contains('notify-me-form') || !form.id.includes('notify-me-form')) {
      return;
    }
    
    e.preventDefault();
    
    const submitButton = form.querySelector('.notify-me-form__submit');
    const buttonText = submitButton.querySelector('.button-text');
    const spinner = submitButton.querySelector('.loading__spinner');
    const formWrapper = form.closest('.notify-me-form-wrapper');
    
    // Show loading state
    submitButton.disabled = true;
    buttonText.textContent = 'Submitting...';
    if (spinner) spinner.classList.remove('hidden');
    
    try {
      // Submit form with AJAX
      const formData = new FormData(form);
      
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      // Check if submission was successful
      if (response.ok || response.redirected) {
        // Show success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'notify-me-form__message success';
        messageDiv.textContent = 'Success! You\'ll be notified when this item is back in stock.';
        messageDiv.style.marginBottom = '1rem';
        
        // Insert message at the top of the form
        form.insertBefore(messageDiv, form.firstChild);
        
        // Clear the email field
        form.querySelector('input[type="email"]').value = '';
        
        // Hide the form after 3 seconds
        setTimeout(() => {
          if (formWrapper) {
            formWrapper.hidden = true;
            // Remove the success message for next time
            messageDiv.remove();
          }
        }, 3000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Show error message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'notify-me-form__message error';
      messageDiv.textContent = 'Sorry, there was an error. Please try again.';
      messageDiv.style.marginBottom = '1rem';
      
      // Insert message at the top of the form
      const existingMessage = form.querySelector('.notify-me-form__message');
      if (existingMessage) {
        existingMessage.remove();
      }
      form.insertBefore(messageDiv, form.firstChild);
    } finally {
      // Reset button state
      submitButton.disabled = false;
      buttonText.textContent = 'Notify me';
      if (spinner) spinner.classList.add('hidden');
    }
  });
});