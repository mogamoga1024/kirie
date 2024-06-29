
function kirieFilter(imageData, outlineThreshold = 180, fillThreshold = 100) {
    // sobelフィルタによる輪郭抽出
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        }
        else {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
        data[i + 3] = 255;
    }

    const sobelData = new Uint8ClampedArray(width * height);

    const kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixel = data[((y + ky) * width + (x + kx)) * 4];
                    pixelX += pixel * kernelX[ky + 1][kx + 1];
                    pixelY += pixel * kernelY[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.round(Math.sqrt(pixelX * pixelX + pixelY * pixelY));
            sobelData[y * width + x] = magnitude;
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const invertedMagnitude = 255 - sobelData[y * width + x];

            if (invertedMagnitude < outlineThreshold || data[idx] < fillThreshold) {
                data[idx    ] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
            }
            else {
                data[idx    ] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
            }
        }
    }

    // ノイズ除去
    medianFilter(imageData);
}
