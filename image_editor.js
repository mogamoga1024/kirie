
function medianFilter(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // for (let c = 0; c < 3; c++) {
            //     const pixels = [];
            //     for (let dy = -1; dy <= 1; dy++) {
            //         for (let dx = -1; dx <= 1; dx++) {
            //             const index = ((y + dy) * width + (x + dx)) * 4 + c;
            //             pixels.push(copy[index]);
            //         }
            //     }
            //     pixels.sort((a, b) => a - b);
            //     data[(y * width + x) * 4 + c] = pixels[4];
            // }
            const pixels = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    pixels.push(copy[index]);
                }
            }
            pixels.sort((a, b) => a - b);
            // MEMO:モノクロに変換されているからこれでいい
            data[(y * width + x) * 4] = pixels[4];
            data[(y * width + x) * 4 + 1] = pixels[4];
            data[(y * width + x) * 4 + 2] = pixels[4];
        }
    }
}

// function grayScale(imageData) {
//     const data = imageData.data;
//     for (let i = 0; i < data.length; i += 4) {
//         const red   = data[i];
//         const green = data[i + 1];
//         const blue  = data[i + 2];
//         const grayscaleValue = 0.21 * red + 0.72 * green + 0.07 * blue;
//         data[i]     = grayscaleValue;
//         data[i + 1] = grayscaleValue;
//         data[i + 2] = grayscaleValue;
//     }
// }

function monochrome(imageData, baseOutlineAverageColor = 110, needTransparent = false, shouldBinarize = true) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let value = 0.21 * r + 0.72 * g + 0.07 * b;

        if (shouldBinarize) {
            if (value <= baseOutlineAverageColor) {
                value = 0; // 黒
            }
            else {
                value = 255; // 白
            }
        }
        
        if (needTransparent && data[i + 3] === 0) {
            data[i]     = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
        }
        else if (value !== 255) {
            data[i]     = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
        else {
            data[i]     = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = needTransparent ? 0 : 255;
        }
    }
}

function sobelFilter(imageData) {
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
            data[idx] = invertedMagnitude;
            data[idx + 1] = invertedMagnitude;
            data[idx + 2] = invertedMagnitude;
            data[idx + 3] = 255;
        }
    }
}

function prewittFilter(imageData) {
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
        [-1, 0, 1],
        [-1, 0, 1]
    ];
    const kernelY = [
        [-1, -1, -1],
        [0, 0, 0],
        [1, 1, 1]
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

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const invertedMagnitude = 255 - sobelData[y * width + x];

            data[idx] = invertedMagnitude;
            data[idx + 1] = invertedMagnitude;
            data[idx + 2] = invertedMagnitude;
            data[idx + 3] = 255;
        }
    }
}

function laplacianFilter(imageData) {
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

    const kernel = [
        [0, -1, 0],
        [-1, 4, -1],
        [0, -1, 0]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelSum = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixel = data[((y + ky) * width + (x + kx)) * 4];
                    pixelSum += pixel * kernel[ky + 1][kx + 1];
                }
            }

            const magnitude = Math.abs(pixelSum);
            sobelData[y * width + x] = magnitude;
        }
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const invertedMagnitude = 255 - sobelData[y * width + x];

            data[idx] = invertedMagnitude;
            data[idx + 1] = invertedMagnitude;
            data[idx + 2] = invertedMagnitude;
            data[idx + 3] = 255;
        }
    }
}

