<template>
  <section class="editor">
    <header>Summary</header>
    <div id="monitor">
      <div id="panel">
        <div id="name">{{ name }}</div>
        <div id="diagonal">{{ diagonal }}</div>
        <div id="size">{{ resolution }}</div>
      </div>
    </div>
    <table>
      <tbody>
      <tr>
        <th>Manufacturer</th>
        <td>{{ manufacturer }}</td>
      </tr>
      <tr>
        <th>Product</th>
        <td>{{ product_name }}</td>
      </tr>
      <tr>
        <th>Production date</th>
        <td>{{ date }}</td>
      </tr>
      <tr>
        <th>Serial</th>
        <td>{{ serial }}</td>
      </tr>
      <tr>
        <th>Native resolution</th>
        <td>{{ resolution }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
#monitor {
  background: #111;
  height: 130px;
  width: v-bind(disp_width);
  border-radius: 2px;
  padding: 5px;
  margin: 0 auto 15px;
  box-shadow: 0 16px 32px -24px var(--color-brand);
}

#panel {
  background: linear-gradient(135deg, var(--color-background-mute) 0%, var(--color-background) 100%);
  width: 100%;
  height: 100%;
  color: var(--color-text);
  text-align: center;
  display: flex;
  flex-direction: column;
}

#diagonal, #name, #size {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#diagonal {
  font-size: 1.6em;
  font-weight: bold;
  color: var(--color-brand);
}

table {
  width: 100%;
}

th {
  text-align: right;
}

td {
  text-align: left;
}

th, td {
  padding: 1px 15px;
  width: 50%;
}
</style>

<script setup lang="ts">
import {computed, defineModel, reactive, ref, watch} from "vue";
import type {DD} from "@/edid";
import {DDProductName, DDSerialNumber, DTD, EDIDBaseBlock} from "@/edid";

const props = defineProps(['canary']);
const model = defineModel();

const date = ref("-");
const name = ref("-");
const serial = ref("");
const size = ref("");
const diagonal = ref("");
const disp_width = ref("173px");

const manufacturer = ref("");
const product_name = ref("");
const resolution = ref("");

function getDDBlock(data, name): DD | undefined {
  if (data.descriptor_1?.type === name) {
    return data.descriptor_1;
  } else if (data.descriptor_2?.type === name) {
    return data.descriptor_2;
  } else if (data.descriptor_3?.type === name) {
    return data.descriptor_3;
  } else if (data.descriptor_4?.type === name) {
    return data.descriptor_4;
  }
}

function getName(data) {
  let dd = getDDBlock(data, "name");
  if (dd !== undefined) {
    dd = dd as DDProductName;
    name.value = dd.name;
    product_name.value = dd.name;
  } else {
    name.value = data.vendor_name;
    product_name.value = `0x${data.product_id}`;
  }
  manufacturer.value = data.vendor_name;
}

function getSerial(data: EDIDBaseBlock) {
  let dd = getDDBlock(data, "serial");
  if (dd !== undefined) {
    dd = dd as DDSerialNumber;
    serial.value = `${dd.serial}`;
  } else {
    serial.value = `${data.serial}`;
  }
}

function getSize(data: EDIDBaseBlock) {
  let dd = getDDBlock(data, "dtd");
  let width = 0;
  let height = 0;
  if (dd !== undefined) {
    dd = dd as DTD;
    width = dd.width;
    height = dd.height;
  } else {
    // Block 0 defines the size in CM
    width = data.hsize * 10;
    height = data.vsize * 10;
  }
  const d = Math.sqrt((width * width) + (height * height));
  size.value = `${width / 10} x ${height / 10} cm`;
  diagonal.value = `${(d / 25.4).toPrecision(3)}"`;
  const aspect = width / height;
  disp_width.value = `${130 * aspect}px`;
}

function getResolution(data: EDIDBaseBlock) {
  let dd = getDDBlock(data, "dtd");
  let hres = 0;
  let vres = 0;
  if (dd !== undefined) {
    dd = dd as DTD;
    hres = dd.h_addr_pixels;
    vres = dd.v_addr_pixels;
  }
  resolution.value = `${hres}x${vres}`;
}

function rebuild() {
  const data: EDIDBaseBlock = model.value as EDIDBaseBlock;
  date.value = `${data.year}-${data.week.toString(10).padStart(2, '0')}`;
  getName(data as EDIDBaseBlock);
  getSerial(data as EDIDBaseBlock);
  getSize(data as EDIDBaseBlock);
  getResolution(data as EDIDBaseBlock);

}

watch(model, function (data) {
  rebuild();
});

watch(() => props.canary, function (event) {
  rebuild();
});

</script>