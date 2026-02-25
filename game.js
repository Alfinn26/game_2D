const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#7ed957",
    physics: { default: 'arcade', arcade: { debug:false }},
    scene: { preload, create, update }
};

new Phaser.Game(config);

let player, enemies, boss;
let camera;
let hp=100, maxHp=100;
let hpBar;
let score=0;
let scoreText;
let swordLevel=1;
let playerSwords=[];
let enemySpeed=120;
let gameOver=false;

let joystickBase, joystickThumb;
let joyActive=false;
let joyPointer=null;
let joyForce={x:0,y:0};

function preload(){
    this.load.image('enemy','https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.image('boss','https://labs.phaser.io/assets/sprites/dragon.png');
}

function create(){

    this.physics.world.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);

    // background rumput
    for(let i=0;i<200;i++){
        let tree=this.add.circle(
            Phaser.Math.Between(0,WORLD_WIDTH),
            Phaser.Math.Between(0,WORLD_HEIGHT),
            Phaser.Math.Between(20,40),
            0x2e8b57
        ).setAlpha(0.6);
    }

    player=this.physics.add.circle(WORLD_WIDTH/2,WORLD_HEIGHT/2,20,0x0000ff);
    player.setCollideWorldBounds(true);

    camera=this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);

    enemies=this.physics.add.group();

    this.time.addEvent({
        delay:1500,
        callback:spawnEnemy,
        callbackScope:this,
        loop:true
    });

    this.physics.add.overlap(player,enemies,hitPlayer,null,this);

    // UI tetap di layar
    hpBar=this.add.rectangle(20,20,200,20,0x00ff00)
    .setOrigin(0)
    .setScrollFactor(0);

    scoreText=this.add.text(config.width-180,20,"Score: 0",{fontSize:"20px",fill:"#000"})
    .setScrollFactor(0);

    createJoystick.call(this);
}

function update(){

    if(gameOver) return;

    const speed=300;
    player.setVelocity(joyForce.x*speed,joyForce.y*speed);

    updateSwords(this);

    if(boss){
        this.physics.moveToObject(boss,player,180);
    }
}

function spawnEnemy(){
    if(gameOver) return;

    let x=Phaser.Math.Between(0,WORLD_WIDTH);
    let y=Phaser.Math.Between(0,WORLD_HEIGHT);

    let enemy=enemies.create(x,y,null);
    enemy.body.setCircle(15);
    enemy.setFillStyle(0xff0000);

    this.physics.moveToObject(enemy,player,enemySpeed);
}

function spawnBoss(scene){

    boss=scene.physics.add.sprite(
        Phaser.Math.Between(0,WORLD_WIDTH),
        Phaser.Math.Between(0,WORLD_HEIGHT),
        'boss'
    );

    boss.setScale(2);
    boss.hp=200;

    scene.physics.add.overlap(player,boss,()=>{
        hp=0;
        hitPlayer.call(scene);
    });
}

function updateSwords(scene){

    if(playerSwords.length===0){
        createSword(scene);
    }

    playerSwords.forEach((sword,index)=>{

        let angle=scene.time.now/200 + index;
        sword.x=player.x+Math.cos(angle)*70;
        sword.y=player.y+Math.sin(angle)*70;

        // warna level
        if(swordLevel===1) sword.fillColor=0xaaaaaa;
        if(swordLevel===2) sword.fillColor=0x00ff00;
        if(swordLevel>=3) sword.fillColor=0xffd700;

        enemies.getChildren().forEach(enemy=>{
            if(Phaser.Math.Distance.Between(sword.x,sword.y,enemy.x,enemy.y)<25){
                splash(scene,enemy.x,enemy.y);
                enemy.destroy();
                score+=10;
                scoreText.setText("Score: "+score);
                levelCheck(scene);
            }
        });

        if(boss && Phaser.Math.Distance.Between(sword.x,sword.y,boss.x,boss.y)<40){
            boss.hp-=5;
            if(boss.hp<=0){
                splash(scene,boss.x,boss.y);
                boss.destroy();
                boss=null;
            }
        }
    });
}

function createSword(scene){
    let sword=scene.add.triangle(player.x,player.y,0,0,40,10,0,20,0xffffff);
    playerSwords.push(sword);
}

function splash(scene,x,y){
    let circle=scene.add.circle(x,y,10,0xffffff);
    scene.tweens.add({
        targets:circle,
        alpha:0,
        scale:3,
        duration:300,
        onComplete:()=>circle.destroy()
    });
}

function levelCheck(scene){

    if(score>0 && score%100===0){

        swordLevel++;
        enemySpeed+=40;

        spawnBoss(scene);
    }
}

function hitPlayer(){
    hp-=10;
    hpBar.width=(hp/maxHp)*200;

    if(hp<=0){
        gameOver=true;
        this.physics.pause();

        this.add.text(
            camera.midPoint.x,
            camera.midPoint.y,
            "GAME OVER\nTap to Restart",
            {fontSize:"40px",fill:"#000",align:"center"}
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

        this.input.once("pointerdown",()=>location.reload());
    }
}

function createJoystick(){

    joystickBase=this.add.circle(100,config.height-100,60,0x006400)
    .setAlpha(0.5)
    .setScrollFactor(0);

    joystickThumb=this.add.circle(100,config.height-100,30,0x00aa00)
    .setAlpha(0.8)
    .setScrollFactor(0);

    this.input.on("pointerdown",pointer=>{
        if(pointer.x<200 && pointer.y>config.height-200){
            joyActive=true;
            joyPointer=pointer;
        }
    });

    this.input.on("pointermove",pointer=>{
        if(joyActive && pointer.id===joyPointer.id){
            let dx=pointer.x-100;
            let dy=pointer.y-(config.height-100);
            let dist=Math.sqrt(dx*dx+dy*dy);
            let maxDist=50;

            if(dist>maxDist){
                dx=dx/dist*maxDist;
                dy=dy/dist*maxDist;
            }

            joystickThumb.x=100+dx;
            joystickThumb.y=config.height-100+dy;

            joyForce.x=dx/maxDist;
            joyForce.y=dy/maxDist;
        }
    });

    this.input.on("pointerup",pointer=>{
        joyActive=false;
        joystickThumb.x=100;
        joystickThumb.y=config.height-100;
        joyForce={x:0,y:0};
    });
}
