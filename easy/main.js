
const srcImage = document.querySelector("#src");
const dstCanvas = document.querySelector("#dst");

const inputOutlineThreshold = document.querySelector("#input-outline-threshold");
const inputFillThreshold = document.querySelector("#input-fill-threshold");

let outlineThreshold = 180;
let fillThreshold = 100;

srcImage.src = "../images/3.jpg";
srcImage.onload = () => {
    updateCanvas();
};

function updateCanvas() {
    dstCanvas.width = srcImage.width;
    dstCanvas.height = srcImage.height;
    const context = dstCanvas.getContext("2d");

    context.drawImage(srcImage, 0, 0);

    const imageData = context.getImageData(0, 0, dstCanvas.width, dstCanvas.height);

    sobelFilter(imageData, outlineThreshold, fillThreshold);

    context.putImageData(imageData, 0, 0);
}


