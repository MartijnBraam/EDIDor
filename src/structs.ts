type FormatPart = {
    format: string;
    pos: number;
    size: number;
    count: number;
    ptype: string;
    var: string;
    color: string;
};

export interface ParsedData {
    [index: string]: string | number | boolean | number[];
}

export type Bytes = number[];

export class Struct {
    fmt: string = "";
    names: string[] = [];
    format: FormatPart[];
    length: number = 0;

    constructor(fmt: string, names: string[]) {
        this.fmt = fmt;
        this.names = names;
        this.format = this.parseFormat();
    }

    public describeIndex(index: number): FormatPart {
        for (let i = 0; i < this.format.length; i++) {
            const f = this.format[i];
            if (f.format == "x") {
                continue;
            }
            const start = f.pos;
            if (index < start) {
                continue
            }
            const end = f.pos + (f.size * f.count);
            if (index > end - 1) {
                continue
            }
            return f;
        }
    }

    private parseFormat(): FormatPart[] {
        let rawFormat = '';
        let pos = 0;
        let number = '';
        let parse_vars = false;
        let var_slice = 0;
        let quote = '';
        let endianness = '@';
        let result = [];
        let index = 0;
        for (let i = 0; i < this.fmt.length; i++) {
            let c = this.fmt[i];
            if (c === ' ' || c === '\n') {
                rawFormat += c;
                continue;
            }

            if (c === '"' || c === "'") {
                if (quote === '') {
                    quote = c;
                    continue;
                }
                parse_vars = true;
                var_slice = i;
                break;
            }

            let size = 0;
            let name = '';
            let ptype = 'int';
            let split = true;

            if (!isNaN(Number(c))) {
                number += c;
                rawFormat += c;
                continue;
            }
            rawFormat += c;

            switch (c) {
                case '@':
                case '=':
                case '<':
                case '>':
                case '!':
                    endianness = c;
                    continue;
                case 'x':
                    size = 1;
                    name = 'padding';
                    split = false;
                    index--;
                    break;
                case 'c':
                    size = 1;
                    name = 'char';
                    ptype = 'bytes'
                    break;
                case 'b':
                    size = 1;
                    name = 'signed char';
                    break;
                case 'B':
                    size = 1;
                    name = 'unsigned char';
                    break;
                case '?':
                    size = 1;
                    name = 'bool';
                    ptype = 'bool'
                    break;
                case 'h':
                    size = 2;
                    name = 'signed short';
                    break;
                case 'H':
                    size = 2;
                    name = 'unsigned short';
                    break;
                case 'i':
                    size = 4;
                    name = 'signed int';
                    break;
                case 'I':
                    size = 4;
                    name = 'unsigned int';
                    break;
                case 'l':
                    size = 4;
                    name = 'signed long';
                    break;
                case 'L':
                    size = 4;
                    name = 'unsigned long';
                    break;
                case 'q':
                    size = 8;
                    name = 'signed long long';
                    break;
                case 'Q':
                    size = 8;
                    name = 'unsigned long long';
                    break;
                case 'n':
                    size = 4;
                    name = 'ssize_t';
                    break;
                case 'N':
                    size = 4;
                    name = 'size_t';
                    break;
                case 'e':
                    size = 2;
                    name = 'float16';
                    ptype = 'float'
                    break;
                case 'f':
                    size = 4;
                    name = 'float';
                    ptype = 'float';
                    break;
                case 'd':
                    size = 8;
                    name = 'double';
                    ptype = 'float';
                    break;
                case 's':
                    size = 1;
                    name = 'char[]';
                    ptype = 'bytes';
                    split = false;
                    break;
                case 'p':
                    size = 1;
                    name = 'char[]';
                    ptype = 'bytes';
                    split = false;
                    break;
                case 'P':
                    size = 1;
                    name = 'void';
                    ptype = 'int';
                    break;
            }
            let count = 1;
            if (number !== '') {
                count = parseInt(number, 10);
                number = '';
            }
            if (split) {
                for (let i = 0; i < count; i++) {
                    result.push({
                        'format': c,
                        'pos': pos + (i * size),
                        'size': size,
                        'count': 1,
                        'name': name,
                        'ptype': ptype,
                        'var': this.names[index++],
                        'color': '',
                    });
                }
            } else {
                result.push({
                    'format': c,
                    'pos': pos,
                    'size': size,
                    'count': count,
                    'name': name,
                    'ptype': ptype,
                    'var': this.names[index++],
                    'color': '',
                });
            }
            pos += size * count;
        }
        this.length = pos;
        return result;
    }

