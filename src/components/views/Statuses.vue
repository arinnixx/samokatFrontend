<template>
  <v-main>
    <DataTable
        header-title="Статусы"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать статус"
        @add="openCreateModal"
        @delete="openConfirmDelete"
        :show-delete-button="true"
        @update:search-value="onSearchChange"
    >
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </DataTable>

    <Modal
        v-model="showCreateModal"
        mode="create"
        title="Создание статуса"
        :fields="createFields"
        :api-method="createStatus"
        @created="fetchStatuses"
    />
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="confirmDialog.show = false">
            Отмена
          </v-btn>
          <v-btn
              color="error"
              @click="confirmDelete"
              :loading="confirmDialog.loading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue';
import Modal from '@/components/Modal.vue';
import apiStatuses from '@/api/api_statuses.js';

export default {
  components: { DataTable, Modal },
  data() {
    return {
      statusesList: [],
      loading: false,
      showCreateModal: false,
      searchQuery: '',
      columns: [
        {key: 'actions', title: 'Действия' },
        { key: 'created_at', title: 'Дата создания' },
        { key: 'status_name', title: 'Наименование статуса' }
      ],
      createFields: [
        { key: 'name', label: 'Название статуса', required: true, cols: 12 }
      ],
      confirmDialog: {
        show: false,
        title: 'Подтверждение удаления',
        message: '',
        item: null,
        loading: false
      },
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.statusesList;
      const q = this.searchQuery.toLowerCase().trim();
      return this.statusesList.filter(item =>
          item.status_name?.toLowerCase().includes(q)
      );
    },
  },
  async created() {
    await this.fetchStatuses();
  },
  methods: {
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async fetchStatuses() {
      this.loading = true;
      try {
        const data = await apiStatuses.getAllStatuses();
        this.statusesList = (data.items || data || []).filter(c => !c.deleted_at);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    },
    openCreateModal() {
      this.showCreateModal = true;
    },
    async createStatus(formData) {
      return await apiStatuses.createStatus(formData);
    },

    openConfirmDelete(item) {
      this.confirmDialog.message = "Вы действительно хотите удалить статус?";
      this.confirmDialog.item = item;
      this.confirmDialog.show = true;
    },

    async confirmDelete() {
      if (!this.confirmDialog.item) return;
      this.confirmDialog.loading = true;
      try {
        await apiStatuses.deleteStatus(this.confirmDialog.item.id);
        await this.fetchStatuses();
        this.confirmDialog.show = false;
      } catch (error) {
        console.error('Ошибка удаления:', error);
      } finally {
        this.confirmDialog.loading = false;
      }
    },
  }
};
</script>