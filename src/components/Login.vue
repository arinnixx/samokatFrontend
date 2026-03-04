<template>
  <v-main class="gradient">
    <v-sheet class="mx-auto" width="450" elevation="12" rounded="xl">
      <v-card color="white" class="pa-6" rounded="xl">
        <v-card-title class="text-center justify-center py-4">
          <h1 class="color-font" >
            Вход
          </h1>
        </v-card-title>

        <v-tabs
            v-model="tab"
            rounded="lg"
            color="#0562AA"
            grow
            class="mb-6"
        >
          <v-tab value="aggregator" rounded="lg">Агрегатор</v-tab>
          <v-tab value="admin" rounded="lg">Администратор</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="aggregator">
            <v-form @submit.prevent="handleAggregatorLogin">
              <v-text-field
                  v-model="aggregatorLogin"
                  label="Логин агрегатора"
                  class="mb-4"
                  rounded="lg"
                  required
                  prepend-inner-icon="mdi-account"
              ></v-text-field>

              <v-text-field
                  :type="aggregatorVisible ? 'text' : 'password'"
                  v-model="aggregatorPassword"
                  label="Пароль"
                  class="mb-4"
                  rounded="lg"
                  required
                  prepend-inner-icon="mdi-lock"
              >
                <template v-slot:append-inner>
                  <button @click="aggregatorVisible = !aggregatorVisible" class="custom-eye-button" type="button">
                    <img
                        v-if="aggregatorVisible"
                        src="/src/components/icons/eye-close.svg"
                        width="25"
                        height="25"
                        alt="close eye"
                    >
                    <img
                        v-else
                        src="/src/components/icons/eye-open.svg"
                        width="25"
                        height="25"
                        alt="open eye"
                    >
                  </button>
                </template>
              </v-text-field>

              <v-btn
                  type="submit"
                  rounded="lg"
                  size="x-large"
                  color="#0562AA"
                  variant="elevated"
                  block
                  :loading="aggregatorLoading"
                  :disabled="aggregatorLoading"
              >
                {{ aggregatorLoading ? 'Вход...' : 'Войти' }}
              </v-btn>
            </v-form>
          </v-window-item>

          <v-window-item value="admin">
            <v-form @submit.prevent="handleAdminLogin">
              <v-text-field
                  v-model="adminLogin"
                  label="Логин администратора"
                  class="mb-4"
                  rounded="lg"
                  required
                  prepend-inner-icon="mdi-account-cog"
              ></v-text-field>

              <v-text-field
                  :type="adminVisible ? 'text' : 'password'"
                  v-model="adminPassword"
                  label="Пароль"
                  class="mb-4"
                  rounded="lg"
                  required
                  prepend-inner-icon="mdi-lock"
              >
                <template v-slot:append-inner>
                  <button @click="adminVisible = !adminVisible" class="custom-eye-button" type="button">
                    <img
                        v-if="adminVisible"
                        src="/src/components/icons/eye-close.svg"
                        width="25"
                        height="25"
                        alt="close eye"
                    >
                    <img
                        v-else
                        src="/src/components/icons/eye-open.svg"
                        width="25"
                        height="25"
                        alt="open eye"
                    >
                  </button>
                </template>
              </v-text-field>

              <v-btn
                  type="submit"
                  rounded="lg"
                  size="x-large"
                  color="#0562AA"
                  variant="elevated"
                  block
                  :loading="adminLoading"
                  :disabled="adminLoading"
              >
                {{ adminLoading ? 'Вход...' : 'Войти' }}
              </v-btn>
            </v-form>
          </v-window-item>
        </v-window>

        <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4 mt-6"
            closable
            @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <p v-if="sessionExpired" class="error-message mt-4">
          Сессия завершена. Пожалуйста, войдите снова.
        </p>
      </v-card>
    </v-sheet>
  </v-main>
</template>

