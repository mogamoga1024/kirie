
let isLoadingInputImage = false;
let worker = null;

const App = {
    components: {
        PlusMinusInputNumbur
    },
    data() {
        return {
            // UI制御系
            isProcessing: false,
            moon: "🌑",

            // ロジック系
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
    watch: {
        isProcessing(newVal) {
            if (newVal) {
                const moons = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"];
                let moonIndex = 0;
                this.moon = moons[moonIndex];
                const moonTimerId = setInterval(() => {
                    if (!this.isProcessing) {
                        clearInterval(moonTimerId);
                        return;
                    }
                    moonIndex = (moonIndex + 1) % moons.length;
                    this.moon = moons[moonIndex];
                }, 100);
            }
        }
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
            this.isProcessing = true;

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
                this.$refs.srcImage.style.maxWidth = imageWidth + "px";
                this.$refs.dstImage.style.maxWidth = imageWidth + "px";
                this.$refs.srcImage.src = e.data.sBase64;
                this.$refs.dstImage.src = e.data.dBase64;
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "createImage",
                sBitmap,
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
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;

            const imageWidth = this.$refs.dstImage.naturalWidth;
            const imageHeight = this.$refs.dstImage.naturalHeight;
            const dCanvas = new OffscreenCanvas(imageWidth, imageHeight);
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
            dContext.drawImage(this.$refs.dstImage, 0, 0, dCanvas.width, dCanvas.height);
            const dBitmap = dCanvas.transferToImageBitmap();

            worker = new Worker("./worker/create_image_worker.js");
            worker.onmessage = e => {
                this.$refs.dstImage.src = e.data.dBase64;
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "removeNoise",
                dBitmap
            }, [dBitmap]);
        },

        thickenLines() {
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;

            const imageWidth = this.$refs.dstImage.naturalWidth;
            const imageHeight = this.$refs.dstImage.naturalHeight;
            const dCanvas = new OffscreenCanvas(imageWidth, imageHeight);
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
            dContext.drawImage(this.$refs.dstImage, 0, 0, dCanvas.width, dCanvas.height);
            const dBitmap = dCanvas.transferToImageBitmap();

            worker = new Worker("./worker/create_image_worker.js");
            worker.onmessage = e => {
                this.$refs.dstImage.src = e.data.dBase64;
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "thickenLines",
                dBitmap
            }, [dBitmap]);
        },

        convertToSVG() {
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;

            const imageWidth = this.$refs.dstImage.naturalWidth;
            const imageHeight = this.$refs.dstImage.naturalHeight;
            const dCanvas = new OffscreenCanvas(imageWidth, imageHeight);
            const dContext = dCanvas.getContext("2d", { willReadFrequently: true });
            dContext.drawImage(this.$refs.dstImage, 0, 0, dCanvas.width, dCanvas.height);
            const dBitmap = dCanvas.transferToImageBitmap();

            worker = new Worker("./worker/create_image_worker.js");
            worker.onmessage = e => {
                this.$refs.dstImage.src = e.data.dBase64;
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "convertToSVG",
                dBitmap
            }, [dBitmap]);
        },

        convertToSVG_old() {
            if (this.isProcessing) {
                return;
            }
            this.isProcessing = true;

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

            this.isProcessing = false;
        },
    }
};

Vue.createApp(App).mount("#app");
