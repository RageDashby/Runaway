/*Clase para el avion*/
export class Player {
    /*Constructor: Se nesesita el tamaño del canvas, el color favorito del usario y el multiplicador de dificultad*/
    constructor(canvasWidth, canvasHeight, color, speedMultiplier) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.width = 40; 
        this.height = 40;
        // Velocidad base 5 multiplicada por dificultad
        this.speed = 5 * speedMultiplier; 
        this.lives = 3; 
        this.color = color; 
    }
/*Metodo de dibujado*/
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); 
        ctx.lineTo(this.width / 2, this.height / 2); 
        ctx.lineTo(0, this.height / 4); 
        ctx.lineTo(-this.width / 2, this.height / 2); 
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(0, this.height / 4);
        ctx.stroke();

        ctx.restore();
    }

/*Metodo de movimiento*/
    update(keys, canvasWidth, canvasHeight) {
        if (keys['a'] || keys['A']) this.x -= this.speed;
        if (keys['d'] || keys['D']) this.x += this.speed;
        if (keys['w'] || keys['W']) this.y -= this.speed;
        if (keys['s'] || keys['S']) this.y += this.speed;

        if(this.x < 20) this.x = 20;
        if(this.x > canvasWidth - 20) this.x = canvasWidth - 20;
        if(this.y < 20) this.y = 20;
        if(this.y > canvasHeight - 20) this.y = canvasHeight - 20;
    }
}