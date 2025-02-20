<template>
  <section class="editor">
    <header>{{ title }}
      <button @click="download">Download</button>
    </header>
    <div class="hexeditor">
      <div class="row" v-for="row in hexdump">
      <span v-for="group in row">
        <span v-for="b in group"><span :title="b.desc">{{ b.val }}</span></span>
      </span>
      </div>
    </div>
    <div v-if="hexdump.length === 0">No data loaded</div>
  </section>

</template>

<style scoped>
button {
  background: var(--color-brand);
  border: none;
  float: right;
  border-radius: 5px;
  color: black;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 4px;
}

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

let hexdump = ref([] as Groups[]);
const props = defineProps<{
  data: number[],
  title: string,
}>();

let proxy = computed(() => props.data.slice());
let edidParser = new EDIDBaseBlock();

type Byte = { val: string, desc: string }
type Group = Byte[];
type Groups = Group[];
type Row = Groups[];

watch(proxy, (bytes) => {
  let rows: Groups[] = [];
  let groups: Group[] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    let group: Group = [];
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

function download() {
  const nums = new Uint8Array(props.data.slice());
  const blob = new Blob([nums.buffer], {type: "application/octet-stream"});
  const url = URL.createObjectURL(blob);
  const el = document.createElement('A');
  el.setAttribute("href", url);
  el.setAttribute('download', "edid.bin");
  el.style.display = 'none';
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}
</script>