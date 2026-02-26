const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let keys = {};

let player = {
  x: 300,
  y: 200,
  size: 30,
  speed: 3
};

let enemies = [];

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function spawnEnemy() {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 20,
    speed: 1.5
  });
}

setInterval(spawnEnemy, 2000);

function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;
}

function moveEnemies() {
  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    enemy.x += (dx/dist) * enemy.speed;
    enemy.y += (dy/dist) * enemy.speed;
  });
}

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(1, "#203a43");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawEnemies() {
  ctx.fillStyle = "red";
  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  });
}

function gameLoop() {
  drawBackground();
  movePlayer();
  moveEnemies();
  drawPlayer();
  drawEnemies();
  requestAnimationFrame(gameLoop);
}

gameLoop();
