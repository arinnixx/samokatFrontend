<template>
  <v-main>
    <DataTable
        title="Типы нарушений"
        :headers="columns"
        :items="violationsTypeList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_violationsType.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      violationsTypeList: [],
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'category', title: 'Категория'},
        {key: 'code', title: 'Код'},
      ]
    }
  },
  async created(){
    await this.fetchViolationsType();
  },
  methods: {
    async fetchViolationsType(){
      try{
        this.violationsTypeList = await api.getAllViolationType();
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