/* eslint-disable no-undef */
import "p5";

const randomProperty = function (obj) {
  let keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
};
function createGrid(rows: number, columns: number, value = (x, y) => 0) {
  var array = new Array(rows);
  for (var i = 0; i < rows; i++) {
    array[i] = new Array(columns);
    for (var j = 0; j < columns; j++) {
      array[i][j] = value(i, j);
    }
  }
  return array;
}

const ROW_NUM: number = 16;
const COL_NUM: number = 16;
const w: number = 40;
const h: number = 40;
enum COLORS {
  RED = "teal",
  BLACK = "black",
  GREEN = "green",
  WHITE = "white"
}
function drawCell(x, y, color: COLORS): void {
  fill(color);
  rect(x * w, y * h, w, h);
}
class Grid {
  grid: Array<Array<number>>;
  constructor() {
    this.init();
  }
  draw() {
    this.grid.map((row, y) => {
      row.map((col, x) => {
        drawCell(x, y, COLORS.RED);
      });
    });
  }
  init() {
    this.grid = createGrid(ROW_NUM, COL_NUM);
  }
}

interface IDirection<T> {
  [key: string]: T;
}

interface IPoint {
  x: number;
  y: number;
}
class Point implements IPoint {
  x: number;
  y: number;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const DIRECTIONS: IDirection<IPoint> = {
  RIGHT: { x: 1, y: 0 },
  LEFT: { x: -1, y: 0 },
  TOP: { x: 0, y: -1 },
  BOTTOM: { x: 0, y: 1 }
};

interface ISnake {
  snakeSegments: Array<Point>;
  init: () => void;
  move: () => void;
  draw: () => void;
  increaseSnake: () => void;
  direction: IPoint;
}
class Snake implements ISnake {
  snakeSegments: Array<IPoint>;
  direction: IPoint;
  constructor() {
    this.init();
    this.draw();
  }
  increaseSnake() {
    const [head] = this.snakeSegments;
    const direction = this.direction;
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };
    this.snakeSegments = [newHead, ...this.snakeSegments];
  }
  init() {
    this.direction = randomProperty(DIRECTIONS);
    const points = [
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 }
    ];
    this.snakeSegments = points.map((p) => new Point(p.x, p.y));
  }

  move() {
    const [head] = this.snakeSegments;
    const newHead = new Point(
      head.x + this.direction.x,
      head.y + this.direction.y
    );
    this.snakeSegments = [newHead, ...this.snakeSegments.slice(0, -1)];
  }
  draw() {
    this.snakeSegments.forEach((segment) => {
      drawCell(segment.x, segment.y, COLORS.WHITE);
    });
  }
}

interface ICollision {
  snake: ISnake;
  point: IPoint;
  isCollide: () => boolean;
}
class CollisionManager implements ICollision {
  snake: ISnake;
  point: IPoint;
  constructor(snake: ISnake, point: IPoint) {
    this.snake = snake;
    this.point = point;
  }
  isCollide() {
    const point = this.point;
    const crossed = this.snake.snakeSegments.filter(
      (segment) => segment.x === point.x && segment.y === point.y
    );
    if (crossed.length) {
      return true;
    } else {
      return false;
    }
  }
}
interface IFruit {
  isDestroyed: boolean;
  x: number;
  y: number;
  draw: () => void;
}
const fruits: Array<IFruit> = [];

class Fruit implements IFruit {
  isDestroyed: boolean;
  x: number;
  y: number;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isDestroyed = false;
  }
  static removeFruits() {
    fruits.forEach((f, index) => {
      if (f.isDestroyed) {
        fruits.splice(index, 1);
        Fruit.addFruit();
      }
    });
  }
  static addFruit() {
    let randomX = parseInt(random(0, ROW_NUM));
    let randomY = parseInt(random(0, COL_NUM));
    fruits.push(new Fruit(randomX, randomY));
  }
  static destroyFruits(
    availableForColliding: IFruit[],
    collideManager: ICollision,
    snake: ISnake
  ) {
    for (let f of availableForColliding) {
      collideManager = new CollisionManager(snake, new Point(f.x, f.y));
      if (collideManager.isCollide()) {
        snake.increaseSnake();
        f.isDestroyed = true;
      }
    }
  }
  draw() {
    if (!this.isDestroyed) {
      drawCell(this.x, this.y, COLORS.GREEN);
    } else {
      drawCell(this.x, this.y, COLORS.BLACK);
    }
  }
}
let gridManager;
let snake;
let collideManager;
window.setup = () => {
  createCanvas(640, 480);
  frameRate(30);
  gridManager = new Grid();
  snake = new Snake();
  Fruit.addFruit();
};

window.keyPressed = () => {
  if (keyCode === UP_ARROW) {
    snake.direction = DIRECTIONS.TOP;
  } else if (keyCode === LEFT_ARROW) {
    snake.direction = DIRECTIONS.LEFT;
  } else if (keyCode === RIGHT_ARROW) {
    snake.direction = DIRECTIONS.RIGHT;
  } else if (keyCode === DOWN_ARROW) {
    snake.direction = DIRECTIONS.BOTTOM;
  }
};

setInterval(() => {
  if (fruits.length < 5) {
    Fruit.addFruit();
  }
}, 5000);
window.draw = () => {
  background(20);
  const availableForColliding = fruits.filter((f) => !f.isDestroyed);
  Fruit.destroyFruits(availableForColliding, collideManager, snake);
  Fruit.removeFruits();
  gridManager.draw();
  fruits.forEach((f) => f.draw());
  snake.move();
  snake.draw();
};
document.addEventListener("click", function (e) {});
