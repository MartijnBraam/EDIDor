<template>
  <div>
    <label>{{ label }}
      <input  type="checkbox" v-model="model" @input="update" :disabled="disabled">
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
}
</style>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  name: String,
  label: String,
  disabled: {
    type: Boolean,
    default: false,
  }
});
const model = defineModel();

const emit = defineEmits(['change'])
function update(event) {
  emit('change', model.value);
}
</script>

