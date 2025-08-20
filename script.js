document.addEventListener('DOMContentLoaded', function() {
    // 1. Sticky/Translucent Navigation on Scroll
    const mainNav = document.getElementById('main-nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { // Add 'scrolled' class after scrolling 50px
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    });

    // 2. Active Tab Highlighting
    const currentPath = window.location.pathname.split('/').pop(); // Gets 'index.html' or 'about.html'

    if (currentPath === 'about.html') {
        const navAbout = document.getElementById('nav-about');
        if (navAbout) {
            navAbout.classList.add('active');
        }
    } else if (currentPath === 'index.html' || currentPath === '') { // Homepage
        // No default active tab on homepage unless specific sections are in view
        // For blog/projects/contact, links are anchored, active class can be added
        // if you implement Intersection Observer for section highlighting.
        // For now, no `active` class on homepage by default.
    }


    // 3. Mobile Dropdown Menu
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });

        // Close menu when a link is clicked (for single page navigation)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                }
            });
        });
    }

    // 4. "Explore Blog" Button Glow and Link
    const exploreBlogBtn = document.getElementById('explore-blog-btn');
    if (exploreBlogBtn) {
        exploreBlogBtn.addEventListener('click', function() {
            const btn = this;
            btn.classList.add('glowing');
            // Timeout matches CSS transition duration for glow
            setTimeout(() => {
                btn.classList.remove('glowing');
                // IMPORTANT: Replace 'YOUR_BLOG_HOME_PAGE_URL' with the actual URL to your blog's homepage.
                window.open('https://raphitotia.wordpress.com/category/blog/', '_blank');
            }, 500); // Glow for 0.5 seconds before opening
        });
    }

    // 5. Email Listing Form Submission (using a placeholder for a real service)
    const emailSubscribeForm = document.getElementById('email-subscribe-form');
    if (emailSubscribeForm) {
        emailSubscribeForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // <--- This line MUST GO for Netlify Forms to work directly

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            // --- IMPORTANT: Replace with your actual email listing service integration ---
            // This is a placeholder. You'll need to integrate with services like
            // Mailchimp, ConvertKit, SendGrid, or Netlify Forms for this to work.
            // Example for Netlify Forms (add data-netlify="true" to your form tag in HTML)
            // Or use a direct POST to your chosen service's API endpoint.

            // For demonstration, simulating an API call:
            try {
                // If using a backend or Netlify Forms, you'd send a POST request.
                // Example for a simple simulation:
                const response = await new Promise(resolve => setTimeout(() => {
                    if (email.includes('@') && email.includes('.')) { // Basic email validation
                        resolve({ ok: true });
                    } else {
                        resolve({ ok: false });
                    }
                }, 1000)); // Simulate network delay

                if (response.ok) {
                    alert('Subscription successful! Thank you for subscribing.');
                    emailInput.value = ''; // Clear the input
                } else {
                    alert('Subscription failed. Please check your email and try again.');
                }
            } catch (error) {
                console.error('Email subscription error:', error);
                alert('An error occurred. Please try again later.');
            }
            // -------------------------------------------------------------------------
        });
    }


    // 6. Contact Form Submission (using Formspree as example)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            const form = this;
            const submitButton = form.querySelector('button[type="submit"]'); // Get the submit button
            const originalButtonText = submitButton.textContent; // Store original text

            const formData = new FormData(form);

            // --- Start Loading State ---
            submitButton.textContent = 'Sending...'; // Change text to "Sending..."
            submitButton.disabled = true; // Disable button
            // You could also add a spinner icon here if you have one (e.g., using FontAwesome)
            // submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            // --- End Loading State ---

            // IMPORTANT: Replace 'YOUR_FORMSPREE_FORM_ID' in index.html with your actual Formspree ID.
            // Go to https://formspree.io/ to get your unique form endpoint.
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree to return JSON
                    }
                });

                if (response.ok) {
                    submitButton.textContent = 'Sent!'; // Change text immediately
                    // Allow a tiny moment for the browser to render the change before the alert
                    await new Promise(resolve => setTimeout(resolve, 50)); // Tiny delay
                    alert('Message sent successfully! I will get back to you shortly.');
                    form.reset(); // Clear the form AFTER the alert is dismissed
                } else {
                    const data = await response.json();
                    submitButton.textContent = 'Not Sent'; // Change text immediately
                    // Allow a tiny moment for the browser to render the change before the alert
                    await new Promise(resolve => setTimeout(resolve, 50)); // Tiny delay

                    if (data.errors) {
                        alert(data.errors.map(error => error.message).join(", "));
                    } else {
                        alert('Oops! There was a problem sending your message.');
                    }
                }
            } catch (error) {
                console.error('Contact form error:', error);
                submitButton.textContent = 'Not Sent'; // Change text immediately
                // Allow a tiny moment for the browser to render the change before the alert
                await new Promise(resolve => setTimeout(resolve, 50)); // Tiny delay
                alert('An error occurred. Please check your internet connection.');
            } finally {
                // This finally block now handles the reverting of text and re-enabling
                // It will execute AFTER the alert is dismissed in both success and failure paths.
                submitButton.textContent = originalButtonText; // Restore original text
                submitButton.disabled = false; // Re-enable button
            }
        });
    }

    // --- 7. Show More/Show Less for Project Card Paragraphs ONLY ---

    // Calculate the target clamped height from CSS
    // This requires getting the computed font-size and line-height of a .card p
    let CARD_P_LINE_HEIGHT_PX = 0;
    let CLAMPED_HEIGHT_TARGET_PX = 0;
    const tempPForMeasurement = document.createElement('p');
    // Apply relevant styles to temp element for accurate line-height measurement
    tempPForMeasurement.style.cssText = `
        font-size: 0.95em; /* Match .card p font-size */
        line-height: 1.5em; /* Match .card p line-height */
        visibility: hidden;
        position: absolute;
        height: auto;
        width: 100px; /* Give it some width to correctly calculate line-height based on font metrics */
        padding: 0; /* Clear any default padding */
        margin: 0; /* Clear any default margin */
    `;
    document.body.appendChild(tempPForMeasurement);
    CARD_P_LINE_HEIGHT_PX = parseFloat(getComputedStyle(tempPForMeasurement).lineHeight);
    // The .5em buffer from CSS `max-height: calc(3 * 1.5em + 0.5em);`
    CLAMPED_HEIGHT_TARGET_PX = (3 * CARD_P_LINE_HEIGHT_PX) + (0.5 * CARD_P_LINE_HEIGHT_PX);
    document.body.removeChild(tempPForMeasurement);

    // Target ONLY project cards for the show more/show less
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const paragraph = card.querySelector('p');

        if (paragraph && paragraph.textContent.trim().length > 0) {
            // Temporarily remove clamping styles to get the full scrollHeight
            const originalWebkitLineClamp = paragraph.style.webkitLineClamp;
            const originalMaxHeight = paragraph.style.maxHeight;
            const originalOverflow = paragraph.style.overflow;
            const originalDisplay = paragraph.style.display;
            const originalWebkitBoxOrient = paragraph.style.webkitBoxOrient;

            paragraph.style.webkitLineClamp = 'unset';
            paragraph.style.maxHeight = 'none';
            paragraph.style.overflow = 'visible';
            paragraph.style.display = 'block'; // Ensure it acts like a block for scrollHeight
            paragraph.style.webkitBoxOrient = 'unset';


            const fullContentHeight = paragraph.scrollHeight;

            // Restore original styles immediately (important for quick UI responsiveness)
            paragraph.style.webkitLineClamp = originalWebkitLineClamp;
            paragraph.style.maxHeight = originalMaxHeight;
            paragraph.style.overflow = originalOverflow;
            paragraph.style.display = originalDisplay;
            paragraph.style.webkitBoxOrient = originalWebkitBoxOrient;


            // Check if the full content height is greater than the calculated 3-line clamped height
            // Add a small tolerance (e.g., 2 pixels) for floating point inaccuracies
            const isOverflowing = fullContentHeight > CLAMPED_HEIGHT_TARGET_PX + 2;


            if (isOverflowing) {
                const toggleSpan = document.createElement('span');
                toggleSpan.classList.add('read-more-toggle');
                toggleSpan.textContent = '...show more';

                // Append the toggle immediately after the paragraph.
                card.appendChild(toggleSpan);

                toggleSpan.addEventListener('click', () => {
                    if (paragraph.classList.contains('expanded')) {
                        // Shrink the paragraph
                        paragraph.classList.remove('expanded');
                        toggleSpan.textContent = '...show more';
                    } else {
                        // Expand the paragraph
                        paragraph.classList.add('expanded');
                        toggleSpan.textContent = 'show less';
                    }
                });
            }
        }
    });
    // --- End Show More/Show Less ---

    // No specific JS needed for card hover effects as they are handled by CSS directly.
    // The blog cards have an invisible overlay link, so clicking anywhere on the card
    // will trigger the link in a new tab.
});



document.addEventListener('DOMContentLoaded', function() {
    const whatIDoItems = document.querySelectorAll('.what-i-do-item');

    whatIDoItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.dataset.target; // Get the ID from data-target
            const descriptionBlock = document.getElementById(targetId);
            const plusIcon = this.querySelector('.plus-icon');

            // Toggle 'active' class on the button itself
            this.classList.toggle('active');

            // Toggle 'show' class on the description block
            if (descriptionBlock.classList.contains('show')) {
                descriptionBlock.classList.remove('show');
                // Optional: reset max-height to 0 for collapsing, though CSS transition handles it well
                descriptionBlock.style.maxHeight = null;
            } else {
                descriptionBlock.classList.add('show');
                // Set max-height to the scrollHeight to enable smooth transition
                // A fixed larger value (e.g., '200px' in CSS) is usually simpler
                // but for dynamic content, scrollHeight is more precise.
                // However, for consistency with CSS transition and simpler management,
                // we'll primarily rely on the max-height value in CSS for `show` class.
                // If content is very dynamic, you might need:
                // descriptionBlock.style.maxHeight = descriptionBlock.scrollHeight + 'px';
            }
        });
    });
});