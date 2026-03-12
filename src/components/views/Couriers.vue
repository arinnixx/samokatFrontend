<template>
  <v-main>
    <DataTable
        title="Курьеры"
        :headers="columns"
        :items="couriersList"
        :loading="loading"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.birthDate="{ item }">
        {{ formatDate(item.birthDate) }}
      </template>

      <template v-slot:item.fullName="{ item }">
        {{ getFullName(item) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_couriers.js";

export default {
  components: {
    DataTable
  },
  data(){
    return{
      couriersList: [],
      loading: false,
      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'id', title: 'Id'},
        {key: 'fullName', title: 'ФИО'},
        {key: 'gender', title: 'Пол'},
        {key: 'phone', title: 'Номер телефона'},
        {key: 'email', title: 'Почта'},
        {key: 'snils', title: 'Снилс'},
        {key: 'inn', title: 'ИНН'},
        {key: 'passport_id', title: 'Паспорт'},
        {key: 'driverLicense_id', title: 'Водительские права'},
      ]
    }
  },
  computed: {
    isAggregator() {
      return !!localStorage.getItem('aggregator');
    },

    aggregatorId() {
      const aggregator = JSON.parse(localStorage.getItem('aggregator') || '{}');
      return aggregator.id || null;
    }
  },
  async created(){
    await this.fetchCouriers()
  },
  methods:{
    async fetchCouriers(){
      try{
        if (this.isAggregator && this.aggregatorId) {
          console.log('Загрузка курьеров для агрегатора ID:', this.aggregatorId);
          this.couriersList = await api.getCouriersByAggregator(this.aggregatorId);
        } else {
          console.log('Загрузка всех курьеров');
          this.couriersList = await api.getAllCouriers();
        }
        console.log('Загружено курьеров:', this.couriersList.length);
      } catch(error) {
        console.error('Ошибка загрузки курьеров:', error);
        this.couriersList = [];
      }
    },

    getFullName(item){
      const lastName = item.lastName || '';
      const firstName = item.firstName || '';
      const middleName = item.middleName || '';

      const fullName = `${lastName} ${firstName} ${middleName}`.trim();

      return fullName || '—';
    },

    formatDate(timestamp) {
      if (!timestamp) return '—';

      try {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch {
        return String(timestamp);
      }
    }
  }
}
</script>