import Vue from 'vue';
import VueRouter from 'vue-router';
import Editor from '@/views/Editor.vue';
import Selector from '@/views/Selector.vue';
import API from '@/views/API.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/selector',
  },
  {
    path: '/selector',
    name: 'selector',
    component: Selector,
  },
    {
        path: '/api/load/:url',
        name: 'api',
        component: API,
        props: true,
    },
  {
      path: '/editor/:id',
      name: 'editor',
      component: Editor,
      props: true,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
