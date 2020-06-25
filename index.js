const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

ctx.scale(20, 20);
const arena = createMatrix(12,20);

const matrix = [
  // creates T
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

//creates an oject.
position = {x:5, y:5};

// this is another object
const player = {
  pos: position,
  matrix: matrix,
}

/*
Task 2 after adding keydown eventListener: Do not let the tetrics go through the brick wall at the bottom, right, left
y = ROW, x = COL
CONCEPT: player has its own matrix. Arena is basically a 12(col) * 20(row) 2D table of 0's.
In this table we need to check if the matrix[y][x] is
We add player.pos.y to y to check the current row the player is in right now.
we run the for loop till for the length of matrix because thats all we are interested in.
if the arena has a row and a col at the specficied locations and they are not 0, collide.
*/

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// This creates multiple arrays inside the matrix array.
// Basically creates the array as well.
function createMatrix(w, h){
  const matrix = [];
  while(h--){
    matrix.push(new Array(w).fill(0));
  };
  return matrix;
};

function draw(){
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

// draws our tetris
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
};

//merge the values of the player into the arena or copy the values of player into arena.
//arena is arranged as such (y first x next because when we cosole log, it shows it like that)
// we add + player.pos.y and + player.pos.x cz that gives u the real time position of the block. If we do not do that
// every time merge will be called, it will put the block at the same position. Remove + player.pos.y and see for yourself.

function merge(arena, player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
};

function playerDrop() {
  player.pos.y++; // we choose y and it increases because it is gng down where y increases.
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
  }
  dropCounter = 0;
}

function playerMove(dir){
  player.pos.x += dir;
  if(collide(arena, player)){
    player.pos.x -= dir;
  }
}

function playerRotate(dir){
  rotate(player.matrix, dir);
}
// When we add the event listener, we find two issues to resolve.
// Task 1: Write the rotate function to rotate the tetris

function rotate(matrix, dir) {
  // we say matrix.length because thats an indication of the number of rows and does not change.
  // this is transposing (rows to columns)
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      var temp = matrix[x][y];
      matrix[x][y] = matrix[y][x];
      matrix[y][x] = temp;
      // [
      //   matrix[x][y], matrix[y][x]
      // ] = [
      //   matrix[y][x], matrix[x][y]
      // ];
    }
  }
  if (dir > 0){
    matrix.forEach(row => row.reverse());
  }
  else{
    matrix.reverse();
  }
};

// we need to implement functionality to drop the piece (one block at a time)

let dropCounter = 0;
let dropInterval = 1000; // this is in milliseconds. So every second we drop.

let start = 0;

// this is a loop. requestAnimationFrame runs 60 times/sec. In this case, it will keep redrawing.
function update(timestamp = 0){
  const elapsed = timestamp - start;

  // console.log(elapsed);
  dropCounter += elapsed;
  if(dropCounter > dropInterval){
    playerDrop();
  }

  start = timestamp;
  draw();
  requestAnimationFrame(update);
}

update();

document.addEventListener('keydown', e => {
  if(e.keyCode === 37){
    playerMove(-1); //left
  }
  else if(e.keyCode === 39){
    playerMove(1); //right
  }
  else if(e.keyCode === 40){
    playerDrop(); // down
  }
  // key q  
  else if(e.keyCode == 81){
    playerRotate(-1);
  }
  // key w
  else if(e.keyCode == 87){
    playerRotate(1);
  }
});
