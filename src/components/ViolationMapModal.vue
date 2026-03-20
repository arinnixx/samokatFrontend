<template>
  <v-dialog v-model="dialog" max-width="800" content-class="map-modal">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Местоположение нарушения</span>
        <v-btn icon @click="close">
            <img
                :src="'/src/components/icons/close.svg'"
                width="40"
                height="40"
            >
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <div ref="mapContainer" class="map-container"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'ViolationMapModal',
  props: {
    modelValue: Boolean,
    coordinates: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dialog = ref(props.modelValue);
    const mapContainer = ref(null);
    let map = null;
    let marker = null;

    const initMap = () => {
      if (!window.ymaps || !mapContainer.value) return;
      window.ymaps.ready(() => {
        const coords = props.coordinates?.coordinates;
        if (!coords || !Array.isArray(coords) || coords.length !== 2) return;
        const [lng, lat] = coords;
        map = new window.ymaps.Map(mapContainer.value, {
          center: [lat, lng],
          zoom: 14,
          controls: ['zoomControl', 'fullscreenControl']
        });
        marker = new window.ymaps.Placemark([lat, lng], {}, {
          preset: 'islands#redDotIcon'
        });
        map.geoObjects.add(marker);
      });
    };

    const destroyMap = () => {
      if (map) {
        map.destroy();
        map = null;
        marker = null;
      }
    };

    const close = () => {
      emit('update:modelValue', false);
      dialog.value = false;
    };

    watch(() => props.modelValue, (val) => {
      dialog.value = val;
      if (val) {
        setTimeout(() => {
          initMap();
        }, 100);
      } else {
        destroyMap();
      }
    });

    onUnmounted(() => {
      destroyMap();
    });

    return { dialog, mapContainer, close };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
}
:deep(.map-modal) {
  border-radius: 8px;
  overflow: hidden;
}
</style>