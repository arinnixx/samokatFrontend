<template>
  <v-main>
    <DataTable
        header-title="Тип транспорта"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать тип транспорта"
        @add="openCreateModal"
        @delete="openConfirmDelete"
        :show-delete-button="true"
        @update:search-value="onSearchChange"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </DataTable>

    <Modal
        v-model="showCreateModal"
        mode="create"
        title="Создание типа транспорта"
        :fields="createFields"
        :api-method="createTransportType"
        @created="fetchTransportTypes"
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
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_transportTypes.js";
import Modal from "@/components/Modal.vue";
import apiTransportType from "@/api/api_transportTypes.js";

export default {
  components: {
    Modal,
    DataTable
  },
  data(){
    return{
      transportTypesList: [],
      loading: false,
      showCreateModal: false,
      searchQuery: '',
      columns: [
        {key: 'actions', title: 'Действия' },
        {key: 'created_at', title: 'Дата создания'},
        {key: 'name', title: 'Наименование транспорта'},
      ],
      createFields: [
        { key: 'name', label: 'Название транспорта', required: true, cols: 12 },

      ],
      confirmDialog: {
        show: false,
        title: 'Подтверждение удаления',
        message: '',
        item: null,
        loading: false
      },
    }
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.transportTypesList;
      const q = this.searchQuery.toLowerCase().trim();
      return this.transportTypesList.filter(item =>
          item.name?.toLowerCase().includes(q)
      );
    },
  },
  async created(){
    await this.fetchTransportTypes()
  },
  methods:{
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async fetchTransportTypes(){
      try {
        const data = await api.getAllTransportTypes();
        let items = (data.items || data || []).filter(item => !item.deleted_at);
        this.transportTypesList = items;
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
    openCreateModal() {
      this.showCreateModal = true;
    },
    async createTransportType(formData) {
      return await apiTransportType.createTransportType(formData);
    },

    openConfirmDelete(item) {
      this.confirmDialog.message = "Вы действительно хотите удалить тип транспорта?";
      this.confirmDialog.item = item;
      this.confirmDialog.show = true;
    },

    async confirmDelete() {
      if (!this.confirmDialog.item) return;
      this.confirmDialog.loading = true;
      try {
        await apiTransportType.deleteTransportType(this.confirmDialog.item.id);
        await this.fetchTransportTypes();
        this.confirmDialog.show = false;
      } catch (error) {
        console.error('Ошибка удаления:', error);
      } finally {
        this.confirmDialog.loading = false;
      }
    },
  }
}

</script>
