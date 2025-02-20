<template>
  <div>
    <label>{{ label }}
      <select v-model="model">
        <slot/>
      </select>
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
select {
  position:absolute;
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

const props = defineProps(['name', 'label', 'model'])
const model = defineModel();

const emit = defineEmits(['change'])

</script>

