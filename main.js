
let isLoadingInputImage = false;

const App = {
    data() {
        return {
            imageFileName: "",
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
        drawImage(image, mcMaxColorCount = 128, baseColorDistance = 30) {
            const sCanvas = this.$refs.srcCanvas;
            const sContext = sCanvas.getContext("2d");
            const dCanvas = this.$refs.dstCanvas;
            const dContext = dCanvas.getContext("2d");
            sCanvas.width = dCanvas.width = image.width;
            sCanvas.height = dCanvas.height = image.height;
            sContext.drawImage(image, 0, 0);

            const imageData = sContext.getImageData(0, 0, image.width, image.height);

            // medianCut(imageData, mcMaxColorCount);

            outline(imageData, baseColorDistance);

            dContext.putImageData(imageData, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
