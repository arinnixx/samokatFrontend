<template>
  <v-app>
    <SidebarMenu v-if="showSidebar" />
    <v-main class="padd" >
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>

import SidebarMenu from "@/components/SidebarMenu.vue";
import {computed, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()

const showSidebar = computed(()=>route.meta.showSidebar ===true)
</script>

<style scoped>
.padd{
  padding: 0px;
}

.v-application{
  background: #fff;
}
</style>
