/**
 * PULSE LANDING PAGE - JavaScript
 * Interactivity, Dark Mode, Animations, Accessibility
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        scrollOffset: 100,
        animationThreshold: 0.1,
        animationRootMargin: '0px 0px -50px 0px',
        debounceDelay: 150
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        body: document.body,
        navbar: document.querySelector('.navbar'),
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        themeToggle: document.querySelector('.theme-toggle'),
        navLinks: document.querySelectorAll('.nav-link'),
        scrollIndicator: document.querySelector('.scroll-indicator'),
        aosElements: document.querySelectorAll('[data-aos]'),
        form: document.getElementById('participar-form'),
        modal: document.getElementById('success-modal'),
        modalClose: document.querySelector('.modal-close'),
        stepConnectors: document.querySelectorAll('.step-connector')
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * Debounce function to limit execution rate
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
     * Throttle function for scroll events
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

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    
    const ThemeManager = {
        key: 'pulse-theme',
        
        /**
         * Initialize theme based on saved preference or system preference
         */
        init() {
            const savedTheme = localStorage.getItem(this.key);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
                this.set(savedTheme);
            } else if (systemPrefersDark) {
                this.set('dark');
            }
            
            this.bindEvents();
        },
        
        /**
         * Set theme
         */
        set(theme) {
            if (theme === 'dark') {
                elements.body.setAttribute('data-theme', 'dark');
                elements.themeToggle.setAttribute('aria-pressed', 'true');
            } else {
                elements.body.removeAttribute('data-theme');
                elements.themeToggle.setAttribute('aria-pressed', 'false');
            }
            localStorage.setItem(this.key, theme);
        },
        
        /**
         * Toggle between light and dark themes
         */
        toggle() {
            const currentTheme = elements.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.set(newTheme);
            
            // Announce theme change for screen readers
            this.announceChange(newTheme);
        },
        
        /**
         * Announce theme change to screen readers
         */
        announceChange(theme) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'visually-hidden';
            announcement.textContent = `Tema alterado para ${theme === 'dark' ? 'escuro' : 'claro'}`;
            elements.body.appendChild(announcement);
            
            setTimeout(() => announcement.remove(), 1000);
        },
        
        /**
         * Bind theme toggle events
         */
        bindEvents() {
            elements.themeToggle.addEventListener('click', () => this.toggle());
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.key)) {
                    this.set(e.matches ? 'dark' : 'light');
                }
            });
        }
    };

    // ============================================
    // NAVIGATION
    // ============================================
    
    const Navigation = {
        /**
         * Initialize navigation functionality
         */
        init() {
            this.bindScrollEvent();
            this.bindMobileMenu();
            this.bindSmoothScroll();
            this.highlightActiveSection();
        },
        
        /**
         * Handle navbar scroll effects
         */
        bindScrollEvent() {
            const handleScroll = throttle(() => {
                const scrollY = window.scrollY;
                
                // Add scrolled class for navbar styling
                if (scrollY > 50) {
                    elements.navbar.classList.add('scrolled');
                } else {
                    elements.navbar.classList.remove('scrolled');
                }
                
                // Hide scroll indicator after scrolling
                if (scrollY > 100 && elements.scrollIndicator) {
                    elements.scrollIndicator.style.opacity = '0';
                } else if (elements.scrollIndicator) {
                    elements.scrollIndicator.style.opacity = '1';
                }
            }, 100);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
        },
        
        /**
         * Mobile menu toggle
         */
        bindMobileMenu() {
            if (!elements.navToggle) return;
            
            elements.navToggle.addEventListener('click', () => {
                const isExpanded = elements.navToggle.getAttribute('aria-expanded') === 'true';
                elements.navToggle.setAttribute('aria-expanded', !isExpanded);
                elements.navMenu.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                elements.body.style.overflow = isExpanded ? '' : 'hidden';
            });
            
            // Close menu on link click
            elements.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    elements.navToggle.setAttribute('aria-expanded', 'false');
                    elements.navMenu.classList.remove('active');
                    elements.body.style.overflow = '';
                });
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.navMenu.classList.contains('active')) {
                    elements.navToggle.setAttribute('aria-expanded', 'false');
                    elements.navMenu.classList.remove('active');
                    elements.body.style.overflow = '';
                    elements.navToggle.focus();
                }
            });
        },
        
        /**
         * Smooth scroll to sections
         */
        bindSmoothScroll() {
            elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;
                            window.scrollTo({
                                top: offsetTop,
                                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
                            });
                        }
                    }
                });
            });
        },
        
        /**
         * Highlight active navigation item based on scroll position
         */
        highlightActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            
            const observerOptions = {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        elements.navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, observerOptions);
            
            sections.forEach(section => observer.observe(section));
        }
    };

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    
    const ScrollAnimations = {
        /**
         * Initialize scroll-triggered animations
         */
        init() {
            if (prefersReducedMotion()) {
                // Show all elements immediately if user prefers reduced motion
                elements.aosElements.forEach(el => {
                    el.classList.add('aos-animate');
                });
                return;
            }
            
            this.setupIntersectionObserver();
            this.setupStepConnectorAnimations();
        },
        
        /**
         * Setup Intersection Observer for AOS elements
         */
        setupIntersectionObserver() {
            const observerOptions = {
                root: null,
                rootMargin: CONFIG.animationRootMargin,
                threshold: CONFIG.animationThreshold
            };
            
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.getAttribute('data-aos-delay') || 0;
                        
                        setTimeout(() => {
                            entry.target.classList.add('aos-animate');
                        }, parseInt(delay));
                        
                        // Unobserve after animation
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            elements.aosElements.forEach(el => observer.observe(el));
        },
        
        /**
         * Animate step connectors on scroll
         */
        setupStepConnectorAnimations() {
            const steps = document.querySelectorAll('.step');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        const connector = entry.target.querySelector('.step-connector');
                        if (connector) {
                            setTimeout(() => {
                                connector.style.opacity = '1';
                                connector.style.transform = 'translateX(0)';
                            }, index * 200);
                        }
                    }
                });
            }, { threshold: 0.5 });
            
            steps.forEach(step => {
                const connector = step.querySelector('.step-connector');
                if (connector) {
                    connector.style.opacity = '0';
                    connector.style.transform = 'translateX(-20px)';
                    connector.style.transition = 'all 0.5s ease';
                }
                observer.observe(step);
            });
        }
    };

    // ============================================
    // FORM HANDLING
    // ============================================
    
    const FormHandler = {
        /**
         * Initialize form functionality
         */
        init() {
            if (!elements.form) return;
            
            this.bindSubmitEvent();
            this.bindInputValidation();
        },
        
        /**
         * Handle form submission
         */
        bindSubmitEvent() {
            elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.validateForm()) {
                    this.handleSuccess();
                }
            });
        },
        
        /**
         * Validate form inputs
         */
        validateForm() {
            let isValid = true;
            const inputs = elements.form.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    this.showFieldError(input);
                } else {
                    this.clearFieldError(input);
                    
                    // Email validation
                    if (input.type === 'email' && !this.isValidEmail(input.value)) {
                        isValid = false;
                        this.showFieldError(input, 'Por favor, insira um e-mail válido');
                    }
                }
            });
            
            return isValid;
        },
        
        /**
         * Check if email is valid
         */
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        /**
         * Show field error
         */
        showFieldError(input, message = 'Este campo é obrigatório') {
            input.style.borderColor = '#ef4444';
            
            // Remove existing error message
            const existingError = input.parentElement.querySelector('.field-error');
            if (existingError) existingError.remove();
            
            // Add error message
            const error = document.createElement('span');
            error.className = 'field-error';
            error.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
            error.textContent = message;
            input.parentElement.appendChild(error);
            
            // Announce error for screen readers
            input.setAttribute('aria-invalid', 'true');
        },
        
        /**
         * Clear field error
         */
        clearFieldError(input) {
            input.style.borderColor = '';
            const error = input.parentElement.querySelector('.field-error');
            if (error) error.remove();
            input.setAttribute('aria-invalid', 'false');
        },
        
        /**
         * Handle successful form submission
         */
        handleSuccess() {
            // Get form data
            const formData = new FormData(elements.form);
            const data = Object.fromEntries(formData);
            
            // Log data (replace with actual API call)
            console.log('Form submitted:', data);
            
            // Show success modal
            this.showModal();
            
            // Reset form
            elements.form.reset();
        },
        
        /**
         * Show success modal
         */
        showModal() {
            if (!elements.modal) return;
            
            elements.modal.classList.add('active');
            elements.modal.setAttribute('aria-hidden', 'false');
            
            // Focus on close button for accessibility
            if (elements.modalClose) {
                setTimeout(() => elements.modalClose.focus(), 100);
            }
            
            // Trap focus within modal
            this.trapFocus(elements.modal);
        },
        
        /**
         * Close modal
         */
        closeModal() {
            if (!elements.modal) return;
            
            elements.modal.classList.remove('active');
            elements.modal.setAttribute('aria-hidden', 'true');
            
            // Return focus to form submit button
            const submitBtn = elements.form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.focus();
        },
        
        /**
         * Trap focus within modal for accessibility
         */
        trapFocus(modal) {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            });
        },
        
        /**
         * Bind input validation on blur
         */
        bindInputValidation() {
            const inputs = elements.form.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (!input.value.trim()) {
                        this.showFieldError(input);
                    } else {
                        this.clearFieldError(input);
                    }
                });
                
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        this.clearFieldError(input);
                    }
                });
            });
        },
        
        /**
         * Bind modal close events
         */
        bindModalEvents() {
            if (!elements.modalClose) return;
            
            elements.modalClose.addEventListener('click', () => this.closeModal());
            
            // Close on overlay click
            elements.modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    };

    // ============================================
    // MICROINTERACTIONS
    // ============================================
    
    const MicroInteractions = {
        /**
         * Initialize microinteractions
         */
        init() {
            this.addCardHoverEffects();
            this.addButtonRippleEffect();
            this.addParallaxEffect();
        },
        
        /**
         * Add hover effects to cards
         */
        addCardHoverEffects() {
            const cards = document.querySelectorAll('.sobre-card, .beneficio-item, .publico-card');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = card.classList.contains('beneficio-item') 
                        ? 'translateX(8px)' 
                        : 'translateY(-8px)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                });
            });
        },
        
        /**
         * Add ripple effect to buttons
         */
        addButtonRippleEffect() {
            const buttons = document.querySelectorAll('.btn');
            
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const ripple = document.createElement('span');
                    ripple.style.cssText = `
                        position: absolute;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                        left: ${x}px;
                        top: ${y}px;
                        width: 100px;
                        height: 100px;
                        margin-left: -50px;
                        margin-top: -50px;
                    `;
                    
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);
                    
                    setTimeout(() => ripple.remove(), 600);
                });
            });
            
            // Add ripple animation keyframes
            if (!document.querySelector('#ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        /**
         * Add subtle parallax effect to hero orbs
         */
        addParallaxEffect() {
            if (prefersReducedMotion()) return;
            
            const orbs = document.querySelectorAll('.gradient-orb');
            
            const handleMouseMove = throttle((e) => {
                const { clientX, clientY } = e;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                orbs.forEach((orb, index) => {
                    const speed = (index + 1) * 0.02;
                    const x = (clientX - centerX) * speed;
                    const y = (clientY - centerY) * speed;
                    
                    orb.style.transform = `translate(${x}px, ${y}px)`;
                });
            }, 50);
            
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
        }
    };

    // ============================================
    // PERFORMANCE UTILITIES
    // ============================================
    
    const PerformanceUtils = {
        /**
         * Lazy load images and iframes
         */
        lazyLoad() {
            const lazyElements = document.querySelectorAll('[data-src]');
            
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            el.src = el.dataset.src;
                            el.removeAttribute('data-src');
                            observer.unobserve(el);
                        }
                    });
                });
                
                lazyElements.forEach(el => observer.observe(el));
            } else {
                // Fallback for older browsers
                lazyElements.forEach(el => {
                    el.src = el.dataset.src;
                });
            }
        },
        
        /**
         * Prefetch visible links for faster navigation
         */
        prefetchLinks() {
            const links = document.querySelectorAll('a[href^="#"]');
            
            links.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    const href = link.getAttribute('href');
                    if (href && href !== '#') {
                        const target = document.querySelector(href);
                        if (target) {
                            // Pre-calculate position
                            target.getBoundingClientRect();
                        }
                    }
                });
            });
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        // Initialize all modules
        ThemeManager.init();
        Navigation.init();
        ScrollAnimations.init();
        FormHandler.init();
        FormHandler.bindModalEvents();
        MicroInteractions.init();
        PerformanceUtils.lazyLoad();
        PerformanceUtils.prefetchLinks();
        
        // Console greeting
        console.log('%c Pulse ', 'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
        console.log('%cTecnologia que cuida, inovação que transforma.', 'font-size: 14px; color: #6366f1;');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose to global scope for debugging
    window.PulseApp = {
        theme: ThemeManager,
        navigation: Navigation,
        animations: ScrollAnimations,
        form: FormHandler
    };

})();
