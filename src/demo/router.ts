import {RouteRecordRaw, createRouter, createWebHistory} from 'vue-router';
import Home from './pages/Home.vue';
import Overlay from './pages/Overlay.vue';
import TodoDetails from './pages/TodoDetails.vue';
import Counts from './pages/Counts.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/todos",
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
    },
    {
        path: "/counts",
        component: Counts,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;
