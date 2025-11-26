import { Player } from './classes/player.js';
import { Tunnel } from './classes/Tunnel.js';
import { ObstacleManager } from './classes/ObstacleManager.js';
import { Starfield } from './classes/Starfield.js';
import { showModal } from './main.js';

export class Game {
    /*Constructor: inicializa el juego, canvas, audio, clases y controles*/
    constructor(canvasId, colors, difficulty) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        //Tamaño fijo del canvas
        this.canvas.width = 1200;
        this.canvas.height = 700;

        //Configura la dificultad del juego
        this.difficulty = difficulty;
        this.speedMultiplier = 1;

        //Ajusta la velocidad base según la dificultad
        if (difficulty === 'easy') this.speedMultiplier = 0.8;
        if (difficulty === 'normal') this.speedMultiplier = 1.0;
        if (difficulty === 'hard') this.speedMultiplier = 1.5;

        //Inicializa las clases principales con los parámetros necesarios
        this.player = new Player(this.canvas.width, this.canvas.height, colors.primary, this.speedMultiplier);

        this.tunnel = new Tunnel(this.canvas.width, this.canvas.height, colors.secondary, this.speedMultiplier);

        this.starfield = new Starfield(this.canvas.width, this.canvas.height);

        this.obstManager = new ObstacleManager(this.canvas.width, this.canvas.height, colors.secondary, this.speedMultiplier);

        this.isRunning = false;
        this.score = 0;
        this.keys = {};


        //Sistema de audio

        //Carga los archivos de audio desde la carpeta recursos
        try {
            this.music = new Audio('recursos/music.mp3');

            this.music.loop = true;

            this.music.volume = 0.5;

            this.hitSound = new Audio('recursos/hit.mp3');
            this.hitSound.volume = 0.8;

            this.dieSound = new Audio('recursos/die.mp3');
        } catch (e) {

            console.log("no se encontraron los audios o hubo error al cargar");
        }

        //Configura los listeners de teclado para el movimiento (WASD)
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    /*Metodo start: inicia la musica, el bucle principal y el contador de score*/
    start() {
        this.isRunning = true;

        //Intenta reproducir la música de fondo
        if (this.music) {
            this.music.currentTime = 0;
            //
            this.music.play().catch(error => console.log("interactua primero para el audio"));
        }

        this.gameLoop();

        //Inicia el contador de score, suma 10 puntos cada segundo
        this.scoreInterval = setInterval(() => {
            if (this.isRunning) {
                this.score += 10;
                this.updateHUD();
            }
        }, 1000);
    }

    /*Metodo stop: detiene el juego y ejecuta la secuencia de Game Over*/
    stop() {
        this.isRunning = false;
        clearInterval(this.scoreInterval);

        //Pausa la música y reproduce el sonido de muerte
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
        if (this.dieSound) {
            this.dieSound.play();
        }

        //Maneja la secuencia de Game Over y guarda el score final
        import('./main.js').then(mod => {
            mod.handleGameOver(this.score, this.difficulty);
        });
    }

    /*Metodo updateHUD: actualiza la información de score y vidas en la interfaz*/
    updateHUD() {
        document.getElementById('hud-score').innerText = `Puntaje: ${this.score}`;
        let hearts = "";
        //Dibuja los corazones según las vidas restantes del jugador
        for (let i = 0; i < this.player.lives; i++) hearts += "❤";
        document.getElementById('hud-lives').innerText = hearts;
    }

    /*Metodo gameLoop: el bucle principal de renderizado del juego */
    gameLoop() {
        if (!this.isRunning) return;

        const dt = 0.016;


        //Limpia la pantalla con color negro
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


        //1. Actualiza y dibuja el túnel (Efecto Paralaje)
        this.tunnel.update(dt);
        this.tunnel.draw(this.ctx);

        //Actualiza y dibuja el starfield (Efecto velocidad)
        this.starfield.update(this.tunnel.speed * dt);
        this.starfield.draw(this.ctx, this.canvas.width / 2, this.canvas.height / 2);

        //2. Actualiza y dibuja los obstáculos
        const moveStep = this.tunnel.speed * dt;

        //Pasa el callback para el sonido de golpe y el efecto visual
        this.obstManager.update(dt, moveStep, this.player, () => {
            
            //Reproduce el sonido de golpe
            if (this.hitSound) {
                this.hitSound.currentTime = 0;
                this.hitSound.play();
            }

            //Aplica el efecto visual de daño (shake)
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);
        });
        this.obstManager.draw(this.ctx);

        //3. Actualiza y dibuja el jugador
        this.player.update(this.keys, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx);

        //Verifica la condición de Game Over
        if (this.player.lives <= 0) {
            this.stop();
        }

        //Llama a la siguiente iteración del bucle (aproximadamente 60 veces por segundo)
        requestAnimationFrame(() => this.gameLoop());
    }
}