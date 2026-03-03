<template>
  <v-main>
    <DataTable
        title="Логи"
        :headers="columns"
        :items="requestLogData"
        :loading="loading"
    >

      <template v-slot:item.request_data="{ item }">
        <v-expansion-panels class="mt-2 mb-2">
          <v-expansion-panel
          title="Показать данные"
          >
            <v-expansion-panel-text class="custom-panel">
              <pre class="custom-size">{{ item.request_data }}</pre>

            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_requestLogs.js";

export default {
  components: { DataTable },
  data(){
    return{
      requestLogData: [],
      loading: false,
      columns: [
        {key: 'id', title: 'Id', width: '80px'},
        {key: 'aggregator_id', title: 'Id аггрегатора', width: '120px'},
        {key: 'request_data', title: 'Данные запроса', width: '300px'},
        {key: 'created_at', title: 'Дата создания', width: '150px'},
      ]
    }
  },
  async created(){
    await this.fetchRequestLogs()
  },
  methods: {
    async fetchRequestLogs(){
      this.loading = true;
      try{
        const data = await api.getAllRequestLogs();
        console.log('Данные:', data);

        if (data && data.items) {
          this.requestLogData = data.items;
        } else if (Array.isArray(data)) {
          this.requestLogData = data;
        } else {
          this.requestLogData = [];
        }
      }catch(error){
        console.error('Ошибка:', error);
        this.requestLogData = [];
      } finally {
        this.loading = false;
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

<style scoped>
.custom-panel {
  max-height: 300px;
  overflow-y: auto;
}

.custom-size{
  width: 300px;

}

</style>