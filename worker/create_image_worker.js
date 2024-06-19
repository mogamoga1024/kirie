
onmessage = evnt => {
    const sBitmap = evnt.data.sBitmap;
    const imageWidth = evnt.data.imageWidth;
    const imageHeight = evnt.data.imageHeight;
    const canvas = new OffscreenCanvas(imageWidth, imageHeight);
    const context = canvas.getContext("2d");
    context.drawImage(sBitmap, 0, 0, canvas.width, canvas.height);

};
