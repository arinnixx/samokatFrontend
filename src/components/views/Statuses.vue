<template>
  <v-main>
    <DataTable
        header-title="Статусы"
        :headers="columns"
        :items="statusesList"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать статус"
        @add="openCreateModal"
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
        { key: 'created_at', title: 'Дата создания' },
        { key: 'status_name', title: 'Наименование статуса' }
      ],
      createFields: [
        { key: 'name', label: 'Название статуса', required: true, cols: 12 }
      ]
    };
  },
  computed: {

  },
  async created() {
    await this.fetchStatuses();
  },
  methods: {
    async fetchStatuses() {
      this.loading = true;
      try {
        const data = await apiStatuses.getAllStatuses();
        this.statusesList = data.items || data || [];
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
    }
  }
};
</script>