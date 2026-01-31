/* ========================================
   H Green - JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initStaggerAnimations();
    initFormHandling();
    initActiveNavLink();
});

/* Header Scroll Effect */
function initHeader() {
    const header = document.getElementById('header');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* Mobile Menu Toggle */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        const links = menu.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

/* Smooth Scroll for Anchor Links */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* Scroll Reveal Animation */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.reveal, .fade-up, .fade-in, .scale-in, .slide-left, .slide-right');
    animatedElements.forEach(el => observer.observe(el));
}

/* Stagger Animations for Grid Items */
function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    staggerContainers.forEach(container => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = container.querySelectorAll('.stagger-item');
                    items.forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.18}s`;
                        item.classList.add('active');
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observer.observe(container);
    });
}

/* Form Handling */
function initFormHandling() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Simple form validation
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;

            if (name && email) {
                // Show success message
                form.innerHTML = `
                    <div class="form-success">
                        <div class="form-success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h3>Thank You!</h3>
                        <p>We'll contact you shortly to schedule your free building checkup.</p>
                    </div>
                `;
            }
        });
    }
}

/* Active Nav Link on Scroll */
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
}

/* Form Success Styles (added dynamically) */
const formSuccessStyles = `
    .form-success {
        text-align: center;
        padding: 2rem;
    }

    .form-success-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1.5rem;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #10b981;
    }

    .form-success-icon svg {
        width: 32px;
        height: 32px;
    }

    .form-success h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
    }

    .form-success p {
        font-size: 0.875rem;
        color: #6b7280;
    }
`;

// Inject form success styles
const styleSheet = document.createElement('style');
styleSheet.textContent = formSuccessStyles;
document.head.appendChild(styleSheet);
