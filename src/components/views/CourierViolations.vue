<template>
  <v-main color="#f9e4ff">
    <DataTable
        title="Нарушения курьера"
        :headers="columns"
        :items="courierViolationsList"
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
import api from "@/api/api_courierViolations.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      courierViolationsList: [],
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'violation_date', title: 'Код'},
        {key: 'incident_details', title: 'Описание нарушения'},
        {key: 'operator_comment', title: 'Комментарий оператора'},
        {key: 'courier_id', title: 'Id курьера'},
        {key: 'violation_type_id', title: 'Id типа нарушения'},
      ]
    }
  },
  async created(){
    await this.fetchCourierViolations();
  },
  methods: {
    async fetchCourierViolations(){
      try{
        this.courierViolationsList = await api.getAllCourierViolations();
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