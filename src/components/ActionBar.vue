<template>
  <nav>
    <h1>EDIDor</h1>
    <ul>
      <li>
        <button>Load from clipboard</button>
      </li>
      <li>
        <button>Load from file</button>
      </li>
      <li>
        <button @click="loadExample">Load example</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const emit = defineEmits(['action'])

function loadExample() {
  emit('action', 'load-example');
}
</script>

<style scoped>
nav {
  background: var(--color-background-soft);
}

h1 {
  color: var(--color-brand);
  font-weight: bold;
  padding: 6px 20px;
  display: inline-block;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: inline-block;
}

li {
  display: inline;
  padding: 0;
  margin: 0;
}

button {
  border: none;
  margin: 0;
  padding: 12px 10px;
  width: auto;
  overflow: visible;
  cursor: pointer;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: normal;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  -webkit-appearance: none;
}

button::-moz-focus-inner {
  border: 0;
  padding: 0;
}

button:hover {
  color: var(--color-brand);
}
</style>
