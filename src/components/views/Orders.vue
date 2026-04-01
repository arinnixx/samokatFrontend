<template>
  <v-main>
    <DataTable
        title="Смена"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
        @filters="openFilters"
        @history="showHistory"
        :show-history-button="true"
        :show-filter-button="true"
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

    <FilterModal
        v-model="filterModalVisible"
        :fields="filterFields"
        :initial-filters="currentFilters"
        :show-partial-switch="true"
        @apply="applyFilters"
        @reset="resetFilters"
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
import FilterModal from "@/components/FilterModal.vue";

export default {
  components: {
    HistoryModal,
    DataTable,
    Modal,
    FilterModal
  },
  data() {
    return {
      api: api,
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
      filterModalVisible: false,
      partialMatch: false,
      filterFields: [
        {
          key: 'aggregatorId',
          label: 'Агрегатор',
          type: 'select',
          items: [],
          itemTitle: 'name',
          itemValue: 'id'
        },
        {
          key: 'statusId',
          label: 'Статус',
          type: 'select',
          items: [],
          itemTitle: 'status_name',
          itemValue: 'id'
        },
        {
          key: 'courierId',
          label: 'Курьер',
          type: 'select',
          items: [],
          itemTitle: 'fullName',
          itemValue: 'id'
        },
        {
          key: 'transportId',
          label: 'Транспорт',
          type: 'select',
          items: [],
          itemTitle: 'code',
          itemValue: 'id'
        },
        {
          key: 'bagId',
          label: 'Сумка',
          type: 'select',
          items: [],
          itemTitle: 'code',
          itemValue: 'id'
        },
        {
          key: 'jacketId',
          label: 'Куртка',
          type: 'select',
          items: [],
          itemTitle: 'code',
          itemValue: 'id'
        },
        {
          key: 'startDateRange',
          type: 'daterange',
          startKey: 'startDateFrom',
          endKey: 'startDateTo',
          startLabel: 'Дата начала от',
          endLabel: 'Дата начала до'
        },
        {
          key: 'endDateRange',
          type: 'daterange',
          startKey: 'endDateFrom',
          endKey: 'endDateTo',
          startLabel: 'Дата окончания от',
          endLabel: 'Дата окончания до'
        }
      ],
      currentFilters: {},

      modal: {
        show: false,
        title: '',
        item: null,
        fields: []
      },

      columns: [
        { key: 'actions', title: 'Действия' },
        { key: 'created_at', title: 'Дата создания' },
        { key: 'aggregator_id', title: 'Аггрегатор' },
        { key: 'courier_id', title: 'Курьер' },
        { key: 'transport_id', title: 'Транспорт' },
        { key: 'bag_id', title: 'Сумка курьера' },
        { key: 'jacket_id', title: 'Куртка курьера' },
        { key: 'status_id', title: 'Статус' },
        { key: 'start_date', title: 'Дата начала смены' },
        { key: 'end_date', title: 'Дата окончания смены' }
      ]
    };
  },
  computed: {
    filteredItems() {
      let result = this.ordersList;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(item => {
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
      }

      if (!this.partialMatch) {
        if (this.currentFilters.aggregatorId) {
          result = result.filter(item => item.aggregator_id === this.currentFilters.aggregatorId);
        }
        if (this.currentFilters.statusId) {
          result = result.filter(item => item.status_id === this.currentFilters.statusId);
        }
        if (this.currentFilters.courierId) {
          result = result.filter(item => item.courier_id === this.currentFilters.courierId);
        }
        if (this.currentFilters.transportId) {
          result = result.filter(item => item.transport_id === this.currentFilters.transportId);
        }
        if (this.currentFilters.bagId) {
          result = result.filter(item => item.bag_id === this.currentFilters.bagId);
        }
        if (this.currentFilters.jacketId) {
          result = result.filter(item => item.jacket_id === this.currentFilters.jacketId);
        }

        if (this.currentFilters.startDateFrom && this.currentFilters.startDateTo) {
          const start = new Date(this.currentFilters.startDateFrom).getTime() / 1000;
          const end = new Date(this.currentFilters.startDateTo).getTime() / 1000 + 86400 - 1;
          result = result.filter(item => item.start_date >= start && item.start_date <= end);
        } else if (this.currentFilters.startDateFrom) {
          const start = new Date(this.currentFilters.startDateFrom).getTime() / 1000;
          result = result.filter(item => item.start_date >= start);
        } else if (this.currentFilters.startDateTo) {
          const end = new Date(this.currentFilters.startDateTo).getTime() / 1000 + 86400 - 1;
          result = result.filter(item => item.start_date <= end);
        }

        if (this.currentFilters.endDateFrom && this.currentFilters.endDateTo) {
          const start = new Date(this.currentFilters.endDateFrom).getTime() / 1000;
          const end = new Date(this.currentFilters.endDateTo).getTime() / 1000 + 86400 - 1;
          result = result.filter(item => {
            if (!item.end_date) return false;
            return item.end_date >= start && item.end_date <= end;
          });
        } else if (this.currentFilters.endDateFrom) {
          const start = new Date(this.currentFilters.endDateFrom).getTime() / 1000;
          result = result.filter(item => item.end_date >= start);
        } else if (this.currentFilters.endDateTo) {
          const end = new Date(this.currentFilters.endDateTo).getTime() / 1000 + 86400 - 1;
          result = result.filter(item => item.end_date <= end);
        }
      } else {
        result = result.filter(item => {
          let match = false;

          if (this.currentFilters.aggregatorId && item.aggregator_id === this.currentFilters.aggregatorId) match = true;
          if (this.currentFilters.statusId && item.status_id === this.currentFilters.statusId) match = true;
          if (this.currentFilters.courierId && item.courier_id === this.currentFilters.courierId) match = true;
          if (this.currentFilters.transportId && item.transport_id === this.currentFilters.transportId) match = true;
          if (this.currentFilters.bagId && item.bag_id === this.currentFilters.bagId) match = true;
          if (this.currentFilters.jacketId && item.jacket_id === this.currentFilters.jacketId) match = true;

          if (this.currentFilters.startDateFrom && this.currentFilters.startDateTo) {
            const start = new Date(this.currentFilters.startDateFrom).getTime() / 1000;
            const end = new Date(this.currentFilters.startDateTo).getTime() / 1000 + 86400 - 1;
            if (item.start_date >= start && item.start_date <= end) match = true;
          } else if (this.currentFilters.startDateFrom) {
            const start = new Date(this.currentFilters.startDateFrom).getTime() / 1000;
            if (item.start_date >= start) match = true;
          } else if (this.currentFilters.startDateTo) {
            const end = new Date(this.currentFilters.startDateTo).getTime() / 1000 + 86400 - 1;
            if (item.start_date <= end) match = true;
          }

          if (this.currentFilters.endDateFrom && this.currentFilters.endDateTo) {
            const start = new Date(this.currentFilters.endDateFrom).getTime() / 1000;
            const end = new Date(this.currentFilters.endDateTo).getTime() / 1000 + 86400 - 1;
            if (item.end_date && item.end_date >= start && item.end_date <= end) match = true;
          } else if (this.currentFilters.endDateFrom) {
            const start = new Date(this.currentFilters.endDateFrom).getTime() / 1000;
            if (item.end_date && item.end_date >= start) match = true;
          } else if (this.currentFilters.endDateTo) {
            const end = new Date(this.currentFilters.endDateTo).getTime() / 1000 + 86400 - 1;
            if (item.end_date && item.end_date <= end) match = true;
          }

          return match;
        });
      }

      return result;
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
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
          this.fetchFilterOptions()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchFilterOptions() {
      const aggData = await apiAggregators.getAllAggregators();
      const aggregators = aggData.items || aggData || [];
      const aggregatorField = this.filterFields.find(f => f.key === 'aggregatorId');
      if (aggregatorField) aggregatorField.items = aggregators;

      const statusData = await apiStatus.getAllStatuses();
      const statuses = statusData.items || statusData || [];
      const statusField = this.filterFields.find(f => f.key === 'statusId');
      if (statusField) statusField.items = statuses;

      const couriersData = await apiCouriers.getAllCouriers();
      let couriers = couriersData.items || couriersData || [];
      const courierItems = couriers.map(c => ({
        id: c.id,
        fullName: `${c.lastName || ''} ${c.firstName || ''}`.trim() || `Курьер #${c.id}`
      }));
      const courierField = this.filterFields.find(f => f.key === 'courierId');
      if (courierField) courierField.items = courierItems;

      const transportData = await apiTransport.getAllTransport();
      let transports = transportData.items || transportData || [];
      const transportItems = transports.map(t => ({
        id: t.id,
        code: t.code || `Транспорт #${t.id}`
      }));
      const transportField = this.filterFields.find(f => f.key === 'transportId');
      if (transportField) transportField.items = transportItems;

      const bagsData = await apiDeliveryBags.getAllDeliveryBags();
      let bags = bagsData.items || bagsData || [];
      const bagItems = bags.map(b => ({
        id: b.id,
        code: b.code || `Сумка #${b.id}`
      }));
      const bagField = this.filterFields.find(f => f.key === 'bagId');
      if (bagField) bagField.items = bagItems;

      const jacketsData = await apiDeliveryJackets.getAllDeliveryJackets();
      let jackets = jacketsData.items || jacketsData || [];
      const jacketItems = jackets.map(j => ({
        id: j.id,
        code: j.code || `Куртка #${j.id}`
      }));
      const jacketField = this.filterFields.find(f => f.key === 'jacketId');
      if (jacketField) jacketField.items = jacketItems;
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

    async fetchCouriers() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки курьеров:', error);
      }
    },

    async fetchAggregators() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки агрегаторов:', error);
      }
    },

    async fetchTransports() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки транспорта:', error);
      }
    },

    async fetchBags() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки сумок:', error);
      }
    },

    async fetchJackets() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки курток:', error);
      }
    },

    async fetchStatus() {
      try {
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
      } catch (error) {
        console.error('Ошибка загрузки статусов:', error);
      }
    },

    async fetchPassportNumber() {
      try {
        const response = await apiPassport.getAllPassport();
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
      } catch (error) {
        console.error('Ошибка загрузки паспортов:', error);
      }
    },

    async fetchDriverLicenseNumber() {
      try {
        const response = await apiDriverLicense.getAllDriverLicense();
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
      } catch (error) {
        console.error('Ошибка загрузки прав:', error);
      }
    },

    openModal(type, id) {
      let item = null;
      let title = '';
      let fields = [];

      switch (type) {
        case 'courier':
          item = this.couriersMap[`full_${id}`] || { id, name: this.getCourierName(id) };
          title = 'Информация о курьере';
          fields = [
            { key: 'fullName', label: 'ФИО', getValue: (item) => this.getFullName(item) },
            { key: 'gender', label: 'Пол' },
            { key: 'citizenship', label: 'Гражданство' },
            { key: 'phone', label: 'Телефон' },
            { key: 'birthDate', label: 'Дата рождения' },
            { key: 'email', label: 'Почта' },
            { key: 'snils', label: 'Снилс' },
            { key: 'inn', label: 'ИНН' },
            { key: 'passport_id', label: 'Паспорт', getValue: (item) => this.getPassportNumber(item.passport_id) },
            { key: 'driverLicense_id', label: 'Водительские права', getValue: (item) => this.getDriverLicenseNumber(item.driverLicense_id) }
          ];
          break;
        case 'transport':
          item = this.transportsMap[`full_${id}`] || { id, code: this.getTransportCode(id) };
          title = 'Информация о транспорте';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Агрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) }
          ];
          break;
        case 'bag':
          item = this.bagsMap[`full_${id}`] || { id, code: this.getDeliveryBagsCode(id) };
          title = 'Информация о сумке';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Агрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) }
          ];
          break;
        case 'jacket':
          item = this.jacketsMap[`full_${id}`] || { id, code: this.getDeliveryJacketsCode(id) };
          title = 'Информация о куртке';
          fields = [
            { key: 'code', label: 'Код' },
            { key: 'aggregator_id', label: 'Агрегатор', getValue: (item) => this.getAggregatorName(item.aggregator_id) }
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

    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },

    openFilters() {
      this.filterModalVisible = true;
    },
    applyFilters(filters) {
      this.partialMatch = filters._partialMatch || false;

      this.currentFilters = filters;
    },
    resetFilters() {
      this.currentFilters = {};
      this.partialMatch = false;
    },

    formatDate(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
        minute: '2-digit'
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