<template>
  <v-dialog v-model="dialog" max-width="700" content-class="history-dialog">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">История изменений: {{ entityTitle }}</span>
      </v-card-title>

      <v-card-text class="px-2 py-0 history-content">
        <v-data-table
            :headers="headers"
            :items="historyItems"
            :loading="loading"
            items-per-page="10"
            class="elevation-1"
            dense
            items-per-page-text="Записей на странице:"
            page-text="{0}-{1} из {2}"
        >
          <template #item.data="{ item }">
            <pre class="history-pre">{{ formatData(item.data) }}</pre>
          </template>
          <template #item.changedAt="{ item }">
            {{ formatDate(item.changedAt) }}
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    modelValue: Boolean,
    entityId: [Number, String],        // идентификатор сущности (курьера или заказа)
    entityTitle: String,               // отображаемое название (например, "Иванов Иван" или "Заказ #123")
    fetchHistory: Function,             // асинхронная функция, принимающая entityId и возвращающая данные истории
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      historyItems: [],
      headers: [
        { key: 'action', title: 'Действие' },
        { key: 'data', title: 'Данные до изменения' },
        { key: 'changedAt', title: 'Дата изменения' },
      ]
    };
  },
  computed: {
    dialog: {
      get() { return this.modelValue; },
      set(val) { this.$emit('update:modelValue', val); }
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.entityId && this.fetchHistory) {
        this.fetchHistoryData();
      }
    }
  },
  methods: {
    async fetchHistoryData() {
      this.loading = true;
      try {
        const data = await this.fetchHistory(this.entityId);
        this.historyItems = data.items || data || [];
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      } finally {
        this.loading = false;
      }
    },
    formatData(data) {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return '—';
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    close() {
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
.history-pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.history-dialog) {
  max-width: 1000px;
  width: 800px;
}

.history-content {
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: thin;
}

:deep(.v-data-table th:nth-child(1)) { width: 10%; }
:deep(.v-data-table th:nth-child(2)) { width: 80%; }
:deep(.v-data-table th:nth-child(3)) { width: 10%; }
</style>