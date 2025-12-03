import { defineConfig } from '@umijs/max';
import { antdThemeTokens } from './src/theme/tokens';

export default defineConfig({
  antd: {
    dark: false,
    compact: false,
    theme: {
      token: antdThemeTokens,
    },
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    default: 'es-ES',
    antd: true,
    baseNavigator: false,
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
      title: 'Ingreso',
      layout: false,
    },
    {
      path: '/forgot-password',
      component: '@/pages/ForgotPassword',
      name: 'Recuperar contraseña',
      title: 'Recuperar contraseña',
      layout: false,
    },
    {
      path: '/reset-password/:resetToken',
      component: '@/pages/ResetPassword',
      name: 'Restablecer contraseña',
      title: 'Restablecer contraseña',
      layout: false,
    },
    {
      path: '/',
      name: 'Inicio',
      title: 'Inicio',
      component: './Home',
      wrappers: ['@/wrappers/auth'],
      menu: false,
    },
    {
      path: '/stores',
      name: 'Tiendas',
      title: 'Gestión de Tiendas',
      component: './Stores',
      wrappers: ['@/wrappers/auth'],
      icon: 'stores',
    },
    {
      path: '/people',
      name: 'Personas',
      title: 'Gestión de Personas',
      component: './People',
      wrappers: ['@/wrappers/auth'],
      icon: 'people',
    },
    {
      path: '/users',
      name: 'Usuarios',
      title: 'Gestión de Usuarios',
      component: './Users',
      wrappers: ['@/wrappers/auth'],
      icon: 'users',
    },
    {
      path: '/segmentation',
      name: 'Segmentación',
      title: 'Gestión de Segmentaciones',
      component: './Segmentation',
      wrappers: ['@/wrappers/auth'],
      icon: 'segmentation',
    },
  ],
  define: {
    'process.env.BASE_URL': 'http://localhost:8080',
  },
  npmClient: 'pnpm',
});
