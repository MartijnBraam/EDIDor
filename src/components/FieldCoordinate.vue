<template>
  <div>
    <label>{{ label }}
      <input class="x" type="text" v-model="model.x" @input="update">
      <input class="y" type="text" v-model="model.y" @input="update">
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

input.x, input.y {
  position: absolute;
  left: 150px;
  width: 150px;
  background: var(--color-background-mute);
  color: var(--color-text);
  font-family: monospace;
  border: none;
  padding: 3px 12px;
}
input.y {
  left: 320px;
}
</style>

<script setup>
const props = defineProps(['name', 'label'])
const model = defineModel();

const emit = defineEmits(['change'])

function update(event) {
  emit('change', model.value);
}
</script>

