importScripts("../image_editor.js");

onmessage = async evnt => {
    const sBitmap = evnt.data.sBitmap;
    const imageWidth = evnt.data.imageWidth;
    const imageHeight = evnt.data.imageHeight;
    const gamma = evnt.data.gamma;
    const outlineAlgorithm = evnt.data.outlineAlgorithm;
    const lowThreshold = evnt.data.lowThreshold;
    const highThreshold = evnt.data.highThreshold;

    const baseOutlineAverageColor = evnt.data.baseOutlineAverageColor;
    const needColoredAreas = evnt.data.needColoredAreas;
    const baseColoredAreasAverageColor = evnt.data.baseColoredAreasAverageColor;

    const sCanvas = new OffscreenCanvas(imageWidth, imageHeight);
    const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
    const dCanvas = new OffscreenCanvas(imageWidth, imageHeight);
    const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
    sContext.drawImage(sBitmap, 0, 0, sCanvas.width, sCanvas.height);
    sBitmap.close();

    const imageData1 = sContext.getImageData(0, 0, sCanvas.width, sCanvas.height);
            
    // ガンマ補正
    gammaCorrection(imageData1, gamma);
    sContext.putImageData(imageData1, 0, 0);

    // 輪郭抽出 & モノクロ
    switch (outlineAlgorithm) {
        case "sobelFilter": sobelFilter(imageData1); break;
        case "prewittFilter": prewittFilter(imageData1); break;
        case "cannyEdgeDetection": cannyEdgeDetection(imageData1, lowThreshold, highThreshold); break;
        case "laplacianFilter": laplacianFilter(imageData1); break;
    }
    monochrome(imageData1, baseOutlineAverageColor);
    dContext.putImageData(imageData1, 0, 0);

    // 元絵全体のモノクロ
    if (needColoredAreas) {
        const imageData2 = sContext.getImageData(0, 0, sCanvas.width, sCanvas.height);
        monochrome(imageData2, baseColoredAreasAverageColor, true);

        const tmpCanvas = new OffscreenCanvas(sCanvas.width, sCanvas.height);
        const tmpContext = tmpCanvas.getContext("2d");
        tmpContext.putImageData(imageData2, 0, 0);

        dContext.drawImage(tmpCanvas, 0, 0);
    }

    const [sBase64, dBase64] = await Promise.all([canvasToBase64(sCanvas), canvasToBase64(dCanvas)]);
    postMessage({sBase64, dBase64});
};

function canvasToBase64(canvas) {
    return new Promise(async resolve => {
        const fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.onerror = () => {
            resolve("");
        };
        const blob = await canvas.convertToBlob();
        fr.readAsDataURL(blob);
    });
}
