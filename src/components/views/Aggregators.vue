<template>
  <v-main>
    <DataTable
        header-title="Управление пользователями"
        :headers="columns"
        :items="aggregatorList"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать аггрегатора"
        @add="openCreateModal"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

    </DataTable>

    <Modal
        v-model="showCreateModal"
        mode="create"
        title="Создание аггрегатора"
        :fields="createFields"
        :api-method="createAggregator"
        @created="fetchAggregators"
    />
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_aggregator.js";
import Modal from "@/components/Modal.vue";
import apiAggregator from "@/api/api_aggregator.js";

export default {
  components: {
    Modal,
    DataTable
  },
  data(){
    return{
      aggregatorList: [],
      loading: false,
      showCreateModal: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'name', title: 'Название'},
      ],
      createFields: [
        { key: 'name', label: 'Название аггрегатора', required: true, cols: 12 },
        { key: 'login', label: 'Логин', required: true, cols: 12 },
        { key: 'password', label: 'Пароль', required: true, cols: 12, },
      ]
    }
  },
  async created(){
    await this.fetchAggregators()
  },
  methods: {
    async fetchAggregators(){
      try{
        this.aggregatorList = await api.getAllAggregators();
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
    async createAggregator(formData) {
      return await apiAggregator.createAggregator(formData);
    }
  }
}
</script>