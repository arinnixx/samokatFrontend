<template>
  <div class="table-wrapper">
    <div class="header-section">
      <div class="header-top">
        <div>
          <h1 class="page-title">
            {{ headerTitle || title }}
          </h1>
        </div>
        <slot name="header-actions">
          <v-btn
              v-if="showAddButton"
              class="button-add"
              @click="$emit('add')"
          >
            <template v-slot:prepend>
              <img
                  :src="'/src/components/icons/add.svg'"
                  width="24"
                  height="24"
              >
            </template>
            {{ addButtonText }}
          </v-btn>
        </slot>
      </div>

      <div class="filters-row">
        <div class="search-wrapper">
          <v-text-field
              v-model="searchModel"
              placeholder="Поиск"
              density="compact"
              hide-details
              variant="outlined"
              @update:model-value="onSearchInput"
          >
            <template v-slot:prepend-inner>
              <img
                  :src="'/src/components/icons/search.svg'"
                  width="14"
                  height="14"
              >
            </template>
          </v-text-field>
        </div>
        <div class="filter-buttons">
          <v-btn
              variant="outlined"
              class="filter-button"
              @click="$emit('filters')"
          >

            <template v-slot:prepend>
              <img
                  :src="'/src/components/icons/filter.svg'"
                  width="16"
                  height="16"
              >
            </template>
            Фильтры
          </v-btn>
        </div>
      </div>
    </div>
    <v-card class="mx-auto mb-8 wide-card" flat >
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
import {computed, ref, watch} from 'vue';

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
  },
  headerTitle: {
    type: String,
    default: ''
  },
  showAddButton: { type: Boolean, default: false },
  addButtonText: { type: String, default: 'Создать' },
  searchPlaceholder: { type: String, default: 'Поиск...' },
  searchValue: { type: String, default: '' },

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
  padding-right: 32px;
}

.header-section {
  width: 100%;
  max-width: none;
  background-color: white;
  padding: 24px 32px;
  border-radius: 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1 1 300px;
  max-width: 400px;
}

.filter-buttons {
  display: flex;
}

.filter-buttons .v-btn {
  height: 40px;

}

.filter-button{
  border-color: lightgray;
  font-weight: 600;
}


.custom-border {
  border: 1px solid #60A5FA;
}

.wide-card {
  width: 100%;
  max-width: none;
  margin: 0 32px 0 0;
}

:deep(.v-data-table__th) {
  background-color: #60A5FA;
  color: white;
}

.page-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: black;
}

.button-add {
  background-color: #3B82F6;
  color: white;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
}
.button-add:hover {
  background-color: #3B82F6 ;
}
</style>