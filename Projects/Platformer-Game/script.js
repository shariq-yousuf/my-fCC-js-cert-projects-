const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const bgSky = document.querySelector(".background-buildings");
const darkModeIcon = document.querySelector("#dark-mode-icon");
const leftBtn = document.querySelector("#left-btn");
const rightBtn = document.querySelector("#right-btn");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
};

class Player {
  constructor() {
    this.position = {
      x: proportionalSize(10),
      y: proportionalSize(400),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
  }
  draw() {
    bgSky.classList[1] === "light-sky"
      ? (ctx.fillStyle = "red")
      : (ctx.fillStyle = "white");
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    if (this.position.x < this.width) {
      this.position.x = this.width;
    }

    if (this.position.x >= canvas.width - 2 * this.width) {
      this.position.x = canvas.width - 2 * this.width;
    }
  }
}

class Platform {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.width = 200;
    this.height = proportionalSize(40);
  }
  draw() {
    ctx.shadowColor = "gray";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    bgSky.classList[1] === "light-sky"
      ? (ctx.fillStyle = "#ffcf33")
      : (ctx.fillStyle = "#fcdf85");
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class CheckPoint {
  constructor(x, y, z) {
    this.position = {
      x,
      y,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
  }

  draw() {
    bgSky.classList[1] === "light-sky"
      ? (ctx.fillStyle = "#f54b4b")
      : (ctx.fillStyle = "white");
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
}

const player = new Player();

const platformPositions = [
  { x: 500, y: proportionalSize(450) },
  { x: 700, y: proportionalSize(400) },
  { x: 850, y: proportionalSize(350) },
  { x: 900, y: proportionalSize(350) },
  { x: 1050, y: proportionalSize(150) },
  { x: 2500, y: proportionalSize(450) },
  { x: 2900, y: proportionalSize(400) },
  { x: 3150, y: proportionalSize(350) },
  { x: 3900, y: proportionalSize(450) },
  { x: 4200, y: proportionalSize(400) },
  { x: 4400, y: proportionalSize(200) },
  { x: 4700, y: proportionalSize(150) },
];

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

const checkpointPositions = [
  { x: 1170, y: proportionalSize(80), z: 1 },
  { x: 2900, y: proportionalSize(330), z: 2 },
  { x: 4800, y: proportionalSize(80), z: 3 },
];

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach((platform) => {
    platform.draw();
  });

  checkpoints.forEach((checkpoint) => {
    checkpoint.draw();
  });

  player.update();

  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5;
  } else if (
    keys.leftKey.pressed &&
    player.position.x > proportionalSize(100)
  ) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >=
        platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every((rule) => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    }
  });

  checkpoints.forEach((checkpoint, index, checkpoints) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <=
        checkpoint.position.x - checkpoint.width + player.width * 0.9,
      index === 0 || checkpoints[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      checkpoint.claim();

      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("You reached the final checkpoint!");
        movePlayer("ArrowRight", 0, false);
      } else if (
        player.position.x >= checkpoint.position.x &&
        player.position.x <= checkpoint.position.x + 40
      ) {
        showCheckpointScreen("You reached a checkpoint!");
      }
    }
  });
};

const keys = {
  rightKey: {
    pressed: false,
  },
  leftKey: {
    pressed: false,
  },
};

const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
};

const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  animate();

  if (innerWidth < 768) {
    leftBtn.style.display = "block";
    rightBtn.style.display = "block";
  }
};

const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
  }
};

const enableDarkMode = () => {
  let vars;
  bgSky.classList.toggle("dark-sky");
  bgSky.classList.toggle("light-sky");
  const body = document.querySelector("body");
  const btn = document.querySelector(".btn");

  if (bgSky.classList[1] === "dark-sky") {
    vars = {
      "--building-color1": "#000",
      "--building-color2": "#000",
      "--building-color3": "#000",
      "--building-color4": "#000",
      "--window-color1": "#777",
      "--window-color2": "#777",
      "--window-color3": "#777",
      "--window-color4": "#777",
      "--section-bg-color": "#000000ae",
    };

    body.style.color = "white";
    btn.style.background = "white";
    btn.style.border = "none";
  } else {
    vars = {
      "--building-color1": "#aa80ff",
      "--building-color2": "#66cc99",
      "--building-color3": "#cc6699",
      "--building-color4": "#538cc6",
      "--window-color1": "#bb99ff",
      "--window-color2": "#8cd9b3",
      "--window-color3": "#d98cb3",
      "--window-color4": "#8cb3d9",
      "--section-bg-color": "#ffffffdf",
    };

    body.style.color = "#0919ff";
    btn.style.background = "linear-gradient(#66cc99, #8cd9b3)";
    btn.style.border = "medium outset #8cd9b3";
  }

  Object.entries(vars).forEach((v) =>
    document.body.style.setProperty(v[0], v[1])
  );
};

startBtn.addEventListener("click", startGame);

window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});

leftBtn.addEventListener("touchstart", () => {
  movePlayer("ArrowLeft", 8, true);
});

leftBtn.addEventListener("touchend", () => {
  movePlayer("ArrowLeft", 0, false);
});

rightBtn.addEventListener("touchstart", () => {
  movePlayer("ArrowRight", 8, true);
});

rightBtn.addEventListener("touchend", () => {
  movePlayer("ArrowRight", 0, false);
});

canvas.addEventListener("touchstart", () => {
  movePlayer("ArrowUp", 8, true);
});

canvas.addEventListener("touchend", () => {
  movePlayer("ArrowUp", 0, false);
});

darkModeIcon.addEventListener("click", enableDarkMode);
