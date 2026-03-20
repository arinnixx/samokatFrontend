<template>
  <v-main>
    <DataTable
        title="Курьеры"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @history="showHistory"
        @update:search-value="onSearchChange"
        :show-history-button="true"
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

      <template v-slot:item.passport_id="{ item }">
        <span class="clickable-text" @click="openModal('passport', item.passport_id)">
          {{ getPassportNumber(item.passport_id) }}
        </span>
      </template>

      <template v-slot:item.driverLicense_id="{ item }">
        <span class="clickable-text" @click="openModal('driverLicense', item.driverLicense_id)">
          {{ getDriverLicenseNumber(item.driverLicense_id) }}
        </span>
      </template>
    </DataTable>

    <Modal
        v-model="modal.show"
        :title="modal.title"
        :item="modal.item"
        :fields="modal.fields"
    />
      <HistoryModal
          v-model="showHistoryModal"
          :entity-id="historyCourier?.id"
          :entity-title="historyCourier ? getFullName(historyCourier) : ''"
          :fetch-history="api.getCourierHistory"
      />

  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_couriers.js";
import apiPassport from "@/api/api_passport.js";
import apiDriverLicense from "@/api/api_driverLicense.js";
import Modal from "@/components/Modal.vue";
import HistoryModal from "@/components/HistoryModal.vue";
import {filterItems} from "vuetify/lib/composables/filter.js";

