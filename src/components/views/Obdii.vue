<template>
  <v-main>
    <DataTable
        title="Устройство"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </DataTable>

  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_obdii.js";
export default {
  components: {
    DataTable,
  },
  data(){
    return{
      obdiiList: [],
      loading: false,
      searchQuery: '',
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'uid', title: 'UID'},
      ]
    }
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.obdiiList;

        const q = this.searchQuery.toLowerCase().trim();
        return this.obdiiList.filter(item => {
          return (
              item.uid?.toLowerCase().includes(q)
          );
        });
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
          this.fetchObdii(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchObdii(){
      try{
        const data = await api.getAllObdii();
        this.obdiiList = data.items || (Array.isArray(data) ? data : []);
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
    },

  }
}
</script>