function medianCut(imageData, maxColorGroupCount = 64) {
    const getRed   = i => imageData.data[i];
    const getGreen = i => imageData.data[i + 1];
    const getBlue  = i => imageData.data[i + 2];
    
    const colorArray = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        // 透明は無視する
        if (imageData.data[i + 3] === 0) {
            continue;
        }
        colorArray.push(i);
    }
    if (colorArray.length === 0) {
        return [];
    }
    const tmpColorGroupArray = [colorArray];
    let colorGroupArray = [];

    for (let i = 0; i < maxColorGroupCount - 1; i++) {
        // 最も要素が多い色空間を選択
        let maxLength = 0, maxLengthIndex = 0;
        for (let i = 0; i < tmpColorGroupArray.length; i++) {
            if (tmpColorGroupArray[i].length > maxLength) {
                maxLength = tmpColorGroupArray[i].length;
                maxLengthIndex = i;
            }
        }
        const colorGroup = tmpColorGroupArray[maxLengthIndex];
        tmpColorGroupArray.splice(maxLengthIndex, 1);
        
        // 色空間のRGBの各要素の最大最小を求める
        const statistics = {
            red:   {min: 255, max: 0},
            green: {min: 255, max: 0},
            blue:  {min: 255, max: 0}
        }
        for (const color of colorGroup) {
            statistics.red.min   = Math.min(statistics.red.min, getRed(color));
            statistics.red.max   = Math.max(statistics.red.max, getRed(color));
            statistics.green.min = Math.min(statistics.green.min, getGreen(color));
            statistics.green.max = Math.max(statistics.green.max, getGreen(color));
            statistics.blue.min  = Math.min(statistics.blue.min, getBlue(color));
            statistics.blue.max  = Math.max(statistics.blue.max, getBlue(color));
        }

        const diffRed   = statistics.red.max   - statistics.red.min;
        const diffGreen = statistics.green.max - statistics.green.min;
        const diffBlue  = statistics.blue.max  - statistics.blue.min;

        // 単色は分割する意味がない
        if (diffRed === 0 && diffGreen === 0 && diffBlue === 0) {
            colorGroupArray.push(colorGroup);
            if (tmpColorGroupArray.length === 0) {
                break;
            }
            continue;
        }

        let center = undefined;
        let getTargetRGB = undefined;

        // RGBで濃度差が大きい要素を求める
        if (diffRed >= diffGreen && diffRed >= diffBlue) {
            center = (statistics.red.min + statistics.red.max) / 2;
            getTargetRGB = getRed;
        }
        else if (diffGreen >= diffRed && diffGreen >= diffBlue) {
            center = (statistics.green.min + statistics.green.max) / 2;
            getTargetRGB = getGreen;
        }
        else {
            center = (statistics.blue.min + statistics.blue.max) / 2;
            getTargetRGB = getBlue;
        }

        // 中央値で分割する
        const lowerGroup = [], upperGropu = [];
        while (colorGroup.length > 0) {
            const color = colorGroup.pop();
            if (getTargetRGB(color) < center) {
                lowerGroup.push(color);
            }
            else {
                upperGropu.push(color);
            }
        }
        tmpColorGroupArray.push(lowerGroup);
        tmpColorGroupArray.push(upperGropu);
    }

    colorGroupArray = colorGroupArray.concat(tmpColorGroupArray);

    // 分割された色空間の平均値を求める
    return colorGroupArray.map(colorGroup => {
        const totalColor = colorGroup.reduce((total, color) => {
            total.red   += getRed(color);
            total.green += getGreen(color);
            total.blue  += getBlue(color);
            return total;
        }, {red: 0, green: 0, blue: 0});
        const averageColor = {
            red:   Math.round(totalColor.red   / colorGroup.length),
            green: Math.round(totalColor.green / colorGroup.length),
            blue:  Math.round(totalColor.blue  / colorGroup.length)
        };
        for (const color of colorGroup) {
            imageData.data[color]     = averageColor.red;
            imageData.data[color + 1] = averageColor.green;
            imageData.data[color + 2] = averageColor.blue;
        }
        return averageColor;
    }).sort((a, b) => {
        const sumA = a.red + a.green + a.blue;
        const sumB = b.red + b.green + b.blue;
        if (sumA !== sumB) {
            return sumA - sumB;
        }
        if (a.red !== b.red) {
            return a.red - b.red; 
        }
        if (a.green !== b.green) {
            return a.green - b.green;
        }
        return a.blue - b.blue;
    });
}

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

function removeNonBlackColors(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (r === 0 && g === 0 && b === 0 && a === 255) {
            // 何もしない
        }
        else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
        }
    }
}