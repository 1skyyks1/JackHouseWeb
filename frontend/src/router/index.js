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
        {
            path: '/user/:user_id',
            name: 'user',
            component: () => import('../views/user.vue')
        },
        {
            path: '/forum',
            name: 'forum',
            component: () => import('../views/forum.vue')
        },
        {
            path: '/oauth/complete',
            name: 'oAuthComplete',
            component: () => import('../views/auth/oAuthComplete.vue'),
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/admin/admin.vue'),
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('../views/admin/dashboard.vue')
                },
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/admin/users.vue')
                },
                {
                    path: 'announcement',
                    name: 'announcement',
                    component: () => import('../views/admin/announcement.vue')
                },
                {
                    path: 'posts',
                    name: 'posts',
                    component: () => import('../views/admin/posts.vue')
                },
                {
                    path: 'postFiles',
                    name: 'postFiles',
                    component: () => import('../views/admin/postFiles.vue')
                },
            ]
        }
    ]
})

export default router;