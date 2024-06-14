
let isLoadingInputImage = false;

const App = {
    components: {
        PlusMinusInputNumbur
    },
    data() {
        return {
            imageFileName: "",
            image: null,
            // mcMaxColorCount: 128, // todo いらんかも
            // baseColorDistance: 30,
            baseAverageColor: 100,
        };
    },
    created() {
        this.image = new Image();
        this.image.src = "./images/3.jpg";
        this.image.onload = () => {
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
                this.imageFileName = imageFile.name;

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

        onChangeBaseAverageColor(e) {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        onChangeBaseColorDistance(e) {
            if (this.image !== null) {
                this.drawImage();
            }
        },

        drawImage() {
            const sCanvas = this.$refs.srcCanvas;
            const sContext = sCanvas.getContext("2d", { willReadFrequently: true });
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d");
            sCanvas.style.maxWidth = dCanvas.style.maxWidth = `${this.image.width}px`;
            sCanvas.width = dCanvas.width = this.image.width;
            sCanvas.height = dCanvas.height = this.image.height;
            sContext.drawImage(this.image, 0, 0);

            // 輪郭抽出

            const imageData1 = sContext.getImageData(0, 0, this.image.width, this.image.height);

            // outline(imageData1, this.baseColorDistance);
            sobelFilter(imageData1);

            // removeNonBlackColors(imageData1);

            monochrome(imageData1, this.baseAverageColor);

            // medianFilter(imageData1);

            dContext.putImageData(imageData1, 0, 0);

            // 元絵全体のモノクロ

            const imageData2 = sContext.getImageData(0, 0, this.image.width, this.image.height);

            monochrome(imageData2, this.baseAverageColor);

            // medianFilter(imageData2);

            const tmpCanvas = new OffscreenCanvas(this.image.width, this.image.height);
            const tmpContext = tmpCanvas.getContext("2d");
            tmpContext.putImageData(imageData2, 0, 0);

            dContext.drawImage(tmpCanvas, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
