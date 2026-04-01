<template>
  <v-main>
    <DataTable
        title="Нарушения курьера"
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

      <template v-slot:item.violation_date="{ item }">
        {{ formatDate(item.violation_date) }}
      </template>

      <template v-slot:item.courier_id="{ item }">
        {{ getCourierName(item.courier_id) }}
      </template>

      <template v-slot:item.violation_type_id="{ item }">
        {{ getViolationsTypeCategory(item.violation_type_id) }}
      </template>

      <template v-slot:item.location="{ item }">
        <v-btn
            v-if="item.location?.coordinates"
            variant="text"
            color="primary"
            @click="openMapModal(item.location, item)"
        >
          Посмотреть на карте
        </v-btn>
        <span v-else>—</span>
      </template>
    </DataTable>

    <ViolationMapModal
        v-model="mapModal.show"
        :coordinates="mapModal.coordinates"
        :violation="mapModal.violation"
    />

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
import api from "@/api/api_courierViolations.js";
import apiCouriers from "@/api/api_couriers.js";
import apiViolationsType from "@/api/api_violationsType.js";
import ViolationMapModal from "@/components/ViolationMapModal.vue";
import FilterModal from "@/components/FilterModal.vue";

export default {
  components: {
    ViolationMapModal,
    DataTable,
    FilterModal
  },
  data(){
    return{
      courierViolationsList: [],
      couriersMap: {},
      violationsTypeMap: {},
      loading: false,
      searchQuery: '',
      filterModalVisible: false,
      filterFields: [
        {
          key: 'violationTypeId',
          label: 'Тип нарушения',
          type: 'select',
          items: [],
          itemTitle: 'category',
          itemValue: 'id'
        },
        {
          key: 'dateRange',
          type: 'daterange',
          startKey: 'startDate',
          endKey: 'endDate',
          startLabel: 'Дата от',
          endLabel: 'Дата до'
        }
      ],
      currentFilters: {},
      mapModal: {
        show: false,
        coordinates: null,
        violation: null
      },
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'violation_date', title: 'Дата нарушения'},
        {key: 'incident_details', title: 'Описание нарушения'},
        {key: 'operator_comment', title: 'Комментарий оператора'},
        {key: 'courier_id', title: 'Курьер'},
        {key: 'violation_type_id', title: 'Тип нарушения'},
        {key: 'location', title: 'Местоположение'},
      ]
    }
  },
  computed: {
    filteredItems() {
      let result = this.courierViolationsList;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(item => {
          const courierName = this.couriersMap[item.courier_id] || '';
          const violationType = this.violationsTypeMap[item.violation_type_id] || '';
          const dateVl = this.formatDate(item.violation_date);
          return (
              item.incident_details?.toLowerCase().includes(q) ||
              item.operator_comment?.toLowerCase().includes(q) ||
              courierName.toLowerCase().includes(q) ||
              violationType.toLowerCase().includes(q) ||
              item.id?.toString().includes(q) ||
              dateVl.includes(q)
          );
        });
      }

      if (this.currentFilters.violationTypeId) {
        result = result.filter(item => item.violation_type_id === this.currentFilters.violationTypeId);
      }

      if (this.currentFilters.startDate && this.currentFilters.endDate) {
        const start = new Date(this.currentFilters.startDate).getTime() / 1000;
        const end = new Date(this.currentFilters.endDate).getTime() / 1000 + 86400 - 1;
        result = result.filter(item => {
          const ts = item.violation_date;
          return ts >= start && ts <= end;
        });
      } else if (this.currentFilters.startDate) {
        const start = new Date(this.currentFilters.startDate).getTime() / 1000;
        result = result.filter(item => item.violation_date >= start);
      } else if (this.currentFilters.endDate) {
        const end = new Date(this.currentFilters.endDate).getTime() / 1000 + 86400 - 1;
        result = result.filter(item => item.violation_date <= end);
      }

      return result;
    }
  },
  async created(){
    await this.loadData()
  },
  methods: {
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchCourierViolations(),
          this.fetchCouriers(),
          this.fetchViolationsType(),
          this.fetchFilterOptions()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
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

    async fetchCourierViolations(){
      try{
        const data = await api.getAllCourierViolations();
        this.courierViolationsList = data.items || (Array.isArray(data) ? data : []);
      }catch(error){
        console.error(error)
      }
    },

    async fetchViolationsType(){
      try{
        const response = await apiViolationsType.getAllViolationType();
        console.log('Ответ API типов нарушений:', response);

        let violationsTypeArray = [];
        if (response?.items) {
          violationsTypeArray = response.items;
        } else if (Array.isArray(response)) {
          violationsTypeArray = response;
        } else {
          violationsTypeArray = [];
        }

        violationsTypeArray.forEach(violationType => {
          if (violationType && violationType.id) {
            this.violationsTypeMap[violationType.id] = violationType.category || `Тип нарушения #${violationType.id}`;
          }
        });

        console.log('Загружено типов нарушений:', Object.keys(this.violationsTypeMap).length);
      }catch(error){
        console.error('Ошибка загрузки типов нарушений:', error);
      }
    },

    async fetchFilterOptions() {
      const data = await apiViolationsType.getAllViolationType();
      const types = data.items || data || [];
      const typeField = this.filterFields.find(f => f.key === 'violationTypeId');
      if (typeField) typeField.items = types;
    },

    getCourierName(id) {
      if (!id) return '—';
      return this.couriersMap[id] || `ID: ${id}`;
    },

    getViolationsTypeCategory(id) {
      if (!id) return '—';
      return this.violationsTypeMap[id] || `ID: ${id}`;
    },

    openMapModal(location, violationItem) {
      const typeId = violationItem.violation_type_id;
      const typeName = this.violationsTypeMap[typeId] || `Тип нарушения #${typeId}`;
      this.mapModal.violation = {
        typeName,
        description: violationItem.incident_details || '—'
      };
      this.mapModal.coordinates = location;
      this.mapModal.show = true;
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
    }
  }
}
</script>