export default {
  components: {
    HistoryModal,
    Modal,
    DataTable
  },
  data(){
    return{
      api: api,
      couriersList: [],
      couriersFullMap: {},
      passportNumberMap: {},
      driverLicenseNumberMap: {},
      loading: false,
      showHistoryModal: false,
      historyCourier: null,

      modal: {
        show: false,
        title: '',
        item: null,
        fields: []
      },

      columns: [
        { key: 'actions', title: 'Действия' },
        {key: 'created_at', title: 'Дата создания'},
        {key: 'fullName', title: 'ФИО'},
        {key: 'gender', title: 'Пол'},
        {key: 'phone', title: 'Номер телефона'},
        {key: 'email', title: 'Почта'},
        {key: 'snils', title: 'Снилс'},
        {key: 'inn', title: 'ИНН'},
        {key: 'passport_id', title: 'Паспорт'},
        {key: 'driverLicense_id', title: 'Водительские права'},
      ],

      searchQuery: '',
    }
  },
  computed: {
    isAggregator() {
      return !!localStorage.getItem('aggregator');
    },

    aggregatorId() {
      const aggregator = JSON.parse(localStorage.getItem('aggregator') || '{}');
      return aggregator.id || null;
    },

    filteredItems() {
      if (!this.searchQuery) return this.couriersList;

      const q = this.searchQuery.toLowerCase().trim();
      return this.couriersList.filter(item => {
        return (
            (item.lastName?.toLowerCase().includes(q)) ||
            (item.firstName?.toLowerCase().includes(q)) ||
            (item.middleName?.toLowerCase().includes(q)) ||
            (item.phone?.includes(q)) ||
            (item.email?.toLowerCase().includes(q)) ||
            (item.snils?.includes(q)) ||
            (item.inn?.includes(q))
        );
      });
    }
  },
  async created(){
    await this.loadData()
  },
  methods: {

    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    filterItems() {
      return filterItems
    },
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchCouriers(),
          this.fetchPassportNumber(),
          this.fetchDriverLicenseNumber()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCouriers() {
      try {
        let response;
        if (this.isAggregator && this.aggregatorId) {
          console.log('Загрузка курьеров для агрегатора ID:', this.aggregatorId);
          response = await api.getCouriersByAggregator(this.aggregatorId);
        } else {
          console.log('Загрузка всех курьеров');
          response = await api.getAllCouriers();
        }

        let couriersArray = [];
        if (response && response.items) {
          couriersArray = response.items;
        } else if (Array.isArray(response)) {
          couriersArray = response;
        } else {
          couriersArray = [];
        }

        couriersArray = couriersArray.filter(c => !c.deleted_at);

        this.couriersList = couriersArray;
        this.couriersFullMap = {};

        couriersArray.forEach(courier => {
          if (courier && courier.id) {
            this.couriersFullMap[courier.id] = courier;
          }
        });

        console.log('Загружено курьеров:', couriersArray.length);
      } catch (error) {
        console.error('Ошибка загрузки курьеров:', error);
        this.couriersList = [];
      }
    },

    async fetchPassportNumber() {
      try {
        const response = await apiPassport.getAllPassport();
        console.log('Ответ API паспорта:', response);

        let passportArray = [];
        if (response?.items) {
          passportArray = response.items;
        } else if (Array.isArray(response)) {
          passportArray = response;
        } else {
          passportArray = [];
        }

        passportArray.forEach(passport => {
          if (passport && passport.id) {
            this.passportNumberMap[passport.id] = passport.number || `Паспорт #${passport.id}`;
            this.passportNumberMap[`full_${passport.id}`] = passport;
          }
        });

        console.log('Загружено паспортов:', Object.keys(this.passportNumberMap).length);
      } catch (error) {
        console.error('Ошибка загрузки паспортов:', error);
      }
    },

    async fetchDriverLicenseNumber() {
      try {
        const response = await apiDriverLicense.getAllDriverLicense();
        console.log('Ответ API прав:', response);

        let licenseArray = [];
        if (response?.items) {
          licenseArray = response.items;
        } else if (Array.isArray(response)) {
          licenseArray = response;
        } else {
          licenseArray = [];
        }

        licenseArray.forEach(license => {
          if (license && license.id) {
            this.driverLicenseNumberMap[license.id] = license.number || `Права #${license.id}`;
            this.driverLicenseNumberMap[`full_${license.id}`] = license;
          }
        });

        console.log('Загружено прав:', Object.keys(this.driverLicenseNumberMap).length);
      } catch (error) {
        console.error('Ошибка загрузки прав:', error);
      }
    },

    getFullName(item) {
      const lastName = item.lastName || '';
      const firstName = item.firstName || '';
      const middleName = item.middleName || '';
      return `${lastName} ${firstName} ${middleName}`.trim() || '—';
    },

    getPassportNumber(id) {
      if (!id) return '—';
      return this.passportNumberMap[id] || `ID: ${id}`;
    },

    getDriverLicenseNumber(id) {
      if (!id) return '—';
      return this.driverLicenseNumberMap[id] || `ID: ${id}`;
    },

    openModal(type, id) {
      let item = null;
      let title = '';
      let fields = [];

      switch (type) {
        case 'passport':
          item = this.passportNumberMap[`full_${id}`] || {id, number: this.getPassportNumber(id)};
          title = 'Информация о паспорте';
          fields = [
            {key: 'series', label: 'Серия'},
            {key: 'number', label: 'Номер'},
            {key: 'issueDate', label: 'Дата выдачи'},
            {key: 'issuedBy', label: 'Кем выдан'},
            {key: 'birthPlace', label: 'Место рождения'},
            {key: 'registrationAddress', label: 'Адрес постоянной регистрации'},
            {key: 'residenceAddress', label: 'Адрес проживания'},
            {
              key: 'couriers_id',
              label: 'ФИО',
              getValue: (item) => {
                const courier = this.couriersFullMap[item.couriers_id];
                return courier ? this.getFullName(courier) : `ID: ${item.couriers_id}`;
              }
            },
            {
              key: 'citizenship',
              label: 'Гражданство',
              getValue: (item) => this.couriersFullMap[item.couriers_id]?.citizenship || '—'
            },
            {
              key: 'birthDate',
              label: 'Дата рождения',
              getValue: (item) => this.formatDate(this.couriersFullMap[item.couriers_id]?.birthDate)
            }
          ];
          break;

        case 'driverLicense':
          item = this.driverLicenseNumberMap[`full_${id}`] || {id, number: this.getDriverLicenseNumber(id)};
          title = 'Информация о водительских правах';
          fields = [
            {key: 'country', label: 'Страна',},
            {key: 'series', label: 'Серия'},
            {key: 'number', label: 'Номер'},
            {key: 'issueDate', label: 'Дата выдачи'},
            {key: 'expiryDate', label: 'Дата окончания действия'},
            {key: 'experience_startYear', label: 'Год начала ВУ'},
            {
              key: 'couriers_id',
              label: 'ФИО',
              getValue: (item) => {
                const courier = this.couriersFullMap[item.couriers_id];
                return courier ? this.getFullName(courier) : `ID: ${item.couriers_id}`;
              }
            }
          ];
          break;
      }

      this.modal = {
        show: true,
        title,
        item,
        fields
      };
    },


    showHistory(item) {
      this.historyCourier = item;
      this.showHistoryModal = true;
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

<style scoped>
.clickable-text {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
  color: #0562AA;
}

.clickable-text:hover {
  opacity: 0.7;
}
</style>