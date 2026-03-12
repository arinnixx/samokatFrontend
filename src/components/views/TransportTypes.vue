<template>
  <v-main>
    <DataTable
        title="Тип транспорта"
        :headers="columns"
        :items="transportTypesList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_transportTypes.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      transportTypesList: [],
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'name', title: 'Наименование транспорта'},
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
    }
  }
}

</script>
