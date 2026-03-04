<template>
  <v-main>
    <DataTable
        title="Курьеры агрегаторов"
        :headers="columns"
        :items="couriersAggregatorList"
        :loading="loading"
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

      <template v-slot:item.couriers_id="{ item }">
        {{ getCourierName(item.couriers_id) }}
      </template>

      <template v-slot:item.aggregator_id="{ item }">
        {{ getAggregatorName(item.aggregator_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_couriersAggregator.js";
import apiCouriers from "@/api/api_couriers.js";
import apiAggregators from "@/api/api_aggregator.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      couriersAggregatorList: [],
      couriersMap: {},
      aggregatorsMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'start_date', title: 'Дата начала работы'},
        {key: 'end_date', title: 'Дата окончания работы'},
        {key: 'couriers_id', title: 'Курьер'},
        {key: 'aggregator_id', title: 'Агрегатор'},
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
          this.fetchCouriersAggregator(),
          this.fetchCouriers(),
          this.fetchAggregators()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCouriersAggregator(){
      try{
        const response = await api.getAllCouriersAggregator();
        this.couriersAggregatorList = response?.items || response || [];
        console.log('Загружено связей:', this.couriersAggregatorList.length);
      }catch(error){
        console.error('Ошибка загрузки связей:', error);
        this.couriersAggregatorList = [];
      }
    },

    async fetchCouriers(){
      try{
        const response = await apiCouriers.getAllCouriers();
        console.log('Ответ API курьеров:', response);

        let couriersArray = [];
        if (response?.items) {
          couriersArray = response.items;
        } else if (Array.isArray(response)) {
          couriersArray = response;
        } else {
          couriersArray = [];
        }

        couriersArray.forEach(courier => {
          if (courier && courier.id) {
            const fullName = `${courier.lastName || ''} ${courier.firstName || ''}`.trim();
            this.couriersMap[courier.id] = fullName || `Курьер #${courier.id}`;
          }
        });

        console.log('Загружено курьеров:', Object.keys(this.couriersMap).length);
      }catch(error){
        console.error('Ошибка загрузки курьеров:', error);
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

    getCourierName(id) {
      if (!id) return '—';
      return this.couriersMap[id] || `ID: ${id}`;
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