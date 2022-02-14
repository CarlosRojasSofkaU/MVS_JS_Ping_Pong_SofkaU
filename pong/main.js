/*Carlos Fernando Rojas Cortés C.C:1214739705*/
/* Clase Board --> será el modelo de nuestra clase
este recibe dos parametros, ancho (width) y alto (height)
*/
(function(){
    self.Board = function(width,height){//Constructor de board
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.winner_player=0;        
    }

    self.Board.prototype = { //Prototipado de board (acá se añaden los métodos de la clase)
        get elements(){ //Este método me genera los elementos del juego (barras y bola)
            var elements = this.bars.map(function(bar){ return bar; });//generando una copia para poder elminar las copias basura
            elements.push(this.ball);
            return elements;
        },
        check_winner: function(){//Este método me verifica quien ganó el juego de ping pong
            if(this.game_over){
                if(this.winner_player == 1){
                    document.getElementById("demo").innerHTML = "El ganador es el jugador 1";
                }
                if(this.winner_player == 2){
                    document.getElementById("demo").innerHTML = "El ganador es el jugador 2";
                }
            this.playing=false; //detenemos el juego
            }
        }
    }
})();

/* Clase Ball --> Esta clase será la pelota que se estará moviendo por el tablero
como entrada tendrá posiciones X y Y, un radio y un tablero (está contenida dentro de board)
*/
(function(){//Constructor de Ball
    self.Ball = function(x,y,radius,board){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        this.direction = 1;
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;

        board.ball = this;
        this.kind = "circle";
    }

    self.Ball.prototype = {//Prototipado de Ball (acá se añaden los métodos)
        move: function(){//Método que mueve la pelota en todo momento
            this.x +=(this.speed_x * this.direction);
            this.y +=(this.speed_y);
        },
        winner: function(){//Método que determina cuando hay un ganador del juego (se tocan los bordes laterales)
            if(this.x<=0){
                board.game_over=true
                board.winner_player=2;
            }
            if(this.x>=800){
                board.game_over=true
                board.winner_player=1;
            }
        },
        get width(){//Getter de anchura de la bola
            return this.radius * 2;
        },
        get height(){//Getter de altura de la bola
            return this.radius * 2;
        },
        collision: function(bar){ //reacciona a la colision con una barra que recibe como parámetro
            //calcula el ángulo en el que rebota la pelota y su dirección
            
            if (this.y <= 0){
                this.y = 0.001;
                this.direction = this.direction * -1;
                this.speed_y = this.speed * Math.sin(this.bounce_angle);
                this.speed_x = this.speed * -Math.cos(this.bounce_angle);
            }
            else if (this.y >= 400){
                this.y = 399.999;
                this.direction = this.direction * -1;
                this.speed_y = this.speed * Math.sin(this.bounce_angle);
                this.speed_x = this.speed * -Math.cos(this.bounce_angle);
            }
            else{
                var relative_intersect_y = ( bar.y + (bar.height / 2)) - this.y;
                var normalized_intersect_y = relative_intersect_y / (bar.height / 2);
    
                this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
                this.speed_y = this.speed * -Math.sin(this.bounce_angle);
                this.speed_x = this.speed * Math.cos(this.bounce_angle);
                if(this.x > (this.board.width / 2)) this.direction = -1;
                else this.direction = 1;
            }
        }
    }
})();

/* Class Bar -->Esta clase será la Barra que se utiliza para jugar
como entradas recibe posiciones en X y Y, un ancho, una altura y una board (está contenida dentro de board)
*/
(function(){//Constructor de Bar
    self.Bar = function(x,y,width,height,board){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 10;
    }

    self.Bar.prototype = {//Prototipado de Bar (acá se añaden sus métodos)
        down: function(){//Función para bajar la barra
            this.y += this.speed;
        },
        up: function(){//Función para subir la barra
            this.y -=this.speed;
        },
        toString: function(){
            return "x: "+ this.x+" y: "+this.y;
        }
    }
})();

