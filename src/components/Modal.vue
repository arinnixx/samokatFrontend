<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ title }}</span>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row v-if="item">
          <v-col cols="12" md="6" v-for="field in fields" :key="field.key">
            <v-text-field
                :model-value="getFieldValue(item, field)"
                :label="field.label"
                readonly
                variant="outlined"
                density="comfortable"
            ></v-text-field>
          </v-col>
        </v-row>
        <div v-else class="text-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">Загрузка...</p>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="$emit('update:modelValue', false)">
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Информация'
    },
    item: {
      type: Object,
      default: null
    },
    fields: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue'],
  methods: {
    getFieldValue(item, field) {
      if (!item) return '';

      if (field.getValue) {
        return field.getValue(item);
      }

      if (field.key.includes('.')) {
        return field.key.split('.').reduce((obj, key) => obj?.[key], item) || '';
      }

      return item[field.key] || '';
    }
  }
}
</script>