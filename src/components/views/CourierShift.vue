<template>
  <v-main color="#f9e4ff">
    <DataTable
        title="Средства передвижения"
        :headers="columns"
        :items="courierShiftList"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_courierShift.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      courierShiftList: [],
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'movement_type', title: 'Тип передвижения'},
        {key: 'vehicle_number', title: 'Номер ТС'},
        {key: 'bag_number', title: 'Номер сумки'},
        {key: 'closed_at', title: 'Дата закрытия'},
        {key: 'courier_id', title: 'Id курьера'},
      ]
    }
  },
  async created(){
    await this.fetchCourierShift();
  },
  methods: {
    async fetchCourierShift(){
      try{
        this.courierShiftList = await api.getAllCourierShifts();
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