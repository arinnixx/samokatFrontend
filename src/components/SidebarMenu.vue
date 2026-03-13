<template>
  <v-navigation-drawer permanent class="custom-sidebar">
    <template v-slot:prepend>
      <div class="custom-border-bottom" >
        <v-list-item class="custom">{{ userDisplayName }}</v-list-item>
      </div>
    </template>
    <v-list>
      <v-list-group value="Справочники">
        <template v-slot:activator="{ props, isOpen }">
          <v-list-item v-bind="props" class="custom-list-item">
            <template v-slot:append>
              <img
                  :src="isOpen ? '/src/components/icons/up-arrow 1.svg' : '/src/components/icons/down-arrow 2.svg'"
                  width="24"
                  height="24"
              >
            </template>
            <v-list-item-title >Справочники</v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item v-if="isAdmin"  to="/delivery-jackets" class="custom-list-item">
          <v-list-item-title>Куртки курьеров</v-list-item-title>
        </v-list-item>

        <v-list-item to="/statuses" class="custom-list-item">
          <v-list-item-title>Статусы</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin"  to="/delivery-bags" class="custom-list-item">
          <v-list-item-title>Сумки курьеров</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" to="/violations-type" class="custom-list-item">
          <v-list-item-title>Типы нарушений</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" to="/transport-types" class="custom-list-item">
          <v-list-item-title>Типы транспорта</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin"  to="/transport" class="custom-list-item">
          <v-list-item-title>Транспорт</v-list-item-title>
        </v-list-item>
      </v-list-group>

      <v-list-item v-if="isAdmin" to="/aggregators" class="custom-list-item">Агрегаторы</v-list-item>
      <v-list-item to="/couriers" class="custom-list-item">Курьеры</v-list-item>
      <v-list-item v-if="isAdmin" to="/request-logs" class="custom-list-item">Логи</v-list-item>
      <v-list-item v-if="isAdmin" to="/courier-violations" class="custom-list-item">Нарушения курьера</v-list-item>
      <v-list-item v-if="isAdmin" to="/couriers-aggregator" class="custom-list-item">Работа</v-list-item>
      <v-list-item v-if="isAdmin"  to="/orders" class="custom-list-item">Смена</v-list-item>
    </v-list>


    <template v-slot:append>
      <div class="custom-border-top">
        <v-btn
            @click="handleLogout"
            color="#60A5FA"
            block
            flat
            :loading="logoutLoading"
            class="custom-button"
        >
          <template v-slot:prepend>
            <img
                :src="'/src/components/icons/exit.svg'"
                width="16"
                height="16"
            >
          </template>
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

.custom {
  text-align: center;
  color: #fff;
  font-weight: 600;
  width: 100%;

}

.custom-border-bottom {
  border-bottom: 1px solid #3B82F6;
  padding: 8px;
}
.custom-border-top {
  border-top: 1px solid #3B82F6;
  padding: 12px;

}

.custom-button{
  border-radius: 10px;
  font-weight: bold;
}

.custom-button:hover {
  background-color: #3B82F6 !important;
}

.custom-sidebar {
  max-width: 220px;
  background-color: #60A5FA;
  color: #fff;
}

.custom-list-item:hover {
  background-color: #3B82F6;

}
:deep(.v-list-item--active) {
  background-color: #2563eb;
  color: #fff

}

</style>