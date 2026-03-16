<template>
  <v-main>
    <DataTable
        title="Смена"
        :headers="columns"
        :items="ordersList"
        :loading="loading"
        @edit="editOrder"
        @delete="openConfirmDelete"
        @history="showHistory"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.courier_id="{ item }">
          {{ getCourierName(item.courier_id) }}
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
    </DataTable>

    <Modal
        v-model="modal.show"
        :title="modal.title"
        :item="modal.item"
        :fields="modal.fields"
    />

    <Modal
        v-model="editModal.show"
        mode="edit"
        :title="editModal.title"
        :item="editModal.item"
        :fields="editModal.fields"
        :api-method="editModal.apiMethod"
        @created="fetchOrders"
    />

    <template>
      <HistoryModal
          v-model="showOrderHistoryModal"
          :entity-id="historyOrder?.id"
          :entity-title="`Смена #${historyOrder?.id}`"
          :fetch-history="api.getOrderHistory"
      />
    </template>

    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="confirmDialog.show = false">
            Отмена
          </v-btn>
          <v-btn
              color="error"
              @click="confirmDelete"
              :loading="confirmDialog.loading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      loading: false,
      showOrderHistoryModal: false,
      historyOrder: null,

      modal: {
        show: false,
        title: '',
        item: null,
        fields: []
      },

      editModal: {
        show: false,
        title: 'Редактирование смены',
        item: null,
        fields: [],
        apiMethod: null
      },

      confirmDialog: {
        show: false,
        title: 'Подтверждение удаления',
        message: '',
        item: null,
        loading: false
      },

      columns: [
        {key: 'created_at', title: 'Дата создания'},
        {key: 'aggregator_id', title: 'Аггрегатор'},
        {key: 'courier_id', title: 'Курьер'},
        {key: 'transport_id', title: 'Транспорт'},
        {key: 'bag_id', title: 'Сумка курьера'},
        {key: 'jacket_id', title: 'Куртка курьера'},
        {key: 'status_id', title: 'Статус'},
        {key: 'start_date', title: 'Дата начала смены'},
        {key: 'end_date', title: 'Дата окончания смены'},
        { key: 'actions', title: 'Действия' }
      ]
    }
  },
  async created(){
    await this.loadData()
  },
  methods:{
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

    openModal(type, id) {
      let item = null;
      let title = '';
      let fields = [];

      switch(type) {
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


    editOrder(item) {
      const fields = [
        {key: 'created_at', label: 'Дата создания', cols:12},
        {key: 'aggregator_id', label: 'Аггрегатор', cols:12},
        {key: 'courier_id', label: 'Курьер', cols:12},
        {key: 'transport_id', label: 'Транспорт', cols:12},
        {key: 'bag_id', label: 'Сумка курьера', cols:12},
        {key: 'jacket_id', label: 'Куртка курьера', cols:12},
        {key: 'status_id', label: 'Статус', cols:12},
        {key: 'start_date', label: 'Дата начала смены', cols:12},
        {key: 'end_date', label: 'Дата окончания смены', cols:12},
      ];
      this.editModal.item = {...item};
      this.editModal.fields = fields;
      this.editModal.apiMethod = (data) => api.updateOrder(item.id, data);
      this.editModal.show = true;
    },

    showHistory(item) {
      this.historyOrder = item;
      this.showOrderHistoryModal = true;
    },

    openConfirmDelete(item) {
      this.confirmDialog.message = `Вы действительно хотите удалить смену?`;
      this.confirmDialog.item = item;
      this.confirmDialog.show = true;
    },

    async confirmDelete() {
      if (!this.confirmDialog.item) return;
      this.confirmDialog.loading = true;
      try {
        await api.deleteOrder(this.confirmDialog.item.id);
        await this.fetchOrders();
        this.confirmDialog.show = false;
      } catch (error) {
        console.error('Ошибка удаления:', error);
      } finally {
        this.confirmDialog.loading = false;
      }
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