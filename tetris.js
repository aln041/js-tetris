const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20, 20);

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

// 'player' is the current shape dropping on the screen.
const player = {
    pos: {
        x: 0,
        y: 0
    },
    matrix: null,
    score: 0
};


const arena = createMatrix(12, 20);
let dropCounter = 0;
let dropInterval = 1000; // total time for a tetris shape to drop (milliseconds)
let start = 0;


/**
 * This function clears the botton of the screen when a row is full
 */
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount;
    }
}

/* 
This function detects if a shape collies with another shape.
*/
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) { // while h !== 0
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createShape(type) {
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

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {
        x: 0,
        y: 0
    });
    drawMatrix(player.matrix, player.pos);
}

/*
This function draws the tetris shape
*/
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

/*
This function copies the values of 'player' into 'arena' at the correct position.
The 'arena' param is a matrix representation of the entire game.
*/
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

/**
 * This function gets called every time the shape moves downward one increment.
 */
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

/**
 * This function will move the current falling shape left or right.
 * @param {*} offset the offset the shape (player) will move.
 */
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

/**
 * This function rotates the current dropping shape.
 * @param {int} direction is the direction to rotate the shape.
 */
function playerRotate(direction) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    // check for collision
    while (collide(arena, matrix)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createShape(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            // swap the values in the matrix
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (direction > 0) {
        matrix.forEach(row => {
            row.reverse()
        });
    } else {
        matrix.reverse();
    }
}

/* 
This function gets called 60 times per second through requestAnimationFrame().
The time parameter is a DOMHighResTimeStamp, which starts at 0 milliseconds.
 */
function update(time = 0) {
    const dt = time - start;
    start = time;
    dropCounter += dt;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = "Score: " + player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // left arrow
        playerMove(-1);
    } else if (event.keyCode === 39) { // right arrow
        playerMove(1);
    } else if (event.keyCode === 40) { // down arrow
        playerDrop();
    } else if (event.keyCode === 38) { // up arrow
        playerRotate(1);
    }
    /*else if (event.keyCode === 32) { // space bar
           playerBottom();
       }*/
});

// Initialize the game
playerReset();
updateScore();
update();