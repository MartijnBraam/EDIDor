<template>
  <div>
    <label>{{ label }}
      <input type="text" :value="displayValue" @input="update">
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
  position: absolute;
  left: 150px;
  width: 250px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-family: monospace;
  border: none;
  padding: 3px 12px;
}
</style>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps(['name', 'label', 'model'])
const model = defineModel();

const emit = defineEmits(['change'])

function update(event) {
  model.value = parseInt(event.target.value, 16);
  emit('change', model.value);
}

const displayValue = computed(() => model.value?.toString(16).toUpperCase());
</script>

