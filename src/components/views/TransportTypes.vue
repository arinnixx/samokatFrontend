<template>
  <v-main>
    <DataTable
        header-title="Тип транспорта"
        :headers="columns"
        :items="transportTypesList"
        :loading="loading"
        :show-add-button="true"
        add-button-text="Создать тип транспорта"
        @add="openCreateModal"
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
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'name', title: 'Наименование транспорта'},
      ],
      createFields: [
        { key: 'name', label: 'Название транспорта', required: true, cols: 12 },

      ]
    }
  },
  async created(){
    await this.fetchTransportTypes()
  },
  methods:{
    async fetchTransportTypes(){
      try{
        this.transportTypesList = await api.getAllTransportTypes();
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
    async createTransportType(formData) {
      return await apiTransportType.createTransportType(formData);
    }
  }
}

</script>
