/*  TODO
-   ajouter un bouton pause
-   ajouter du son
-   ajouter un scoreboard
-   ajouter diférents thèmes
*/

var canvas = document.getElementById("tetris");
var ctx = canvas.getContext("2d");
ctx.scale(20, 20);
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var placeHolder = document.getElementById("placeholder");
var ptx = placeHolder.getContext("2d");
ptx.scale(20, 20);
ptx.fillStyle = "rgba(0, 0, 0, 0.1)";
ptx.fillRect(0, 0, placeHolder.width, placeHolder.height);

function arenaSweep(){
    let rowCount = 1;
    outer :for(let y = arena.length - 1; y > 0; --y){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] == 0){
                continue outer ;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;

        player.score += rowCount * 100;
        rowCount *= 2;
        dropInterval *= 0.925;
    }
}

function collide(arena, player){
    const [m, o] = [player.matrix, player.position];
    for (let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if(m[y][x] != 0 && (arena[y + o.y] && 
            arena[y + o.y][x + o.x]) != 0){
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h){
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createTetriminos(type){
    if(type == 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    }
    else if(type == 'L'){
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2]
        ];
    }
    else if(type == 'J'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0]
        ];
    }
    else if(type == 'I'){
        return [
            [0, 4, 0, 0],
            [0, 4, 0, 0],
            [0, 4, 0, 0],
            [0, 4, 0, 0]
        ];
    }
    else if(type == 'S'){
        return [
            [0, 0, 0],
            [0, 5, 5],
            [5, 5, 0]
        ];
    }
    else if(type == 'Z'){
        return [
            [0, 0, 0],
            [6, 6, 0],
            [0, 6, 6]
        ];
    }
    else if(type == 'O'){
        return [
            [7, 7],
            [7, 7]
        ];
    }
}

function draw(){
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawTetriminos(arena, {x:0, y: 0});
    drawTetriminos(player.matrix, player.position);
}

function drawPlaceHolder(matrix, offset){
    ptx.clearRect(0, 0, placeHolder.width, placeHolder.height);
    ptx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ptx.fillRect(0, 0, canvas.width, canvas.height);
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0){
                ptx.fillStyle = colors[value];
                ptx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawTetriminos(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0){
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value != 0){
                arena[y + player.position.y][x + player.position.x] = value;
            }
        })
    })
}

function playerDrop(){
    player.position.y++;
    if(collide(arena, player)){
        player.position.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir){
    player.position.x += dir;
    if(collide(arena, player)){
        player.position.x -= dir
    }
}

const tetriminos = 'ILJOTSZ';
var current = createTetriminos(tetriminos[Math.floor(Math.random() * 7)]);

function playerReset(){
    let next = createTetriminos(tetriminos[Math.floor(Math.random() * 7)]);
    player.matrix = current;
    current = next;
    drawPlaceHolder(next, {x: 0, y: 0});
    player.position.y = 0;
    player.position.x = Math.floor(arena[0].length / 2) - 
                        Math.floor(player.matrix[0].length / 2);
    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        alert(player.score);
        player.score = 0;
        updateScore();
        dropInterval = 1000;
        
    }
}

function playerRotate(dir){
    const position = player.position.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)){
        player.position.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.position.x = position;
            return;
        }
    }
}

function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
        for(let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if(dir > 0){
       matrix.forEach(row => row.reverse()); 
    }
    else{
        matrix.reverse();
    }
}

var dropCounter = 0;
var dropInterval = 1000;

var lastTime = 0;
var animation;
function update(time = 0){
    let deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }
    draw();
    animation = requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById("score").innerHTML = "score: " + player.score;
}

function pauseGame(){
    cancelAnimationFrame(animation);
}

function playGame(){
    
    animation = requestAnimationFrame(update);
}

const colors = [
    null,
    '#8A2BE2', //purple
    '#FF971C', //orange
    '#0341AE', //blue
    '#00CED1', //cyan
    '#32CD32', //green
    '#FF3213', //red 
    '#FFD500' //yellow
];

const arena = createMatrix(12, 20);

const player = {
    position: {x: 0, y: 0},
    matrix: null,
    score: 0
}

var controls = document.addEventListener('keydown', event => {
    if(event.keyCode == 37){
        playerMove(-1);
    }
    else if(event.keyCode == 39){
        playerMove(1);
    }
    else if(event.keyCode == 40){
        playerDrop();
    }
    else if(event.keyCode == 81){
        playerRotate(-1);
    }
    else if(event.keyCode == 87){
        playerRotate(1);
    }
})

function sound(src) {
    let audio = document.createElement("audio");
    audio.src = src;
    audio.setAttribute("preload", "auto");
    audio.setAttribute("controls", "none");
    audio.loop = true;
    audio.style.display = "none";
    document.body.appendChild(audio);
    this.play = function(){
      audio.play();
    }
    this.stop = function(){
      audio.pause();
    }
  }

var backgroundMusic = new sound('Media/TetrisThemeA.mp3');

function beginGame(){
    gameover = false;
    document.getElementById("start").style.display = "none";
    document.getElementById("play").style.display = "inline";
    playerReset();
    backgroundMusic.play();
    updateScore();
    update();
}

