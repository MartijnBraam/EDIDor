<template>
  <div id="editor">
    <div id="left">
      <EDIDBase :model="edidBlockBase" @change="change"/>
    </div>
    <div id="right">
      <SummaryView v-model="edidBlockBase" :canary="canary"/>
      <div class="sbs">
        <HexView :data="EDID" title="Hex view (original)"/>
        <HexView :data="exported" title="Hex view (edited)"/>
      </div>
    </div>
  </div>
</template>
<style scoped>
#editor {
  display: flex;
  width: 100%;
}

#left, #right {
  flex: 1;
  overflow: scroll;
}

.sbs {
  display: flex;
}

.sbs > section {
  flex: 1;
}
</style>

<script setup lang="ts">
import EDIDBase from "@/components/EDIDBase.vue";
import HexView from "@/components/HexView.vue";
import {computed, ref, watch} from "vue";
import {EDIDBaseBlock} from "@/edid";
import SummaryView from "@/components/SummaryView.vue";

let edidBlockBase = ref(new EDIDBaseBlock());
let exported = ref([] as number[]);
let canary = ref(0);

const props = defineProps<{
  EDID: number[]
}>();

let EDID = computed(function () {
  return props.EDID.slice();
});

watch(EDID, (newEDID) => {
  console.log("NEW EDID", newEDID);

  let block = new EDIDBaseBlock();
  block.fromBytes(newEDID);
  edidBlockBase.value = block;

  exported.value = block.toBytes();
});

function change(event) {
  canary.value++;
  exported.value = edidBlockBase.value.toBytes();
}
</script>