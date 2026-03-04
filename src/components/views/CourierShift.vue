<template>
  <v-main>
    <DataTable
        title="Средства передвижения"
        :headers="columns"
        :items="courierShiftList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>

      <template v-slot:item.closed_at="{ item }">
        {{ formatDate(item.closed_at) }}
      </template>

      <template v-slot:item.courier_id="{ item }">
        {{ getCourierName(item.courier_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_courierShift.js";
import apiCouriers from "@/api/api_couriers.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      courierShiftList: [],
      couriersMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'movement_type', title: 'Тип передвижения'},
        {key: 'vehicle_number', title: 'Номер ТС'},
        {key: 'bag_number', title: 'Номер сумки'},
        {key: 'closed_at', title: 'Дата закрытия'},
        {key: 'courier_id', title: 'Курьер'},
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
          this.fetchCourierShift(),
          this.fetchCouriers(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCourierShift(){
      try{
        this.courierShiftList = await api.getAllCourierShifts();
      }catch(error){
        console.error(error)
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

    getCourierName(id) {
      if (!id) return '—';
      return this.couriersMap[id] || `ID: ${id}`;
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