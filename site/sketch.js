let grid;
let squareAmount = 100;
let gameSize;
let gameState;
let brushState;
let lastCell;
let buttons;
let img;
let duck;

const Game = {
	RUNNING: "running",
	PAUSED: "paused"
}

const Brush = {
  DRAW: "draw",
  ERASE: "erase"
}

function preload() {
  img = loadImage('../assets/logo.png');
}

function loadImageData() {
  image(img, 0, 0, 100, 100);
  loadPixels();

  let d = pixelDensity();

  duck = new Array(squareAmount);
  for (let x = 0; x < squareAmount; x++) {
    duck[x] = new Array(squareAmount);
    for (let y = 0; y < squareAmount; y++) {
      const i = 4 * d*(y * d*width + x);
      if(pixels[i] !== 0) {
        const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]]; // get colors
        duck[x][y] = 1;
      } else {
        duck[x][y] = 0;
      }
    }
  }

}

function setup() {
  gameSize = windowWidth;
  gameState = Game.PAUSED;
  brushState = Brush.DRAW;
  createCanvas(gameSize, gameSize);

  loadImageData();

  grid = createGrid();

  buttons = [createButton('Start'), createButton('Draw')];
  buttons.forEach(button => {
    button.parent('buttons');
    button.class('button')
  });

  buttons[0].mousePressed(toggleGameState);
  buttons[1].mousePressed(toggleBrushState);
}

function draw() {
  background(255);  
  
  if(gameState === Game.RUNNING) grid = update(grid);

  for (let i = 0; i < squareAmount; i++) {
    for (let j = 0; j < squareAmount; j++) {
      grid[i][j].show();
    }
  }
}

function mouseDragged(mouse) {
  let currentCell = grid[floor(mouse.changedTouches[0].clientX / (gameSize / squareAmount))][floor((mouse.changedTouches[0].clientY - 75) / (gameSize / squareAmount))];
  // if(lastCell) {
  //   plotLine(currentCell.x, currentCell.y, lastCell.x, lastCell.y);
  //   return;
  // }
  if(lastCell !== currentCell) {
    currentCell.state = brushState === Brush.DRAW ? 1 : 0;
  }
  lastCell = currentCell;
}

// function mouseClicked(mouse) {
//   let currentCell = grid[floor(mouse.clientX / (gameSize / squareAmount))][floor((mouse.clientY - 75) / (gameSize / squareAmount))];
//   if(lastCell) {
//     plotLine(currentCell.x, currentCell.y, lastCell.x, lastCell.y);
//   }
//   // if(lastCell !== currentCell) {
//   //   currentCell.state = brushState === Brush.DRAW ? 1 : 0;
//   // }
//   lastCell = currentCell;

// }

function plotLine(x0, y0, x1, y1) {
  let dx = x1 - x0;
  let dy = y1 - y0;
  let D = 2 * dy - dx;
  let y = y0;
  
  for(let x = x0; x <= x1; x++) {
    grid[x][y].state = brushState === Brush.DRAW ? 1 : 0;
    if (D > 0) {
      y += 1;
      D -= 2 * dx;
    }
    D = D + 2 * dy;
  }
}

function toggleGameState() {  
  if(gameState === Game.RUNNING) {
    gameState = Game.PAUSED;
  } else {
    gameState = Game.RUNNING;
  }
  buttons[0].html(gameState === Game.RUNNING ? "Stop" : "Start");

}
function toggleBrushState() {  
  if(brushState === Brush.DRAW) {
    brushState = Brush.ERASE;
  } else {
    brushState = Brush.DRAW;
  }
  buttons[1].html(brushState === Brush.DRAW ? "Draw" : "Erase");
}

function update(arr) {
  let next = {...arr};
  for (let i = 0; i < squareAmount; i++) {
    for (let j = 0; j < squareAmount; j++) {
      let count = applyRules(arr, i, j)

      if (count == 3 && next[i][j].state == 0) next[i][j].state = 1;
      else if (next[i][j].state == 1 && (count < 2 || count > 3)) next[i][j].state = 0;
    }
  }

  return next;
}

function applyRules(arr, row, col) {
  let neighbourCount = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let rows = (row + i + squareAmount) % squareAmount;
      let cols = (col + j + squareAmount) % squareAmount;

      neighbourCount += arr[rows][cols].state;
    }
  }

  if (arr[col][row].state == 1) neighbourCount--;
  return neighbourCount;
}

function createGrid() {
  let arr = new Array(squareAmount);
  for (let i = 0; i < squareAmount; i++) {
    arr[i] = new Array(squareAmount);
    for (let j = 0; j < squareAmount; j++) {
      arr[i][j] = new Cell(i, j, round(random() * 0.6));
    }
  }
  return arr;
}



function Cell(x, y, state) {
  this.x = x;
  this.y = y;
  this.state = state;

  this.show = function () {
    // TODO set fill to transparent or something

    if (this.state === 1) {
      fill(255);
      stroke(255)
      rectMode(CORNER);
      rect(this.x * (gameSize / squareAmount), this.y * (gameSize / squareAmount), (gameSize / squareAmount), (gameSize / squareAmount));
    } else if (duck[x][y] === 1) {
      fill(0);
      stroke(0)
      rectMode(CORNER);
      rect(this.x * (gameSize / squareAmount), this.y * (gameSize / squareAmount), (gameSize / squareAmount), (gameSize / squareAmount));
    }
  }

  this.toggle = function () {
    if(this.state === 1) this.state = 0;
    else this.state = 1;
  }
}