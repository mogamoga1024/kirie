
function outline(imageData, baseColorDistance = 30) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const rightIdx = i + 4;
        const underIdx = i + imageData.width * 4;
    
        const existsRight = (i / 4 + 1) % imageData.width !== 0;
        const existsUnder = i <= imageData.width * 4 * (imageData.height - 1);
    
        let didChangeColor = false;
        if (existsRight) {
            if (colorDistance(data, i, rightIdx) > baseColorDistance) {
                data[i] = data[i + 1] = data[i + 2] = 0;
                didChangeColor = true;
            }
        }
        if (!didChangeColor && existsUnder) {
            if (colorDistance(data, i, underIdx) > baseColorDistance) {
                data[i] = data[i + 1] = data[i + 2] = 0;
            }
        }
    }
};

// 3次元空間の距離を求める
// ちなみに最大値は441.6729559300637
function colorDistance(data, oriIdx, dstIdx) {
    return Math.sqrt(
        Math.pow((data[oriIdx] - data[dstIdx]), 2) +
        Math.pow((data[oriIdx + 1] - data[dstIdx + 1]), 2) +
        Math.pow((data[oriIdx + 2] - data[dstIdx + 2]), 2)
    );
};
