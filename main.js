
let isLoadingInputImage = false;

const App = {
    data() {
        return {
            imageFileName: "",
        };
    },
    created() {
        // noop
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
            const canvas = this.$refs.canvas;
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            medianCut(imageData, 128);

            context.putImageData(imageData, 0, 0);
        },
    }
};

Vue.createApp(App).mount("#app");
