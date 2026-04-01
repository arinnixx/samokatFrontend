<template>
  <v-main>
    <DataTable
        title="Транспорт"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
        @filters="openFilters"
        :show-filter-button="true"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.code="{ item }">
        <span class="clickable-text" @click="openModal('transport', item.id)">
          {{ item.code }}
        </span>
      </template>

      <template v-slot:item.aggregator_id="{ item }">
        {{ getAggregatorName(item.aggregator_id) }}
      </template>

      <template v-slot:item.type_id="{ item }">
        {{ getTransportTypeName(item.type_id) }}
      </template>
    </DataTable>

    <Modal
        v-model="modal.show"
        :title="modal.title"
        :item="modal.item"
        :fields="modal.fields"
    />

    <FilterModal
        v-model="filterModalVisible"
        :fields="filterFields"
        :initial-filters="currentFilters"
        @apply="applyFilters"
        @reset="resetFilters"
    />
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import api from "@/api/api_transport.js";
import apiAggregators from "@/api/api_aggregator.js";
import apiTransportTypes from "@/api/api_transportTypes.js";
import apiTransportObdii from "@/api/api_transportObdii.js";
import apiObdii from "@/api/api_obdii.js";
import FilterModal from "@/components/FilterModal.vue";

export default {
  components: {
    DataTable,
    Modal,
    FilterModal
  },
  data() {
    return {
      transportList: [],
      aggregatorsMap: {},
      transportTypeMap: {},
      obdiiMap: {},
      transportObdiiMap: {},
      loading: false,
      searchQuery: '',
      filterModalVisible: false,
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
          key: 'typeId',
          label: 'Тип транспорта',
          type: 'select',
          items: [],
          itemTitle: 'name',
          itemValue: 'id'
        }
      ],
      currentFilters: {},
      modal: {
        show: false,
        title: 'Информация о транспорте',
        item: null,
        fields: [
          { key: 'code', label: 'Номер транспортного средства' },
          { key: 'obdiiUid', label: 'Устройство' }
        ]
      },
      columns: [
        { key: 'created_at', title: 'Дата создания' },
        { key: 'code', title: 'Номер транспортного средства' },
        { key: 'type_id', title: 'Тип транспорта' },
        { key: 'aggregator_id', title: 'Агрегатор' }
      ]
    }
  },
  computed: {
    filteredItems() {
      let result = this.transportList;

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(item => {
          const aggregatorName = this.getAggregatorName(item.aggregator_id).toLowerCase();
          const typeName = this.getTransportTypeName(item.type_id).toLowerCase();
          return (
              item.code?.toLowerCase().includes(q) ||
              aggregatorName.includes(q) ||
              typeName.includes(q)
          );
        });
      }

      if (this.currentFilters.aggregatorId) {
        result = result.filter(item => item.aggregator_id === this.currentFilters.aggregatorId);
      }

      if (this.currentFilters.typeId) {
        result = result.filter(item => item.type_id === this.currentFilters.typeId);
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
          this.fetchTransport(),
          this.fetchAggregators(),
          this.fetchTransportType(),
          this.fetchObdii(),
          this.fetchTransportObdii(),
          this.fetchFilterOptions()
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTransport() {
      try {
        const data = await api.getAllTransport();
        this.transportList = data.items || (Array.isArray(data) ? data : []);
        this.transportList.forEach(t => {
          this.transportsMap = this.transportsMap || {};
          this.transportsMap[t.id] = t.code;
          this.transportsMap[`full_${t.id}`] = t;
        });
      } catch (error) {
        console.error(error);
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
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки агрегаторов:', error);
      }
    },

    async fetchTransportType() {
      try {
        const response = await apiTransportTypes.getAllTransportTypes();
        let transportTypeArray = [];
        if (response?.items) {
          transportTypeArray = response.items;
        } else if (Array.isArray(response)) {
          transportTypeArray = response;
        } else {
          transportTypeArray = [];
        }

        transportTypeArray.forEach(transportType => {
          if (transportType && transportType.id) {
            this.transportTypeMap[transportType.id] = transportType.name || `Тип транспорта #${transportType.id}`;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки типов транспорта:', error);
      }
    },

    async fetchObdii() {
      try {
        const response = await apiObdii.getAllObdii();
        let obdiiArray = [];
        if (response?.items) {
          obdiiArray = response.items;
        } else if (Array.isArray(response)) {
          obdiiArray = response;
        } else {
          obdiiArray = [];
        }
        obdiiArray.forEach(obdii => {
          if (obdii && obdii.id) {
            this.obdiiMap[obdii.id] = obdii.uid;
            this.obdiiMap[`full_${obdii.id}`] = obdii;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки OBDII:', error);
      }
    },

    async fetchTransportObdii() {
      try {
        const data = await apiTransportObdii.getAllTransportObdii();
        const connections = data.items || (Array.isArray(data) ? data : []);
        this.transportObdiiMap = {};
        connections.forEach(conn => {
          if (conn.transportId && conn.obdiiId) {
            this.transportObdiiMap[conn.transportId] = conn.obdiiId;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки связей транспорта и OBDII:', error);
      }
    },

    async fetchFilterOptions() {
      const aggData = await apiAggregators.getAllAggregators();
      const aggregators = aggData.items || aggData || [];
      const aggregatorField = this.filterFields.find(f => f.key === 'aggregatorId');
      if (aggregatorField) aggregatorField.items = aggregators;

      const typeData = await apiTransportTypes.getAllTransportTypes();
      const types = typeData.items || typeData || [];
      const typeField = this.filterFields.find(f => f.key === 'typeId');
      if (typeField) typeField.items = types;
    },

    getAggregatorName(id) {
      if (!id) return '—';
      return this.aggregatorsMap[id] || `ID: ${id}`;
    },

    getTransportTypeName(id) {
      if (!id) return '—';
      return this.transportTypeMap[id] || `ID: ${id}`;
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

    openFilters() {
      this.filterModalVisible = true;
    },
    applyFilters(filters) {
      this.currentFilters = filters;
    },
    resetFilters() {
      this.currentFilters = {};
    },

    openModal(type, id) {
      if (type === 'transport') {
        const transport = this.transportsMap?.[`full_${id}`] || { id, code: this.transportsMap?.[id] || `ID: ${id}` };
        const obdiiId = this.transportObdiiMap[id];
        const obdiiUid = obdiiId ? (this.obdiiMap[obdiiId] || `OBDII #${obdiiId}`) : '—';

        this.modal.item = {
          code: transport.code,
          obdiiUid: obdiiUid
        };
        this.modal.show = true;
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