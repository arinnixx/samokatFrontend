<template>
  <v-main>
    <DataTable
        title="Смена"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
        @history="showHistory"
        :show-history-button="true"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.courier_id="{ item }">
        <span class="clickable-text" @click="openModal('courier', item.courier_id)">
          {{ getCourierName(item.courier_id) }}
          </span>
      </template>

      <template v-slot:item.aggregator_id="{ item }">
          {{ getAggregatorName(item.aggregator_id) }}
      </template>

      <template v-slot:item.transport_id="{ item }">
        <span class="clickable-text" @click="openModal('transport', item.transport_id)">
          {{ getTransportCode(item.transport_id) }}
        </span>
      </template>

      <template v-slot:item.bag_id="{ item }">
        <span class="clickable-text" @click="openModal('bag', item.bag_id)">
          {{ getDeliveryBagsCode(item.bag_id) }}
        </span>
      </template>

      <template v-slot:item.jacket_id="{ item }">
        <span class="clickable-text" @click="openModal('jacket', item.jacket_id)">
          {{ getDeliveryJacketsCode(item.jacket_id) }}
        </span>
      </template>

      <template v-slot:item.status_id="{ item }">
        {{ getStatusName(item.status_id) }}
      </template>

      <template v-slot:item.start_date="{ item }">
        {{ formatDateAndTime(item.start_date) }}
      </template>

      <template v-slot:item.end_date="{ item }">
        {{ formatDateAndTime(item.end_date) }}
      </template>
    </DataTable>

    <Modal
        v-model="modal.show"
        :title="modal.title"
        :item="modal.item"
        :fields="modal.fields"
    />

      <HistoryModal
          v-model="showOrderHistoryModal"
          :entity-id="historyOrder?.id"
          :entity-title="`Смена #${historyOrder?.id}`"
          :fetch-history="api.getOrderHistory"
      />

  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import api from "@/api/api_orders.js";
import apiCouriers from "@/api/api_couriers.js";
import apiAggregators from "@/api/api_aggregator.js";
import apiTransport from "@/api/api_transport.js";
import apiDeliveryBags from "@/api/api_deliveryBags.js";
import apiDeliveryJackets from "@/api/api_deliveryJackets.js";
import apiStatus from "@/api/api_statuses.js";
import HistoryModal from "@/components/HistoryModal.vue";
import apiPassport from "@/api/api_passport.js";
import apiDriverLicense from "@/api/api_driverLicense.js";

