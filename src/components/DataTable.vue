<template>
  <div class="table-wrapper">
    <h2 class="text-center">{{ title }}</h2>
    <v-card class="mx-auto mb-8 wide-card" flat rounded="lg">
      <v-data-table
          :headers="headers"
          :items="normalizedItems"
          :items-per-page="itemsPerPage"
          :loading="loading"
          class="custom-border"
          items-per-page-text="Записей на странице:"
          page-text="{0}-{1} из {2}"
      >

        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-4">
            <p>Нет данных для отображения</p>
          </div>
        </template>

        <template v-slot:loading>
          <div class="text-center pa-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-2">Загрузка...</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  headers: {
    type: Array,
    required: true
  },
  items: {
    type: [Array, Object],
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const normalizedItems = computed(() => {
  if (!props.items) return [];

  if (Array.isArray(props.items)) {
    return props.items;
  }

  if (props.items && props.items.items && Array.isArray(props.items.items)) {
    return props.items.items;
  }

  if (props.items && props.items.data && Array.isArray(props.items.data)) {
    return props.items.data;
  }

  console.warn('Не удалось нормализовать items:', props.items);
  return [];
});
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
}

.custom-border {
  border: 1px solid #0562AA;
}

h2 {
  text-align: center;
  color: #094067;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  width: 100%;
}

.wide-card {
  width: 95%;
  max-width: 1600px;
}

:deep(.v-data-table__th) {
  background-color: #0562AA;
  color: white;
}




</style>