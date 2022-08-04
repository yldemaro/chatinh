import Home from "../pages/Home.vue";
import Details from "../pages/Details.vue";
import Tables from "../pages/Tables.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/details/:id",
    component: Details,
  },
  {
    path: "/tables",
    component: Tables,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
