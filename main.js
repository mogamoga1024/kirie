
let isLoadingInputImage = false;
let worker = null;

const App = {
    components: {
        PlusMinusInputNumbur
    },
    data() {
        return {
            imageFileName: "",
            image: null,
            imageWidth: 0,
            imageWidthMin: 10,
            imageWidthMax: 5000,
            outlineAlgorithm: "sobelFilter",
            lowThreshold: 70,
            highThreshold: 70,
            baseOutlineAverageColor: 100,
            baseColoredAreasAverageColor: 100,
            needColoredAreas: true,
            gamma: 1.0,
        };
    },
    created() {
        this.image = new Image();
        this.image.src = "./images/3.jpg";
        this.image.onload = () => {
            this.imageFileName = "test";
            this.imageWidth = this.image.width;
            this.drawImage();
        };
    },
    methods: {
        onChangeInputImageFile(e) {
            if (isLoadingInputImage) {
                return;
            }
            isLoadingInputImage = true;

            const imageFile = e.target.files[0];
            e.target.value = "";

            if (!imageFile.type.startsWith("image")) {
                alert("画像ファイルを選択してください。");
                isLoadingInputImage = false;
                return;
            }

            this.image = new Image();
            this.image.onload = () => {
                if (this.image.width < this.imageWidthMin || this.image.width > this.imageWidthMax) {
                    alert(`画像の幅は${this.imageWidthMin}px以上${this.imageWidthMax}px以下の必要があります。`);
                    if (this.imageFileName === "") {
                        this.$refs.inputImageFile.value = "";
                        this.image = null;
                        this.imageWidth = 0;
                    }
                    
                    return;
                }

                this.imageFileName = imageFile.name;
                this.imageWidth = this.image.width;

                this.drawImage();

                URL.revokeObjectURL(this.image.src);
                isLoadingInputImage = false;
            };
            this.image.onerror = () => {
                alert("画像の読み込みに失敗しました。");
                URL.revokeObjectURL(this.image.src);
                this.image = null;
                isLoadingInputImage = false;
            };

            this.image.src = URL.createObjectURL(imageFile);
        },

        onChangeImageWidth() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeOutlineAlgorithm() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeLowThreshold() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeHighThreshold() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeBaseOutlineAverageColor() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeBaseColoredAreasAverageColor() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onClickNeedColoredAreas(needColoredAreas) {
            this.needColoredAreas = needColoredAreas;
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeGamma() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onClickRemoveNoise() {
            if (this.image !== null) {
                this.removeNoise();
            }
        },

        onClickThickness() {
            if (this.image !== null) {
                this.thickenLines();
            }
        },

        onClickConvertToSVG() {
            if (this.image !== null) {
                this.convertToSVG();
            }
        },

        onClickReset() {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        drawImage() {
            if (worker !== null) {
                worker.terminate();
                worker = null;
            }

            const imageWidth = this.imageWidth;
            const imageHeight = this.image.height * this.imageWidth / this.image.width;

            const sCanvas = new OffscreenCanvas(imageWidth, imageHeight);
            const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
            sContext.drawImage(this.image, 0, 0, sCanvas.width, sCanvas.height);
            const sBitmap = sCanvas.transferToImageBitmap();

            worker = new Worker("./worker/create_image_worker.js");
            worker.onmessage = e => {
                const sBase64 = e.data.sBase64;
                const dBase64 = e.data.dBase64;

                this.$refs.srcImage.style.maxWidth = imageWidth + "px";
                this.$refs.dstImage.style.maxWidth = imageWidth + "px";
                this.$refs.srcImage.src = sBase64;
                this.$refs.dstImage.src = dBase64;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
            };

            worker.postMessage({
                sBitmap,
                imageWidth,
                imageHeight,
                gamma: this.gamma,
                outlineAlgorithm: this.outlineAlgorithm,
                lowThreshold: this.lowThreshold,
                highThreshold: this.highThreshold,
                baseOutlineAverageColor: this.baseOutlineAverageColor,
                needColoredAreas: this.needColoredAreas,
                baseColoredAreasAverageColor: this.baseColoredAreasAverageColor,
            }, [sBitmap]);
        },

        removeNoise() {
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });

            const imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
            medianFilter(imageData);

            dContext.putImageData(imageData, 0, 0);
        },

        thickenLines() {
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });

            const imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
            thickenLines(imageData, 1);

            dContext.putImageData(imageData, 0, 0);
        },

        convertToSVG() {
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });

            let imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
            const strSvg = convertToSVG(imageData);

            const v = canvg.Canvg.fromString(dContext, strSvg);
            v.render();
            this.$refs.dstCanvas.style.width = "";
            this.$refs.dstCanvas.style.height = "";

            imageData = dContext.getImageData(0, 0, dCanvas.width, dCanvas.height);
            monochrome(imageData, 128);

            dContext.putImageData(imageData, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