/*Class BoardView --> esta clase será la vista de nuestro programa
como parámetros recibe un canvas y una board(modelo)
*/
(function(){//Constructor de BoardView
    self.BoardView = function(canvas,board){
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    } 

    self.BoardView.prototype = {//Prototipado de BoardView (acá se añaden sus métodos)
        clean: function(){//Método que limpia las barras cuando se mueven
            this.ctx.clearRect(0,0,this.board.width,this.board.height);
        },
        draw: function(){//método que dibuja las barras y la pelota
            for (var i = this.board.elements.length - 1; i >= 0; i--){
                var el = this.board.elements[i];
                draw(this.ctx,el);
            };
        },
        check_collisions: function(){//Método que detecta las coliciones con las barras y los bordes
            for (let i = this.board.bars.length - 1; i >= 0; i--) {
                var bar = this.board.bars[i];
                if(hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }               
            }
        },
        play: function(){//Método que se encarga de correr la vista y verificar eventos
            if(this.board.playing){
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
                this.board.ball.winner();
                this.board.check_winner();
            }
        }
    }

    function hit(a,b){ //revisa si a colisiona con b
        var hit = false;
        //colisiones horizontales
        if(b.x + b.width >= a.x && b.x < a.x + a.width){
            //colisiones verticales
            if(b.y + b.height >= a.y && b.y < a.y + a.height)
            hit = true;
        }
        //colisión de a con b
        if(b.x <= a.x && b.x + b.width >= a.x + a.width){
            if(b.y <= a.y && b.y + b.height >= a.y + a.height)
            hit = true;
        }
        //colisión de b con a
        if(a.x <= b.x && a.x + a.width >= b.x + b.width){
            if(a.y <= b.y && a.y + a.height >= b.y + b.height)
            hit = true;
        }
        if(b.y >= 400 || b.y <= 0){//colisión de la pelota con el borde superior o inferior
            hit = true;
        }
        return hit;
    }

    function draw(ctx,element){//Función que dibuja los elementos dependiendo si son barras o pelotas
        switch(element.kind){
            case "rectangle":
                ctx.fillRect(element.x,element.y,element.width,element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x,element.y,element.radius,0,7);
                ctx.fill();
                ctx.closePath();
                break;
        }
    }
})();

/* INICIALIZACIÓN DE VARIABLES (OBJETOS)*/
var board = new Board(800,400); //Tablero en el que se juega
var bar_2 = new Bar(20,100,40,100,board); //Barra para el jugador 1
var bar = new Bar(735,100,40,100,board); //Barra para el jugador 2
var canvas = document.getElementById('canvas'); //Canvas
var board_view = new BoardView(canvas,board); //Vista del programa
var ball = new Ball(350,100,10,board); //Pelota con la que se juega

/*Detector de eventos --> realiza acciones si se presionan ciertas teclas
*/
document.addEventListener("keydown",function(ev){
    if(ev.keyCode === 38){ //Si se presiona tecla arriba
        ev.preventDefault();
        bar.up();
    }
    else if(ev.keyCode === 40){ //Si se presiona tecla abajo
        ev.preventDefault();
        bar.down();
    }
    else if(ev.keyCode === 87){ // Si se presiona la tecla "W"
        ev.preventDefault();
        bar_2.up();
    }
    else if(ev.keyCode === 83){ // Si se presiona la tecla "S"
        ev.preventDefault();
        bar_2.down();
    }
    else if(ev.keyCode === 32){ // Si se presiona la tecla espacio (Pausa el juego)
        ev.preventDefault();
        board.playing = !board.playing;
    }
});

board_view.draw(); //Se dibuja el tablero inicialmente para ver el juego antes de iniciar

self.requestAnimationFrame(controller); //se le pide constantemente a la visa que se actualice

/* Controlador de nuestro programa --> Se encarga de que el juego esté actualizandose constantemente
*/
function controller(){
    board_view.play(); //Comienza a jugar
    window.requestAnimationFrame(controller);
}