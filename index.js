const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

ctx.scale(20, 20);
const arena = createMatrix(12, 20);

//creates an oject.
position = {
  x: 5,
  y: 5
};

// this is another object
const player = {
  pos: position,
  matrix: piece('T'),
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// basically look at the entire arena and find if there is a filled row
// Logic: take that row, fill with zeroes, add to top of array
// function clearLine(){
//   for(let y = arena.length - 1; y > 0; y--){
//     for(let x = 0; x < arena[y].length; x++){
//       if(arena[y][x] === 0){
//         continue;
//       }
//     }
//
//     const row = arena.splice(y,1)[0].fill(0);
//     arena.unshift(row);
//     y++;
//   }
// }

/*
Task 2 after adding keydown eventListener: Do not let the tetris go through the brick wall at the bottom, right, left
y = ROW, x = COL
CONCEPT: player has its own matrix. Arena is basically a 12(col) * 20(row) 2D table of 0's.
In this table we need to check if the matrix[y][x] is
We add player.pos.y to y to check the current row the player is in right now.
we run the for loop till the length of matrix because thats all we are interested in.
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
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  };
  return matrix;
};

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {
    x: 0,
    y: 0
  });
  drawMatrix(player.matrix, player.pos);
}

// draws our tetris
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
};

//merge the values of the player into the arena or copy the values of player into arena.
//arena is arranged as such (y first x next because when we cosole.log, it shows it like that)
// we add + player.pos.y and + player.pos.x cz that gives u the real time position of the block. If we do not do that
// every time merge will be called, it will put the block at the same position. Remove + player.pos.y and see for yourself.

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
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
    // clearLine();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// if collides on the left wall, add offset
// when it collides on the right wall, subract two.
function playerRotate(dir) {
  let offset = 1;
  rotate(player.matrix, dir);

  while (collide(arena, player)) {
    player.pos.x += offset;
    if (collide(arena, player)) {
      player.pos.x -= 2;
    }
  }
}

function piece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function playerReset(){
  const pieces = 'TJLOSZI';
  const length = pieces.length;
  player.matrix = piece(pieces[Math.floor(length * Math.random())]);
  player.pos.y = 0;

  if(collide(arena, player)){
    arena.forEach(row => row.fill(0));
  }
}

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

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  }
  // } else {
  //   matrix.reverse();
  // }
};

let dropCounter = 0;
let dropInterval = 1000; // this is in milliseconds. So every second we drop.

let start = 0;

// this is a loop. requestAnimationFrame runs 60 times/sec. In this case, it will keep redrawing.
function update(timestamp = 0) {
  const elapsed = timestamp - start;

  dropCounter += elapsed;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  start = timestamp;
  draw();
  requestAnimationFrame(update);
}

update();

document.addEventListener('keydown', e => {
  if (e.keyCode === 37) {
    playerMove(-1); //left
  } else if (e.keyCode === 39) {
    playerMove(1); //right
  } else if (e.keyCode === 40) {
    playerDrop(); // down
  }
  // key q
  else if (e.keyCode == 81) {
    playerRotate(-1);
  }
  // key w
  else if (e.keyCode == 87) {
    playerRotate(1);
  }
});
