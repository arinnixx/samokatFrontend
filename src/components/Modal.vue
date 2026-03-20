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
                    v-if="!field.type || field.type === 'text' || field.type === 'password'"
                    v-model="formData[field.key]"
                    :label="field.label"
                    :required="field.required"
                    :readonly="mode === 'edit' && field.readonly"
                    :type="showPassword[field.key] ? 'text' : 'password'"
                    variant="outlined"
                    density="comfortable"
                >
                  <template v-slot:append-inner v-if="field.type === 'password'">
                    <button @click="togglePassword(field.key)" class="custom-eye-button" type="button">
                      <img
                          v-if="showPassword[field.key]"
                          src="/src/components/icons/eye-close.svg"
                          width="25"
                          height="25"
                          alt="close eye"
                      >
                      <img
                          v-else
                          src="/src/components/icons/eye-open.svg"
                          width="25"
                          height="25"
                          alt="open eye"
                      >
                    </button>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-alert
                v-if="formError"
                type="error"
                variant="tonal"
                class="mt-2"
                dense
                :icon="false"
            >
              {{ formError }}
            </v-alert>
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
    cancelButtonText: { type: String, default: 'Отмена' },
    passwordMismatchMessage: { type: String, default: 'Пароли не совпадают' },
    passwordMinLength: { type: Number, default: 6 }
  },
  emits: ['update:modelValue', 'created'],
  data() {
    return {
      loading: false,
      formData: {},
      showPassword: {},
      formError: ''
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
    },
    formData: {
      handler() {
        this.formError = '';
      },
      deep: true
    }
  },
  methods: {
    initFormData(fields) {
      const data = {};
      const show = {};
      fields.forEach(field => {
        data[field.key] = '';
        if (field.type === 'password') {
          show[field.key] = false;
        }
      });
      this.formData = data;
      this.showPassword = show;
      this.formError = '';
    },
    getFieldValue(item, field) {
      if (!item) return '';
      if (field.getValue) return field.getValue(item);
      if (field.key.includes('.')) {
        return field.key.split('.').reduce((obj, key) => obj?.[key], item) || '';
      }
      return item[field.key] || '';
    },
    togglePassword(key) {
      this.showPassword[key] = !this.showPassword[key];
    },
    close() {
      this.$emit('update:modelValue', false);
      if (this.mode === 'create') this.initFormData(this.fields);
    },
    async save() {
      if (this.mode !== 'create' && this.mode !== 'edit') return;

      this.formError = '';

      const missing = this.fields
          .filter(f => f.required && !this.formData[f.key])
          .map(f => f.label);
      if (missing.length) {
        this.formError = 'Заполните все поля';
        return;
      }

      for (const field of this.fields) {
        if (field.type === 'password' && this.formData[field.key]?.length < this.passwordMinLength) {
          this.formError = `${field.label} должен содержать минимум ${this.passwordMinLength} символов`;
          return;
        }
      }


      const confirmFields = this.fields.filter(f => f.confirm);
      for (const field of confirmFields) {
        const value = this.formData[field.key];
        const confirmKey = field.confirm;
        const confirmValue = this.formData[confirmKey];
        if (value !== confirmValue) {
          this.formError = this.passwordMismatchMessage;
          return;
        }
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
        this.formError = 'Ошибка при сохранении';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-content {
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

.custom-eye-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

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