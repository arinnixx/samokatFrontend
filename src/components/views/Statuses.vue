<template>
  <v-main>
    <DataTable
        title="Статусы"
        :headers="columns"
        :items="statusesList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_statuses.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      statusesList: [],
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления '},
        {key: 'id', title: 'Id'},
        {key: 'status_name', title: 'Наименование статуса'},
      ]
    }
  },
  async created(){
    await this.fetchStatuses()
  },
  methods:{
    async fetchStatuses(){
      try{
        this.statusesList = await api.getAllStatuses();
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
    }
  }
}

</script>
