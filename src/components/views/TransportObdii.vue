<template>
  <v-main>
    <DataTable
        title="Транспорт OBDII"
        :headers="columns"
        :items="filteredItems"
        :loading="loading"
        @update:search-value="onSearchChange"
    >
      <template v-slot:item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template v-slot:item.obdii_id="{ item }">
        {{ getObdiiUid(item.obdiiId) }}
      </template>

      <template v-slot:item.transport_id="{ item }">
        {{ getTransportCode(item.transportId) }}
      </template>
    </DataTable>
  </v-main>
</template>

<script>
import DataTable from '@/components/DataTable.vue'
import api from "@/api/api_transportObdii.js";
import apiTransport from "@/api/api_transport.js";
import apiObdii from "@/api/api_obdii.js";

export default {
  components: { DataTable },
  data() {
    return {
      transportObdiiList: [],
      transportMap: {},
      obdiiMap: {},
      loading: false,
      searchQuery: '',
      columns: [
        { key: 'created_at', title: 'Дата создания' },
        { key: 'obdii_id', title: 'OBDII' },
        { key: 'transport_id', title: 'Транспорт' }
      ]
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.transportObdiiList;

      const q = this.searchQuery.toLowerCase().trim();
      return this.transportObdiiList.filter(item => {
        const obdiiUid = this.getObdiiUid(item.obdiiId);
        const transportCode = this.getTransportCode(item.transportId);
        return (
            obdiiUid.toLowerCase().includes(q) ||
            transportCode.toLowerCase().includes(q)
        );
      });
    },
  },
  async created() {
    await this.loadData();
  },
  methods: {
    onSearchChange(val) {
      this.searchQuery = val.toLowerCase().trim();
    },
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchTransportObdii(),
          this.fetchTransport(),
          this.fetchObdii(),
        ]);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchTransportObdii() {
      try {
        const data = await api.getAllTransportObdii();
        this.transportObdiiList = data.items || (Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    },

    async fetchTransport() {
      try {
        const response = await apiTransport.getAllTransport();
        let transportArray = [];
        if (response?.items) {
          transportArray = response.items;
        } else if (Array.isArray(response)) {
          transportArray = response;
        } else {
          transportArray = [];
        }
        transportArray.forEach(transport => {
          if (transport?.id) {
            this.transportMap[transport.id] = transport.code || `Транспорт #${transport.id}`;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки транспорта:', error);
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
          if (obdii?.id) {
            this.obdiiMap[obdii.id] = obdii.uid || `OBDII #${obdii.id}`;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки OBDII:', error);
      }
    },

    getTransportCode(id) {
      if (!id) return '—';
      return this.transportMap[id] || `ID: ${id}`;
    },

    getObdiiUid(id) {
      if (!id) return '—';
      return this.obdiiMap[id] || `ID: ${id}`;
    },

    formatDate(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>