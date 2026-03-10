<template>
  <v-main>
    <DataTable
        title="Водительские права"
        :headers="columns"
        :items="driverLicenseList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.issueDate="{ item }">
        {{ formatDate(item.issueDate) }}
      </template>

      <template v-slot:item.expiryDate="{ item }">
        {{ formatDate(item.expiryDate) }}
      </template>

      <template v-slot:item.couriers_id="{ item }">
        {{ getCourierName(item.couriers_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_driverLicense.js";
import apiCouriers from "@/api/api_couriers.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      driverLicenseList: [],
      couriersMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'country', title: 'Государство выдавшее ВУ'},
        {key: 'series', title: 'Серия ВУ'},
        {key: 'number', title: 'Номер ВУ'},
        {key: 'issueDate', title: 'Дата выдачи ВУ'},
        {key: 'expiryDate', title: 'Дата окончания действия ВУ'},
        {key: 'experience_startYear', title: 'Год начала ВУ'},
        {key: 'couriers_id', title: 'Курьер'},
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
          this.fetchDriverLicense(),
          this.fetchCouriers(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDriverLicense(){
      try{
        this.driverLicenseList = await api.getAllDriverLicense();
      }catch(error){
        console.error(error)
      }
    },

    async fetchCouriers() {
      try {
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
      } catch (error) {
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