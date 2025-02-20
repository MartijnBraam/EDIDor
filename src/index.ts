import {EDIDBaseBlock} from "./edid.js";

let baseblock = new EDIDBaseBlock();
baseblock.fromBytes([0]);
console.log(baseblock);

export function buildEditor(data: EDIDBaseBlock) {

}

export function loadEdid() {
    const entry = document.getElementById('load') as HTMLInputElement;
    let data = entry?.value;

    data = data.toLowerCase().replace('0x', '').replace(/\s/g, '');

    let EDID: number[] = [];
    for (let i = 0; i < data.length; i += 2) {
        EDID.push(parseInt(data.substring(i, i + 2), 16));
    }

    let EDIDParser = new EDIDBaseBlock();
    EDIDParser.fromBytes(EDID);
    console.log(EDIDParser);
    buildEditor(EDIDParser);
    //updateHex();
}

document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById('load');
    loader?.addEventListener('change', loadEdid);
    loader?.addEventListener('keyup', loadEdid);
    loader?.addEventListener('paste', loadEdid);
});