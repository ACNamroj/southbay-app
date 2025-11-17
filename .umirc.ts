import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    dark: false,
    compact: false,
    theme: {
      token: {
        colorPrimary: '#FF5200',
        colorBgBase: '#FFFFFF',
        colorBorder: '#D9D9D9',
        colorLink: '#0449DD',
        colorText: '#000000',
        borderRadius: 8,
      },
    },
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'es-ES',
    antd: true,
  },
  layout: {
    title: 'Southbay',
  },
  favicons: ['/icons/favicon.ico'],
  routes: [
    {
      path: '/login',
      component: '@/pages/Login',
      name: 'Ingreso',
      title: 'Ingresar',
      layout: false,
    },
    {
      path: '/',
      name: 'Inicio',
      title: '',
      component: './Home',
    },
    {
      path: '/access',
      name: 'Acceso',
      title: 'Acceso',
      component: './Access',
    },
    {
      path: '/table',
      name: 'CRUD',
      component: './Table',
    },
  ],
  define: {
    'process.env.BASE_URL': 'http://localhost:8080',
  },
  npmClient: 'pnpm',
});
