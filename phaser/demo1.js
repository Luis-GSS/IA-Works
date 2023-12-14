var w=800;
var h=400;
var jugador;
var fondo;
var flag = true;
var dispar = 0;
var bala, balaD=false, nave, bala2, bala2D=true;
var csv = [];
var salto;
var adelante;
var menu;
const filePath = 'C:/Users/LENOVO/IA/datos.csv';
var velocidadBala;
var despBala;
var estatus;

var velocidadBala2=0;
var despBala2;
var estatusA;


var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;

var sal=0, adela=0;

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('bala2', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');

}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    bala2 = juego.add.sprite(50, 10, 'bala2');
    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    juego.physics.enable(bala2);
    //bala2.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    delante = juego.input.keyboard.addKey(Phaser.Keyboard.D);

    
    nnNetwork =  new synaptic.Architect.Perceptron(3, 3, 3, 2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000, shuffle: true});
}


function datosDeEntrenamiento(param_entrada){

    //console.log("Entrada",param_entrada[0]+" "+param_entrada[1]+" "+param_entrada[2]+" "+param_entrada[3]);
    nnSalida = nnNetwork.activate(param_entrada);
    console.log(nnSalida);
    var aire=Math.round( nnSalida[0]*100 );
    var adel=Math.round( nnSalida[1]*100 );
    console.log("Valor adel: %"+ adel + "En el salta %: "+ aire );
    if (40<aire) return 1;
    else if(40<adel) return 0;
}



function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            resetbala1();
            resetbala2();
            juego.paused = false;

        }
    }
}


function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    jugador.position.x=50;
    flag = true;
    dispar = 0;
    balaD = false;
    bala2D = true;
}

function resetbala1(){
    bala.body.velocity.x = 0;
    bala.position.x = w-100;
    
}

function resetbala2(){
    bala2.body.velocity.y = 0;
    bala2.position.y = 10;
    
}


function saltar(){
    jugador.body.velocity.y = -270;
}

function adelante(){
    jugador.body.velocity.x = 270;
    flag = true;
}


function update() {

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatus = 0;
    estatusA = 0;

    if(!jugador.body.onFloor()) {
        estatus = 1;
    }
    if(jugador.position.x > 50){
        estatusA = 1;
    }
	
    despBala = Math.floor( jugador.position.x - bala.position.x );
    despBala2 = Math.floor( jugador.position.y - bala2.position.y );

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }

    if( modoAuto==false && delante.isDown){
        adelante();
    }

    if (jugador.position.x < 50 && flag == false){
        resetVariables()
        flag = true;
        //console.log(jugador.position.x)
    }

    
    if(jugador.position.x > 100 && flag == true){
        jugador.body.velocity.x = -270;
        flag = false;
    }
        
    if( modoAuto == true  && bala.position.x>0 && jugador.body.onFloor()) {
        //console.log(velocidadBala)
        if( datosDeEntrenamiento( [despBala , velocidadBala, despBala2, velocidadBala2] ) == 1  ){
            saltar();
        }
        else if (datosDeEntrenamiento( [despBala , velocidadBala, despBala2, velocidadBala2] ) == 0){
            adelante();
        }
    }

    if( balaD==false && bala2D==true && dispar == 0){
        disparo1();
        
    }else if(balaD==true && bala2D==false && dispar == 1){
        disparo2();
    }
    
    if( bala.position.x <= 0  && dispar == 0){    
        resetbala1();
        dispar = 1;
    }
    else if( bala2.position.y >= 400  && dispar == 1){
        resetbala2();
        dispar = 0;
    }
    
    if( modoAuto ==false  && bala.position.x > 0){
        datosEntrenamiento.push({
                'input' :  [despBala , velocidadBala, despBala2, velocidadBala2],
                'output':  [estatus, estatusA]  
        });
        console.log(despBala + " " +velocidadBala + " "+ estatus + " " + despBala2 + " " +velocidadBala2 + " " + estatusA);
        csv.push([despBala, velocidadBala, estatus, despBala2, velocidadBala2, estatusA]);
   }

}


function disparo1(){
    
    bala2.body.enable = false;
    velocidadBala =  -1 * velocidadRandom(200,300);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
    bala2D=false;
}
function disparo2(){
    bala2.body.enable = true;
    velocidadBala2 =  1 * velocidadRandom(300,400);
    bala2.body.velocity.y = velocidadBala2; 
    bala2.body.velocity.x = 0;
    bala2D=true;
    balaD=false;
}

function colisionH(){
    pausa();
}

function descargarCSV() {
    const csvContent = csv.map(row => row.join(',')).join('\n');

    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    enlaceDescarga.download = 'datos.csv';

    enlaceDescarga.click();

    if (document.body.contains(enlaceDescarga)) {
        document.body.removeChild(enlaceDescarga);
    }
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}

// Agregar un evento de clic al botón después de que se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('descargarBtn').addEventListener('click', descargarCSV);
  });