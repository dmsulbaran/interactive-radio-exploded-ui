/**
 * DevNexus Portfolio - Lógica de Interactividad
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticleBackground();
    initConsoleSim();
    initProjectFilter();
    initContactForm();
});

/* ==========================================================================
   NAVEGACIÓN: SCROLL Y MENÚ MÓVIL
   ========================================================================== */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Efecto de navbar compacta al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Resaltar sección activa en el menú
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Toggle del menú móvil
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   FONDO DE PARTÍCULAS INTERACTIVO (CANVAS)
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 100; // Menos partículas en móvil

    // Mouse coords
    let mouse = {
        x: null,
        y: null,
        radius: 120 // Radio de interacción
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Ajustar tamaño del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Clase Partícula
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
            this.color = 'rgba(0, 242, 254, 0.4)';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Movimiento normal
            this.x += this.vx;
            this.y += this.vy;

            // Rebotar en bordes
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Interacción con mouse (repulsión suave)
            if (mouse.x != null && mouse.y != null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    // Fuerza máxima en el centro del mouse, decae hacia los bordes
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * 1.5;
                    let directionY = forceDirectionY * force * 1.5;

                    this.x += directionX;
                    this.y += directionY;
                }
            }
        }
    }

    // Inicializar
    function init() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Dibujar líneas de conexión entre partículas
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                const connectionLimit = 150;
                if (distance < connectionLimit) {
                    opacityValue = 1 - (distance / connectionLimit);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ==========================================================================
   CONSOLA DE IA INTERACTIVA (SIMULADOR DE PROMPT Y RESPUESTAS)
   ========================================================================== */
function initConsoleSim() {
    const consoleBody = document.getElementById('console-body');
    if (!consoleBody) return;

    // Diálogos de simulación
    const steps = [
        {
            type: 'input',
            text: 'user> gemini --about-skills'
        },
        {
            type: 'gemini',
            text: 'gemini> Procesando solicitud de habilidades full-stack...'
        },
        {
            type: 'result',
            lines: [
                '✔ Front-end: React, Responsive CSS (Avanzado)',
                '✔ Back-end: Node.js, Express, REST APIs (Escalable)',
                '✔ Bases de datos: SQL (PostgreSQL), NoSQL (MongoDB)',
                '✔ Integración de Inteligencia Artificial activa.'
            ]
        },
        {
            type: 'input',
            text: 'user> gemini --prompt-engineering-demo'
        },
        {
            type: 'gemini',
            text: 'gemini> Simulando optimización de prompt con Few-Shot...'
        },
        {
            type: 'result',
            lines: [
                'Entrada: "Haz un resumen de ventas"',
                'Prompt Optimizado:',
                '  "Rol: Analista de Negocios.',
                '   Tarea: Resume los datos de ventas del Q2.',
                '   Formato: Tabla con ingresos y porcentaje de cambio.',
                '   Contexto: Ignora transacciones pendientes."',
                'Resultado: Datos estructurados limpios y listos para DB.'
            ]
        },
        {
            type: 'input',
            text: 'user> gemini --search-google "Google Search Integration"'
        },
        {
            type: 'gemini',
            text: 'gemini> Conectando a Google Search API en tiempo real...'
        },
        {
            type: 'result',
            lines: [
                'Buscando: "Google Search Integration + LLM retrieval"',
                'Respuesta de Gemini enriquecida:',
                '  "La búsqueda web proporciona a los LLMs',
                '   información actualizada. Al integrar Google Search,',
                '   el agente puede responder con precisión sobre eventos',
                '   recientes y validar hechos dinámicamente."'
            ]
        }
    ];

    let currentStep = 0;

    // Función auxiliar para simular retraso de escritura
    function typeWriter(element, text, index, speed, callback) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => {
                typeWriter(element, text, index + 1, speed, callback);
            }, speed);
        } else if (callback) {
            callback();
        }
    }

    // Ejecuta un paso de la secuencia
    function executeStep() {
        // Limpiar consola al reiniciar el ciclo
        if (currentStep >= steps.length) {
            currentStep = 0;
            consoleBody.innerHTML = `
                <div class="console-line system-line">Initializing Gemini Integration Hub...</div>
                <div class="console-line system-line">Connecting to Google Search Engine API...</div>
                <div class="console-line system-line">Status: <span class="status-online">ONLINE</span></div>
                <div class="console-line spacer"></div>
            `;
            setTimeout(executeStep, 1500);
            return;
        }

        const step = steps[currentStep];
        const lineDiv = document.createElement('div');

        if (step.type === 'input') {
            lineDiv.className = 'console-line user-line';
            consoleBody.appendChild(lineDiv);

            // Añadir cursor dinámico durante la escritura
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'cursor';
            lineDiv.appendChild(cursorSpan);

            typeWriter(lineDiv, step.text, 0, 40, () => {
                cursorSpan.remove();
                currentStep++;
                setTimeout(executeStep, 1000);
            });

        } else if (step.type === 'gemini') {
            lineDiv.className = 'console-line gemini-line';
            consoleBody.appendChild(lineDiv);

            typeWriter(lineDiv, step.text, 0, 30, () => {
                currentStep++;
                setTimeout(executeStep, 1000);
            });

        } else if (step.type === 'result') {
            lineDiv.className = 'console-line result-line';
            consoleBody.appendChild(lineDiv);

            let lineIndex = 0;
            function printResultLine() {
                if (lineIndex < step.lines.length) {
                    const lineContent = document.createElement('div');
                    lineContent.style.opacity = '0';
                    lineContent.style.transform = 'translateY(4px)';
                    lineContent.style.transition = 'all 0.3s ease';
                    lineContent.textContent = step.lines[lineIndex];

                    lineDiv.appendChild(lineContent);

                    // Trigger reflow/animation
                    setTimeout(() => {
                        lineContent.style.opacity = '1';
                        lineContent.style.transform = 'translateY(0)';
                    }, 50);

                    lineIndex++;
                    setTimeout(printResultLine, 400); // Retraso entre líneas
                } else {
                    currentStep++;
                    // Auto-scroll al fondo
                    consoleBody.scrollTop = consoleBody.scrollHeight;
                    setTimeout(executeStep, 2500); // Esperar un momento antes del siguiente comando
                }
                consoleBody.scrollTop = consoleBody.scrollHeight;
            }

            printResultLine();
        }

        consoleBody.scrollTop = consoleBody.scrollHeight;
    }

    // Iniciar simulación con un retraso inicial
    setTimeout(executeStep, 2000);
}

