import Home from "../pages/Home.vue";
import Details from "../pages/Details.vue";
import SuperAdmin from "../pages/SuperAdmin.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/:id",
    component: Details,
  },
  {
    path: "/superadmin",
    component: SuperAdmin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
