<template>
  <div>
    <label v-if="model">{{ label }}
      <input class="hpixels" type="number" v-model="model.hpixels" @input="update" min="256" max="2288">
      <select class="aspect" v-model="model.ratio" @input="update">
        <option value="1.6">16:10</option>
        <option :value="4/3">4:3</option>
        <option value="1.25">5:4</option>
        <option :value="16/9">16:9</option>
      </select>
      <input class="rate" type="number" v-model="model.rate" @input="update" min="60" max="123">
      <span id="val">{{model}}</span>
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
</style>

<script setup lang="ts">
const props = defineProps(['label'])
const model = defineModel();

const emit = defineEmits(['change'])

function update(event) {
  emit('change', model.value);
}
</script>

