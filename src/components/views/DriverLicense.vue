<template>
  <v-main color="#f9e4ff">
    <DataTable
        title="Водительские права"
        :headers="columns"
        :items="driverLicenseList"
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
import api from "@/api/api_driverLicense.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      driverLicenseList: [],
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'ID'},
        {key: 'country', title: 'Государство выдавшее ВУ'},
        {key: 'series', title: 'Серия ВУ'},
        {key: 'number', title: 'Номер ВУ'},
        {key: 'issueDate', title: 'Дата выдачи ВУ'},
        {key: 'expiryDate', title: 'Дата окончания действия ВУ'},
        {key: 'experience_startYear', title: 'Год начала ВУ'},
        {key: 'courier_id', title: 'Id курьера'},
      ]
    }
  },
  async created(){
    await this.fetchDriverLicense();
  },
  methods: {
    async fetchDriverLicense(){
      try{
        this.driverLicenseList = await api.getAllDriverLicense();
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