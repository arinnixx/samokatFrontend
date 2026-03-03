import { defineStore } from 'pinia';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        token: null,
    }),

    getters: {
        isLoggedIn: (state) => {
            return !!state.token || !!Cookies.get('token') || !!localStorage.getItem('authToken');
        }
    },

    actions: {
        login(token) {
            this.isAuthenticated = true;
            this.token = token;

            localStorage.setItem('authToken', token);
            Cookies.set('token', token, { expires: 7, path: '/' });
        },

        logout() {
            this.isAuthenticated = false;
            this.token = null;

            localStorage.removeItem('authToken');
            localStorage.removeItem('aggregator');
            Cookies.remove('token', { path: '/' });
        },

        logoutAdmin() {
            this.isAuthenticated = false;
            this.token = null;

            localStorage.removeItem('authToken');
            localStorage.removeItem('admin');
            Cookies.remove('token', { path: '/' });
        },



        setToken(token) {
            this.token = token;
            this.isAuthenticated = !!token;

            if (token) {
                localStorage.setItem('authToken', token);
                Cookies.set('token', token, { expires: 7, path: '/' });
            }
        },

        initializeAuth() {
            const token = Cookies.get('token') || localStorage.getItem('authToken');

            if (token) {
                this.token = token;
                this.isAuthenticated = true;

                if (!localStorage.getItem('authToken')) {
                    localStorage.setItem('authToken', token);
                }
                if (!Cookies.get('token')) {
                    Cookies.set('token', token, { expires: 7, path: '/' });
                }
            }
        },

        getTokenFromCookies() {
            return Cookies.get('token') || null;
        }
    },
});