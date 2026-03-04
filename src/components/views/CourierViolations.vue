<template>
  <v-main>
    <DataTable
        title="Нарушения курьера"
        :headers="columns"
        :items="courierViolationsList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>

      <template v-slot:item.courier_id="{ item }">
        {{ getCourierName(item.courier_id) }}
      </template>

      <template v-slot:item.violation_type_id="{ item }">
        {{ getViolationsTypeCategory(item.violation_type_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_courierViolations.js";
import apiCouriers from "@/api/api_couriers.js";
import apiViolationsType from "@/api/api_violationsType.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      courierViolationsList: [],
      couriersMap: {},
      violationsTypeMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'violation_date', title: 'Код'},
        {key: 'incident_details', title: 'Описание нарушения'},
        {key: 'operator_comment', title: 'Комментарий оператора'},
        {key: 'courier_id', title: 'Курьер'},
        {key: 'violation_type_id', title: 'Тип нарушения'},
      ]
    }
  },
  async created(){
    await this.loadData()
  },
  methods: {
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
        this.courierViolationsList = await api.getAllCourierViolations();
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