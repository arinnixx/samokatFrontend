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

      <template v-slot:item.deleted_at="{ item }">
        {{ formatDate(item.deleted_at) }}
      </template>

      <template v-slot:item.birthDate="{ item }">
        {{ formatDate(item.birthDate) }}
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
        {key: 'deleted_at', title: 'Дата удаления'},
        {key: 'id', title: 'Id'},
        {key: 'lastName', title: 'Фамилия'},
        {key: 'firstName', title: 'Имя'},
        {key: 'middleName', title: 'Отчество'},
        {key: 'gender', title: 'Пол'},
        {key: 'citizenship', title: 'Гражданство'},
        {key: 'phone', title: 'Номер телефона'},
        {key: 'birthDate', title: 'Дата рождения'},
        {key: 'email', title: 'Почта'},
        {key: 'snils', title: 'Снилс'},
        {key: 'inn', title: 'ИНН'},
      ]
    }
  },
  computed: {
    // Правильное использование computed в Options API
    isAggregator() {
      return !!localStorage.getItem('aggregator');
    },

    // Получаем ID агрегатора из localStorage
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
          // Если это агрегатор - получаем только его курьеров
          console.log('Загрузка курьеров для агрегатора ID:', this.aggregatorId);
          this.couriersList = await api.getCouriersByAggregator(this.aggregatorId);
        } else {
          // Если это администратор - получаем всех курьеров
          console.log('Загрузка всех курьеров');
          this.couriersList = await api.getAllCouriers();
        }
        console.log('Загружено курьеров:', this.couriersList.length);
      } catch(error) {
        console.error('Ошибка загрузки курьеров:', error);
        this.couriersList = [];
      }
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