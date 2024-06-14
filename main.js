
let isLoadingInputImage = false;

const App = {
    components: {
        PlusMinusInputNumbur
    },
    data() {
        return {
            imageFileName: "",
            // mcMaxColorCount: 128, // todo いらんかも
            baseColorDistance: 30,
            baseAverageColor: 100,
        };
    },
    created() {
        const image = new Image();
        image.src = "./images/3.jpg";
        image.onload = () => {
            this.drawImage(image);
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

            const image = new Image();
            image.onload = () => {
                this.imageFileName = imageFile.name;

                this.drawImage(image);

                URL.revokeObjectURL(image.src);
                isLoadingInputImage = false;
            };
            image.onerror = () => {
                alert("画像の読み込みに失敗しました。");
                URL.revokeObjectURL(image.src);
                isLoadingInputImage = false;
            };

            image.src = URL.createObjectURL(imageFile);
        },
        drawImage(image) {
            const sCanvas = this.$refs.srcCanvas;
            const sContext = sCanvas.getContext("2d");
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d");
            sCanvas.style.maxWidth = dCanvas.style.maxWidth = `${image.width}px`;
            sCanvas.width = dCanvas.width = image.width;
            sCanvas.height = dCanvas.height = image.height;
            sContext.drawImage(image, 0, 0);

            const imageData1 = sContext.getImageData(0, 0, image.width, image.height);

            // medianCut(imageData, this.mcMaxColorCount);

            outline(imageData1, this.baseColorDistance);

            removeNonBlackColors(imageData1);

            // completeWithBlack(imageData);

            medianFilter(imageData1);

            dContext.putImageData(imageData1, 0, 0);

            const imageData2 = sContext.getImageData(0, 0, image.width, image.height);

            monochrome(imageData2, this.baseAverageColor);

            const tmpCanvas = new OffscreenCanvas(image.width, image.height);
            const tmpContext = tmpCanvas.getContext("2d");
            tmpContext.putImageData(imageData2, 0, 0);

            dContext.drawImage(tmpCanvas, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
