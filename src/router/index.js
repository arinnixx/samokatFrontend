import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/Login.vue';
import Cookies from 'js-cookie';
import Aggregators from "@/components/views/Aggregators.vue";
import Statuses from "@/components/views/Statuses.vue";
import Couriers from "@/components/views/Couriers.vue";
import CouriersAggregator from "@/components/views/CouriersAggregator.vue";
import RequestLogs from "@/components/views/RequestLogs.vue";
import CourierViolations from "@/components/views/CourierViolations.vue";
import DriverLicense from "@/components/views/DriverLicense.vue";
import Passport from "@/components/views/Passport.vue";
import ViolationsType from "@/components/views/ViolationsType.vue";
import DeliveryBags from "@/components/views/DeliveryBags.vue";
import DeliveryJackets from "@/components/views/DeliveryJackets.vue";
import Orders from "@/components/views/Orders.vue";
import Transport from "@/components/views/Transport.vue";
import TransportTypes from "@/components/views/TransportTypes.vue";
import Obdii from "@/components/views/Obdii.vue";
import TransportObdii from "@/components/views/TransportObdii.vue";

const ROLES = {
    ADMIN: 'admin',
    AGGREGATOR: 'aggregator'
};

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login,
        meta: {
            requiresAuth: false,
            showSidebar: false
        }
    },
    {
        path: '/aggregators',
        component: Aggregators,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/statuses',
        component: Statuses,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN, ROLES.AGGREGATOR]
        }
    },
    {
        path: '/couriers',
        component: Couriers,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN, ROLES.AGGREGATOR]
        }
    },
    {
        path: '/couriers-aggregator',
        component: CouriersAggregator,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/request-logs',
        component: RequestLogs,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/courier-violations',
        component: CourierViolations,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/violations-type',
        component: ViolationsType,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/delivery-bags',
        component: DeliveryBags,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/delivery-jackets',
        component: DeliveryJackets,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/orders',
        component: Orders,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/transport',
        component: Transport,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/transport-types',
        component: TransportTypes,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },
    {
        path: '/obdii',
        component: Obdii,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN]
        }
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

const hasToken = () => {
    return !!(Cookies.get('token') || localStorage.getItem('authToken'));
};

const getUserRole = () => {
    return localStorage.getItem('userType');
};

router.beforeEach((to, from, next) => {
    const isAuthenticated = hasToken();
    const userRole = getUserRole();

    console.log('Навигация:', to.path);
    console.log('Роль пользователя:', userRole);
    console.log('Авторизован:', isAuthenticated);

    if (!to.meta.requiresAuth) {
        if (isAuthenticated) {
            if (userRole === ROLES.ADMIN) {
                return next('/aggregators');
            } else {
                return next('/statuses');
            }
        }
        return next();
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/?sessionExpired=true');
    }

    if (to.meta.allowedRoles && userRole) {
        if (!to.meta.allowedRoles.includes(userRole)) {
            console.log('Доступ запрещен для роли', userRole);

            if (userRole === ROLES.ADMIN) {
                return next('/aggregators');
            } else {
                return next('/statuses');
            }
        }
    }

    next();
});

export default router;