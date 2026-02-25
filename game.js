const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#98d98e",
    physics: { default: 'arcade', arcade: { debug:false }},
    scene: { preload, create, update },
    plugins: {
        global: [{
            key: 'rexVirtualJoystick',
            plugin: rexvirtualjoystickplugin,
            start: true
        }]
    }
};

const game = new Phaser.Game(config);

let player, enemies, joystick;
let hp=100, maxHp=100;
let hpBar;
let score=0;
let scoreText;
let swordItem;
let gameOver=false;

let playerSwords=[];
let enemySpeed=120;
let swordLevel=1;

function preload(){
    this.load.image('player','https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('enemy','https://labs.phaser.io/assets/sprites/mushroom2.png');
    this.load.image('sword','https://labs.phaser.io/assets/sprites/sword.png');
    this.load.audio('bgm','https://labs.phaser.io/assets/audio/tech.mp3');
}

function create(){

    score=0;
    hp=100;
    swordLevel=1;
    enemySpeed=120;
    gameOver=false;

    this.sound.play('bgm',{loop:true,volume:0.3});

    player = this.physics.add.image(config.width/2,config.height/2,'player')
    .setCollideWorldBounds(true);

    enemies = this.physics.add.group();

    spawnSwordItem.call(this);

    this.time.addEvent({
        delay:1500,
        callback:spawnEnemy,
        callbackScope:this,
        loop:true
    });

    this.physics.add.overlap(player,enemies,hitPlayer,null,this);

    hpBar=this.add.rectangle(20,20,200,20,0x00ff00).setOrigin(0);

    scoreText=this.add.text(config.width-180,20,"Score: 0",{fontSize:"20px",fill:"#000"});

    joystick = this.plugins.get('rexVirtualJoystick').add(this,{
        x:100,
        y:config.height-100,
        radius:70,
        base:this.add.circle(0,0,70,0x006400),
        thumb:this.add.circle(0,0,35,0x00aa00)
    });
}

function update(){

    if(gameOver) return;

    const force=300; // lebih sensitif
    player.setVelocity(
        joystick.forceX*force,
        joystick.forceY*force
    );

    updateSwords(this,player,playerSwords);

    enemies.getChildren().forEach(enemy=>{
        if(enemy.swords){
            updateSwords(this,enemy,enemy.swords);
        }
    });
}

function spawnEnemy(){
    if(gameOver) return;

    let x=Phaser.Math.Between(0,config.width);
    let y=Phaser.Math.Between(0,config.height);

    let enemy=enemies.create(x,y,'enemy');
    enemy.hp=20;
    enemy.swords=[];

    this.physics.moveToObject(enemy,player,enemySpeed);

    // Musuh juga bisa ambil pedang
    this.physics.add.overlap(enemy,swordItem,()=>{
        giveSword(this,enemy);
        swordItem.destroy();
        spawnSwordItem.call(this);
    });
}

function spawnSwordItem(){
    swordItem=this.physics.add.image(
        Phaser.Math.Between(100,config.width-100),
        Phaser.Math.Between(100,config.height-100),
        'sword'
    );

    this.physics.add.overlap(player,swordItem,()=>{
        giveSword(this,player);
        swordItem.destroy();
        spawnSwordItem.call(this);
    });
}

function giveSword(scene,owner){

    let sword=scene.add.image(owner.x,owner.y,'sword');

    if(owner===player){
        playerSwords.push(sword);
    }else{
        owner.swords.push(sword);
    }
}

function updateSwords(scene,owner,swords){

    swords.forEach((sword,index)=>{
        let angle=scene.time.now/300 + index;
        sword.x=owner.x+Math.cos(angle)*60;
        sword.y=owner.y+Math.sin(angle)*60;

        // warna pedang berdasarkan level
        if(swordLevel===1) sword.setTint(0xaaaaaa);
        if(swordLevel===2) sword.setTint(0x00ff00);
        if(swordLevel>=3) sword.setTint(0xffd700);

        enemies.getChildren().forEach(enemy=>{
            if(owner===player && Phaser.Math.Distance.Between(sword.x,sword.y,enemy.x,enemy.y)<30){
                enemy.destroy();
                score+=10;
                scoreText.setText("Score: "+score);
                levelUpCheck();
            }
        });

        if(owner!==player && Phaser.Math.Distance.Between(sword.x,sword.y,player.x,player.y)<30){
            hitPlayer(player,null);
        }
    });
}

function hitPlayer(playerObj,enemy){
    if(gameOver) return;

    hp-=10;
    hpBar.width=(hp/maxHp)*200;

    if(hp<=0){
        gameOver=true;
        this.physics.pause();

        let txt=this.add.text(
            config.width/2,
            config.height/2,
            "GAME OVER\nTap to Restart",
            {fontSize:"32px",fill:"#000",align:"center"}
        ).setOrigin(0.5);

        this.input.once('pointerdown',()=>location.reload());
    }
}

function levelUpCheck(){

    if(score>0 && score%100===0){

        swordLevel++;
        enemySpeed+=40;

        enemies.getChildren().forEach(enemy=>{
            enemy.hp+=10;
        });
    }
        }
