
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
                isLoadingInputImage = false;
            };
            image.onerror = () => {
                alert("画像の読み込みに失敗しました。");
                isLoadingInputImage = false;
            };

            image.src = URL.createObjectURL(imageFile);
        },
    }
};

Vue.createApp(App).mount("#app");
