<template>
  <v-dialog
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ title }}</span>
      </v-card-title>

      <v-card-text class="pa-4 modal-content">
        <template v-if="mode === 'view'">
          <v-row v-if="item">
            <v-col
                v-for="field in fields"
                :key="field.key"
                cols="12"
            >
            <v-text-field
                :model-value="getFieldValue(item, field)"
                :label="field.label"
                readonly
                variant="outlined"
                density="comfortable"
            />
            </v-col>
          </v-row>
          <div v-else class="text-center pa-4">
            <v-progress-circular indeterminate color="primary" />
            <p class="mt-2">Загрузка...</p>
          </div>
        </template>

        <template v-else>
          <v-form ref="formRef" @submit.prevent="save">
            <v-row>
              <v-col
                  v-for="field in fields"
                  :key="field.key"
                  cols="12"
              >
              <v-text-field
                  v-if="!field.type || field.type === 'text'"
                  v-model="formData[field.key]"
                  :label="field.label"
                  :required="field.required"
                  :readonly="mode === 'edit' && field.readonly"
                  variant="outlined"
                  density="comfortable"
              />


              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer />
        <template v-if="mode === 'view'">
          <v-btn color="primary" variant="text" @click="close">
            Закрыть
          </v-btn>
        </template>
        <template v-else>
          <v-btn color="secondary" variant="text" @click="close">
            {{ cancelButtonText }}
          </v-btn>
          <v-btn color="primary" @click="save" :loading="loading">
            {{ submitButtonText }}
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    modelValue: { type: Boolean, required: true },
    mode: { type: String, default: 'view', validator: v => ['view', 'create', 'edit'].includes(v) },
    title: { type: String, default: 'Информация' },
    item: { type: Object, default: null },
    fields: { type: Array, required: true },
    apiMethod: { type: Function, default: null },
    submitButtonText: { type: String, default: 'Сохранить' },
    cancelButtonText: { type: String, default: 'Отмена' }
  },
  emits: ['update:modelValue', 'created'],
  data() {
    return {
      loading: false,
      formData: {}
    };
  },
  watch: {
    fields: {
      handler(newFields) {
        this.initFormData(newFields);
      },
      immediate: true,
      deep: true
    },
    item: {
      handler(newItem) {
        if (this.mode === 'edit' && newItem) {
          this.formData = { ...newItem };
        }
      },
      immediate: true
    }
  },
  methods: {
    initFormData(fields) {
      const data = {};
      fields.forEach(field => {
        data[field.key] = '';
      });
      this.formData = data;
    },
    getFieldValue(item, field) {
      if (!item) return '';
      if (field.getValue) return field.getValue(item);
      if (field.key.includes('.')) {
        return field.key.split('.').reduce((obj, key) => obj?.[key], item) || '';
      }
      return item[field.key] || '';
    },
    close() {
      this.$emit('update:modelValue', false);
      if (this.mode === 'create') this.initFormData(this.fields);
    },
    async save() {
      if (this.mode !== 'create' && this.mode !== 'edit') return;

      const missing = this.fields
          .filter(f => f.required && !this.formData[f.key])
          .map(f => f.label);
      if (missing.length) {
        alert(`Заполните поля: ${missing.join(', ')}`);
        return;
      }

      this.loading = true;
      try {
        if (this.apiMethod) {
          const result = await this.apiMethod(this.formData);
          this.$emit('created', result);
          this.close();
        } else {
          console.error('apiMethod не передан');
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-content {
  max-height: 70vh;        /* ограничиваем высоту */
  overflow-y: auto;        /* включаем вертикальный скролл */
  scrollbar-width: thin;   /* для Firefox */
}

/* стилизация скроллбара для WebKit (Chrome, Safari) */
.modal-content::-webkit-scrollbar {
  width: 6px;
}
.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.modal-content::-webkit-scrollbar-thumb {
  background: #0562AA;
  border-radius: 3px;
}
.modal-content::-webkit-scrollbar-thumb:hover {
  background: #034578;
}
</style>