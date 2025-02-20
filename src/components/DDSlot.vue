<template>
  <div v-if="model === undefined">
    Empty descriptor
    <a @click="addDescriptor('serial')">Add Serial</a>
    <a @click="addDescriptor('name')">Product Name</a>
    <a @click="addDescriptor('data')">ASCII Data</a>
    <a @click="addDescriptor('rangelimits')">Range limits</a>
    <a @click="addDescriptor('dtd')">DTD</a>
  </div>

  <div v-if="model !== undefined && model.type === 'serial'" class="panel">
    <header>Display Product Serial Number
      <button @click="deleteDescriptor">X</button>
    </header>
    <FieldString label="Serial" v-model="model.serial" max="13" @change="change"/>
  </div>
  <div v-if="model !== undefined && model.type === 'name'" class="panel">
    <header>Display Product Name
      <button @click="deleteDescriptor">X</button>
    </header>
    <FieldString label="Name" v-model="model.name" max="13" @change="change"/>
  </div>
  <div v-if="model !== undefined && model.type === 'data'" class="panel">
    <header>Alphanumeric Data String (ASCII)
      <button @click="deleteDescriptor">X</button>
    </header>
    <FieldString label="Data" v-model="model.data" max="13" @change="change"/>
  </div>

  <div v-if="model !== undefined && model.type === 'rangelimits'" class="panel">
    <header>Display Range Limits
      <button @click="deleteDescriptor">X</button>
    </header>
    <FieldInt label="Min. vertical rate" v-model="model.min_v_rate" @change="change"/>
    <FieldInt label="Max. vertical rate" v-model="model.max_v_rate" @change="change"/>
    <hr/>
    <FieldInt label="Min. horiz. rate" v-model="model.min_h_rate" @change="change"/>
    <FieldInt label="Max. horiz. rate" v-model="model.max_h_rate" @change="change"/>
    <hr/>
    <FieldInt label="Max. Pixel Clock" v-model="model.max_pixelclock" @change="change"/>

  </div>

  <div v-if="model !== undefined && model.type === 'dtd'" class="panel">
    <header>Detailed Timing Descriptor
      <button @click="deleteDescriptor">X</button>
    </header>
    Horizontal
    <FieldInt label="Adressable pixels" v-model="model.h_addr_pixels" @change="change"/>
    <FieldInt label="Blanking pixels" v-model="model.h_blanking" @change="change"/>
    <FieldInt label="Front porch" v-model="model.h_front_porch" @change="change"/>
    <FieldInt label="Sync width" v-model="model.h_sync" @change="change"/>
    <FieldInt label="Border" v-model="model.h_border" @change="change"/>
    <FieldInt label="Physical width [mm]" v-model="model.width" @change="change"/>
    <hr/>
    Vertical
    <FieldInt label="Adressable pixels" v-model="model.v_addr_pixels" @change="change"/>
    <FieldInt label="Blanking pixels" v-model="model.v_blanking" @change="change"/>
    <FieldInt label="Front porch" v-model="model.v_front_porch" @change="change"/>
    <FieldInt label="Sync width" v-model="model.v_sync" @change="change"/>
    <FieldInt label="Border" v-model="model.v_border" @change="change"/>
    <FieldInt label="Physical Height [mm]" v-model="model.height" @change="change"/>
  </div>

</template>

<style scoped>

div.panel {
  background: var(--color-background-soft);
  padding: 10px;
  margin-right: -6px;
}

div.panel > header {
  background: var(--color-background-mute);
  margin-left: -10px;
  margin-top: -10px;
  margin-right: -10px;
  padding: 3px 10px;
  margin-bottom: 10px;
}

div.panel > header > button {
  background: var(--color-danger);
  font-weight: bold;
  border-radius: 5px;
  border: none;
  color: var(--color-text);
  padding: 2px 7px;
  float: right;
}

label {
  display: block;
}

input, select {
  position: absolute;
  left: 150px;
  width: 100px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-family: monospace;
  border: none;
  padding: 3px 12px;
}

select.aspect {
  left: 260px;
}

input.rate {
  left: 370px;
}

span#val {
  position: absolute;
  left: 500px;
}

hr {
  height: 1px;
  background: var(--color-background-mute);
  font-size: 0;
  border: 0;
  margin: 5px 0;
}
</style>

<script setup>
import FieldInt from "@/components/FieldInt.vue";
import FieldString from "@/components/FieldString.vue";
import {DDAlphanumericData, DDProductName, DDRangeLimits, DDSerialNumber, DTD} from "@/edid";

const props = defineProps(['label'])
const model = defineModel();

const emit = defineEmits(['change'])

function change(event) {
  emit('change', event);
}

function deleteDescriptor(event) {
  model.value = undefined;
  emit('change', event);
}

function addDescriptor(dt) {
  switch (dt) {
    case 'serial':
      model.value = new DDSerialNumber();
      break;
    case 'name':
      model.value = new DDProductName();
      break;
    case 'data':
      model.value = new DDAlphanumericData();
      break;
    case 'rangelimits':
      model.value = new DDRangeLimits();
      break;
    case 'dtd':
      model.value = new DTD();
      break;

  }
}
</script>

