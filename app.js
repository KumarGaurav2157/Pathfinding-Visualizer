const board = document.getElementById("board");
var cells;
let row, col;
var matrix;
let source_Cordinate;
let target_Cordinate;
renderBoard();

function renderBoard(cellWidth = 22) {
  const root = document.documentElement;
  root.style.setProperty("--cell-width", `${cellWidth}px`);
  row = Math.floor(board.clientHeight / cellWidth);
  col = Math.floor(board.clientWidth / cellWidth);
  board.innerHTML = "";
  cells = [];
  matrix = [];

  for (let i = 0; i < row; i++) {
    const rowArr = [];
    const rowElement = document.createElement("div");
    rowElement.classList.add("row");
    rowElement.setAttribute("id", `${i}`);
    for (let j = 0; j < col; j++) {
      const colElement = document.createElement("div");
      colElement.classList.add("col");
      colElement.setAttribute("id", `${i}-${j}`);
      cells.push(colElement);
      rowArr.push(colElement);
      rowElement.appendChild(colElement);
    }
    matrix.push(rowArr);
    board.appendChild(rowElement);
  }
  source_Cordinate = set("source");
  target_Cordinate = set("target");
  boardInteraction(cells);
}

//console.log(matrix);

const navOptions = document.querySelectorAll(".nav-menu>li>a");
var dropOptions = null;
const removeActive = (elements, parent = false) => {
  elements.forEach((element) => {
    if (parent) element = element.parentElement;
    element.classList.remove("active");
  });
};
navOptions.forEach((navOption) => {
  navOption.addEventListener("click", () => {
    const li = navOption.parentElement;
    if (li.classList.contains("active")) {
      li.classList.remove("active");
      return;
    }
    removeActive(navOptions, true);
    li.classList.add("active");
    if (li.classList.contains("drop-box")) {
      dropOptions = li.querySelectorAll(".drop-menu>li");
      toggle_dropOption(navOption.innerText);
    }
  });
});

let pixelSize = 22;
let speed = "Noraml";
let algorithm = "BFS";
const visualizeBtn = document.getElementById("visualize");
function toggle_dropOption(target) {
  console.log(target);
  dropOptions.forEach((dropOption) => {
    dropOption.addEventListener("click", () => {
      removeActive(dropOptions);
      dropOption.classList.add("active");
      if (target === "Pixel") {
        pixelSize = +dropOption.innerText.replace("px", "");
        renderBoard(pixelSize);
        //console.log(pixelSize);
      } else if (target === "Speed") {
        speed = dropOption.innerText;
        //console.log(speed);
      } else {
        algorithm = dropOption.innerText.split(" ")[0];
        //console.log(algorithm);
        visualizeBtn.innerText = `Visualize ${algorithm}`;
      }
      removeActive(navOptions, true);
    });
  });
}

document.addEventListener("click", (e) => {
  const navMenu = document.querySelector(".nav-menu");

  if (!navMenu.contains(e.target)) {
    removeActive(navOptions, true);
  }
});

// board Interaction

function isValid(x, y) {
  return x >= 0 && y >= 0 && x < row && y < col;
}

function set(className, x = -1, y = -1) {
  if (isValid(x, y)) {
    matrix[x][y].classList.add(className);
  } else {
    x = Math.floor(Math.random() * row);
    y = Math.floor(Math.random() * col);
    matrix[x][y].classList.add(className);
  }

  return { x, y };
}

//console.log(source, target);

let isDrawing = false;
let isDragging = false;
let dragPoint = null;

