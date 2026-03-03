<template>
  <v-navigation-drawer permanent :width="175" color="#d8eefe">
    <v-list>
      <v-list-item>Справочники</v-list-item>
      <v-divider/>
      <v-list-item v-if="isAdmin" to="/aggregators" class="custom-list-item">Агрегаторы</v-list-item>
      <v-list-item to="/statuses" class="custom-list-item">Статусы</v-list-item>
      <v-list-item to="/couriers" class="custom-list-item">Курьеры</v-list-item>
      <v-list-item v-if="isAdmin" to="/couriers-aggregator" class="custom-list-item">Курьеры-агрегаторы</v-list-item>
      <v-list-item v-if="isAdmin" to="/request-logs" class="custom-list-item">Логи</v-list-item>
      <v-list-item v-if="isAdmin" to="/courier-shift" class="custom-list-item">Средства передвижения</v-list-item>
      <v-list-item v-if="isAdmin" to="/courier-violations" class="custom-list-item">Нарушения курьера</v-list-item>
      <v-list-item v-if="isAdmin" to="/driver-license" class="custom-list-item">Водительские права</v-list-item>
      <v-list-item v-if="isAdmin" to="/passport" class="custom-list-item">Паспорт</v-list-item>
      <v-list-item v-if="isAdmin" to="/violations-type" class="custom-list-item">Типы нарушений</v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <div class="mb-2 text-caption text-center" style="color: #094067;">
          {{ userDisplayName }}
        </div>
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
          ? 'http://localhost:3002/admin/logout'
          : 'http://localhost:3002/aggregator/logout';

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

.custom-list-item:hover {
  background-color: #add7f5 !important;
  color: white !important;
}
:deep(.v-list-item--active) {
  background-color: #83c2ef !important;
  color: white !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: white !important;
}

.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.text-caption {
  font-size: 0.75rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>