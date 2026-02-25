const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#a8e6a1",
    physics: { default: 'arcade', arcade: { debug:false }},
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, enemies;
let hp=100, maxHp=100;
let hpBar;
let score=0;
let scoreText;
let swordItem;
let playerSwords=[];
let enemySpeed=120;
let swordLevel=1;
let gameOver=false;

// ANALOG VARIABLE
let joystickBase, joystickThumb;
let joyActive=false;
let joyPointer=null;
let joyForce={x:0,y:0};

function preload(){
    this.load.image('player','https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('enemy','https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.image('sword','https://labs.phaser.io/assets/sprites/sword.png');
}

function create(){

    player=this.physics.add.image(config.width/2,config.height/2,'player')
    .setCollideWorldBounds(true);

    enemies=this.physics.add.group();

    spawnSwordItem.call(this);

    this.time.addEvent({
        delay:1500,
        callback:spawnEnemy,
        callbackScope:this,
        loop:true
    });

    this.physics.add.overlap(player,enemies,hitPlayer,null,this);

    // HP BAR
    this.add.rectangle(20,20,200,20,0xff0000).setOrigin(0);
    hpBar=this.add.rectangle(20,20,200,20,0x00ff00).setOrigin(0);

    // SCORE
    scoreText=this.add.text(config.width-180,20,"Score: 0",{fontSize:"20px",fill:"#000"});

    // ANALOG MANUAL
    joystickBase=this.add.circle(100,config.height-100,60,0x006400).setAlpha(0.5);
    joystickThumb=this.add.circle(100,config.height-100,30,0x00aa00).setAlpha(0.8);

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
        if(pointer.id===joyPointer?.id){
            joyActive=false;
            joystickThumb.x=100;
            joystickThumb.y=config.height-100;
            joyForce={x:0,y:0};
        }
    });
}

function update(){

    if(gameOver) return;

    const speed=300;
    player.setVelocity(joyForce.x*speed,joyForce.y*speed);

    updateSwords(this,player,playerSwords);
}

function spawnEnemy(){
    if(gameOver) return;

    let x=Phaser.Math.Between(0,config.width);
    let y=Phaser.Math.Between(0,config.height);

    let enemy=enemies.create(x,y,'enemy');
    this.physics.moveToObject(enemy,player,enemySpeed);
}

function spawnSwordItem(){
    swordItem=this.physics.add.image(
        Phaser.Math.Between(100,config.width-100),
        Phaser.Math.Between(100,config.height-100),
        'sword'
    );

    this.physics.add.overlap(player,swordItem,()=>{
        giveSword(this);
        swordItem.destroy();
        spawnSwordItem.call(this);
    });
}

function giveSword(scene){
    let sword=scene.add.image(player.x,player.y,'sword');
    playerSwords.push(sword);
}

function updateSwords(scene,owner,swords){

    swords.forEach((sword,index)=>{
        let angle=scene.time.now/300 + index;
        sword.x=owner.x+Math.cos(angle)*60;
        sword.y=owner.y+Math.sin(angle)*60;

        if(swordLevel===1) sword.setTint(0xaaaaaa);
        if(swordLevel===2) sword.setTint(0x00ff00);
        if(swordLevel>=3) sword.setTint(0xffd700);

        enemies.getChildren().forEach(enemy=>{
            if(Phaser.Math.Distance.Between(sword.x,sword.y,enemy.x,enemy.y)<30){
                enemy.destroy();
                score+=10;
                scoreText.setText("Score: "+score);
                levelUp();
            }
        });
    });
}

function levelUp(){
    if(score>0 && score%100===0){
        swordLevel++;
        enemySpeed+=40;
    }
}

function hitPlayer(){
    hp-=10;
    hpBar.width=(hp/maxHp)*200;

    if(hp<=0){
        gameOver=true;
        this.physics.pause();

        this.add.text(
            config.width/2,
            config.height/2,
            "GAME OVER\nTap to Restart",
            {fontSize:"32px",fill:"#000",align:"center"}
        ).setOrigin(0.5);

        this.input.once('pointerdown',()=>location.reload());
    }
}
