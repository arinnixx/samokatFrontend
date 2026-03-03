<template>
  <v-main>
    <DataTable
        title="Курьеры агрегаторов"
        :headers="columns"
        :items="couriersAggregatorList"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>

      <template v-slot:item.start_date="{ item }">
        {{ formatDate(item.start_date) }}
      </template>

      <template v-slot:item.end_date="{ item }">
        {{ formatDate(item.end_date) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_couriersAggregator.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      couriersAggregatorList: [],
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления '},
        {key: 'id', title: 'Id'},
        {key: 'start_date', title: 'Дата начала работы'},
        {key: 'end_date', title: 'Дата окончания работы'},
        {key: 'couriers_id', title: 'Id курьера'},
        {key: 'aggregator_id', title: 'Id агрегатора'},
      ]
    }
  },
  async created(){
    await this.fetchCouriersAggregator()
  },
  methods:{
    async fetchCouriersAggregator(){
      try{
        this.couriersAggregatorList = await api.getAllCouriersAggregator();
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
