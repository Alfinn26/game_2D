const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1600;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#88c070",
    physics: { default: 'arcade', arcade: { debug:false }},
    scene: { preload, create, update }
};

new Phaser.Game(config);

let player, enemies, boss;
let hp=100;
let hpBar;
let score=0;
let scoreText;
let sword;
let swordLevel=1;
let enemySpeed=120;
let gameOver=false;

let joyForce={x:0,y:0};
let joyActive=false;

function preload(){
    this.load.image('enemy','https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.image('boss','https://labs.phaser.io/assets/sprites/dragon.png');
}

function create(){

    this.physics.world.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);

    // Background hutan simpel (grid rumput)
    for(let x=0;x<WORLD_WIDTH;x+=80){
        for(let y=0;y<WORLD_HEIGHT;y+=80){
            this.add.rectangle(x,y,80,80,0x7fbf6f).setOrigin(0);
        }
    }

    player=this.physics.add.circle(WORLD_WIDTH/2,WORLD_HEIGHT/2,20,0x0044ff);
    player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);

    enemies=this.physics.add.group();

    this.time.addEvent({
        delay:2000,
        callback:spawnEnemy,
        callbackScope:this,
        loop:true
    });

    this.physics.add.overlap(player,enemies,damagePlayer,null,this);

    // Sword (energy blade)
    sword=this.add.circle(player.x,player.y,10,0xaaaaaa);

    // UI
    this.add.rectangle(20,20,200,20,0xff0000).setOrigin(0).setScrollFactor(0);
    hpBar=this.add.rectangle(20,20,200,20,0x00ff00).setOrigin(0).setScrollFactor(0);

    scoreText=this.add.text(config.width-180,20,"Score: 0",{fontSize:"20px",fill:"#000"}).setScrollFactor(0);

    createJoystick.call(this);
}

function update(){

    if(gameOver) return;

    player.setVelocity(joyForce.x*300,joyForce.y*300);

    // Sword orbit
    let angle=this.time.now/200;
    sword.x=player.x+Math.cos(angle)*50;
    sword.y=player.y+Math.sin(angle)*50;

    // Warna pedang naik level
    if(swordLevel===1) sword.fillColor=0xaaaaaa;
    if(swordLevel===2) sword.fillColor=0x00ff00;
    if(swordLevel>=3) sword.fillColor=0xffd700;

    // Kill enemy
    enemies.getChildren().forEach(enemy=>{
        if(Phaser.Math.Distance.Between(sword.x,sword.y,enemy.x,enemy.y)<20){
            enemy.destroy();
            score+=10;
            scoreText.setText("Score: "+score);
            levelCheck(this);
        }
    });

    if(boss){
        this.physics.moveToObject(boss,player,160);

        if(Phaser.Math.Distance.Between(player.x,player.y,boss.x,boss.y)<40){
            hp=0;
            damagePlayer.call(this);
        }
    }
}

function spawnEnemy(){
    if(gameOver) return;

    let x=Phaser.Math.Between(0,WORLD_WIDTH);
    let y=Phaser.Math.Between(0,WORLD_HEIGHT);

    let enemy=enemies.create(x,y,'enemy');
    this.physics.moveToObject(enemy,player,enemySpeed);
}

function spawnBoss(scene){
    boss=scene.physics.add.sprite(
        Phaser.Math.Between(0,WORLD_WIDTH),
        Phaser.Math.Between(0,WORLD_HEIGHT),
        'boss'
    );
    boss.setScale(1.5);
}

function levelCheck(scene){
    if(score>0 && score%100===0){
        swordLevel++;
        enemySpeed+=30;
        spawnBoss(scene);
    }
}

function damagePlayer(){
    hp-=10;
    hpBar.width=(hp/100)*200;

    if(hp<=0){
        gameOver=true;
        this.physics.pause();

        this.add.text(
            this.cameras.main.midPoint.x,
            this.cameras.main.midPoint.y,
            "GAME OVER\nTap to Restart",
            {fontSize:"36px",fill:"#000",align:"center"}
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

        this.input.once("pointerdown",()=>location.reload());
    }
}

function createJoystick(){

    let base=this.add.circle(100,config.height-100,60,0x006400)
    .setAlpha(0.4)
    .setScrollFactor(0);

    let thumb=this.add.circle(100,config.height-100,30,0x00aa00)
    .setScrollFactor(0);

    this.input.on("pointermove",pointer=>{
        if(pointer.isDown){
            let dx=pointer.x-100;
            let dy=pointer.y-(config.height-100);
            let dist=Math.sqrt(dx*dx+dy*dy);
            let max=50;

            if(dist>max){
                dx=dx/dist*max;
                dy=dy/dist*max;
            }

            thumb.x=100+dx;
            thumb.y=config.height-100+dy;

            joyForce.x=dx/max;
            joyForce.y=dy/max;
        }
    });

    this.input.on("pointerup",()=>{
        thumb.x=100;
        thumb.y=config.height-100;
        joyForce={x:0,y:0};
    });
        }
