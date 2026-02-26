window.onload = function () {

  const loadingScreen = document.getElementById("loadingScreen");
  const menu = document.getElementById("menu");
  const continueBtn = document.getElementById("continueBtn");
  const newGameBtn = document.getElementById("newGameBtn");

  const SAVE_KEY = "darkForestSave";
  let gameData = null;

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
    menu.classList.add("hidden");
    document.getElementById("gameUI").classList.remove("hidden");
    initCanvas();
  }

  continueBtn.onclick = function () {
    loadGame();
    startGame();
  };

  newGameBtn.onclick = function () {
    newGame();
  };

  // Loading screen delay
  setTimeout(function () {
    loadingScreen.classList.add("hidden");
    menu.classList.remove("hidden");
  }, 1500);

  // ================= GAME =================

  function initCanvas() {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    let player = {
      x: 300,
      y: 200,
      size: 30,
      speed: 3
    };

    let keys = {};

    document.addEventListener("keydown", e => keys[e.key] = true);
    document.addEventListener("keyup", e => keys[e.key] = false);

    function movePlayer() {
      if (keys["w"]) player.y -= player.speed;
      if (keys["s"]) player.y += player.speed;
      if (keys["a"]) player.x -= player.speed;
      if (keys["d"]) player.x += player.speed;
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

    function gameLoop() {
      drawBackground();
      movePlayer();
      drawPlayer();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }

};
