const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");

let isVideo = false;
let model2 = null;

 video.width = 700
 video.height = 400

const model2Params = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}


trackButton.addEventListener("click", function(){
    toggleVideo();
});

function nextImage() {

    imgindex++;
    handimg.src = "images/" + imgindex % 15 + ".jpg"
    // alert(handimg.src)
    runDetectionImage(handimg)
}



function runDetection() {
    model2.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);
        model2.renderPredictions(predictions, canvas, context, video);
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

function runDetectionImage(img) {
    model2.detect(img).then(predictions => {
        console.log("Predictions: ", predictions);
        model2.renderPredictions(predictions, canvas, context, img);
    });
}

// Load the model2.
handTrack.load(model2Params).then(lmodel2 => {
    // detect objects in the image.
    model2 = lmodel2
    updateNote.innerText = "Loaded model2!"
    runDetectionImage(handimg)
    trackButton.disabled = false
    nextImageButton.disabled = false
});
