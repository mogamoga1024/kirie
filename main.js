
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
            const canvas = this.$refs.canvas;
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // medianCut(imageData, mcMaxColorCount);

            outline(imageData, baseColorDistance);

            context.putImageData(imageData, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
