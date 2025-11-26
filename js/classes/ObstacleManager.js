import { Obstacle } from './Obstacle.js';
//Importa la clase Obstacle para crear y manejar los obstaculos del juego
export class ObstacleManager {
    /*Constructor: recibe dimensiones, color del tunel y el multiplicador de velocidad*/
    constructor(canvasWidth, canvasHeight, themeColor, speedMultiplier) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.obstacles = []; //aqui guarda todos los obstaculos generados
        this.color = themeColor; //el color secundario para las paredes
        this.speedMultiplier = speedMultiplier; //el parametro de dificultad
        
        this.figureTimer = 0; //contador para los puntos rojos
        this.wallTimer = 0; //contador para las paredes grandes
        
        //calculo de tiempos iniciales dependiendo la dificultad
        //entre mas dificil, menos tiempo de espera
        let minTime = 10000 / speedMultiplier;
        let maxTime = 15000 / speedMultiplier;
        this.nextWallTime = this.getRandomTime(minTime, maxTime); //tiempo para la primera pared
        this.timeSinceStart = 0; //cuanto tiempo ha pasado desde la ultima pared
    }

    /*Esta funcion saca un tiempo aleatorio entre el min y max que nesesito*/
    getRandomTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /*Metodo principal: mueve, genera y checa colisiones*/
    update(dt, tunnelSpeed, player, onDamageCallback) {
        this.timeSinceStart += dt * 1000; //sumo tiempo en milisegundos
        this.figureTimer += dt * 1000; //sumo tiempo para los puntos rojos

        //GENERAR PUNTOS ROJOS
        let figureSpawnTime = 500 / this.speedMultiplier;
        if (this.figureTimer > figureSpawnTime) { 
            //Se crea un nuevo obstaculo tipo 'figure' (punto rojo)
            this.obstacles.push(new Obstacle('figure', this.width, this.height, this.color));
            this.figureTimer = 0; //reseteo el contador
        }

        //GENERAR PAREDES
        if (this.timeSinceStart > this.nextWallTime) {
            //Se crea el obstaculo tipo 'wall' (pared grande)
            this.obstacles.push(new Obstacle('wall', this.width, this.height, this.color));
            this.timeSinceStart = 0; //reseteo el tiempo de la pared
            //recalculo el tiempo para la siguiente pared con la dificultad aplicada
            let minTime = 10000 / this.speedMultiplier; 
            let maxTime = 15000 / this.speedMultiplier;
            this.nextWallTime = this.getRandomTime(minTime, maxTime);
        }

        //Se recorren los obstaculos para moverlos y checar choques
        //Se inicia por el final del para poder borrar sin problemas
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            
            //la velocidad base es la del tunel
            let currentSpeed = tunnelSpeed;
            if (obs.type === 'figure') {
                //si es un punto rojo le doy velocidad extra (4 veces mas) para que sea un reto
                currentSpeed *= 4; 
            }
            obs.update(currentSpeed); //se mueve el obstaculo con la velocidad calculada

            //DETECTAR COLISION
            //Verifica si el obstaculo esta cerca del avion en el eje Z (entre 100 y -50)
            if (obs.z < 100 && obs.z > -50 && !obs.hasHitPlayer) { 
                //ademas verifica si ya habia pegado antes
                if (obs.type === 'figure') {
                    //logica para choque con puntos rojos
                    let scale = 300 / (300 + obs.z);
                    //calculo las coordenadas reales del punto rojo en 2D
                    let obsX = (this.width/2) + (obs.xOffset * scale);
                    let obsY = (this.height/2) + (obs.yOffset * scale);
                    
                    //calculo la distancia del avion al punto (formula de hipotenusa)
                    let dist = Math.hypot(player.x - obsX, player.y - obsY);
                    
                    if (dist < 40) { //si la distancia es menor a 40, hay colision
                        player.lives -= 1; //quita 1 vida
                        obs.hasHitPlayer = true; //marco que ya pego
                        this.obstacles.splice(i, 1); //lo borro visualmente
                        if(onDamageCallback) onDamageCallback(); //llamo el sonido de daño
                        continue; //paso al siguiente obstaculo
                    }
                } 
                else if (obs.type === 'wall') {
                    //logica para pared
                    if (obs.collisionBox) {
                        let cb = obs.collisionBox;
                        //verifica si el avion esta dentro del rectangulo de la pared (chequeo de cajas)
                        if (player.x > cb.x && player.x < cb.x + cb.w &&
                            player.y > cb.y && player.y < cb.y + cb.h) {
                            
                            //La pared quita 2 vidas
                            player.lives -= 2;
                            if (player.lives < 0) player.lives = 0; //no da pauta a vidas negativas
                            
                            obs.hasHitPlayer = true; //evito doble golpe en el mismo frame
                            //no borro la pared para que se vea que te estampaste
                            //pero ya no hace daño
                            if(onDamageCallback) onDamageCallback(); //llamo el sonido de daño
                        }
                    }
                }
            }
            
            //borrar si ya no se encuentra en el campo de juego
            if (obs.markedForDeletion) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    /*Metodo para dibujar todos los obstaculos*/
    draw(ctx) {
        //Ordena los obstaculos por Z para que se dibujen bien la profundidad (los mas lejos primero)
        this.obstacles.sort((a, b) => b.z - a.z);
        //recorro y dibujo cada obstaculo
        for (let obs of this.obstacles) {
            //paso el centro del canvas para que se dibuje en perspectiva
            obs.draw(ctx, this.width / 2, this.height / 2, this.width, this.height);
        }
    }
}