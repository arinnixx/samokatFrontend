<template>
  <v-main>
    <DataTable
        title="Куртки курьеров"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
        @filters="openFilters"
        :show-filter-button="true"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.aggregator_id="{ item }">
        {{ getAggregatorName(item.aggregator_id) }}
      </template>
    </DataTable>

    <FilterModal
        v-model="filterModalVisible"
        :fields="filterFields"
        :initial-filters="currentFilters"
        @apply="applyFilters"
        @reset="resetFilters"
    />
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_deliveryJackets.js";
import apiAggregators from "@/api/api_aggregator.js";
import FilterModal from "@/components/FilterModal.vue";

export default {
  components: {
    FilterModal,
    DataTable
  },
  data(){
    return{
      deliveryJacketsList: [],
      aggregatorsMap: {},
      loading: false,
      searchQuery: '',
      filterModalVisible: false,
      filterFields: [
        {
          key: 'aggregatorId',
          label: 'Агрегатор',
          type: 'select',
          items: [],
          itemTitle: 'name',
          itemValue: 'id'
        }
      ],
      currentFilters: {},
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'code', title: 'Код куртки'},
        {key: 'aggregator_id', title: 'Аггрегатор'},
      ]
    }
  },
  computed: {
    filteredItems() {
      let result = this.deliveryJacketsList;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(item => {
          const aggregatorName = this.getAggregatorName(item.aggregator_id).toLowerCase();
          return (
              item.code?.toLowerCase().includes(q) ||
              aggregatorName.includes(q)
          );
        });
      }

      if (this.currentFilters.aggregatorId) {
        result = result.filter(item => item.aggregator_id === this.currentFilters.aggregatorId);
      }

      return result;
    },
  },
  async created(){
    await this.loadData()
  },
  methods:{
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchDeliveryJackets(),
          this.fetchAggregators(),
          this.fetchAggregatorsForFilter()

        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDeliveryJackets(){
      try{
        const data = await api.getAllDeliveryJackets();
        this.deliveryJacketsList = data.items || (Array.isArray(data) ? data : []);
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

    async fetchAggregatorsForFilter() {
      const data = await apiAggregators.getAllAggregators();
      const aggregators = data.items || data || [];
      const aggregatorField = this.filterFields.find(f => f.key === 'aggregatorId');
      if (aggregatorField) aggregatorField.items = aggregators;
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
    },

    openFilters() {
      this.filterModalVisible = true;
    },
    applyFilters(filters) {
      this.currentFilters = filters;
    },
    resetFilters() {
      this.currentFilters = {};
    },
  }
}

</script>
