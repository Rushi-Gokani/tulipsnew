/**
 * Notify Me - Back in stock notification form functionality
 * Handles the notify-me form for out-of-stock products
 */

(function() {
  'use strict';

  class NotifyMeForm {
  constructor(formElement) {
    this.form = formElement;
    this.wrapper = formElement.closest('.notify-me-form-wrapper');
    this.submitBtn = formElement.querySelector('.notify-me-form__submit');
    this.emailInput = formElement.querySelector('input[type="email"]');
    this.messageEl = formElement.querySelector('.notify-me-form__message');
    this.closeBtn = formElement.querySelector('.notify-me-form__close');

    this.init();
  }

  init() {
    // Handle form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Handle close button
    this.closeBtn?.addEventListener('click', () => this.closeForm());

    // Handle trigger buttons
    document.querySelectorAll('.notify-me-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (trigger.classList.contains('notify-me-trigger')) {
          e.preventDefault();
          this.openForm();
        }
      });
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const email = this.emailInput.value.trim();

    // Basic validation
    if (!this.isValidEmail(email)) {
      this.showMessage('Please enter a valid email address.', 'error');
      return;
    }

    // Show loading state
    this.setLoading(true);

    const formData = {
      email: email,
      product_id: this.wrapper.dataset.productId,
      variant_id: this.wrapper.dataset.variantId
    };

    try {
      // Submit to Shopify's contact form or custom endpoint
      const response = await this.submitNotification(formData);

      if (response.success) {
        this.showMessage('Thank you! We\'ll notify you when this product is back in stock.', 'success');
        this.form.reset();
      } else {
        this.showMessage(response.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Notify me submission error:', error);
      this.showMessage('Something went wrong. Please try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  async submitNotification(data) {
    // This is a placeholder implementation
    // You may need to integrate with a third-party service like Klaviyo, Back in Stock, etc.
    // Or use Shopify's built-in contact form

    // Example: Submit to a contact form
    const formData = new FormData();
    formData.append('contact[email]', data.email);
    formData.append('contact[body]', `Notify me when product ${data.product_id} / variant ${data.variant_id} is back in stock.`);

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: 'Failed to submit. Please try again.' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  openForm() {
    this.wrapper?.removeAttribute('hidden');
    this.emailInput?.focus();
  }

  closeForm() {
    this.wrapper?.setAttribute('hidden', '');
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.submitBtn?.setAttribute('disabled', 'disabled');
      this.submitBtn?.classList.add('btn--loading');
      this.submitBtn.querySelector('.loading__spinner')?.classList.remove('hidden');
    } else {
      this.submitBtn?.removeAttribute('disabled');
      this.submitBtn?.classList.remove('btn--loading');
      this.submitBtn.querySelector('.loading__spinner')?.classList.add('hidden');
    }
  }

  showMessage(message, type = 'info') {
    if (!this.messageEl) return;

    this.messageEl.textContent = message;
    this.messageEl.hidden = false;
    this.messageEl.className = `notify-me-form__message notify-me-form__message--${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.closeForm();
        this.messageEl.hidden = true;
      }, 5000);
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Initialize all notify-me forms on the page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.notify-me-form').forEach(form => {
    new NotifyMeForm(form);
  });
});

// Handle dynamic content (for quick view, variant changes, etc.)
const observer = new MutationObserver(() => {
  document.querySelectorAll('.notify-me-form:not([data-initialized])').forEach(form => {
    form.dataset.initialized = 'true';
    new NotifyMeForm(form);
  });
});

observer.observe(document.body, { childList: true, subtree: true });

})();
