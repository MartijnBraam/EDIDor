import * as fs from 'fs';
import yargs from 'yargs/yargs';
import {EDIDBaseBlock} from "./edid";

const argv = yargs(process.argv.slice(2)).options({}).parseSync();
console.log("ARGV", argv);

let raw = fs.readFileSync(argv["_"][0])
console.log("RAW", raw);

let baseblock = new EDIDBaseBlock();
baseblock.fromBytes([...raw]);
console.log(baseblock);