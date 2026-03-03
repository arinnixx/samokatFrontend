<template>
  <v-main color="#f9e4ff">
    <DataTable
        title="Паспорт"
        :headers="columns"
        :items="passportList"
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
import api from "@/api/api_passport.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      passportList: [],
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'series', title: 'Серия'},
        {key: 'number', title: 'Номер ВУ'},
        {key: 'issueDate', title: 'Дата выдачи'},
        {key: 'issuedBy', title: 'Кем выдан'},
        {key: 'birthPlace', title: 'Место рождения'},
        {key: 'registrationAddress', title: 'Адрес фактического проживания'},
        {key: 'courier_id', title: 'Id курьера'},
      ]
    }
  },
  async created(){
    await this.fetchPassport();
  },
  methods: {
    async fetchPassport(){
      try{
        this.driverLicenseList = await api.getAllPassport();
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