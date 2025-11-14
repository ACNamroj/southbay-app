import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'es-ES',
    antd: true,
    title: false,
    baseNavigator: false,
  },
  layout: {
    title: 'Southbay',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: 'Inicio',
      path: '/home',
      component: './Home',
    },
    {
      name: 'Acceso',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD',
      path: '/table',
      component: './Table',
    },
  ],
  define: {
    'process.env.BASE_URL': 'http://localhost:8080',
  },
  npmClient: 'pnpm',
});
