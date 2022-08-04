import { createApp } from "vue";
import App from "./App.vue";
import VueApexCharts from "vue3-apexcharts";
import Table from "ant-design-vue";
import router from "./routes/routes";
import "./index.css";
import "./style.css";

createApp(App).use(router).use(VueApexCharts).use(Table).mount("#app");
