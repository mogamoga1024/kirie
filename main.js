
let isLoadingInputImage = false;
let worker = null;

const App = {
    components: {
        PlusMinusInputNumbur
    },
    data() {
        return {
            // UI制御系
            isMobile: false,
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
            shouldBinarize: true,
            baseOutlineAverageColor: 180,
            baseColoredAreasAverageColor: 100,
            needColoredAreas: true,
            gamma: 1.0,
        };
    },
    created() {
        const mobileRegex = /iphone;|(android|nokia|blackberry|bb10;).+mobile|android.+fennec|opera.+mobi|windows phone|symbianos/i;
        const isMobileByUa = mobileRegex.test(navigator.userAgent);;
        const isMobileByClientHint = navigator.userAgentData && navigator.userAgentData.mobile;
        this.isMobile = isMobileByUa || isMobileByClientHint;

        this.image = new Image();
        this.image.src = "./kawaii.png";
        // this.image.src = "./images/3.jpg";
        this.image.onload = () => {
            this.imageFileName = "未選択";
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
                    URL.revokeObjectURL(this.image.src);
                    if (this.imageFileName === "") {
                        this.$refs.inputImageFile.value = "";
                        this.image = null;
                        this.imageWidth = 0;
                    }
                    isLoadingInputImage = false;
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

        onClickShouldBinarize(shouldBinarize) {
            this.shouldBinarize = shouldBinarize;
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

        onClickDstImageToSrcImage() {
            this.image = new Image();
            this.image.src = this.$refs.dstImage.src;
            this.$refs.srcImage.src = this.image.src;
            this.imageFileName += "（加工）";
        },

        drawImage() {
            this.isProcessing = true;

            const imageWidth = this.imageWidth;
            const imageHeight = this.image.height * this.imageWidth / this.image.width;

            const sCanvas = new OffscreenCanvas(imageWidth, imageHeight);
            const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
            sContext.drawImage(this.image, 0, 0, sCanvas.width, sCanvas.height);
            const sBitmap = sCanvas.transferToImageBitmap();

            worker?.terminate();
            worker = new Worker("./worker/create_image_worker.js");
            worker.onmessage = e => {
                this.$refs.srcImage.style.maxWidth = imageWidth + "px";
                this.$refs.dstImage.style.maxWidth = imageWidth + "px";
                this.$refs.srcImage.style.aspectRatio = "";
                this.$refs.dstImage.style.aspectRatio = "";
                this.$refs.srcImage.src = e.data.sBase64;
                this.$refs.dstImage.src = e.data.dBase64;
                worker?.terminate();
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                worker?.terminate();
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "createImage",
                sBitmap,
                gamma: this.gamma,
                outlineAlgorithm: this.outlineAlgorithm,
                lowThreshold: this.lowThreshold,
                highThreshold: this.highThreshold,
                shouldBinarize: this.shouldBinarize,
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
                worker?.terminate();
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                worker?.terminate();
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
                worker?.terminate();
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                worker?.terminate();
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
            worker.onmessage = async e => {
                const preset = canvg.presets.offscreen();
                const v = await canvg.Canvg.fromString(dContext, e.data.strSvg, preset);
                await v.render();
                const dBase64 = await canvasToBase64(dCanvas);
                
                this.$refs.dstImage.src = dBase64;
                worker?.terminate();
                this.isProcessing = false;
            };
            worker.onerror = e => {
                alert("エラーが発生しました。");
                worker?.terminate();
                this.isProcessing = false;
            };

            worker.postMessage({
                method: "convertToSVG",
                dBitmap
            }, [dBitmap]);
        },
    }
};

Vue.createApp(App).mount("#app");
