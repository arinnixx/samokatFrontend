<template>
  <v-navigation-drawer permanent class="custom-sidebar">
    <v-list>
      <v-list-item class="custom">{{ userDisplayName }}</v-list-item>
      <v-divider/>
      <v-list-group value="Справочники">
        <template v-slot:activator="{ props, isOpen }">
          <v-list-item v-bind="props" class="custom-list-item">
            <template v-slot:append>
              <img
                  :src="isOpen ? '/src/components/icons/up-arrow.svg' : '/src/components/icons/down-arrow.svg'"
                  width="24"
                  height="24"
              >
            </template>
            <v-list-item-title >Справочники</v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item v-if="isAdmin" to="/violations-type" class="custom-list-item">
          <v-list-item-title>Типы нарушений</v-list-item-title>
        </v-list-item>

        <v-list-item to="/statuses" class="custom-list-item">
          <v-list-item-title>Статусы</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" to="/courier-shift" class="custom-list-item">
          <v-list-item-title>Типы транспорта</v-list-item-title>
        </v-list-item>
      </v-list-group>
      <v-list-item v-if="isAdmin" to="/aggregators" class="custom-list-item">Агрегаторы</v-list-item>
      <v-list-item v-if="isAdmin" to="/driver-license" class="custom-list-item">Водительские права</v-list-item>
      <v-list-item to="/couriers" class="custom-list-item">Курьеры</v-list-item>
      <v-list-item v-if="isAdmin" to="/couriers-aggregator" class="custom-list-item">Курьеры-агрегаторов</v-list-item>
      <v-list-item v-if="isAdmin" to="/request-logs" class="custom-list-item">Логи</v-list-item>
      <v-list-item v-if="isAdmin" to="/courier-violations" class="custom-list-item">Нарушения курьера</v-list-item>
      <v-list-item v-if="isAdmin" to="/passport" class="custom-list-item">Паспорт</v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
            @click="handleLogout"
            color="#0562AA"
            block
            :loading="logoutLoading"
        >
          Выход
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import Cookies from 'js-cookie';

const router = useRouter();
const authStore = useAuthStore();
const logoutLoading = ref(false);
const API_URL =import.meta.env.VITE_APP_API_URL_PRIVATE;


const isAdmin = computed(() => {
  return !!localStorage.getItem('admin');
});

const userDisplayName = computed(() => {
  const admin = localStorage.getItem('admin');
  const aggregator = localStorage.getItem('aggregator');

  if (admin) {
    try {
      const adminData = JSON.parse(admin);
      return adminData.login || 'Администратор';
    } catch {
      return 'Администратор';
    }
  } else if (aggregator) {
    try {
      const aggregatorData = JSON.parse(aggregator);
      return aggregatorData.name || aggregatorData.login || 'Агрегатор';
    } catch {
      return 'Агрегатор';
    }
  }
  return 'Пользователь';
});

const handleLogout = async () => {
  logoutLoading.value = true;

  try {
    const token = Cookies.get('token') || authStore.token;
    const isAdminUser = !!localStorage.getItem('admin');

    if (token) {
      const logoutEndpoint = isAdminUser
          ? `${API_URL}/admin/logout`
          : `${API_URL}/aggregator/logout`;

      await axios.post(logoutEndpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch((error) => {
        console.log('Logout error:', error.message);
      });
    }
  } finally {
    const isAdminUser = !!localStorage.getItem('admin');

    if (isAdminUser) {
      authStore.logoutAdmin();
    } else {
      authStore.logout();
    }

    await router.push('/');
    logoutLoading.value = false;
  }
};
</script>

<style scoped>
.custom-list-item {
  border-radius: 10px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.custom-list-group {
  border-radius: 10px;
  margin: 4px 8px;
  transition: all 0.3s ease;
  padding-left: 0;
}

.custom {
  text-align: center;
  color: #094067;
  font-weight: 600;
  width: 100%;

}

.custom-sidebar {
  max-width: 220px;
  background-color: #d8eefe70;

}

.custom-list-item:hover {
  background-color: #add7f5;

}
:deep(.v-list-item--active) {
  background-color: #77c9fc70;

}

</style>