/* ==========================================================================
   FILTRO DE PROYECTOS EN LA GALERÍA
   ========================================================================== */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase active a todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase active al botón pulsado
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                // Efecto de desvanecimiento
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(10px)';

                setTimeout(() => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        // Trigger fade in
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1) translateY(0)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });
}

/* ==========================================================================
   FORMULARIO DE CONTACTO (VALIDACIÓN E INTEGRACIÓN REAL CON FORMSPREE)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const statusAlert = document.getElementById('form-status');

    if (!form || !statusAlert) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar envío por defecto brusco

        // Obtener inputs
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();

        // Validaciones básicas adicionales
        if (!name || !email || !subject || !message) {
            showStatus('Por favor, rellena todos los campos.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showStatus('Ingresa un correo electrónico válido.', 'error');
            return;
        }

        // Mostrar estado de envío real
        showStatus('Enviando mensaje...', 'sending');

        // Bloquear botón de envío temporalmente para evitar doble clic
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) submitBtn.disabled = true;

        // Recolectar los datos para Formspree
        const data = new FormData(event.target);

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Envío exitoso real
                showStatus('¡Mensaje enviado con éxito! Me pondré en contacto contigo pronto.', 'success');
                form.reset(); // Limpiar campos
            } else {
                // Si Formspree responde con un error
                showStatus('Oops! Ocurrió un problema al procesar el envío.', 'error');
            }
        } catch (error) {
            // Error de red/conexión
            showStatus('Hubo un problema de conexión. Inténtalo de nuevo.', 'error');
        } finally {
            // Desbloquear el botón al terminar el proceso
            if (submitBtn) submitBtn.disabled = false;

            // Ocultar la alerta automáticamente después de 6 segundos
            setTimeout(() => {
                statusAlert.style.display = 'none';
            }, 6000);
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showStatus(text, type) {
        statusAlert.style.display = 'block'; // Nos aseguramos de volver a mostrarlo si estaba oculto
        statusAlert.textContent = text;
        statusAlert.className = 'form-status-alert ' + type;
    }
}