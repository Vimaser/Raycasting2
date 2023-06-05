import { map } from './map.js';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.getElementById("gameCanvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const context = canvas.getContext("2d");

const TICK = 30;
const CELL_SIZE = 64;
const PLAYER_SIZE = 10;
const FOV = toRadians(60);

const wallTexture = new Image();
wallTexture.src = '/brick.jpg'

const floorTexture = new Image();
floorTexture.src = '/brick.jpg'

const ceilingTexture = new Image();
ceilingTexture.src = '/5if9Z+.png'

let texturesLoaded = 0;
const totalTextures = 3;

wallTexture.addEventListener('load', handleTextureLoad);
floorTexture.addEventListener('load', handleTextureLoad);
ceilingTexture.addEventListener('load', handleTextureLoad);

function handleTextureLoad() {
  texturesLoaded++;

  if (texturesLoaded === totalTextures) {
    renderScene(rays);
  }
}

const rays = [
  { angle: 0, distance: 5 },
  { angle: Math.PI / 4, distance: 7 },
  { angle: Math.PI / 2, distance: 3 },
];

const COLORS = {
  floor: "#d52b1e",
  ceiling: "#ffffff",
  wall: "#013aa6",
  wallDark: "#FFA500",
  rays: "#99E77D"
};



const player = {
  x: CELL_SIZE * 1.5,
  y: CELL_SIZE * 2,
  angle: 0,
  speed: 0,
  strafe: 0,
};


function movePlayer() {
    const nextX = player.x + Math.cos(player.angle) * player.speed + Math.sin(player.angle) * player.strafe;
    const nextY = player.y + Math.sin(player.angle) * player.speed - Math.cos(player.angle) * player.strafe;
  
    const cellX = Math.floor(nextX / CELL_SIZE);
    const cellY = Math.floor(nextY / CELL_SIZE);
  
    if (!outOfMapBounds(cellX, cellY) && map[cellY][cellX] === 0) {
      player.x = nextX;
      player.y = nextY;
    }
}
  

function outOfMapBounds(x, y) {
  return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getVCollision(angle) {
  const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

  const firstX = right
    ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
    : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

  const firstY = player.y + (firstX - player.x) * Math.tan(angle);

  const xA = right ? CELL_SIZE : -CELL_SIZE;
  const yA = xA * Math.tan(angle);

  let wall;
  let nextX = firstX;
  let nextY = firstY;
  while (!wall) {
    const cellX = right
      ? Math.floor(nextX / CELL_SIZE)
      : Math.floor(nextX / CELL_SIZE) - 1;
    const cellY = Math.floor(nextY / CELL_SIZE);

    if (outOfMapBounds(cellX, cellY)) {
      break;
    }
    wall = map[cellY][cellX];
    if (!wall) {
        nextX += xA;
        nextY += yA;
      }
    }
    return {
      angle,
      distance: distance(player.x, player.y, nextX, nextY),
      vertical: true,
    };
  }
  

function getHCollision(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2);
    const firstY = up
      ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
      : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;
  
    const firstX = player.x + (firstY - player.y) / Math.tan(angle);
  
    const yA = up ? -CELL_SIZE : CELL_SIZE;
    const xA = yA / Math.tan(angle);
  
    let wall; // Declare the `wall` variable
  
    let nextX = firstX; // Initialize `nextX` with `firstX`
    let nextY = firstY; // Initialize `nextY` with `firstY`
  
    while (!wall) {
      const cellX = Math.floor(nextX / CELL_SIZE);
      const cellY = up
        ? Math.floor(nextY / CELL_SIZE) - 1
        : Math.floor(nextY / CELL_SIZE);
  
      if (outOfMapBounds(cellX, cellY)) {
        break;
      }
      wall = map[cellY][cellX];
      if (!wall) {
        nextX += xA;
        nextY += yA;
      }
    }
    return {
      angle,
      distance: distance(player.x, player.y, nextX, nextY),
      vertical: false,
    };
  }
  
function castRay(angle) {
    const vCollision = getVCollision(angle, player.angle); // Pass player.angle as an argument
    const hCollision = getHCollision(angle, player.angle); // Pass player.angle as an argument
  
    return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
  }
  

function getRays() {
  const initialAngle = player.angle - FOV / 2;
  const numberOfRays = SCREEN_WIDTH;
  const angleStep = FOV / numberOfRays;
  return Array.from({ length: numberOfRays }, (_, i) => {
    const angle = initialAngle + i * angleStep;
    const ray = castRay(angle);
    return ray;
  });
}

function fixFishEye(distance, angle, playerAngle) {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff);
  }