<script>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore.js";
import { useRouter } from "vue-router";
import Cookies from 'js-cookie';
import apiLogin from "@/api/api_login.js";

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const tab = ref('aggregator');

    const aggregatorLogin = ref('');
    const aggregatorPassword = ref('');
    const aggregatorVisible = ref(false);
    const aggregatorLoading = ref(false);

    const adminLogin = ref('');
    const adminPassword = ref('');
    const adminVisible = ref(false);
    const adminLoading = ref(false);

    const errorMessage = ref('');
    const sessionExpired = ref(false);

    const handleAggregatorLogin = async () => {
      if (!aggregatorLogin.value || !aggregatorPassword.value) {
        errorMessage.value = 'Пожалуйста, заполните все поля';
        return;
      }

      aggregatorLoading.value = true;
      errorMessage.value = '';

      try {
        const data = await apiLogin.aggregatorLogin(aggregatorLogin.value, aggregatorPassword.value);

        if (data && data.token) {
          const { token, aggregator } = data;

          Cookies.set('token', token, { expires: 7, path: '/' });
          authStore.setToken(token);

          if (aggregator) {
            localStorage.setItem('aggregator', JSON.stringify(aggregator));
          }

          localStorage.setItem('userType', 'aggregator');

          await router.push('/couriers');
        } else {
          errorMessage.value = 'Ошибка при входе';
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          errorMessage.value = 'Неверный логин или пароль.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage.value = 'Сервер не отвечает. Проверьте подключение.';
        } else {
          errorMessage.value = 'Ошибка при входе. Попробуйте снова.';
        }
      } finally {
        aggregatorLoading.value = false;
      }
    };

    const handleAdminLogin = async () => {
      if (!adminLogin.value || !adminPassword.value) {
        errorMessage.value = 'Пожалуйста, заполните все поля';
        return;
      }

      adminLoading.value = true;
      errorMessage.value = '';

      try {
        const data = await apiLogin.adminLogin(adminLogin.value, adminPassword.value);

        if (data && data.token) {
          const { token, admin } = data;

          Cookies.set('token', token, { expires: 7, path: '/' });
          authStore.setToken(token);

          if (admin) {
            localStorage.setItem('admin', JSON.stringify(admin));
          }

          localStorage.setItem('userType', 'admin');

          await router.push('/aggregators');
        } else {
          errorMessage.value = 'Ошибка при входе';
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          errorMessage.value = 'Неверный логин или пароль.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage.value = 'Сервер не отвечает. Проверьте подключение.';
        } else {
          errorMessage.value = 'Ошибка при входе. Попробуйте снова.';
        }
      } finally {
        adminLoading.value = false;
      }
    };

    onMounted(() => {
      const token = Cookies.get('token');
      const userType = localStorage.getItem('userType');

      if (token) {
        authStore.setToken(token);

        if (userType === 'admin') {
          router.push('/aggregators');
        } else {
          router.push('/couriers');
        }
      }

      const params = new URLSearchParams(window.location.search);
      if (params.has('sessionExpired')) {
        sessionExpired.value = true;
      }
    });

    return {
      tab,
      aggregatorLogin,
      aggregatorPassword,
      aggregatorVisible,
      aggregatorLoading,
      handleAggregatorLogin,
      adminLogin,
      adminPassword,
      adminVisible,
      adminLoading,
      handleAdminLogin,
      errorMessage,
      sessionExpired,
    };
  }
}
</script>

<style scoped>
.gradient {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(73, 171, 247, 0.4) 40%, rgba(13, 141, 239, 0.4) 60%);
}

.color-font{
  color: #094067;
  font-weight: bold;
  font-size: 3rem;
  margin-bottom: 0;
  margin-top: 0;
}

.error-message {
  color: red;
  text-align: center;
}

.custom-eye-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-tab) {
  font-weight: 600;
  text-transform: none;
  font-size: 1rem;
}

:deep(.v-tab--selected) {
  color: #0562AA;
}

:deep(.v-tab.v-tab--selected .v-tab__slider) {
  background-color: #0562AA;
}

:deep(.v-field__prepend-inner) {
  color: #0562AA;
}

:deep(.v-field__prepend-inner .v-icon) {
  font-size: 20px;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  color: #0562AA;
}

:deep(.v-field--focused .v-field__outline) {
  color: #0562AA;
  border-width: 2px;
}
</style>