import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes/routes";
import "./index.css";
import "./style.css";
import Clipboard from 'v-clipboard'
createApp(App).use(router).use(Clipboard).mount("#app");
