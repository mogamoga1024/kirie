
const srcImage = document.querySelector("#src");
const dstImage = document.querySelector("#dst");

const inputFile = document.querySelector("#input-file");
const inputOutlineThreshold = document.querySelector("#input-outline-threshold");
const inputFillThreshold = document.querySelector("#input-fill-threshold");

let outlineThreshold = 180;
let fillThreshold = 100;

// srcImage.src = "../images/3.jpg";
srcImage.src = "../kawaii.png";
srcImage.onload = () => {
    updateCanvas();
};

inputFile.onchange = e => {
    const imageFile = e.target.files[0];
    
    if (!imageFile.type.startsWith("image")) {
        alert("画像ファイルを選択してください。");
        return;
    }

    srcImage.onload = () => {
        updateCanvas();
        URL.revokeObjectURL(srcImage.src);
    };
    srcImage.onerror = () => {
        alert("画像の読み込みに失敗しました。");
        URL.revokeObjectURL(srcImage.src);
    };
    srcImage.src = URL.createObjectURL(imageFile);
};
inputOutlineThreshold.onchange = e => {
    outlineThreshold = Number(e.target.value);
    updateCanvas();
};
inputFillThreshold.onchange = e => {
    fillThreshold = Number(e.target.value);
    updateCanvas();
};

function updateCanvas() {
    const dstCanvas = new OffscreenCanvas(srcImage.naturalWidth, srcImage.naturalHeight);
    const context = dstCanvas.getContext("2d", { willReadFrequently: true });

    context.drawImage(srcImage, 0, 0);

    const imageData = context.getImageData(0, 0, dstCanvas.width, dstCanvas.height);

    kirieFilter(imageData, outlineThreshold, fillThreshold);

    context.putImageData(imageData, 0, 0);

    canvasToBase64(dstCanvas).then(base64 => {
        dstImage.src = base64;
    });
}