function boardInteraction(cells) {
  cells.forEach((cell) => {
    const pointerdown = (e) => {
      if (e.target.classList.contains("source")) {
        dragPoint = "source";
        isDragging = true;
      } else if (e.target.classList.contains("target")) {
        dragPoint = "target";
        isDragging = true;
      } else {
        isDrawing = true;
      }
    };
    const pointermove = (e) => {
      if (isDrawing) {
        e.target.classList.add("wall");
      } else if (dragPoint && isDragging) {
        document
          .querySelector(`.${dragPoint}`)
          .classList.remove(`${dragPoint}`);
        // cells.forEach((cell) => {
        //   cell.classList.remove(`${dragPoint}`);
        // });
        e.target.classList.add(`${dragPoint}`);
        cordinate = e.target.id.split("-");
        if (dragPoint === "source") {
          source_Cordinate.x = +cordinate[0];
          source_Cordinate.y = +cordinate[1];
        } else {
          target_Cordinate.x = +cordinate[0];
          target_Cordinate.y = +cordinate[1];
        }
      }
    };
    const pointerup = () => {
      isDragging = false;
      isDrawing = false;
      dragPoint = null;
    };
    cell.addEventListener("pointerdown", pointerdown);
    cell.addEventListener("pointermove", pointermove);
    cell.addEventListener("pointerup", pointerup);
    cell.addEventListener("click", () => {
      cell.classList.toggle("wall");
    });
  });
}

const clearPathBtn = document.getElementById("clear-path");
const clearBoardBtn = document.getElementById("clear-board");

const clearPath = () => {
  cells.forEach((cell) => {
    cell.classList.remove("visited");
    cell.classList.remove("path");
  });
};

const clearWall = () => {
  cells.forEach((cell) => {
    cell.classList.remove("wall");
  });
};

const clearBoard = () => {
  clearPath();
  cells.forEach((cell) => {
    cell.classList.remove("visited");
    cell.classList.remove("wall");
    cell.classList.remove("wall");
  });
};

clearPathBtn.addEventListener("click", clearPath);
clearBoardBtn.addEventListener("click", clearBoard);

// =============================================MAZE-GENERATION=======================
var wallToAnimate;
const generateMazeBtn = document.querySelector("#generate-maze");
generateMazeBtn.addEventListener("click", () => {
  clearBoard();
  wallToAnimate = [];

  generateMaze(0, row - 1, 0, col - 1, false, "horizontal");
  animate(wallToAnimate, "wall");
});

//generateMaze(0, row - 1, 0, col - 1, false, "horizontal");
function generateMaze(
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  surroundingWall,
  orientation
) {
  if (rowStart > rowEnd || colStart > colEnd) return;
  if (!surroundingWall) {
    for (let i = 0; i < col; i++) {
      if (
        !matrix[0][i].classList.contains("source") &&
        !matrix[0][i].classList.contains("target")
      )
        wallToAnimate.push(matrix[0][i]);
      if (
        !matrix[row - 1][i].classList.contains("source") &&
        !matrix[row - 1][i].classList.contains("target")
      )
        wallToAnimate.push(matrix[row - 1][i]);
    }
    for (let i = 0; i < row; i++) {
      if (
        !matrix[i][0].classList.contains("source") &&
        !matrix[i][0].classList.contains("target")
      )
        wallToAnimate.push(matrix[i][0]);
      if (
        !matrix[i][col - 1].classList.contains("source") &&
        !matrix[i][col - 1].classList.contains("target")
      )
        wallToAnimate.push(matrix[i][col - 1]);
    }
    surroundingWall = true;
  }

  if (orientation === "horizontal") {
    let possibleRows = [];
    for (let i = rowStart; i <= rowEnd; i += 2) {
      possibleRows.push(i);
    }
    let possiblecols = [];
    for (let i = colStart - 1; i <= colEnd + 1; i += 2) {
      if (i > 0 && i < col - 1) possiblecols.push(i);
    }
    const currentRow =
      possibleRows[Math.floor(Math.random() * possibleRows.length)];
    const randomcol =
      possiblecols[Math.floor(Math.random() * possiblecols.length)];

    for (let i = colStart - 1; i <= colEnd; i++) {
      const cell = matrix[currentRow][i];
      if (
        !cell ||
        i === randomcol ||
        cell.classList.contains("source") ||
        cell.classList.contains("target")
      )
        continue;
      wallToAnimate.push(cell);
    }
    //upper subdivison
    generateMaze(
      rowStart,
      currentRow - 2,
      colStart,
      colEnd,
      surroundingWall,
      currentRow - 2 - rowStart > colEnd - colStart ? "horizontal" : "vertical"
    );
    //bottom subdivison
    generateMaze(
      currentRow + 2,
      rowEnd,
      colStart,
      colEnd,
      surroundingWall,
      rowEnd - (currentRow + 2) > colEnd - colStart ? "horizontal" : "vertical"
    );
  } else {
    let possiblecols = [];
    for (let i = colStart; i <= colEnd; i += 2) {
      possiblecols.push(i);
    }
    let possibleRows = [];
    for (let i = rowStart - 1; i <= rowEnd + 1; i += 2) {
      if (i > 0 && i < row - 1) {
        possibleRows.push(i);
      }
    }
    const currentcol =
      possiblecols[Math.floor(Math.random() * possiblecols.length)];
    const randomRow =
      possibleRows[Math.floor(Math.random() * possibleRows.length)];

    for (let i = rowStart - 1; i <= rowEnd + 1; i++) {
      if (!matrix[i]) continue;
      const cell = matrix[i][currentcol];

      if (
        i === randomRow ||
        cell.classList.contains("source") ||
        cell.classList.contains("target")
      ) {
        continue;
      }

      wallToAnimate.push(cell);
    }

    generateMaze(
      rowStart,
      rowEnd,
      colStart,
      currentcol - 2,
      surroundingWall,
      rowEnd - rowStart > currentcol - 2 - colStart ? "horizontal" : "vertical"
    );
    generateMaze(
      rowStart,
      rowEnd,
      currentcol + 2,
      colEnd,
      surroundingWall,
      rowEnd - rowStart > colEnd - (currentcol + 2) ? "horizontal" : "vertical"
    );
  }
}

