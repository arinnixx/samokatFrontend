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

// Определяем роли
const ROLES = {
    ADMIN: 'admin',
    AGGREGATOR: 'aggregator'
};

// Маршруты с указанием доступных ролей
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
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/statuses',
        component: Statuses,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN, ROLES.AGGREGATOR] // АДМИН И АГРЕГАТОР
        }
    },
    {
        path: '/couriers',
        component: Couriers,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN, ROLES.AGGREGATOR] // АДМИН И АГРЕГАТОР
        }
    },
    {
        path: '/couriers-aggregator',
        component: CouriersAggregator,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/request-logs',
        component: RequestLogs,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/courier-shift',
        component: CourierShift,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/courier-violations',
        component: CourierViolations,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/driver-license',
        component: DriverLicense,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/passport',
        component: Passport,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
    },
    {
        path: '/violations-type',
        component: ViolationsType,
        meta: {
            requiresAuth: true,
            showSidebar: true,
            allowedRoles: [ROLES.ADMIN] // ТОЛЬКО АДМИН
        }
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

// Получение роли пользователя
const getUserRole = () => {
    return localStorage.getItem('userType');
};

router.beforeEach((to, from, next) => {
    const isAuthenticated = hasToken();
    const userRole = getUserRole();

    console.log('Навигация:', to.path);
    console.log('Роль пользователя:', userRole);
    console.log('Авторизован:', isAuthenticated);

    // Если не требует авторизации (логин)
    if (!to.meta.requiresAuth) {
        // Если уже авторизован, перенаправляем на доступную страницу
        if (isAuthenticated) {
            if (userRole === ROLES.ADMIN) {
                return next('/aggregators');
            } else {
                return next('/statuses'); // Агрегатор на статусы
            }
        }
        return next();
    }

    // Если требует авторизации, но пользователь не авторизован
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/?sessionExpired=true');
    }

    // Проверка ролей
    if (to.meta.allowedRoles && userRole) {
        if (!to.meta.allowedRoles.includes(userRole)) {
            console.log('Доступ запрещен для роли', userRole);

            // Перенаправляем на доступную страницу в зависимости от роли
            if (userRole === ROLES.ADMIN) {
                return next('/aggregators');
            } else {
                return next('/statuses'); // Агрегатор на статусы
            }
        }
    }

    // Все проверки пройдены
    next();
});

export default router;