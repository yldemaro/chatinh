import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes/routes";
import "./index.css";
import "./style.css";
import Clipboard from 'v-clipboard'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

createApp(App).use(router).use(Clipboard).mount("#app");
