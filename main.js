
let isLoadingInputImage = false;

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
            const sCanvas = this.$refs.srcCanvas;
            const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
            const imageWidth = this.imageWidth;
            const imageHeight = this.image.height * this.imageWidth / this.image.width;
            sCanvas.style.maxWidth = dCanvas.style.maxWidth = `${imageWidth}px`;
            sCanvas.width = dCanvas.width = imageWidth;
            sCanvas.height = dCanvas.height = imageHeight;
            sContext.drawImage(this.image, 0, 0, imageWidth, imageHeight);

            // ガンマ補正

            const imageData1 = sContext.getImageData(0, 0, imageWidth, imageHeight);
            gammaCorrection(imageData1, this.gamma);
            sContext.putImageData(imageData1, 0, 0);

            // 輪郭抽出

            switch (this.outlineAlgorithm) {
                case "sobelFilter": sobelFilter(imageData1); break;
                case "prewittFilter": prewittFilter(imageData1); break;
                case "laplacianFilter": laplacianFilter(imageData1); break;
            }
            monochrome(imageData1, this.baseOutlineAverageColor);

            dContext.putImageData(imageData1, 0, 0);

            // 元絵全体のモノクロ
            if (this.needColoredAreas && false) {
                const imageData2 = sContext.getImageData(0, 0, imageWidth, imageHeight);
                monochrome(imageData2, this.baseColoredAreasAverageColor, true);
    
                const tmpCanvas = new OffscreenCanvas(imageWidth, imageHeight);
                const tmpContext = tmpCanvas.getContext("2d");
                tmpContext.putImageData(imageData2, 0, 0);
    
                dContext.drawImage(tmpCanvas, 0, 0);
            }
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
