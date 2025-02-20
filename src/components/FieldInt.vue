<template>
  <div>
    <label>{{ label }}
      <input type="number" :value="displayValue" @input="update">
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

const props = defineProps(['name', 'label', 'model'])
const model = defineModel({type: Number});

const emit = defineEmits(['change'])
function update(event) {
  model.value = parseInt(event.target.value, 10);
  emit('change', model.value);
}

const displayValue = computed(() => model.value?.toString(10).toUpperCase());
</script>

