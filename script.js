const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let gameData;

const SAVE_KEY = "darkForestSave";

function defaultData() {
  return {
    level: 1,
    exp: 0,
    expNeeded: 100,
    hp: 100,
    maxHp: 100,
    damage: 10,
    score: 0
  };
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

function loadGame() {
  const data = localStorage.getItem(SAVE_KEY);
  if (data) {
    gameData = JSON.parse(data);
  } else {
    gameData = defaultData();
  }
}

function newGame() {
  localStorage.removeItem(SAVE_KEY);
  gameData = defaultData();
  startGame();
}

function startGame() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");
  updateUI();
  gameLoop();
}

function updateUI() {
  document.getElementById("level").textContent = gameData.level;
  document.getElementById("score").textContent = gameData.score;

  document.getElementById("hpBar").style.width =
    (gameData.hp / gameData.maxHp) * 100 + "%";

  document.getElementById("expBar").style.width =
    (gameData.exp / gameData.expNeeded) * 100 + "%";
}

function gainExp(amount) {
  gameData.exp += amount;
  gameData.score += amount;

  if (gameData.exp >= gameData.expNeeded) {
    gameData.exp -= gameData.expNeeded;
    gameData.level++;
    gameData.expNeeded = Math.floor(gameData.expNeeded * 1.5);
    gameData.maxHp += 20;
    gameData.hp = gameData.maxHp;
    gameData.damage += 5;
  }

  updateUI();
  saveGame();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "green";
  ctx.fillRect(280, 180, 40, 40);

  requestAnimationFrame(gameLoop);
}

document.getElementById("continueBtn").onclick = () => {
  loadGame();
  startGame();
};

document.getElementById("newGameBtn").onclick = () => {
  newGame();
};

window.onload = () => {
  setTimeout(() => {
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
  }, 2000);
};

// TEST EXP tiap 3 detik
setInterval(() => {
  if (gameData) gainExp(20);
}, 3000);
