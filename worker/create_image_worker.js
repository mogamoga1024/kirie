importScripts("../image_editor.js");
importScripts("https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js");

onmessage = evnt => {
    switch (evnt.data.method) {
        case "createImage":
            createImage(evnt);
            break;
        case "removeNoise":
            removeNoise(evnt);
            break;
        case "thickenLines":
            wkThickenLines(evnt);
            break;
        case "convertToSVG":
            wkConvertToSVG(evnt);
            break;
    }
};

async function createImage(evnt) {
    const sBitmap = evnt.data.sBitmap;
    const gamma = evnt.data.gamma;
    const outlineAlgorithm = evnt.data.outlineAlgorithm;
    const lowThreshold = evnt.data.lowThreshold;
    const highThreshold = evnt.data.highThreshold;
    const shouldBinarize = evnt.data.shouldBinarize;
    const baseOutlineAverageColor = evnt.data.baseOutlineAverageColor;
    const needColoredAreas = evnt.data.needColoredAreas;
    const baseColoredAreasAverageColor = evnt.data.baseColoredAreasAverageColor;

    const sCanvas = new OffscreenCanvas(sBitmap.width, sBitmap.height);
    const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
    const dCanvas = new OffscreenCanvas(sBitmap.width, sBitmap.height);
    const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
    sContext.drawImage(sBitmap, 0, 0, sCanvas.width, sCanvas.height);
    sBitmap.close();

    const imageData1 = sContext.getImageData(0, 0, sCanvas.width, sCanvas.height);
            
    // ガンマ補正
    gammaCorrection(imageData1, gamma);
    sContext.putImageData(imageData1, 0, 0);

    // ノイズ除去
    medianFilter(imageData1);

    // 輪郭抽出 & モノクロ
    switch (outlineAlgorithm) {
        case "sobelFilter": sobelFilter(imageData1); break;
        case "prewittFilter": prewittFilter(imageData1); break;
        case "cannyEdgeDetection": cannyEdgeDetection(imageData1, lowThreshold, highThreshold); break;
        case "laplacianFilter": laplacianFilter(imageData1); break;
    }
    monochrome(imageData1, baseOutlineAverageColor, false, shouldBinarize);
    dContext.putImageData(imageData1, 0, 0);

    // 元絵全体のモノクロ
    if (needColoredAreas) {
        const imageData2 = sContext.getImageData(0, 0, sCanvas.width, sCanvas.height);
        monochrome(imageData2, baseColoredAreasAverageColor, true, shouldBinarize);

        const tmpCanvas = new OffscreenCanvas(sCanvas.width, sCanvas.height);
        const tmpContext = tmpCanvas.getContext("2d");
        tmpContext.putImageData(imageData2, 0, 0);

        dContext.drawImage(tmpCanvas, 0, 0);
    }

    const [sBase64, dBase64] = await Promise.all([canvasToBase64(sCanvas), canvasToBase64(dCanvas)]);
    postMessage({sBase64, dBase64});
}

async function removeNoise(evnt) {
    const dBitmap = evnt.data.dBitmap;
    const dCanvas = new OffscreenCanvas(dBitmap.width, dBitmap.height);
    const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
    dContext.drawImage(dBitmap, 0, 0, dCanvas.width, dCanvas.height);
    dBitmap.close();

    const imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
    medianFilter(imageData);
    dContext.putImageData(imageData, 0, 0);

    const dBase64 = await canvasToBase64(dCanvas);
    postMessage({dBase64});
}

async function wkThickenLines(evnt) {
    const dBitmap = evnt.data.dBitmap;
    const dCanvas = new OffscreenCanvas(dBitmap.width, dBitmap.height);
    const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
    dContext.drawImage(dBitmap, 0, 0, dCanvas.width, dCanvas.height);
    dBitmap.close();

    const imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
    thickenLines(imageData, 1);
    dContext.putImageData(imageData, 0, 0);

    const dBase64 = await canvasToBase64(dCanvas);
    postMessage({dBase64});
}

async function wkConvertToSVG(evnt) {
    const dBitmap = evnt.data.dBitmap;
    const dCanvas = new OffscreenCanvas(dBitmap.width, dBitmap.height);
    const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
    dContext.drawImage(dBitmap, 0, 0, dCanvas.width, dCanvas.height);
    dBitmap.close();

    const imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
    const strSvg = convertToSVG(imageData);
    postMessage({strSvg});
}
