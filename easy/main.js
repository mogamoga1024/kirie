
const srcImage = document.querySelector("#src");
const dstCanvas = document.querySelector("#dst");

srcImage.src = "../images/3.jpg";

srcImage.onload = () => {
    dstCanvas.width = srcImage.width;
    dstCanvas.height = srcImage.height;
    const context = dstCanvas.getContext("2d");

    context.drawImage(srcImage, 0, 0);

    const imageData = context.getImageData(0, 0, dstCanvas.width, dstCanvas.height);

    sobelFilter(imageData);

    context.putImageData(imageData, 0, 0);
};

