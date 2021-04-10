import {RouteRecordRaw, createRouter, createWebHistory} from 'vue-router';
import Home from './pages/Home.vue';
import Overlay from './pages/Overlay.vue';
import TodoDetails from './pages/TodoDetails.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Home,
        children: [
            {
                path: "overlay",
                component: Overlay,
                children: [
                    {
                        path: "todo/:todoId",
                        component: TodoDetails,
                        props: true,
                    },
                    {
                        path: "new-todo",
                        component: TodoDetails,
                    }
                ]
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
