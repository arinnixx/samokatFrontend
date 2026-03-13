<template>
  <v-main>
    <DataTable
        header-title="Типы нарушений"
        :headers="columns"
        :items="violationsTypeList"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать тип нарушения"
        @add="openCreateModal"
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
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'category', title: 'Категория'},
        {key: 'code', title: 'Код'},
      ],
      createFields: [
        { key: 'category', label: 'Категория нарушения', required: true, cols: 12 },
        { key: 'code', label: 'Код нарушения', required: true, cols: 12 },

      ]
    }
  },
  async created(){
    await this.fetchViolationsType();
  },
  methods: {
    async fetchViolationsType(){
      try{
        this.violationsTypeList = await api.getAllViolationType();
      }catch(error){
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
    }
  }
}
</script>