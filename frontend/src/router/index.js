import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/home.vue')
        },
        {
            path: '/post/:post_id',
            name: 'post',
            component: () => import('../views/post.vue'),
            props: true
        },
        {
            path: '/pack',
            name: 'pack',
            component: () => import('../views/pack.vue')
        },
    ]
})

export default router;