function renderScene(rays) {
rays.forEach((ray, i) => {
  const distance = fixFishEye(ray.distance, ray.angle, player.angle);
  const wallHeight = (CELL_SIZE / distance) * SCREEN_HEIGHT;

  if (ray.vertical) {
    // texture coords based on wall height
    const textureX = Math.floor(ray.distance) % CELL_SIZE;
    //const textureY = Math.floor((i / SCREEN_WIDTH) * wallTexture.height);
    const textureY = Math.floor((ray.hitX / CELL_SIZE) * wallTexture.height);


    //draw wall texture

    context.drawImage(
      wallTexture,
      textureX, 0, 1, wallTexture.height,
      i, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight
    );
  } else {
    // draw floor & ceiling
    context.fillStyle = COLORS.floor;
    context.fillRect(i, SCREEN_HEIGHT / 2 + wallHeight / 2, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);

    context.fillStyle = COLORS.ceiling;
    context.fillRect(i, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2); 
  }
});
} 
  
/* function renderScene(rays) {
    rays.forEach((ray, i) => {
      const distance = fixFishEye(ray.distance, ray.angle, player.angle); // Pass player.angle as an argument
      const wallHeight = (CELL_SIZE / distance) * SCREEN_HEIGHT;
  
      context.fillStyle = ray.vertical ? COLORS.wallDark : COLORS.wall;
      context.fillRect(i, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight);
  
      context.fillStyle = COLORS.floor;
      context.fillRect(i, SCREEN_HEIGHT / 2 + wallHeight / 2, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);
  
      context.fillStyle = COLORS.ceiling;
      context.fillRect(i, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);
    });
} */

const toggleMapButton = document.getElementById("toggleMapButton");
toggleMapButton.addEventListener("click", toggleMap);

function toggleMap() {
  console.log("click", toggleMap);
  isMinimapVisible = !isMinimapVisible;

  if (isMinimapVisible) {
    renderMinimap(0, 0, 0.75, rays);
  } else {
    clearMinimap();
  }
}

function clearMinimap() {
  context.fillStyle = "black";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

let isMinimapVisible = true;


function renderMinimap(posX = 0, posY = 0, scale = 0, rays) {
  //console.log("rays:", rays);
  if (!isMinimapVisible) {
    return; // If the minimap is not visible, exit the function early
  }

  const cellSize = scale * CELL_SIZE;

  if (!Array.isArray(map) || !Array.isArray(rays)) {
    // Handle the case when `map` or `rays` is not an array
    console.error("Invalid map or rays data.");
    return;
  }

  map.forEach((row, y) => {
    if (!Array.isArray(row)) {
      // Handle the case when a row in the map is not an array
      console.error(`Invalid row data at index ${y}.`);
      return;
    }

    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = "grey";
        context.fillRect(
          posX + x * cellSize,
          posY + y * cellSize,
          cellSize,
          cellSize
        );
      }
    });
  });

  context.strokeStyle = COLORS.rays;
  rays.forEach((ray) => {
    context.beginPath();
    context.moveTo(player.x * scale + posX, player.y * scale + posY);
    context.lineTo(
      (player.x + Math.cos(ray.angle) * ray.distance) * scale,
      (player.y + Math.sin(ray.angle) * ray.distance) * scale
    );
    context.closePath();
    context.stroke();
  });

  context.fillStyle = "blue";
  context.fillRect(
    posX + player.x * scale - PLAYER_SIZE / 2,
    posY + player.y * scale - PLAYER_SIZE / 2,
    PLAYER_SIZE,
    PLAYER_SIZE
  );
  const rayLength = PLAYER_SIZE * 2;
  context.strokeStyle = "blue";
  context.beginPath();
  context.moveTo(player.x * scale + posX, player.y * scale + posY);
  context.lineTo(
    (player.x + Math.cos(player.angle) * rayLength) * scale,
    (player.y + Math.sin(player.angle) * rayLength) * scale
  );
  context.closePath();
  context.stroke();
}

function gameLoop() {
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    movePlayer();
    const updatedRays = getRays();
    renderScene(updatedRays);
    renderMinimap(0, 0, 0.75, updatedRays);
  }
  
  setInterval(gameLoop, TICK);
  

  

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

//Controls

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      player.speed = 2;
    }
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      player.speed = -2;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      player.strafe = -2;
    }
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      player.strafe = 2;
    }
  });
  
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "w" || e.key === "s" || e.key === "W" || e.key === "S") {
      player.speed = 0;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "d" || e.key === "a" || e.key === "D" || e.key === "A") {
      player.strafe = 0;
    }
  });
  

  document.addEventListener("mousemove", (e) => {
    player.angle += toRadians(e.movementX);
  }); 

  document.addEventListener("keydown", (e) => {
    if (e.key === "m") {
      isMinimapVisible = !isMinimapVisible;
  }
});

//mobile player controls
/* 
document.addEventListener("touchstart", handleTouchStart);
document.addEventListener("touchend", handleTouchEnd);

let touchX = null;

function handleTouchStart(event) {
  const touch = event.touches[0];
  touchX = touch.clientX;
}

function handleTouchEnd(event) {
  if (touchX === null) {
    return;
  }

  const touch = event.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchDeltaX = touchEndX - touchX;

  // Handle touch controls based on touchDeltaX value

  if (touchDeltaX > 0) {
    // right
    player.strafe = -2; 
  } else if (touchDeltaX < 0) {
    // left
    player.strafe = 2;
}   else {
  player.speed = 2;
}

// reset value
touchX = null;
} */

//test