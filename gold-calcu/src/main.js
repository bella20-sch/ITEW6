import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/Login.vue'
import Calculator from './components/Calculator.vue'
import './style.css'

const routes = [
  { path: '/', component: Calculator },
  { path: '/login', component: Login },
  { path: '/calculator', component: Calculator }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
