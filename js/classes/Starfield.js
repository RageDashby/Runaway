//Clase para el campo de estrellas (particulas blancas)
export class Starfield {
    /*Constructor: nesesita el ancho y alto del canvas*/
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.stars = []; //aqui se guardan todas las particulas
        this.numStars = 550; //cantidad de particulas que nesesito en pantalla
        this.maxDepth = 2000; //que tan lejos se generan

        //Genera las estrellas iniciales
        this.initStars();
    }

    /*Esta funcion inicializa todas las particulas con posicion aleatoria*/
    initStars() {
        //Se crea el bucle for para generar la cantidad de estrellas
        for(let i=0; i<this.numStars; i++) {
            this.stars.push({
                //Usa un rango amplio para que cubra todo el campo visual
                x: (Math.random() - 0.5) * 3000, 
                y: (Math.random() - 0.5) * 3000,
                z: Math.random() * this.maxDepth, //posicion inicial aleatoria en la profundidad (Z)
                size: Math.random() * 2.5 + 0.5 //tamaño aleatorio entre 0.5 y 3 para que no se vean iguales
            });
        }
    }

    /*Metodo para actualizar la posicion de las particulas en cada frame*/
    update(speed) {
        //las particulas viajan mas rapido que el tunel para efecto de viento (1.8 veces mas)
        let starSpeed = speed * 1.8;

        //Recorre todas las particulas
        for(let star of this.stars) {
            star.z -= starSpeed; //muevo la particula hacia el jugador

            //si pasan la camara (z <= 0) se reciclan al fondo
            if(star.z <= 0) {
                star.z = this.maxDepth; //resetea la profundidad al maximo
                star.x = (Math.random() - 0.5) * 3000; //nueva posicion x aleatoria
                star.y = (Math.random() - 0.5) * 3000; //nueva posicion y aleatoria
            }
        }
    }

    /*Metodo para dibujar las particulas en el canvas*/
    draw(ctx, centerX, centerY) {
        //Guarda el estado del canvas
        ctx.save();
        ctx.translate(centerX, centerY); //mueve el origen al centro del canvas
        ctx.fillStyle = "#FFFFFF"; //siempre blancas como polvo o estrellas

        //Recorre y dibujo cada particula
        for(let star of this.stars) {
            //calculo de perspectiva simple para el tamaño
            let scale = 300 / (300 + star.z);
            let x = star.x * scale; //aplica escala a posicion x
            let y = star.y * scale; //aplica escala a posicion y
            let s = star.size * scale; //aplica escala al tamaño

            //opacidad basada en profundidad para que aparezcan suavemente (efecto niebla)
            let alpha = 1 - (star.z / this.maxDepth);
            if(alpha < 0) alpha = 0; //evita valores negativos
            ctx.globalAlpha = alpha; //aplico la opacidad

            //Se dibuja la particula como un cuadrado para mejor rendimiento y look arcade
            ctx.fillRect(x, y, s, s);
        }
        //Se restaura el estado del canvas
        ctx.restore();
    }
}