import Home from "../pages/Home.vue";
import Details from "../pages/Details.vue";
import SuperAdmin from "../pages/SuperAdmin.vue";
import Aterrizaje from "../pages/Aterrizaje.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Home,
    meta: {
      autorizado: true,
    },
  },
  {
    path: "/:hash/:id",
    component: Details,
  },
  {
    path: "/superadmin",
    component: SuperAdmin,
    meta: {
      autorizado: true,
    },
  },
  {
    path: "/aterrizaje",
    component: Aterrizaje,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.beforeEach(async (to, from, next) => {
//   let usuario = await JSON.parse(localStorage.getItem("profile"));
//   let autenticacion = to.matched.some((record) => record.meta.autorizado);
//   console.log(usuario, autenticacion);
  

//   if (autenticacion && !usuario) {
//     next("/aterrizaje");
//   } else if (!autenticacion && usuario?.User.role != "superadmin") {
//     console.log('deberia entrar aqui 1')
//     next("/");
//   } else if (!autenticacion && usuario?.User.role == "superadmin") {
//     console.log('deberia entrar aqui 2')
//     next("/superadmin");
//   } else {
//     console.log('deberia entrar aqui 3')
//     next();
//   }
// });

export default router;
