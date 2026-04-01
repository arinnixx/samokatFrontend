<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card class="custom-card">
      <v-card-title class="text-h6">
        Фильтры
      </v-card-title>
      <v-divider />

      <div v-if="showPartialSwitch" class="px-4 py-2 d-flex align-center ">
        <span class="text-body-2">Частичное совпадение</span>
        <v-switch
            v-model="partialMatch"
            hide-details
            inset
            density="compact"
            class="small-switch"
            :color="partialMatch ? 'success' : 'grey'"
        />
      </div>
      <v-divider />

      <v-card-text class="filter-content">
        <v-form>
          <v-row>
            <v-col v-for="field in fields" :key="field.key" cols="12">
              <v-text-field
                  v-if="field.type === 'text'"
                  v-model="localFilters[field.key]"
                  :label="field.label"
                  clearable
              />
              <v-select
                  v-else-if="field.type === 'select'"
                  v-model="localFilters[field.key]"
                  :items="field.items"
                  :item-title="field.itemTitle || 'title'"
                  :item-value="field.itemValue || 'value'"
                  :label="field.label"
                  clearable
              />
              <div v-else-if="field.type === 'daterange'" class="d-flex gap-2">
                <v-text-field
                    v-model="localFilters[field.startKey]"
                    :label="field.startLabel || 'С'"
                    type="date"
                    clearable
                    class="mr-2"
                />
                <v-text-field
                    v-model="localFilters[field.endKey]"
                    :label="field.endLabel || 'По'"
                    type="date"
                    clearable
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" variant="text" @click="resetFilters">
          Сбросить
        </v-btn>
        <v-btn color="primary" @click="applyFilters">
          Применить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FilterModal',
  props: {
    modelValue: Boolean,
    fields: {
      type: Array,
      default: () => []
    },
    initialFilters: {
      type: Object,
      default: () => ({})
    },
    showPartialSwitch: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'apply', 'reset'],
  data() {
    return {
      localFilters: {},
      partialMatch: false
    };
  },
  computed: {
    dialog: {
      get() { return this.modelValue; },
      set(val) { this.$emit('update:modelValue', val); }
    }
  },
  watch: {
    initialFilters: {
      immediate: true,
      handler(val) {
        this.localFilters = { ...val };
        this.partialMatch = val._partialMatch || false;
        delete this.localFilters._partialMatch;
      }
    }
  },
  methods: {
    applyFilters() {
      const filters = {};
      Object.keys(this.localFilters).forEach(key => {
        const val = this.localFilters[key];
        if (val !== null && val !== undefined && val !== '') {
          filters[key] = val;
        }
      });
      filters._partialMatch = this.partialMatch;
      this.$emit('apply', filters);
      this.dialog = false;
    },
    resetFilters() {
      this.localFilters = {};
      this.partialMatch = false;
      this.$emit('reset');
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
.custom-card {
  border-radius: 14px;
}
.gap-2 {
  gap: 8px;
}
.filter-content {
  max-height: 60vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

.small-switch {
  transform: scale(0.8);
  transform-origin: center;
}
</style>