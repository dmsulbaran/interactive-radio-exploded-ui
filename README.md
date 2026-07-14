# 📻 Interactive 3D Radio Experience - Personal Portfolio Portal

¡Bienvenido! Este proyecto es una experiencia web interactiva tridimensional desarrollada con **React, Three.js y React Three Fiber (R3F)**. Funciona como una introducción inmersiva y gamificada a mi portafolio profesional, donde el usuario interactúa con un modelo 3D de una radio vintage de dinamo hasta desarmarla en gravedad cero para revelar el acceso a mis proyectos principales.

## 🚀 Características Principales

*   **Renderizado 3D de Alta Fidelidad:** Modelo optimizado con texturas metálicas, de desgaste y materiales reflectantes bajo un esquema de iluminación de estudio (luces frontales, cenitales y de recorte).
*   **Mecánicas por Fases (State Machine):**
    *   **Fase 0 (Apagado):** La radio se presenta estática en un entorno minimalista negro.
    *   **Fase 1 (Búsqueda de Señal):** Al hacer clic en la perilla de volumen (`Object_52`), se activa un bucle de audio de estática y la aguja física (`Object_40`) oscila en tiempo real.
    *   **Fase 2 (Sintonización Activa):** El segundo clic detiene la estática, arranca la locución de mi marca personal, la palanca de dinamo se anima y el dial de sintonización (`Object_48`) brilla con un material emisivo turquesa neón proyectando un marquee HTML de mi stack tecnológico.
    *   **Fase 3 (Despiece / Vista Explotada):** Al hacer clic en cualquier otra sección del cuerpo de la radio, suena un disparo que desvanece el chasis exterior y separa los componentes internos (PCB, linterna LED y antena) de forma compacta en el eje Y mediante interpolación lineal (*Lerp*).
*   **Controles de Órbita Libres:** OrbitControls se mantiene activo en la fase final para permitir al usuario rotar, hacer zoom y explorar los fragmentos flotantes metálicos desde cualquier ángulo.
*   **Oclusión Avanzada de Capas (Blender-like depth):** El marquee de tecnologías está integrado físicamente en el dial con propiedades de oclusión, lo que permite que la perilla pase por delante al rotar y que el texto se oculte de forma realista al ver la radio por detrás.
*   **Interfaz Minimalista:** Barra lateral inferior izquierda con iconos cromados pulidos y reflectantes para conectar directamente a mis redes principales (X, LinkedIn, Discord y GitHub).
*   **Portal de Cierre:** Revelación de un enlace dinámico en la esquina inferior derecha que actúa como el llamado a la acción (CTA) final para navegar hacia mi portafolio interactivo clásico.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React, HTML5, CSS3, Tailwind CSS.
*   **Gráficos 3D:** Three.js, React Three Fiber (R3F), @react-three/drei.
*   **Audio:** Howler.js (Gestión de bucles y precarga de clips de audio de alta fidelidad).
*   **Herramientas de Compilación:** Vite.

## 📦 Instalación y Configuración Local

Si deseas clonar este repositorio y ejecutarlo en tu servidor local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/dmsulbaran/TU_REPOSITORIO.git](https://github.com/dmsulbaran/TU_REPOSITORIO.git)
   cd TU_REPOSITORIO