# Runaway - Proyecto Final de Interfaz Dinámica

## Descripción del Proyecto
Runaway es un videojuego de navegador de estilo "endless runner" con estética neón, desarrollado íntegramente utilizando la API Canvas de HTML5. El objetivo del proyecto es demostrar la manipulación avanzada del DOM, el uso de lógica de programación orientada a objetos en JavaScript y la persistencia de datos mediante LocalStorage.

El juego sitúa al usuario en un túnel infinito tridimensional generado matemáticamente, donde controla un avión de papel que debe esquivar obstáculos a velocidades crecientes. El proyecto incluye un sistema completo de gestión de usuarios, permitiendo el registro, inicio de sesión y personalización de la interfaz y elementos del juego.

## Mecánicas Principales
El núcleo del juego se basa en un bucle de renderizado constante que actualiza la lógica y los gráficos en cada fotograma. Las mecánicas implementadas incluyen:

* **Perspectiva y Profundidad:** Simulación de un entorno 3D mediante cálculos de proyección en un plano 2D (Canvas). Los elementos se escalan y posicionan en función de su coordenada Z (profundidad).
* **Generación de Obstáculos:** Sistema aleatorio que genera dos tipos de peligros:
    * Figuras geométricas: Objetos que restan 1 punto de vida.
    * Paredes estructurales: Obstáculos que bloquean secciones del túnel y restan 2 puntos de vida.
* **Sistema de Vidas y Puntuación:** El jugador comienza con 3 vidas. La puntuación aumenta progresivamente con el tiempo de supervivencia.
* **Dificultad Progresiva:** Selección de dificultad (Fácil, Normal, Difícil) que altera la velocidad de desplazamiento de los elementos y la frecuencia de aparición de obstáculos.
* **Gestión de Sesión:** Sistema de autenticación que valida credenciales y mantiene la sesión activa entre recargas.
* **Persistencia de Datos:** Uso de LocalStorage para guardar:
    * Base de datos de usuarios registrados.
    * Preferencias de personalización (Color de la nave y del entorno).
    * Historial de partidas con fecha, dificultad y puntaje.

## Cómo Jugar
1.  **Registro/Inicio de Sesión:** Al abrir la aplicación, el usuario debe crear una cuenta o ingresar con una existente. Durante el registro, puede seleccionar dos colores de preferencia (Principal y Secundario).
2.  **Inicio:** En el panel principal, seleccione la dificultad deseada y presione "Iniciar".
3.  **Controles:**
    * **W:** Mover hacia arriba.
    * **S:** Mover hacia abajo.
    * **A:** Mover hacia la izquierda.
    * **D:** Mover hacia la derecha.
4.  **Objetivo:** Evitar colisiones el mayor tiempo posible. El juego termina cuando el contador de vidas llega a cero.

## Tecnologías Utilizadas
El proyecto ha sido desarrollado siguiendo los estándares web modernos y sin el uso de librerías externas para la lógica del juego:

* **HTML5:** Estructura semántica y uso del elemento Canvas para el renderizado gráfico.
* **CSS3:** Diseño responsivo mediante Flexbox, uso de variables CSS (Custom Properties) para la gestión dinámica de temas de color y animaciones para retroalimentación visual (efecto de daño).
* **JavaScript (ES6+):**
    * Uso de Módulos (import/export) para la organización del código.
    * Programación Orientada a Objetos (Clases para Jugador, Túnel, Obstáculos, etc.).
    * Manipulación del DOM para la interfaz de usuario (HUD, Modales, Formularios).
    * LocalStorage API para la base de datos local.

## Estructura del Proyecto
La organización de carpetas sigue la estructura solicitada:

* **/css**: Contiene la hoja de estilos principal (styles.css).
* **/js**: Contiene la lógica del juego dividida en módulos.
    * **/classes**: Definiciones de objetos (Player.js, Tunnel.js, Obstacle.js, etc.).
    * **main.js**: Controlador principal de la interfaz y eventos.
    * **game.js**: Bucle principal y lógica del juego.
    * **auth.js**: Gestión de usuarios y almacenamiento.
* **/recursos**: Archivos de audio para efectos de sonido y música de fondo.
* **index.html**: Punto de entrada de la aplicación.

## Créditos y Autor
Desarrollado como proyecto final para la asignatura de Interfaz Dinámica.
Creditos a DWX Horyzon por Hyperspace usado para la musica de fondo

* **Autor:** Ashby Aldir Olvera 236707
* **Fecha:** Noviembre 2025# Runaway
