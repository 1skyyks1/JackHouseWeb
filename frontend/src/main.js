import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import ElementPlus from "element-plus";
import 'element-plus/dist/index.css'
import '@/assets/font/font.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/dark/css-vars.css'
import './style/tailwind.css'
import { createI18n } from 'vue-i18n'
import messages from './locale/index'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(store)

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: 'en',
    messages,
})
app.use(i18n)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
