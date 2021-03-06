const video = document.getElementById("myvideo");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const canvasBbox = document.getElementById("canvas-bbox");
const contextBbox = canvasBbox.getContext("2d");

let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let fieldStart = null;
let rects = null;
let fieldSize = null;

let isVideo = false;
let model = null;
pointer = [0, 0];

pointerCell = null;

const modelParams = {
    flipHorizontal: false,   // flip e.g for video
    maxNumBoxes: 5,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function drawGameField(ctx, margin=100) {
    height = ctx.canvas.height
    width = ctx.canvas.width

    fieldSize = Math.min(height, width) - 2 * margin

    fieldStart = [parseInt((width - fieldSize) / 2), parseInt((height - fieldSize) / 2)]

    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = "green";
    ctx.rect(fieldStart[0], fieldStart[1], fieldSize, fieldSize);
    ctx.stroke();

    let sectionSize = parseInt(fieldSize/3);

    var horLineStart = (width - fieldSize) / 2;
    var verLineStart = (height - fieldSize) / 2;
    ctx.beginPath();

    /*
    * Horizontal lines
    */
    for (var y = 1;y <= 2;y++) {
        ctx.moveTo(horLineStart, y * sectionSize + verLineStart);
        ctx.lineTo(horLineStart + fieldSize, y * sectionSize + verLineStart);
    }


    /*
    * Vertical lines
    */
    for (var x = 1;x <= 2;x++) {
        ctx.moveTo(x * sectionSize + horLineStart, verLineStart);
        ctx.lineTo(x * sectionSize + horLineStart, verLineStart + fieldSize);
    }

    context.stroke();
}

function highlightCell(x, y) {
    third_part = parseInt(fieldSize / 3);

    context.beginPath();
    context.lineWidth = "3";
    context.strokeStyle = "red";
    context.rect(fieldStart[0] + third_part * x, fieldStart[1] + third_part * y, third_part, third_part);
    context.stroke();
}

timeoutTurn = null;

function countDown(x, y) {
    if(!pointerCell || pointerCell[0] != x || pointerCell[1] != y) {
        pointerCell = [x, y];

        if(timeoutTurn) {
            clearTimeout(timeoutTurn);
        }

        timeoutTurn = setTimeout(() => {
            console.log('move to: ', pointerCell);
            board.doPlayerMove(x, y);
        }, 2000);
    }
}

function drawCross(x, y) {
    let third_part = parseInt(fieldSize/3);
    a = 30

    let center_x = fieldStart[0] + third_part * x + third_part / 2
    let center_y = fieldStart[1] + third_part * y + third_part / 2

    context.beginPath();
    context.lineWidth = "3";
    context.strokeStyle = "red";

    if(board.gameResults.winningLine) {
        for(el of board.gameResults.winningLine) {
            if(x == el[0] && y == el[1]) {
                context.strokeStyle = "blue";
                break;
            }
        }
    }

    // from top left to bottom right
    context.moveTo(center_x - a, center_y - a);
    context.lineTo(center_x + a, center_y + a);

    // from bottom right to top left
    context.moveTo(center_x - a, center_y + a);
    context.lineTo(center_x + a, center_y - a);

    context.stroke();
}

function drawZero(x, y) {
    let third_part = parseInt(fieldSize/3);
    a = 30

    let center_x = fieldStart[0] + third_part * x + third_part / 2
    let center_y = fieldStart[1] + third_part * y + third_part / 2

    context.beginPath();
    context.lineWidth = "3";
    context.strokeStyle = "red";

    if(board.gameResults.winningLine) {
        for(el of board.gameResults.winningLine) {
            if(x == el[0] && y == el[1]) {
                context.strokeStyle = "blue";
                break;
            }
        }
    }

    context.arc(center_x, center_y, a, 0, 2 * Math.PI);

    context.stroke();
}

function drawMoves() {
    let b = board.state.game._gameBoard;
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(b[i][j] == 'X') {
                drawCross(i, j);
            } else if(b[i][j] == 'O') {
                drawZero(i, j);
            }
        }
    }
}

video.addEventListener('play', function() {
    var $this = this; //cache
    context.canvas.width = video.width;
    context.canvas.height = video.height;
    let width = video.width;
    let height = video.height;


    (function loop() {
        context.drawImage($this, 0, 0);
        context.beginPath();
        context.arc(pointer[0], pointer[1], 10, 0, 2 * Math.PI);
        context.fillStyle = 'green';
        context.fill();
        drawGameField(context);

        drawMoves();

        if(!board.gameResults.winner) {
            let a = parseInt(fieldSize / 3);

            if(!rects) {
                rects = [
                    [[[0, 0], [fieldStart[0]+a, fieldStart[1]+a]], [[fieldStart[0]+a, 0], [fieldStart[0]+2*a, fieldStart[1]+a]], [[fieldStart[0]+2*a, 0], [width, fieldStart[1]+a]]],
                    [[[0, fieldStart[1]+a], [fieldStart[0]+a, fieldStart[1]+2*a]], [[fieldStart[0]+a, fieldStart[1]+a], [fieldStart[0]+2*a, fieldStart[1]+2*a]], [[fieldStart[0]+2*a, fieldStart[1]+a], [width, fieldStart[1]+2*a]]],
                    [[[0, fieldStart[1]+2*a], [fieldStart[0]+a, height]], [[fieldStart[0]+a, fieldStart[1]+2*a], [fieldStart[0]+2*a, height]], [[fieldStart[0]+2*a, fieldStart[1]+2*a], [width, height]]],
                ]
            }

            for(let i = 0; i < 3; i++) {
                for(let j = 0; j < 3; j++) {
                    rect = rects[i][j];
                    [[x1, y1], [x2, y2]] = rect;
                    if(x1 < pointer[0] && pointer[0] < x2 && y1 < pointer[1] && pointer[1] < y2) {
                        countDown(j, i);
                        highlightCell(j, i);
                        break;
                    }
                }
            }
        }
        setTimeout(loop, 1000 / 30); // drawing at 30fps
    })();
}, 0);

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Your symbol is X. To make a move simply place the green dot with your hand in the desired cell and hold it there for 2 seconds";
            isVideo = true;
            runDetection();
        } else {
            updateNote.innerText = "Please enable video";
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
//        updateNote.innerText = "Starting video";
        startVideo();
    } else {
        updateNote.innerText = "Stopping video";
        handTrack.stopVideo(video);
        isVideo = false;
        updateNote.innerText = "Video stopped";
    }
}


trackButton.addEventListener("click", function() {
    toggleVideo();
});

function runDetection() {
    model.detect(video).then(predictions => {
        let bboxPerimeters = [];
        if(predictions.length) {
            for(pred of predictions) {
                [, , width, height] = pred['bbox'];
                bboxPerimeters.push(width * height);
            }
            const indexOfMaxValue = bboxPerimeters.indexOf(Math.max(...bboxPerimeters));
            [x, y, width, height] = predictions[indexOfMaxValue]['bbox'];
            pointer = [x + width/2, y + height/2];
        }

//        model.renderPredictions(predictions, canvasBbox, contextBbox, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

handTrack.load(modelParams).then(m => {
    model = m;
    updateNote.innerText = "Loaded model!";
    toggleVideo();
});