function cannyEdgeDetection(imageData, lowThreshold = 50, highThreshold = 150) {
    lowThreshold = Math.max(0, Math.min(255, lowThreshold));
    highThreshold = Math.max(0, Math.min(255, highThreshold));

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // グレースケール変換
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }

    // Step 1: Gaussian Blur (using a simple box blur for simplicity)
    const blurredData = new Uint8ClampedArray(data.length);
    const kernelSize = 5;
    const kernel = [
        2, 4, 5, 4, 2,
        4, 9, 12, 9, 4,
        5, 12, 15, 12, 5,
        4, 9, 12, 9, 4,
        2, 4, 5, 4, 2
    ];
    const kernelSum = kernel.reduce((a, b) => a + b, 0);
    for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
            let sum = 0;
            for (let ky = -2; ky <= 2; ky++) {
                for (let kx = -2; kx <= 2; kx++) {
                    const pixel = data[((y + ky) * width + (x + kx)) * 4];
                    sum += pixel * kernel[(ky + 2) * kernelSize + (kx + 2)];
                }
            }
            const idx = (y * width + x) * 4;
            const blurred = sum / kernelSum;
            blurredData[idx] = blurred;
            blurredData[idx + 1] = blurred;
            blurredData[idx + 2] = blurred;
            blurredData[idx + 3] = 255;
        }
    }

    // Step 2: Gradient Calculation using Sobel filter
    const sobelData = new Uint8ClampedArray(width * height);
    const gradX = new Float32Array(width * height);
    const gradY = new Float32Array(width * height);
    const kernelX = [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
    ];
    const kernelY = [
        -1, -2, -1,
        0, 0, 0,
        1, 2, 1
    ];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixel = blurredData[((y + ky) * width + (x + kx)) * 4];
                    pixelX += pixel * kernelX[(ky + 1) * 3 + (kx + 1)];
                    pixelY += pixel * kernelY[(ky + 1) * 3 + (kx + 1)];
                }
            }
            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY) >>> 0;
            sobelData[y * width + x] = magnitude;
            gradX[y * width + x] = pixelX;
            gradY[y * width + x] = pixelY;
        }
    }

    // Step 3: Non-Maximum Suppression
    const suppressedData = new Uint8ClampedArray(width * height);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const magnitude = sobelData[idx];
            const angle = Math.atan2(gradY[idx], gradX[idx]) * (180 / Math.PI);
            let compare1 = 0;
            let compare2 = 0;

            if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 || angle < -157.5)) {
                compare1 = sobelData[idx - 1];
                compare2 = sobelData[idx + 1];
            } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
                compare1 = sobelData[idx - width + 1];
                compare2 = sobelData[idx + width - 1];
            } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
                compare1 = sobelData[idx - width];
                compare2 = sobelData[idx + width];
            } else if ((angle >= 112.5 && angle < 157.5) || (angle >= -67.5 && angle < -22.5)) {
                compare1 = sobelData[idx - width - 1];
                compare2 = sobelData[idx + width + 1];
            }

            if (magnitude >= compare1 && magnitude >= compare2) {
                suppressedData[idx] = magnitude;
            } else {
                suppressedData[idx] = 0;
            }
        }
    }

    // Step 4: Double Threshold
    const highThresholdValue = highThreshold;
    const lowThresholdValue = lowThreshold;
    const strong = 255;
    const weak = 75;

    for (let i = 0; i < suppressedData.length; i++) {
        if (suppressedData[i] >= highThresholdValue) {
            suppressedData[i] = strong;
        } else if (suppressedData[i] >= lowThresholdValue) {
            suppressedData[i] = weak;
        } else {
            suppressedData[i] = 0;
        }
    }

    // Step 5: Edge Tracking by Hysteresis
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (suppressedData[idx] === weak) {
                if (
                    suppressedData[idx - 1] === strong || suppressedData[idx + 1] === strong ||
                    suppressedData[idx - width] === strong || suppressedData[idx + width] === strong ||
                    suppressedData[idx - width - 1] === strong || suppressedData[idx - width + 1] === strong ||
                    suppressedData[idx + width - 1] === strong || suppressedData[idx + width + 1] === strong
                ) {
                    suppressedData[idx] = strong;
                } else {
                    suppressedData[idx] = 0;
                }
            }
        }
    }

    // 結果をimageData.dataに反映
    for (let i = 0; i < suppressedData.length; i++) {
        const value = suppressedData[i];
        const idx = i * 4;
        data[idx] = 255 - value;
        data[idx + 1] = 255 - value;
        data[idx + 2] = 255 - value;
        data[idx + 3] = 255;
    }
}

function convertToSVG(imageData) {
    const options = {
        // ltres: 1,
        // qtres: 1,
        pathomit: 17,
        colorsampling: 0,
        numberofcolors: 2,
        blurradius: 5,
        // blurdelta: 20,
        colorquantcycles: 5,
        // linefilter: true,
        // strokewidth: 1,
        // layering: 0,
        pal: [{r:0,g:0,b:0,a:255}, {r:255,g:255,b:255,a:255}]
    };

    return ImageTracer.imagedataToSVG(imageData, options);
}

function thickenLines(imageData, thickness) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const pixelData = [];

    // ピクセルデータを収集し、明るさ順にソート
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            pixelData.push({ x, y, value: data[index] });
        }
    }

    // 明るさの降順にソート
    pixelData.sort((a, b) => b.value - a.value);

    // blackDataを初期化
    const blackData = new Array(width * height).fill(null);

    // 濃い順に太くする処理
    for (let i = 0; i < pixelData.length; i++) {
        const { x, y, value } = pixelData[i];
        if (value < 255) {  // 白ではないピクセル
            for (let dy = -thickness; dy <= thickness; dy++) {
                for (let dx = -thickness; dx <= thickness; dx++) {
                    const newX = x + dx;
                    const newY = y + dy;
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        const newIndex = newY * width + newX;
                        if (blackData[newIndex] === null || blackData[newIndex] > value) {
                            blackData[newIndex] = value;
                        }
                    }
                }
            }
        }
    }

    // blackDataの情報をimageDataに反映する
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const blackIndex = y * width + x;
            const index = blackIndex * 4;
            if (blackData[blackIndex] !== null) {
                data[index] = blackData[blackIndex];
                data[index + 1] = blackData[blackIndex];
                data[index + 2] = blackData[blackIndex];
            }
        }
    }
}

function gammaCorrection(imageData, gamma) {
    const data = imageData.data;
    const length = data.length;
    const gammaCorrection = 1 / gamma;

    for (let i = 0; i < length; i += 4) {
        data[i] = 255 * Math.pow(data[i] / 255, gammaCorrection);
        data[i + 1] = 255 * Math.pow(data[i + 1] / 255, gammaCorrection);
        data[i + 2] = 255 * Math.pow(data[i + 2] / 255, gammaCorrection);
    }
}

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
