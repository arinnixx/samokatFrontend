import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login.vue';
import Cookies from 'js-cookie';
import Aggregators from "@/components/views/Aggregators.vue";
import Statuses from "@/components/views/Statuses.vue";
import Couriers from "@/components/views/Couriers.vue";
import CouriersAggregator from "@/components/views/CouriersAggregator.vue";
import RequestLogs from "@/components/views/RequestLogs.vue";
import CourierShift from "@/components/views/CourierShift.vue";
import CourierViolations from "@/components/views/CourierViolations.vue";
import DriverLicense from "@/components/views/DriverLicense.vue";
import Passport from "@/components/views/Passport.vue";
import ViolationsType from "@/components/views/ViolationsType.vue";

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false, showSidebar: false }
    },
    {
        path:'/aggregators',
        component: Aggregators,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/statuses',
        component: Statuses,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/couriers',
        component: Couriers,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/couriers-aggregator',
        component: CouriersAggregator,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/request-logs',
        component: RequestLogs,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/courier-shift',
        component: CourierShift,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/courier-violations',
        component: CourierViolations,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/driver-license',
        component: DriverLicense,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/passport',
        component: Passport,
        meta: { requiresAuth: true, showSidebar: true },
    },
    {
        path:'/violations-type',
        component: ViolationsType,
        meta: { requiresAuth: true, showSidebar: true },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Проверка наличия токена
const hasToken = () => {
    return !!(Cookies.get('token') || localStorage.getItem('authToken'));
};

router.beforeEach((to, from) => {
    const isAuthenticated = hasToken();

    if (to.path === '/dashboard' && !isAuthenticated) {
        return '/';
    }

    if (to.path === '/' && isAuthenticated) {
        return '/dashboard';
    }
});

export default router;