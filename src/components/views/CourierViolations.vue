<template>
  <v-main>
    <DataTable
        title="Нарушения курьера"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
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
            @click="openMapModal(item.location)"
        >
          Посмотреть на карте
        </v-btn>
        <span v-else>—</span>
      </template>
    </DataTable>

    <ViolationMapModal
        v-model="mapModal.show"
        :coordinates="mapModal.coordinates"
    />
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_courierViolations.js";
import apiCouriers from "@/api/api_couriers.js";
import apiViolationsType from "@/api/api_violationsType.js";
import ViolationMapModal from "@/components/ViolationMapModal.vue";

export default {
  components: {
    ViolationMapModal,
    DataTable
  },
  data(){
    return{
      courierViolationsList: [],
      couriersMap: {},
      violationsTypeMap: {},
      loading: false,
      searchQuery: '',
      mapModal: {
        show: false,
        coordinates: null
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
      if (!this.searchQuery) return this.courierViolationsList;
      const q = this.searchQuery.toLowerCase().trim();
      return this.courierViolationsList.filter(item => {
        const courierName = this.couriersMap[item.courier_id] || '';
        const violationType = this.violationsTypeMap[item.violation_type_id] || '';
        const dateVl = this.formatDate(item.violation_date);
        return (
            item.incident_details?.toLowerCase().includes(q) ||
            item.operator_comment?.toLowerCase().includes(q) ||
            courierName.toLowerCase().includes(q) ||
            violationType.toLowerCase().includes(q) ||
            item.id?.toString().includes(q)||
            dateVl.includes(q)

        );
      });
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
          this.fetchViolationsType()
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


    getCourierName(id) {
      if (!id) return '—';
      return this.couriersMap[id] || `ID: ${id}`;
    },

    getViolationsTypeCategory(id) {
      if (!id) return '—';
      return this.violationsTypeMap[id] || `ID: ${id}`;
    },

    openMapModal(location) {
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
    }
  }
}
</script>