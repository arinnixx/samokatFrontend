<template>
  <v-main>
    <DataTable
        title="Паспорт"
        :headers="columns"
        :items="passportList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.issueDate="{ item }">
        {{ formatDate(item.issueDate) }}
      </template>

      <template v-slot:item.couriers_id="{ item }">
        {{ getCourierName(item.couriers_id) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_passport.js";
import apiCouriers from "@/api/api_couriers.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      passportList: [],
      couriersMap: {},
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'series', title: 'Серия'},
        {key: 'number', title: 'Номер ВУ'},
        {key: 'issueDate', title: 'Дата выдачи'},
        {key: 'issuedBy', title: 'Кем выдан'},
        {key: 'birthPlace', title: 'Место рождения'},
        {key: 'registrationAddress', title: 'Адрес фактического проживания'},
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
          this.fetchPassport(),
          this.fetchCouriers(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPassport(){
      try{
        this.passportList = await api.getAllPassport();
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