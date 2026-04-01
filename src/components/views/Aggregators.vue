<template>
  <v-main>
    <DataTable
        header-title="Управление пользователями"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        :show-change-password-button="true"
        @change-password="openPasswordModal"
        @update:search-value="onSearchChange"
        @filters="openFilters"
        :show-filter-button="true"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.isBlocked="{ item }">
        <div v-if="isAdmin" class="d-flex align-center" style="gap: 4px;">
          <v-switch
              :model-value="!item.isBlocked"
          hide-details
          inset
          size="x-small"
          density="compact"
          color="success"
          base-color="error"
          @update:model-value="(val) => { item.isBlocked = !val; toggleBlock(item); }"
          />
          <span :class="item.isBlocked ? 'status-blocked' : 'status-active'" style="font-size: 14px;">
      {{ item.isBlocked ? 'Заблокирован' : 'Активен' }}
    </span>
        </div>
        <span v-else :class="item.isBlocked ? 'status-blocked' : 'status-active'" style="font-size: 14px;">
    {{ item.isBlocked ? 'Заблокирован' : 'Активен' }}
  </span>
      </template>
    </DataTable>

    <Modal
        v-model="showPasswordModal"
        mode="create"
        title="Смена пароля агрегатора"
        :fields="passwordFields"
        :api-method="resetPassword"
        @created="onPasswordChanged"
    />

    <FilterModal
        v-model="filterModalVisible"
        :fields="filterFields"
        :initial-filters="currentFilters"
        @apply="applyFilters"
        @reset="resetFilters"
    />
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_aggregator.js";
import Modal from "@/components/Modal.vue";
import FilterModal from "@/components/FilterModal.vue";

export default {
  components: {
    Modal,
    DataTable,
    FilterModal
  },
  data() {
    return {
      aggregatorList: [],
      loading: false,
      showCreateModal: false,
      showPasswordModal: false,
      selectedAggregator: null,
      searchQuery: '',
      filterModalVisible: false,
      filterFields: [
        {
          key: 'status',
          label: 'Статус',
          type: 'select',
          items: [
            { title: 'Все', value: null },
            { title: 'Активен', value: false },
            { title: 'Заблокирован', value: true }
          ],
          itemTitle: 'title',
          itemValue: 'value'
        }
      ],
      currentFilters: {},
      columns: [
        { key: 'actions', title: 'Действия' },
        { key: 'isBlocked', title: 'Статус' },
        { key: 'created_at', title: 'Дата создания' },
        { key: 'name', title: 'Название' },
      ],
      passwordFields: [
        { key: 'newPassword', label: 'Новый пароль', required: true, type: 'password', cols: 12 },
        { key: 'confirmPassword', label: 'Подтвердите пароль', required: true, type: 'password', confirm: 'newPassword', cols: 12 }
      ]
    }
  },
  computed: {
    isAdmin() {
      return !!localStorage.getItem('admin');
    },
    filteredItems() {
      let result = this.aggregatorList;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(item => {
          return (
              (item.name?.toLowerCase().includes(q))
          );
        });
      }

      if (this.currentFilters.status !== undefined && this.currentFilters.status !== null) {
        result = result.filter(item => item.isBlocked === this.currentFilters.status);
      }

      return result;
    }
  },
  async created() {
    await this.fetchAggregators();
  },
  methods: {
    async fetchAggregators() {
      try {
        const data = await api.getAllAggregators();
        this.aggregatorList = data.items || data;
      } catch (error) {
        console.error(error)
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },

    openPasswordModal(item) {
      this.selectedAggregator = item;
      this.showPasswordModal = true;
    },

    async resetPassword(formData) {
      return await api.resetAggregatorPassword(this.selectedAggregator.id, formData.newPassword);
    },

    onPasswordChanged() {
      this.showPasswordModal = false;
      this.$emit('show-message', { text: 'Пароль успешно изменён', type: 'success' });
    },

    async toggleBlock(item) {
      try {
        const newStatus = item.isBlocked;
        await api.toggleAggregatorBlock(item.id, newStatus);
      } catch (error) {
        console.error('Ошибка при изменении статуса:', error);
        item.isBlocked = !item.isBlocked;
      }
    },

    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },

    openFilters() {
      this.filterModalVisible = true;
    },
    applyFilters(filters) {
      this.currentFilters = filters;
    },
    resetFilters() {
      this.currentFilters = {};
    },
  }
}
</script>

<style scoped>
:deep(.v-switch) {
  transform: scale(0.7);
  transform-origin: left center;
}

.status-active {
  color: #2e7d32;
}
.status-blocked {
  color: #c62828;
}
</style>