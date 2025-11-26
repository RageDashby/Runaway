/*Clase para generear el tunel*/
export class Tunnel {
    /*Constructor: se nesesitan las dimensiones del canvas, el color y el multiplicador de dificultad*/
    constructor(canvasWidth, canvasHeight, color, speedMultiplier) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.cx = canvasWidth / 2; 
        this.cy = canvasHeight / 2; 
        //el color sera el secundario que eligio el usuario
        this.color = color; 
        
        /*Velocidad base ajustada por dificultad*/
        this.speed = 150 * speedMultiplier; //velocidad inicial por multiplicador
        /*Aceleracion*/
        this.speedMultiplier = speedMultiplier; //Guarda el multiplicador para acelerar despues
        /*Segmentos*/
        this.segments = []; //aqui se guardan los cuadros que forman el tunel
        /**/
        this.numSegments = 20; //cantidad de cuadros que se dibujan
        /*Profundidad*/
        this.maxDepth = 2000; //que tan lejos se ve el final del tunel (en el eje Z)
        
        this.initTunnel(); //Se llama a la funcion para crear los cuadros iniciales
    }

    /*Esta funcion distribuye los segmentos en el espacio 3D*/
    initTunnel() {
        //Se crean los segmentos iniciales con un bucle for 
        for (let i = 0; i < this.numSegments; i++) {
            //calculo la posicion Z para que esten espaciados uniformemente
            let z = (this.maxDepth / this.numSegments) * i;
            this.segments.push({ z: z });
        }
    }

    /*Metodo para actualizar la posicion de los segmentos y la velocidad*/
    update(dt) {
        //Se calcula cuanto se tiene que mover este frame (Delta time= dt evita que el juego se acelere en pcs rapidas)
        let moveStep = this.speed * (dt || 0.016); 

        // celeración: cada frame el tunel se hace mas rapido. La dificultad escala esto.
        this.speed += (0.05 * this.speedMultiplier); 

        //Se recorren los segmentos para acercarlos a la camara
        //Por cada segmento dentro del arreglo
        for (let segment of this.segments) {
            segment.z -= moveStep;
            //Si el segmento pasa al jugador (z <= 0) se resetea al fondo del tunel
            if (segment.z <= 0) {
                segment.z = this.maxDepth; //Se resetea para que el tunel sea infinito
            }
        }
        //Se ordenan los segmentos por Z (el mas lejano primero) para que se dibujen bien
        this.segments.sort((a, b) => b.z - a.z);
    }

    /*Metodo para dibujar el tunel en el canvas*/
    draw(ctx) {
        //Se guarda el estado del contexto del canvas antes de empezar a dibujar
        ctx.save();
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15; //el efecto de brillo neon
        ctx.shadowColor = this.color; //uso el color secundario

        let prevPoints = null;

        //Se va dibujando cada cuadro desde el mas lejano al mas cercano
        for (let i = 0; i < this.segments.length; i++) {
            let seg = this.segments[i];
            //esta es la formula de proyeccion: el tamaño depende de 1/(distancia Z)
            let scale = 300 / (300 + seg.z); 
            //Calculo del ancho y alto que tendra el cuadro
            let rectW = this.width * scale;
            let rectH = this.height * scale;
            //Calculo de la posicion X y Y para que este centrado conforme al tamaño del canvas
            let x = this.cx - rectW / 2;
            let y = this.cy - rectH / 2;

            //Calculo de la transparencia (alpha) para el efecto de niebla/profundidad
            let alpha = 1 - (seg.z / (this.maxDepth * 1.2));
            if(alpha < 0) alpha = 0;
            if(alpha > 1) alpha = 1;
            //Se Aplica la transparencia
            ctx.globalAlpha = alpha; 
            ctx.strokeStyle = this.color;

            //dibujo el cuadro
            ctx.strokeRect(x, y, rectW, rectH);

            //Aqui se dibujan las lineas que conectan los cuadros para simular las paredes
            if (prevPoints) {
                ctx.beginPath();
                //Conectando las cuatro esquinas (efecto paralax)
                ctx.moveTo(prevPoints.x, prevPoints.y);
                ctx.lineTo(x, y);
                ctx.moveTo(prevPoints.x + prevPoints.w, prevPoints.y);
                ctx.lineTo(x + rectW, y);
                ctx.moveTo(prevPoints.x + prevPoints.w, prevPoints.y + prevPoints.h);
                ctx.lineTo(x + rectW, y + rectH);
                ctx.moveTo(prevPoints.x, prevPoints.y + prevPoints.h);
                ctx.lineTo(x, y + rectH);
                ctx.stroke(); 
            }
            //Se guardan los puntos del cuadro actual para la siguiente iteracion (el siguiente cuadro mas cerca)
            prevPoints = { x: x, y: y, w: rectW, h: rectH };
        }
        //De esta manera los cuadros no son infinitamente creados y destruidos, solo se reciclan
        //restauro el estado del canvas
        ctx.restore();
    }
}