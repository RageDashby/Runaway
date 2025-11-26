/*Clase para el objeto Obstaculo (Figuras Rojas y Paredes)*/
export class Obstacle {
    /*Constructor: recibe tipo, dimensiones y el color secundario del tunel*/
    constructor(type, canvasWidth, canvasHeight, themeColor) {
        //Puede ser 'figure' (punto rojo) o 'wall' (pared)
        this.type = type; 
        this.width = canvasWidth;
        this.height = canvasHeight;
        //Posicion inicial bien al fondo en Z
        this.z = 2000; 
        
        //Se verifica que tipo de obstaculo es para configurar su apariencia
        if (this.type === 'figure') {
            //Se dispersan en el eje X e Y
            this.xOffset = (Math.random() - 0.5) * 1200; //calculo la posicion horizontal aleatoria
            this.yOffset = (Math.random() - 0.5) * 700; //calculo la posicion vertical aleatoria
            this.size = 60; //tamaño base del rombo
            //Rojo vibrante obligatorio para señalar peligro
            this.color = '#ff0000'; 
        } else {
            //paredes del tunel: decido si tapan vertical (izq/der) u horizontal (arr/aba)
            this.orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            this.gapPosition = Math.random() > 0.5 ? -1 : 1; //decido el lado que queda abierto
            this.xOffset = 0;
            this.yOffset = 0;
            //uso el color secundario que es el del tunel
            this.color = themeColor || '#ffffff'; 
        }
        
        this.markedForDeletion = false;
        //Esta es una variable de control que es para que si la pared te pega no te haga daño por mas de un frame
        this.hasHitPlayer = false; 
    }

    /*Metodo para mover el obstaculo*/
    update(speed) {
        //Mueve el objeto hacia la pantalla restando la velocidad al eje Z
        this.z -= speed;
        //Si paso al jugador (mas alla de -100) lo borra
        if (this.z < -100) {
            this.markedForDeletion = true;
        }
    }

    /*Metodo para dibujar el obstaculo en el canvas*/
    draw(ctx, centerX, centerY, currentW, currentH) {
        //Calculo matematico de la perspectiva: escala segun Z
        let scale = 300 / (300 + this.z);
        //Efecto de niebla para que no aparezca de golpe, sino suave
        let alpha = 1 - (this.z / 2200);
        if(alpha < 0) alpha = 0;

        ctx.save();
        //Mueve el punto de origen al centro del canvas
        ctx.translate(centerX, centerY);
        ctx.globalAlpha = alpha;

        if (this.type === 'figure') {
            //dibujo el rombo rojo peligroso
            let x = this.xOffset * scale;
            let y = this.yOffset * scale;
            let s = this.size * scale;

            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            //dibujo los puntos del rombo
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s, y);
            ctx.lineTo(x, y + s);
            ctx.lineTo(x - s, y);
            ctx.closePath();
            ctx.fill();

        } else if (this.type === 'wall') {
            //Dibuja la pared que bloquea
            //Uso las dimensiones actuales del canvas (currentW/H) y las escalo con perspectiva
            let w = currentW * scale; 
            let h = currentH * scale;
             //Relleno sutil para que se vea la pared
            ctx.fillStyle = `rgba(255,255,255,0.06)`;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;

            //Calculo coordenadas para dibujar dentro del cuadro del tunel
            let drawX = -w/2;
            let drawY = -h/2;
            
            //Logica para tapar solo una parte y dejar el hueco
            if (this.orientation === 'vertical') {
                if(this.gapPosition === 1) { //si tapo izquierda
                    drawX = -w/2;
                } else { //si tapo derecha
                    drawX = 0;
                }
                w = w / 2; //ancho es la mitad
            } else { //horizontal
                if(this.gapPosition === 1) { //si tapo arriba
                    drawY = -h/2;
                } else { //si tapo abajo
                    drawY = 0;
                }
                h = h / 2; //alto es la mitad
            }

            //Dibujo el rectangulo de la pared
            ctx.fillRect(drawX, drawY, w, h);
            ctx.strokeRect(drawX, drawY, w, h);
            
            //guardo la caja de colision (Bounding Box) solo cuando la pared esta muy cerca
            if(this.z < 200) {
                this.collisionBox = {
                    x: centerX + drawX, //posicion real X en pantalla
                    y: centerY + drawY, //posicion real Y en pantalla
                    w: w, //ancho de la pared
                    h: h //alto de la pared
                };
            }
        }
        ctx.restore();
    }
}