    public parse(input: Bytes): ParsedData {
        let result: ParsedData = {};
        for (let i = 0; i < this.format.length; i++) {
            const f = this.format[i];
            if (f.format == "x") {
                continue;
            }
            const start = f.pos;
            const end = f.pos + (f.size * f.count);
            const raw = input.slice(start, end);
            const rawb = new Uint8Array(raw);

            let val: any = undefined;
            switch (f.format) {
                case 'c':
                    val = rawb[0];
                    break;
                case 's':
                    val = raw;
                    break;
                case 'b':
                    let tempb = new Int8Array(raw);
                    val = tempb[0];
                    break;
                case 'B':
                    val = raw[0];
                    break;
                case 'h':
                    let temph = new Int16Array(rawb.buffer);
                    val = temph[0];
                    break;
                case 'H':
                    let tempH = new Uint16Array(rawb.buffer);
                    val = tempH[0];
                    break;
                case 'i':
                    let tempi = new Int32Array(rawb.buffer);
                    val = tempi[0];
                    break;
                case 'I':
                    let tempI = new Uint32Array(rawb.buffer);
                    val = tempI[0];
                    break;
                case '?':
                    val = raw[0] !== 0;
                    break;
            }
            // @ts-ignore
            result[f.var] = val;
        }
        return result;
    }

    public pack(data): Bytes {
        const types = {
            'c': {type: 'char'},
            's': {type: 'string'},
            'b': {type: 'int', signed: true, bytes: 1, min: -Math.pow(2, 7), max: Math.pow(2, 7) - 1},
            'B': {type: 'int', signed: false, bytes: 1, min: 0, max: Math.pow(2, 8) - 1},
            'h': {type: 'int', signed: true, bytes: 2, min: -Math.pow(2, 15), max: Math.pow(2, 15) - 1},
            'H': {type: 'int', signed: false, bytes: 2, min: 0, max: Math.pow(2, 16) - 1},
            'i': {type: 'int', signed: true, bytes: 4, min: -Math.pow(2, 31), max: Math.pow(2, 31) - 1},
            'I': {type: 'int', signed: false, bytes: 4, min: 0, max: Math.pow(2, 32) - 1},
            'f': {type: 'float', bytes: 4},
            'd': {type: 'float', bytes: 8},
        }
        const buffer = new ArrayBuffer(this.length);
        const dv = new DataView(buffer);
        for (let i = 0; i < this.format.length; i++) {
            const f = this.format[i];
            if (f.format == "x") {
                continue;
            }
            const start = f.pos;
            const end = f.pos + (f.size * f.count);
            const val = data[f.var];

            const t = types[f.format];
            switch (t.type) {
                case "int":
                    if (val > t.max || val < t.min) {
                        throw Error(`Value ${val} does not fit in '${f.format}'`);
                    }
                    if (t.signed) {
                        switch (t.bytes) {
                            case 1:
                                dv.setInt8(start, val);
                                break;
                            case 2:
                                dv.setInt16(start, val, true);
                                break;
                            case 4:
                                dv.setInt32(start, val, true);
                                break;
                        }
                    } else {
                        switch (t.bytes) {
                            case 1:
                                dv.setUint8(start, val);
                                break;
                            case 2:
                                dv.setUint16(start, val, true);
                                break;
                            case 4:
                                dv.setUint32(start, val, true);
                                break;
                        }
                    }
                    break;
                case 'string':
                    if (val.length > f.count) {
                        throw Error("Too many bytes");
                    }
                    for (let i = 0; i < f.count; i++) {
                        dv.setUint8(start + i, val[i]);
                    }
                    break;
            }
        }
        const uints = new Uint8Array(buffer);
        return Array.from(uints);
    }
}