//====================================================
//===============Path Finding Algorithm===============
//====================================================

//======================= BFS =============================

var visitedCell;
var pathToAnimate;
visualizeBtn.addEventListener("click", () => {
  clearPath();
  visitedCell = [];
  pathToAnimate = [];
  switch (algorithm) {
    case "BFS":
      BFS();
      break;
    case "DFS":
      if (DFS(source_Cordinate))
        pathToAnimate.push(matrix[source_Cordinate.x][source_Cordinate.y]);
      break;
    case "Greedy":
      GREEDY();
      break;
    case "A*":
      Astar();
      break;
    case "Dijkstra's":
      Dijkstra();
      break;

    default:
      break;
  }
  animate(visitedCell, "visited");
});
function BFS() {
  const queue = [];
  const visited = new Set();
  const parent = new Map();
  queue.push(source_Cordinate);
  visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

  while (queue.length > 0) {
    const current = queue.shift(); // first element;
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
      getPath(parent, target_Cordinate);
      //console.log(pathToAnimate);
      return;
    }

    const neighbours = [
      { x: current.x - 1, y: current.y }, //up
      { x: current.x, y: current.y + 1 }, //right
      { x: current.x + 1, y: current.y }, //bottom
      { x: current.x, y: current.y - 1 }, //left
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.x}-${neighbour.y}`;
      if (
        isValid(neighbour.x, neighbour.y) &&
        !visited.has(key) &&
        !matrix[neighbour.x][neighbour.y].classList.contains("wall")
      ) {
        queue.push(neighbour);
        visited.add(key);
        parent.set(key, current);
      }
    }
  }
}

const speedOptions = document.querySelectorAll("#speed .drop-menu a");

const fast_AnimateDelay = 7;
const normal_AnimateDelay = 10;
const slow_AnimateDelay = 50;
let delay = normal_AnimateDelay;

speedOptions.forEach((option) => {
  option.addEventListener("click", () => {
    let pickedSpeed = option.innerText;
    if (pickedSpeed === "Fast") delay = fast_AnimateDelay;
    else if (pickedSpeed === "Normal") delay = normal_AnimateDelay;
    else delay = slow_AnimateDelay;
  });
});

function animate(elements, className) {
  //let delay = 10;
  if (className === "path") {
    delay *= 3.5;
  }
  for (let i = 0; i < elements.length; i++) {
    setTimeout(() => {
      elements[i].classList.remove("visited");
      elements[i].classList.add(className);
      if (i === elements.length - 1 && className === "visited") {
        animate(pathToAnimate, "path");
      }
    }, delay * i);
  }
}

function getPath(parent, target) {
  if (!target) return;
  pathToAnimate.push(matrix[target.x][target.y]);
  const p = parent.get(`${target.x}-${target.y}`);
  getPath(parent, p);
}

//============================= Dijkstra's Algorithm ====================
class PriorityQueue {
  constructor() {
    this.elements = [];
    this.length = 0;
  }
  push(data) {
    this.elements.push(data);
    this.length++;
    this.upHeapify(this.length - 1);
  }

  pop() {
    this.swap(0, this.length - 1);
    const popped = this.elements.pop();
    this.length--;
    this.downHeapify(0);
    return popped;
  }

  upHeapify(i) {
    if (i == 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (this.elements[i].cost < this.elements[parent].cost) {
      this.swap(parent, i);
      this.upHeapify(parent);
    }
  }

  downHeapify(i) {
    let minNode = i;
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;

    if (
      leftChild < this.length &&
      this.elements[leftChild].cost < this.elements[minNode].cost
    ) {
      minNode = leftChild;
    }

    if (
      rightChild < this.length &&
      this.elements[rightChild].cost < this.elements[minNode].cost
    ) {
      minNode = rightChild;
    }

    if (minNode !== i) {
      this.swap(minNode, i);
      this.downHeapify(minNode);
    }
  }

  isEmpty() {
    return this.length === 0;
  }

  swap(x, y) {
    [this.elements[x], this.elements[y]] = [this.elements[y], this.elements[x]];
  }
}

function Dijkstra() {
  const pq = new PriorityQueue();
  const parent = new Map();
  const distance = [];
  for (let i = 0; i < row; i++) {
    const INF = [];
    for (let j = 0; j < col; j++) {
      INF.push(Infinity);
    }
    distance.push(INF);
  }
  distance[source_Cordinate.x][source_Cordinate.y] = 0;
  pq.push({ cordinate: source_Cordinate, cost: 0 });

  while (!pq.isEmpty()) {
    const { cordinate: current, cost: distanceSoFar } = pq.pop(); // first element;
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
      getPath(parent, target_Cordinate);
      //console.log(pathToAnimate);
      return;
    }

    const neighbours = [
      { x: current.x - 1, y: current.y }, //up
      { x: current.x, y: current.y + 1 }, //right
      { x: current.x + 1, y: current.y }, //bottom
      { x: current.x, y: current.y - 1 }, //left
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.x}-${neighbour.y}`;
      if (
        isValid(neighbour.x, neighbour.y) &&
        !matrix[neighbour.x][neighbour.y].classList.contains("wall")
      ) {
        //Assuming edge weight = 1;
        const edgeWeight = 1;
        const distanceToNeighbour = distanceSoFar + edgeWeight;
        if (distanceToNeighbour < distance[neighbour.x][neighbour.y]) {
          distance[neighbour.x][neighbour.y] = distanceToNeighbour;
          pq.push({ cordinate: neighbour, cost: distanceToNeighbour });
          parent.set(key, current);
        }
      }
    }
  }
}

