<template>
  <v-dialog v-model="dialog" max-width="800" content-class="map-modal">
    <v-card class="custom-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Местоположение нарушения</span>
        <v-btn icon @click="close">
          <img src="/src/components/icons/close.svg" width="40" height="40">
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <div ref="mapContainer" class="map-container"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, onUnmounted, watch } from 'vue';

export default {
  name: 'ViolationMapModal',
  props: {
    modelValue: Boolean,
    coordinates: {
      type: Object,
      default: null
    },
    violation: {
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

    const getAddress = async (coords) => {
      if (!window.ymaps) return null;
      try {
        const geocoder = window.ymaps.geocode(coords, { kind: 'house' });
        const res = await geocoder;
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          return firstGeoObject.getAddressLine();
        }
        return null;
      } catch (error) {
        console.error('Ошибка геокодирования:', error);
        return null;
      }
    };

    const initMap = async () => {
      if (!window.ymaps || !mapContainer.value) return;
      await new Promise(resolve => window.ymaps.ready(resolve));

      const coordsArr = props.coordinates?.coordinates;
      if (!coordsArr || !Array.isArray(coordsArr) || coordsArr.length !== 2) return;
      const [lng, lat] = coordsArr;
      const center = [lat, lng];

      if (map) map.destroy();

      map = new window.ymaps.Map(mapContainer.value, {
        center: center,
        zoom: 15,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Получаем данные нарушения из пропса
      const typeName = props.violation?.typeName || '—';
      const description = props.violation?.description || '—';

      // Начальное содержимое балуна (без адреса)
      const balloonContent = `
        <div style="max-width: 300px;">
          <b>Тип нарушения:</b> ${typeName}<br>
          <b>Описание:</b> ${description}
        </div>
      `;

      marker = new window.ymaps.Placemark(center, {
        balloonContent: balloonContent,
        balloonContentHeader: 'Нарушение',
      }, {
        preset: 'islands#redDotIcon',
        openBalloonOnClick: true,
      });

      map.geoObjects.add(marker);
      marker.balloon.open(); // Открываем балун сразу

      // Пытаемся получить адрес и обновить балун
      const address = await getAddress(center);
      if (address) {
        marker.properties.set('balloonContent', `
          <div style="max-width: 300px;">
            <b>Адрес:</b> ${address}<br>
            <b>Тип нарушения:</b> ${typeName}<br>
            <b>Описание:</b> ${description}
          </div>
        `);
      }
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
      if (val && props.coordinates?.coordinates) {
        // Даём DOM обновиться и инициализируем карту
        setTimeout(() => initMap(), 100);
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
.custom-card {
  border-radius: 14px;
}
</style>