<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Editor from "@/components/Editor.vue";
import {ref} from "vue";

let EDID = ref<number[]>([]);

function loadExample() {
  EDID.value = [
    0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00,
    0x19, 0xf3, 0x31, 0x21, 0x16, 0xb1, 0x34, 0x01,
    0x01, 0x21, 0x01, 0x03, 0x80, 0x46, 0x27, 0x78,
    0x02, 0x28, 0x95, 0xa7, 0x55, 0x4e, 0xa3, 0x26,
    0x0f, 0x50, 0x54, 0x21, 0x08, 0x00, 0xd1, 0xc0,
    0x81, 0xc0, 0x01, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x02, 0x3a,
    0x80, 0x18, 0x71, 0x38, 0x2d, 0x40, 0x58, 0x2c,
    0x45, 0x00, 0xc4, 0x8e, 0x21, 0x00, 0x00, 0x1e,
    0x00, 0x00, 0x00, 0xfd, 0x00, 0x18, 0x3c, 0x1e,
    0xde, 0x1e, 0x00, 0x0a, 0x20, 0x20, 0x20, 0x20,
    0x20, 0x20, 0x00, 0x00, 0x00, 0xff, 0x00, 0x20,
    0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
    0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x72,
    0x02, 0x03, 0x32, 0x72, 0x50, 0x10, 0x1f, 0x22,
    0x49, 0x20, 0x3f, 0x40, 0x04, 0x13, 0x3e, 0x3d,
    0x3c, 0x2f, 0x29, 0x5f, 0x64, 0x23, 0x09, 0x07,
    0x07, 0x83, 0x01, 0x00, 0x00, 0x6e, 0x03, 0x0c,
    0x00, 0x10, 0x00, 0x00, 0x3c, 0x20, 0x00, 0x80,
    0x01, 0x02, 0x03, 0x04, 0xe5, 0x0e, 0x61, 0x60,
    0x66, 0x65, 0x6a, 0x5e, 0x00, 0xa0, 0xa0, 0xa0,
    0x29, 0x50, 0x30, 0x20, 0x25, 0x00, 0xb0, 0x13,
    0x32, 0x00, 0x00, 0x00, 0x19, 0x64, 0x00, 0x80,
    0xa3, 0xa0, 0x2c, 0x50, 0xb0, 0x10, 0x35, 0x10,
    0xb0, 0x13, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf4,
  ];
}

function onAction(action: string) {
  switch (action) {
    case "load-example":
      console.log("Loading example data...");
      loadExample();
      break;
    case "load-file":
      console.log("Loading data from file...");
      loadFile();
      break;
    case "load-clipboard":
      console.log("Loading data from clipboard...");
      loadClipboard();
      break;
    default:
      console.error("Unknown action: ", action);
  }
}

async function loadClipboard() {
  const contents = await navigator.clipboard.read();
  let result: number[] = [];
  for (const item of contents) {
    if (item.types.includes("text/plain")) {
      const blob = await item.getType("text/plain");
      let pasted = await blob.text();
      if (pasted.startsWith("b'") || pasted.startsWith('b"')) {
        pasted = pasted.slice(2, -1);
        while (pasted.length > 0) {
          if (pasted.startsWith('\\x')) {
            let num = pasted.substring(2, 4);
            pasted = pasted.substring(4);
            result.push(parseInt(num, 16));
          } else if (pasted.startsWith('\\')) {
            let char = pasted.charCodeAt(1);
            pasted = pasted.substring(2);
            result.push(char);
          } else {
            let char = pasted.charCodeAt(0);
            pasted = pasted.substring(1);
            result.push(char);
          }
        }
        EDID.value = result;
      }
    }
  }
}

function loadFile() {
  const fileElem = document.getElementById("fileselector");
  fileElem?.click();
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const arr = new Uint8Array(reader.result as ArrayBuffer);
    EDID.value = Array.from(arr);
  };
  reader.onerror = () => {
    console.error("File reader had an error");
  };
  reader.readAsArrayBuffer(file);
}
</script>

<template>
  <ActionBar @action="onAction"/>
  <Editor :EDID="EDID"/>
  <input type="file" id="fileselector" style="display: none;" @change="handleFileSelection">
</template>
