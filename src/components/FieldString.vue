<template>
  <div>
    <label>{{ label }}
      <input type="text" v-model="model" @input="update" :max="max">
    </label>
  </div>
</template>

<style scoped>
div {
  position: relative;
  padding: 3px;
}
label {
  display: block;
}
input {
  position:absolute;
  left: 150px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-family: monospace;
  border: none;
  padding: 3px 12px;
  width: 250px;
}
</style>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps(['label', 'max'])
const model = defineModel();

const emit = defineEmits(['change'])
function update(event) {
  emit('change', model.value);
}

</script>

