<template>
  <section class="editor">
    <header>EDID block 0</header>
    <FieldHex name="vendor_id" label="Manufacturer" v-model="model.vendor_id" @change="change"/>
    <FieldHex name="product_id" label="Product" v-model="model.product_id" @change="change"/>
    <FieldHex name="serial" label="Serial" v-model="model.serial" @change="change"/>
    <hr/>
    <FieldInt name="serial" label="Week" v-model="model.week" @change="change"/>
    <FieldInt name="year" label="Year" v-model="model.year" @change="change"/>
    <hr/>
    <FieldInt name="maj" label="EDID version major" v-model="model.maj" @change="change"/>
    <FieldInt name="min" label="EDID version minor" v-model="model.min" @change="change"/>
    <hr/>
    <FieldInt name="hsize" label="Width [cm]" v-model="model.hsize" @change="change"/>
    <FieldInt name="vsize" label="Height [cm]" v-model="model.vsize" @change="change"/>
    <hr/>
    <div class="help">Chromasity coordinates for the stock colors of the display</div>
    <FieldCoordinate name="red" label="Red" v-model="model.chromasity.red" @change="change"/>
    <FieldCoordinate name="green" label="Green" v-model="model.chromasity.green" @change="change"/>
    <FieldCoordinate name="blue" label="Blue" v-model="model.chromasity.blue" @change="change"/>
    <FieldCoordinate name="white" label="White" v-model="model.chromasity.white" @change="change"/>

    <hr/>
    <FieldSelect name="digital" label="Digital input" v-model="model.video_interface">
      <option value="analog">Analog</option>
      <option value="digital">Digital</option>
    </FieldSelect>

    <div v-show="model.video_interface === 'analog'" class="inset">
      ANALOG
    </div>
    <div v-show="model.video_interface === 'digital'" class="inset">
      <FieldSelect name="digital_interface" label="Interface" v-model="model.digital_interface">
        <option value="undefined">Undefined</option>
        <option value="DVI">DVI</option>
        <option value="HDMI-a">HDMI-a</option>
        <option value="HDMI-b">HDMI-b</option>
        <option value="MDDI">MDDI</option>
        <option value="DisplayPort">DisplayPort</option>
      </FieldSelect>
      <FieldSelect name="color_bit_depth" label="Color bit depth" v-model="model.color_bit_depth">
        <option value="0">0</option>
        <option value="6">6 Bit</option>
        <option value="8">8 Bit</option>
        <option value="10">10 Bit</option>
        <option value="12">12 Bit</option>
        <option value="14">14 Bit</option>
        <option value="16">16 Bit</option>
      </FieldSelect>
      <FieldCheck name="a" label="Support RGB 4:4:4" v-model="model.color_encoding_rgb444" disabled/>
      <FieldCheck name="a" label="Support YCrCb 4:4:4" v-model="model.color_encoding_ycrcb444"/>
      <FieldCheck name="a" label="Support YCrCb 4:2:2" v-model="model.color_encoding_ycrcb422"/>
    </div>
    <hr/>
    Established Timings
    <div class="timings">
      <label v-for="timing in timings"><input type="checkbox" :value="timing" v-model="model.timings" @input="change">
        {{ timing }}</label>
    </div>
    <hr/>
    Standard Timings
    <FieldTiming label="1" v-model="model.standard_timings[0]" @change="change"/>
    <FieldTiming label="2" v-model="model.standard_timings[1]" @change="change"/>
    <FieldTiming label="3" v-model="model.standard_timings[2]" @change="change"/>
    <FieldTiming label="4" v-model="model.standard_timings[3]" @change="change"/>
    <FieldTiming label="5" v-model="model.standard_timings[4]" @change="change"/>
    <FieldTiming label="6" v-model="model.standard_timings[5]" @change="change"/>
    <FieldTiming label="7" v-model="model.standard_timings[6]" @change="change"/>
    <FieldTiming label="8" v-model="model.standard_timings[7]" @change="change"/>
    <hr/>
    Descriptor 1
    <div class="ddslot">
      <DDSlot v-model="model.descriptor_1" @change="change"/>
    </div>
    <hr/>
    Descriptor 2
    <div class="ddslot">
      <DDSlot v-model="model.descriptor_2" @change="change"/>
    </div>
    <hr/>
    Descriptor 3
    <div class="ddslot">
      <DDSlot v-model="model.descriptor_3" @change="change"/>
    </div>
    <hr/>
    Descriptor 4
    <div class="ddslot">
      <DDSlot v-model="model.descriptor_4" @change="change"/>
    </div>

  </section>
</template>
<style scoped>
hr {
  height: 1px;
  background: var(--color-background-mute);
  font-size: 0;
  border: 0;
  margin: 5px 0;
}

div.ddslot {
  background: var(--color-background);
  border-radius: 3px;
  margin: 5px -13px 5px 5px;
  padding: 10px;
}

div.inset {
  margin-left: 20px;
}

div.help {
  margin-left: 150px;
}

div.timings {
  display: flex;
  flex-wrap: wrap;
  margin-left: 150px;
}

div.timings > label {
  flex: 1;
  flex-basis: 50%;
  display: block;
  width: 50%;
}
</style>
<script setup lang="ts">
import FieldHex from "@/components/FieldHex.vue";
import FieldInt from "@/components/FieldInt.vue";
import FieldSelect from "@/components/FieldSelect.vue";
import FieldCheck from "@/components/FieldCheck.vue";
import FieldCoordinate from "@/components/FieldCoordinate.vue";
import FieldTiming from "@/components/FieldTiming.vue";
import DDSlot from "@/components/DDSlot.vue";

const props = defineProps(['model'])

let timings = ["800x600@60", "800x600@56", "640x480@75", "640x480@72", "640x480@67", "640x480@60", "720x400@88", "720x400@70", "1280x1024@75", "1024x768@75", "1024x768@70", "1024x768@60", "1024x768@87", "832x624@75", "800x600@75", "800x600@72"];


const emit = defineEmits(['change'])

function change(event) {
  emit('change', event);
}
</script>
