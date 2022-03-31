const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon, boat;

var balls = [];
var boats = [];

var score = 0;

var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

//DECLARAR VARIÁVEL QUE RECEBERÁ VALOR BOOLEANO--prof
var isGameOver = false;
//DECLARAR DUAS VARIÁVEIS QUE RECEBERÁ VALOR BOLLEANO--aluno
var isLaughing = false;
var isWater = false;
//VARIÁVEIS PARA OS 4 SONS DO JOGO--aluno
var CannonSong;
var PirateSong;
var SplashSong;
var BgSong;
//SOM_DE_FUNDO, SOM_DE_AGUA, SOM_DE_CANHÃO, SOM_RISADA_DO_PIRATA


function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  //CARREGAR OS SONS--aluno
  CannonSong = loadSound("assets/cannon_explosion.mp3");
  PirateSong = loadSound("assets/pirate_laugh.mp3");
  SplashSong = loadSound("assets/cannon_water.mp3");
  BgSong = loadSound("assets/background_music.mp3");

  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
}

function setup() {
  canvas = createCanvas(1200, 600);

  engine = Engine.create();
  world = engine.world;

  angleMode(DEGREES)
  angle = 15

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 100, 100, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);

  image(backgroundImg, 0, 0, width, height);

  //ADICIONAR O SOM DE FUNDO--ATRAVÉS DE VERIFICAÇÃO--aluno
  if (!BgSong.isPlaying()) {
    BgSong.play();
    BgSong.setVolume(0.1);
  }

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();


  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  //PONTUAÇÃO --PROF
  fill("#6d4c41");
  textSize(40);
  text(`SCORE: ${score}`, 1000, 50);
  textAlign(CENTER, CENTER);
}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      //PONTUAÇÃO SE HOUVE COLISÃO--PROF
      if (collision.collided) {
        score += 5;
        boats[i].remove(i);
        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    //TIRAR A PRIMEIRA VERIFICAÇÃO--PROF
    if (ball.body.position.y >= height - 50) {
      //SOM DA AGUA -- AQUI--ALUNO
      if (!isWater&&!SplashSong.isPlaying()) {
        SplashSong.play();
        SplashSong.setVolume(0.1);
        //isWater = false;
      }


      ball.remove(index);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      //var para receber valor booleano referente a colisão--prof
      var collision = Matter.SAT.collides(this.tower, boats[i].body);
      //if que verifica se houve colisão com um barco bom 
      if (collision.collided && !boats[i].isBroken) {
        //if som da risada--aluno
      if (!isLaughing&&!PirateSong.isPlaying()) {
        PirateSong.play();
        isLaughing = true;
      }

        isGameOver = true;
        gameOver();
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    //TOCAR O SOM DO CANHÃO--AQUI--ALUNO
    CannonSong.play();
    CannonSong.setVolume(0.05);
    balls[balls.length - 1].shoot();
  }
}

//FUNÇÃO GAMEOVER QUE CRIA O POP-UP--prof
function gameOver() {
  swal(
    {
      title: `Fim de Jogo!!!`,
      text: "Obrigada por jogar!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Jogar Novamente"
    },
    function (isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}
