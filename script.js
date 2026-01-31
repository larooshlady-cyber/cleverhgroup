/**
 * Clever H Group - Landing Page JavaScript
 * Handles animations, scroll effects, mobile menu, and form validation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initHeader();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initSmoothScroll();
    initContactForm();
    initParallaxElements();
    initStaggerAnimations();
});

/**
 * Header scroll behavior
 */
function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    const handleScroll = () => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class based on scroll position
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    };

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial check
    handleScroll();
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('a');
    const header = document.getElementById('header');

    const toggleMenu = () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';

        // Ensure header is visible when menu is open
        if (mobileMenu.classList.contains('active')) {
            header.classList.add('scrolled');
        } else if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        }
    };

    menuBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
}

/**
 * Enhanced scroll reveal animations with different effects
 */
function initScrollReveal() {
    // Basic reveal elements
    const reveals = document.querySelectorAll('.reveal');

    // Fade up elements
    const fadeUps = document.querySelectorAll('.fade-up');

    // Fade in elements
    const fadeIns = document.querySelectorAll('.fade-in');

    // Scale in elements
    const scaleIns = document.querySelectorAll('.scale-in');

    // Slide in from left
    const slideLefts = document.querySelectorAll('.slide-left');

    // Slide in from right
    const slideRights = document.querySelectorAll('.slide-right');

    const revealElement = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };

    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(revealElement, observerOptions);

    // Observe all animated elements
    [...reveals, ...fadeUps, ...fadeIns, ...scaleIns, ...slideLefts, ...slideRights].forEach(el => {
        observer.observe(el);
    });
}

/**
 * Stagger animations for grid items
 */
function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');

    staggerContainers.forEach(container => {
        const items = container.querySelectorAll('.stagger-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.18}s`;
                        item.classList.add('active');
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(container);
    });
}

/**
 * Parallax effect for elements with data-parallax attribute
 */
function initParallaxElements() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    const handleParallax = () => {
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const windowCenterY = window.innerHeight / 2;
            const offset = (centerY - windowCenterY) * speed;

            el.style.transform = `translateY(${offset}px)`;
        });
    };

    // Throttle for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Animated counters in About section
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number, .stat-card-number');

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Contact form handling with validation
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name: {
            element: document.getElementById('name'),
            validate: (value) => {
                if (!value.trim()) return 'Please enter your name';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return null;
            }
        },
        company: {
            element: document.getElementById('company'),
            validate: (value) => {
                if (!value.trim()) return 'Please enter your company name';
                return null;
            }
        },
        email: {
            element: document.getElementById('email'),
            validate: (value) => {
                if (!value.trim()) return 'Please enter your email address';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return null;
            }
        }
    };

    // Real-time validation on blur
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        field.element.addEventListener('blur', () => {
            validateField(field);
        });

        // Clear error on input
        field.element.addEventListener('input', () => {
            const group = field.element.closest('.form-group');
            group.classList.remove('error');
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual endpoint)
        try {
            await simulateFormSubmission();
            showFormSuccess(form);
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            alert('There was an error submitting the form. Please try again.');
        }
    });
}

/**
 * Validate a single field
 */
function validateField(field) {
    const value = field.element.value;
    const error = field.validate(value);
    const group = field.element.closest('.form-group');
    const errorMessage = group.querySelector('.error-message');

    if (error) {
        group.classList.add('error');
        errorMessage.textContent = error;
        return false;
    } else {
        group.classList.remove('error');
        errorMessage.textContent = '';
        return true;
    }
}

/**
 * Simulate form submission delay
 */
function simulateFormSubmission() {
    return new Promise((resolve) => {
        setTimeout(resolve, 1500);
    });
}

/**
 * Show success message after form submission
 */
function showFormSuccess(form) {
    const formParent = form.parentElement;

    // Hide the form
    form.style.display = 'none';

    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <div class="form-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        </div>
        <h3>Thank You!</h3>
        <p>Your consultation request has been received. Our team will be in touch within 24 hours.</p>
    `;

    // Add success message
    formParent.appendChild(successMessage);

    // Hide the form note
    const formNote = formParent.querySelector('.form-note');
    if (formNote) {
        formNote.style.display = 'none';
    }
}

/**
 * Video modal functionality (for About section)
 */
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            alert('Video functionality would open a modal player here. Replace this with your actual video implementation.');
        });
    }
});

/**
 * Lazy loading for images (performance optimization)
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Add subtle hover effects to interactive elements
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            button.style.setProperty('--ripple-x', x + 'px');
            button.style.setProperty('--ripple-y', y + 'px');
        });
    });
});

/**
 * Keyboard navigation improvements
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add focus styles for keyboard navigation
    document.body.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.body.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
});

/**
 * Performance: Debounce utility
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Performance: Throttle utility
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
