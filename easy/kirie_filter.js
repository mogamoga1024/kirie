
function kirieFilter(imageData, outlineThreshold = 180, fillThreshold = 100) {
    // sobelフィルタによる輪郭抽出
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
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

            if (invertedMagnitude < outlineThreshold) {
                data[idx    ] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
            }
            else if (data[idx] < fillThreshold) {
                data[idx    ] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
            }
            else {
                data[idx    ] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = 255;
            }
        }
    }

    // ノイズ除去
    medianFilter(imageData);
}

function medianFilter(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixels = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    pixels.push(copy[index]);
                }
            }
            pixels.sort((a, b) => a - b);
            data[(y * width + x) * 4] = pixels[4];
            data[(y * width + x) * 4 + 1] = pixels[4];
            data[(y * width + x) * 4 + 2] = pixels[4];
        }
    }
}
