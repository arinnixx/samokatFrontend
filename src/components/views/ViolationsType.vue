<template>
  <v-main>
    <DataTable
        header-title="Типы нарушений"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать тип нарушения"
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
        title="Создание типа нарушения"
        :fields="createFields"
        :api-method="createViolationsType"
        @created="fetchViolationsType"
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
import api from "@/api/api_violationsType.js";
import apiViolationsType from "@/api/api_violationsType.js";
import Modal from "@/components/Modal.vue";


export default {
  components: {
    Modal,
    DataTable
  },
  data(){
    return{
      violationsTypeList: [],
      loading: false,
      showCreateModal: false,
      searchQuery: '',
      columns: [
        {key: 'actions', title: 'Действия' },
        {key: 'created_at', title: 'Дата создания'},
        {key: 'category', title: 'Категория'},
        {key: 'code', title: 'Код'},
      ],
      createFields: [
        { key: 'category', label: 'Категория нарушения', required: true, cols: 12 },
        { key: 'code', label: 'Код нарушения', required: true, cols: 12 },

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
      if (!this.searchQuery) return this.violationsTypeList;
      const q = this.searchQuery.toLowerCase().trim();
      return this.violationsTypeList.filter(item =>
          item.category?.toLowerCase().includes(q) ||
          item.code?.toLowerCase().includes(q)
      );
    },
  },
  async created(){
    await this.fetchViolationsType();
  },
  methods: {
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async fetchViolationsType() {
      try {
        const data = await api.getAllViolationType();
        let items = (data.items || data || []).filter(item => !item.deleted_at);
        this.violationsTypeList = items;
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
    async createViolationsType(formData) {
      return await apiViolationsType.createViolationsType(formData);
    },

    openConfirmDelete(item) {
      this.confirmDialog.message = "Вы действительно хотите удалить тип нарушения?";
      this.confirmDialog.item = item;
      this.confirmDialog.show = true;
    },

    async confirmDelete() {
      if (!this.confirmDialog.item) return;
      this.confirmDialog.loading = true;
      try {
        await apiViolationsType.deleteViolationsType(this.confirmDialog.item.id);
        await this.fetchViolationsType();
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