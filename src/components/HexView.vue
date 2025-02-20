<template>
  <section class="editor">
    <header>HEX View</header>
    <div class="hexeditor">
      <div class="row" v-for="row in hexdump">
      <span v-for="group in row">
        <span v-for="b in group"><span :title="b.desc">{{ b.val }}</span></span>
      </span>
      </div>
    </div>
  </section>

</template>

<style scoped>
div > span {
  margin-right: 10px;
}

div > span > span {
  font-family: monospace;
  margin-right: 5px;
}
</style>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {EDIDBaseBlock} from "@/edid";

let hexdump = ref([]);
const props = defineProps<{
  data: number[]
}>();

let proxy = computed(() => props.data.slice());
let edidParser = new EDIDBaseBlock();

watch(proxy, (bytes) => {
  let rows = [];
  let groups = [];
  for (let i = 0; i < bytes.length; i += 4) {
    let group = [];
    for (let j = i; j < Math.min(i + 4, bytes.length); j++) {
      let hex = bytes[j].toString(16).padStart(2, '0');
      let desc = edidParser.parser.describeIndex(j);
      let label = `${j}`;
      if (desc !== undefined) {
        label = `${j}: ${desc?.var}[${j - desc.pos}]`;
      }
      group.push({val: hex, desc: label});
    }
    groups.push(group);
    if (groups.length == 2) {
      rows.push(groups);
      groups = [];
    }
  }
  if (groups.length > 0) {
    rows.push(groups);
  }
  hexdump.value = rows;
});
</script>