export default {
  components: {
    HistoryModal,
    DataTable,
    Modal
  },
  data(){
    return{
      api:api,
      ordersList: [],
      couriersMap: {},
      aggregatorsMap: {},
      transportsMap: {},
      bagsMap: {},
      jacketsMap: {},
      statusMap: {},
      passportNumberMap: {},
      driverLicenseNumberMap: {},
      loading: false,
      showOrderHistoryModal: false,
      historyOrder: null,
      searchQuery: '',

      modal: {
        show: false,
        title: '',
        item: null,
        fields: []
      },

      columns: [
        {key: 'actions', title: 'Действия' },
        {key: 'created_at', title: 'Дата создания'},
        {key: 'aggregator_id', title: 'Аггрегатор'},
        {key: 'courier_id', title: 'Курьер'},
        {key: 'transport_id', title: 'Транспорт'},
        {key: 'bag_id', title: 'Сумка курьера'},
        {key: 'jacket_id', title: 'Куртка курьера'},
        {key: 'status_id', title: 'Статус'},
        {key: 'start_date', title: 'Дата начала смены'},
        {key: 'end_date', title: 'Дата окончания смены'},

      ]
    }
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.ordersList;
      const q = this.searchQuery.toLowerCase().trim();
      return this.ordersList.filter(item => {
        const courierName = this.getCourierName(item.courier_id).toLowerCase();
        const aggregatorName = this.getAggregatorName(item.aggregator_id).toLowerCase();
        const transportCode = this.getTransportCode(item.transport_id).toLowerCase();
        const bagCode = this.getDeliveryBagsCode(item.bag_id).toLowerCase();
        const jacketCode = this.getDeliveryJacketsCode(item.jacket_id).toLowerCase();
        const statusName = this.getStatusName(item.status_id).toLowerCase();
        const startDate = this.formatDateAndTime(item.start_date);
        const endDate = this.formatDateAndTime(item.end_date);
        return (
            courierName.includes(q) ||
            aggregatorName.includes(q) ||
            transportCode.includes(q) ||
            bagCode.includes(q) ||
            jacketCode.includes(q) ||
            statusName.includes(q) ||
            startDate.includes(q) ||
            endDate.includes(q)
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
          this.fetchOrders(),
          this.fetchCouriers(),
          this.fetchAggregators(),
          this.fetchTransports(),
          this.fetchBags(),
          this.fetchJackets(),
          this.fetchStatus(),
          this.fetchPassportNumber(),
          this.fetchDriverLicenseNumber(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders() {
      try {
        const data = await api.getAllOrders();
        let ordersArray = [];
        if (data && data.items) {
          ordersArray = data.items;
        } else if (Array.isArray(data)) {
          ordersArray = data;
        } else {
          ordersArray = [];
        }
        ordersArray = ordersArray.filter(o => !o.deleted_at);
        this.ordersList = ordersArray;
      } catch (error) {
        console.error('Ошибка загрузки смен:', error);
        this.ordersList = [];
      }
    },

    async fetchCouriers(){
      try{
        const response = await apiCouriers.getAllCouriers();
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
            this.couriersMap[`full_${courier.id}`] = courier;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки курьеров:', error);
      }
    },

    async fetchAggregators(){
      try{
        const response = await apiAggregators.getAllAggregators();
        let aggregatorsArray = [];
        if (response?.items) {
          aggregatorsArray = response.items;
        } else if (Array.isArray(response)) {
          aggregatorsArray = response;
        } else {
          aggregatorsArray = [];
        }

        aggregatorsArray.forEach(aggregator => {
          if (aggregator && aggregator.id) {
            this.aggregatorsMap[aggregator.id] = aggregator.name || `Агрегатор #${aggregator.id}`;
            this.aggregatorsMap[`full_${aggregator.id}`] = aggregator;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки агрегаторов:', error);
      }
    },

    async fetchTransports(){
      try{
        const response = await apiTransport.getAllTransport();
        let transportsArray = [];
        if (response?.items) {
          transportsArray = response.items;
        } else if (Array.isArray(response)) {
          transportsArray = response;
        } else {
          transportsArray = [];
        }

        transportsArray.forEach(transport => {
          if (transport && transport.id) {
            this.transportsMap[transport.id] = transport.code || `Транспорт #${transport.id}`;
            this.transportsMap[`full_${transport.id}`] = transport;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки транспорта:', error);
      }
    },

    async fetchBags(){
      try{
        const response = await apiDeliveryBags.getAllDeliveryBags();
        let bagsArray = [];
        if (response?.items) {
          bagsArray = response.items;
        } else if (Array.isArray(response)) {
          bagsArray = response;
        } else {
          bagsArray = [];
        }

        bagsArray.forEach(bag => {
          if (bag && bag.id) {
            this.bagsMap[bag.id] = bag.code || `Сумка #${bag.id}`;
            this.bagsMap[`full_${bag.id}`] = bag;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки сумок:', error);
      }
    },

    async fetchJackets(){
      try{
        const response = await apiDeliveryJackets.getAllDeliveryJackets();
        let jacketsArray = [];
        if (response?.items) {
          jacketsArray = response.items;
        } else if (Array.isArray(response)) {
          jacketsArray = response;
        } else {
          jacketsArray = [];
        }

        jacketsArray.forEach(jacket => {
          if (jacket && jacket.id) {
            this.jacketsMap[jacket.id] = jacket.code || `Куртка #${jacket.id}`;
            this.jacketsMap[`full_${jacket.id}`] = jacket;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки курток:', error);
      }
    },

    async fetchStatus(){
      try{
        const response = await apiStatus.getAllStatuses();
        let statusArray = [];
        if (response?.items) {
          statusArray = response.items;
        } else if (Array.isArray(response)) {
          statusArray = response;
        } else {
          statusArray = [];
        }

        statusArray.forEach(status => {
          if (status && status.id) {
            this.statusMap[status.id] = status.status_name || `Статус #${status.id}`;
            this.statusMap[`full_${status.id}`] = status;
          }
        });
      }catch(error){
        console.error('Ошибка загрузки статусов:', error);
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

    openModal(type, id) {
      let item = null;
      let title = '';
      let fields = [];

      switch(type) {
        case 'courier':
          item = this.couriersMap[`full_${id}`] || { id, name: this.getCourierName(id) };
          title = 'Информация о курьере';
          fields = [
            { key: 'fullName', label: 'ФИО', getValue: (item) => this.getFullName(item)},
            { key: 'gender', label: 'Пол'},
            { key: 'citizenship', label: 'Гражданство'},
            { key: 'phone', label: 'Телефон'},
            { key: 'birthDate', label: 'Дата рождения'},
            { key: 'email', label: 'Почта'},
            { key: 'snils', label: 'Снилс'},
            { key: 'inn', label: 'ИНН'},
            { key: 'passport_id', label: 'Паспорт', getValue: (item) => this.getPassportNumber(item.passport_id)},
            { key: 'driverLicense_id', label: 'Водительские права',getValue: (item) => this.getDriverLicenseNumber(item.driverLicense_id)},
          ];
          break;
          case 'transport':
          item = this.transportsMap[`full_${id}`] || { id, code: this.getTransportCode(id) };
          title = 'Информация о транспорте';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Аггрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) },
          ];
          break;
        case 'bag':
          item = this.bagsMap[`full_${id}`] || { id, code: this.getDeliveryBagsCode(id) };
          title = 'Информация о сумке';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Аггрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) },

          ];
          break;
        case 'jacket':
          item = this.jacketsMap[`full_${id}`] || { id, code: this.getDeliveryJacketsCode(id) };
          title = 'Информация о куртке';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Аггрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) },

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
      this.historyOrder = item;
      this.showOrderHistoryModal = true;
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

    getCourierName(id) {
      if (!id) return '—';
      return this.couriersMap[id] || `ID: ${id}`;
    },

    getAggregatorName(id) {
      if (!id) return '—';
      return this.aggregatorsMap[id] || `ID: ${id}`;
    },

    getTransportCode(id) {
      if (!id) return '—';
      return this.transportsMap[id] || `ID: ${id}`;
    },

    getDeliveryBagsCode(id) {
      if (!id) return '—';
      return this.bagsMap[id] || `ID: ${id}`;
    },

    getDeliveryJacketsCode(id) {
      if (!id) return '—';
      return this.jacketsMap[id] || `ID: ${id}`;
    },

    getStatusName(id) {
      if (!id) return '—';
      return this.statusMap[id] || `ID: ${id}`;
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

    formatDateAndTime(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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