//============================ GREEDY ALGORITHM==========================

function heuristicValue(node) {
  //return dx + dy;
  return (
    Math.abs(node.x - target_Cordinate.x) +
    Math.abs(node.y - target_Cordinate.y)
  );
}

function GREEDY() {
  const queue = new PriorityQueue();
  const visited = new Set();
  const parent = new Map();
  queue.push({
    cordinate: source_Cordinate,
    cost: heuristicValue(source_Cordinate),
  });
  visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

  while (queue.length > 0) {
    const { cordinate: current } = queue.pop(); // first element;
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
      getPath(parent, target_Cordinate);
      //console.log(pathToAnimate);
      return;
    }

    const neighbours = [
      { x: current.x - 1, y: current.y }, //up
      { x: current.x, y: current.y + 1 }, //right
      { x: current.x + 1, y: current.y }, //bottom
      { x: current.x, y: current.y - 1 }, //left
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.x}-${neighbour.y}`;
      if (
        isValid(neighbour.x, neighbour.y) &&
        !visited.has(key) &&
        !matrix[neighbour.x][neighbour.y].classList.contains("wall")
      ) {
        queue.push({ cordinate: neighbour, cost: heuristicValue(neighbour) });
        visited.add(key);
        parent.set(key, current);
      }
    }
  }
}

//============================A start Algorithm==========================
//Astar == Dijkstra + greedy
//         dist     +  heuristic

// distance ----- gscore
// fscore == gscore + heuristic
function Astar() {
  const queue = new PriorityQueue();
  const visited = new Set(); // closed Set
  const queued = new Set(); //open Set
  const parent = new Map();

  const distance = [];
  for (let i = 0; i < row; i++) {
    const INF = [];
    for (let j = 0; j < col; j++) {
      INF.push(Infinity);
    }
    distance.push(INF);
  }
  distance[source_Cordinate.x][source_Cordinate.y] = 0;

  queue.push({
    cordinate: source_Cordinate,
    cost: 0 + heuristicValue(source_Cordinate),
  });
  visited.add(`${source_Cordinate.x}-${source_Cordinate.y}`);

  while (queue.length > 0) {
    const { cordinate: current } = queue.pop(); // first element;
    visitedCell.push(matrix[current.x][current.y]);

    if (current.x === target_Cordinate.x && current.y === target_Cordinate.y) {
      getPath(parent, target_Cordinate);
      //console.log(pathToAnimate);
      return;
    }

    visited.add(`${current.x}-${current.y}`);

    const neighbours = [
      { x: current.x - 1, y: current.y }, //up
      { x: current.x, y: current.y + 1 }, //right
      { x: current.x + 1, y: current.y }, //bottom
      { x: current.x, y: current.y - 1 }, //left
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.x}-${neighbour.y}`;
      if (
        isValid(neighbour.x, neighbour.y) &&
        !visited.has(key) &&
        !queued.has(key) &&
        !matrix[neighbour.x][neighbour.y].classList.contains("wall")
      ) {
        //Assuming edge weight = 1;
        const edgeWeight = 1;
        const distanceToNeighbour = distance[current.x][current.y] + edgeWeight;
        if (distanceToNeighbour < distance[neighbour.x][neighbour.y]) {
          distance[neighbour.x][neighbour.y] = distanceToNeighbour;
          queue.push({
            cordinate: neighbour,
            cost: distanceToNeighbour + heuristicValue(neighbour),
          });
          queued.add(key);
          parent.set(key, current);
        }
      }
    }
  }
}

//===========================DFS=========================================
const visited = new Set();
function DFS(current) {
  if (current.x === target_Cordinate.x && current.y === target_Cordinate.y)
    return true;
  visitedCell.push(matrix[current.x][current.y]);
  visited.add(`${current.x}-${current.y}`);
  const neighbours = [
    { x: current.x - 1, y: current.y }, //up
    { x: current.x, y: current.y + 1 }, //right
    { x: current.x + 1, y: current.y }, //bottom
    { x: current.x, y: current.y - 1 }, //left
  ];

  for (const neighbour of neighbours) {
    if (
      isValid(neighbour.x, neighbour.y) &&
      !visited.has(`${neighbour.x}-${neighbour.y}`) &&
      !matrix[neighbour.x][neighbour.y].classList.contains("wall")
    ) {
      if (DFS(neighbour)) {
        pathToAnimate.push(matrix[neighbour.x][neighbour.y]);
        return true;
      }
    }
  }
}
