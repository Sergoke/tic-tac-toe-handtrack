const video = document.getElementById("myvideo");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const canvasBbox = document.getElementById("canvas-bbox");
const contextBbox = canvasBbox.getContext("2d");

let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model = null;
pointer = [0, 0];

const modelParams = {
    flipHorizontal: false,   // flip e.g for video
    maxNumBoxes: 10,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function drawGameField(ctx, margin=50) {
    height = ctx.canvas.height
    width = ctx.canvas.width

    side_length = Math.min(height, width) - 2 * margin

    point_1 = [parseInt((width - side_length) / 2), parseInt((height - side_length) / 2)]
    //    point_2 = [point_1[0] + side_length, point_1[1] + side_length]

    //    cv2.rectangle(fr, point_1, point_2, (0, 0, 255), -1)
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = "green";
    ctx.rect(point_1[0], point_1[1], side_length, side_length);
    ctx.stroke();

    let sectionSize = parseInt(side_length/3);

    var horLineStart = (width - side_length) / 2;
    var verLineStart = (height - side_length) / 2;
    ctx.beginPath();

    /*
    * Horizontal lines
    */
    for (var y = 1;y <= 2;y++) {
        ctx.moveTo(horLineStart, y * sectionSize + verLineStart);
        ctx.lineTo(horLineStart + side_length, y * sectionSize + verLineStart);
    }


    /*
    * Vertical lines
    */
    for (var x = 1;x <= 2;x++) {
        ctx.moveTo(x * sectionSize + horLineStart, verLineStart);
        ctx.lineTo(x * sectionSize + horLineStart, verLineStart + side_length);
    }

    context.stroke();
}


video.addEventListener('play', function() {
    var $this = this; //cache
    context.canvas.width = video.width;
    context.canvas.height = video.height;

    (function loop() {
        context.drawImage($this, 0, 0);
        context.beginPath();
        context.arc(pointer[0], pointer[1], 10, 0, 2 * Math.PI);
        context.fillStyle = 'green';
        context.fill();
        drawGameField(context);
        setTimeout(loop, 1000 / 30); // drawing at 30fps
    })();
}, 0);

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking";
            isVideo = true;
            runDetection();
        } else {
            updateNote.innerText = "Please enable video";
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video";
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
//        console.log("Predictions: ", predictions);
        if(predictions.length) {
            [x, y, width, height] = predictions[0]['bbox'];
            pointer = [x + width/2, y + height/2];
            console.log(pointer);
        }

        model.renderPredictions(predictions, canvasBbox, contextBbox, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

handTrack.load(modelParams).then(m => {
    model = m;
    updateNote.innerText = "Loaded model!";
});
