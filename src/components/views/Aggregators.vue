<template>
  <v-main>
    <DataTable
        title="Управление пользователями"
        :headers="columns"
        :items="aggregatorList"
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
import api from "@/api/api_aggregator.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      aggregatorList: [],
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'name', title: 'Название'},
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
    }
  }
}
</script>