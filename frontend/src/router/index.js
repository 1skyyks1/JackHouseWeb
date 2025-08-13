import { createRouter, createWebHistory } from 'vue-router';
import { userInfo } from "@/api/user.js";

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
            path: '/user/edit',
            name: 'userEdit',
            component: () => import('@/views/userEdit.vue'),
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
            meta: { requiresAdmin: true },
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
                {
                    path: 'homeImgs',
                    name: 'homeImgs',
                    component: () => import('../views/admin/homeImgs.vue')
                }
            ]
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    if(to.meta.requiresAdmin) {
        try {
            const res = await userInfo();
            const role = res.data.role;
            if (role === 1 || role === 2) {
                next()
            } else {
                next(false)
            }
        }
        catch (error) {
            next(false)
        }
    } else {
        next()
    }
})

export default router;