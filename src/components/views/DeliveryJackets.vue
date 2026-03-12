<template>
  <v-main>
    <DataTable
        title="Куртки курьеров"
        :headers="columns"
        :items="deliveryJacketsList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.aggregator_id="{ item }">
        {{ getAggregatorName(item.aggregator_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_deliveryJackets.js";
import apiAggregators from "@/api/api_aggregator.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      deliveryJacketsList: [],
      aggregatorsMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'code', title: 'Код куртки'},
        {key: 'aggregator_id', title: 'Аггрегатор'},
      ]
    }
  },
  async created(){
    await this.loadData()
  },
  methods:{
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchDeliveryJackets(),
          this.fetchAggregators()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDeliveryJackets(){
      try{
        this.deliveryJacketsList = await api.getAllDeliveryJackets();
      }catch(error){
        console.error(error)
      }
    },

    async fetchAggregators(){
      try{
        const response = await apiAggregators.getAllAggregators();
        console.log('Ответ API агрегаторов:', response);

        let aggregatorsArray = [];
        if (response?.items) {
          aggregatorsArray = response.items;
        } else if (Array.isArray(response)) {
          aggregatorsArray = response;
        } else {
          aggregatorsArray = [];
        }

        aggregatorsArray.forEach(aggregator => {
          if (aggregator && aggregator.id) {
            this.aggregatorsMap[aggregator.id] = aggregator.name || `Агрегатор #${aggregator.id}`;
          }
        });

        console.log('Загружено агрегаторов:', Object.keys(this.aggregatorsMap).length);
      }catch(error){
        console.error('Ошибка загрузки агрегаторов:', error);
      }
    },

    getAggregatorName(id) {
      if (!id) return '—';
      return this.aggregatorsMap[id] || `ID: ${id}`;
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
