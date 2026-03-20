<template>
  <v-main>
    <DataTable
        title="Транспорт"
        :headers="columns"
        :items="transportList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.aggregator_id="{ item }">
        {{ getAggregatorName(item.aggregator_id) }}
      </template>

      <template v-slot:item.type_id="{ item }">
        {{ getTransportTypeName(item.type_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_transport.js";
import apiAggregators from "@/api/api_aggregator.js";
import apiTransportTypes from "@/api/api_transportTypes.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      transportList: [],
      aggregatorsMap: {},
      transportTypeMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'code', title: 'Номер транспортного средства'},
        {key: 'type_id', title: 'Тип транспорта'},
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
          this.fetchTransport(),
          this.fetchAggregators(),
          this.fetchTransportType()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTransport(){
      try{
        this.transportList = await api.getAllTransport();
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

    async fetchTransportType(){
      try{
        const response = await apiTransportTypes.getAllTransportTypes();
        console.log('Ответ API типов транспорта:', response);

        let transportTypeArray = [];
        if (response?.items) {
          transportTypeArray = response.items;
        } else if (Array.isArray(response)) {
          transportTypeArray = response;
        } else {
          transportTypeArray = [];
        }

        transportTypeArray.forEach(transportType => {
          if (transportType && transportType.id) {
            this.transportTypeMap[transportType.id] = transportType.name || `Тип транспорта #${transportType.id}`;
          }
        });

        console.log('Загружено типов транспорта:', Object.keys(this.transportTypeMap).length);
      }catch(error){
        console.error('Ошибка загрузки типов транспорта:', error);
      }
    },

    getAggregatorName(id) {
      if (!id) return '—';
      return this.aggregatorsMap[id] || `ID: ${id}`;
    },

    getTransportTypeName(id) {
      if (!id) return '—';
      return this.transportTypeMap[id] || `ID: ${id}`;
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
