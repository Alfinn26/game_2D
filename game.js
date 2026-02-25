const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let enemies;
let cursors;
let speed = 150;
let gameOver = false;

function preload(){
    this.load.image('player','https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('enemy','https://labs.phaser.io/assets/sprites/red_ball.png');
}

function create(){
    player = this.physics.add.image(config.width/2, config.height/2,'player')
    .setCollideWorldBounds(true);

    enemies = this.physics.add.group();

    this.time.addEvent({
        delay: 1500,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    this.physics.add.overlap(player,enemies,()=>{
        gameOver = true;
        this.add.text(config.width/2-80,config.height/2,"GAME OVER",{fontSize:'32px',fill:'#fff'});
        this.physics.pause();
    });

    createControls(this);
}

function update(){
    if(gameOver) return;
}

function spawnEnemy(){
    let x = Phaser.Math.Between(0,config.width);
    let y = Phaser.Math.Between(0,config.height);

    let enemy = enemies.create(x,y,'enemy');
    this.physics.moveToObject(enemy,player,100);
}

function createControls(scene){
    const left = scene.add.text(50,config.height-100,"◀",{fontSize:'40px'}).setInteractive();
    const right = scene.add.text(150,config.height-100,"▶",{fontSize:'40px'}).setInteractive();
    const up = scene.add.text(config.width-150,config.height-180,"▲",{fontSize:'40px'}).setInteractive();
    const down = scene.add.text(config.width-150,config.height-100,"▼",{fontSize:'40px'}).setInteractive();

    left.on('pointerdown',()=> player.setVelocityX(-speed));
    right.on('pointerdown',()=> player.setVelocityX(speed));
    up.on('pointerdown',()=> player.setVelocityY(-speed));
    down.on('pointerdown',()=> player.setVelocityY(speed));

    scene.input.on('pointerup',()=>{
        player.setVelocity(0);
    });
}
