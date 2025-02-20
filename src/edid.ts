import {Struct} from "./structs";

export type Bytes = number[];

export abstract class EDIDBlock {
    abstract fromBytes(input: Bytes): void;
}

export class EDIDExtensionBlock extends EDIDBlock {
    fromBytes(input: Bytes): void {
    }
}

type Coordinate = {
    x: number;
    y: number;
}

export class Timing {
    hpixels: number = 0;
    vpixels: number = 0;
    ratio: number = 0;
    rate: number = 0;

    toBytes(): Bytes {
        let res = [0, 0];
        res[0] = (this.hpixels / 8) - 31;
        let r = 0;
        switch (this.ratio) {
            case 16 / 10:
                r = 0;
                break;
            case 4 / 3:
                r = 1;
                break;
            case 5 / 4:
                r = 2;
                break;
            case 16 / 9:
                r = 3;
                break;
        }
        res[1] = r << 6 | (this.rate - 60);
        return res;
    }

    toString(): string {
        if (this.hpixels === 256 && this.ratio === 16 / 10) {
            return ''
        } else {
            let vpixels = Math.floor(this.hpixels / this.ratio);
            return `${this.hpixels}x${vpixels}@${this.rate}`
        }
    }
}

export class Chromasity {
    red: Coordinate = {x: 1.0, y: 1.0};
    green: Coordinate = {x: 1.0, y: 1.0};
    blue: Coordinate = {x: 1.0, y: 1.0};
    white: Coordinate = {x: 1.0, y: 1.0};

    public fromBytes(raw: Bytes): void {
        let red_x_int = (raw[2] << 2) | ((raw[0] >> 6) & 0b11);
        let red_y_int = (raw[3] << 2) | ((raw[0] >> 4) & 0b11);
        let green_x_int = (raw[4] << 2) | ((raw[0] >> 2) & 0b11);
        let green_y_int = (raw[5] << 2) | ((raw[0] >> 0) & 0b11);
        let blue_x_int = (raw[6] << 2) | ((raw[1] >> 6) & 0b11);
        let blue_y_int = (raw[7] << 2) | ((raw[1] >> 4) & 0b11);
        let white_x_int = (raw[8] << 2) | ((raw[1] >> 2) & 0b11);
        let white_y_int = (raw[9] << 2) | ((raw[1] >> 0) & 0b11);
        this.red = Chromasity.ints_to_coordinate(red_x_int, red_y_int);
        this.green = Chromasity.ints_to_coordinate(green_x_int, green_y_int);
        this.blue = Chromasity.ints_to_coordinate(blue_x_int, blue_y_int);
        this.white = Chromasity.ints_to_coordinate(white_x_int, white_y_int);
    }

    private static ints_to_coordinate(x: number, y: number): Coordinate {
        return {x: x / 1024.0, y: y / 1024.0};
    }

    private static coordinate_to_ints(c: Coordinate): number[] {
        let x = Math.floor(c.x * 1024);
        let y = Math.floor(c.y * 1024);
        return [x, y];
    }

    public toBytes(): Bytes {
        const red = Chromasity.coordinate_to_ints(this.red);
        const green = Chromasity.coordinate_to_ints(this.green);
        const blue = Chromasity.coordinate_to_ints(this.blue);
        const white = Chromasity.coordinate_to_ints(this.white);
        let result = Array(10).fill(0);
        result[0] = ((red[0] & 3) << 6) | ((red[1] & 3) << 4) | ((green[0] & 3) << 2) | ((green[1] & 3) << 0);
        result[1] = ((blue[0] & 3) << 6) | ((blue[1] & 3) << 4) | ((white[0] & 3) << 2) | ((white[1] & 3) << 0);
        result[2] = red[0] >> 2;
        result[3] = red[1] >> 2;
        result[4] = green[0] >> 2;
        result[5] = green[1] >> 2;
        result[6] = blue[0] >> 2;
        result[7] = blue[1] >> 2;
        result[8] = white[0] >> 2;
        result[9] = white[1] >> 2;
        return result;
    }
}

export class DDSerialNumber {
    type: string = "serial";
    serial: string = "";

    public fromBytes(raw: Bytes): void {
        this.serial = String.fromCharCode(...raw.slice(5)).trim();
    }

    public toBytes(): Bytes {
        let result = Array(18).fill(0);
        let i = 0;
        for (i = 0; i < this.serial.length; i++) {
            result[i] = this.serial[i].charCodeAt(0) & 0xFF;
        }
        result[i++] = 0x1A;
        for (; i < 18; i++) {
            result[i] = 0x20;
        }
        return result;
    }
}

export class DDAlphanumericData {
    type: string = "data";
    data: string = "";

    public fromBytes(raw: Bytes): void {
        this.data = String.fromCharCode(...raw.slice(5));
    }

    public toBytes(): Bytes {
        let result = Array(18).fill(0);
        let i = 0;
        for (i = 0; i < this.data.length; i++) {
            result[i] = this.data[i].charCodeAt(0) & 0xFF;
        }
        result[i++] = 0x1A;
        for (; i < 18; i++) {
            result[i] = 0x20;
        }
        return result;
    }
}

export class DDRangeLimits {
    type: string = "rangelimits";
    flags: number = 0;
    min_v_rate: number = 0;
    max_v_rate: number = 0;
    min_h_rate: number = 0;
    max_h_rate: number = 0;
    max_pixelclock: number = 0;
    timing_support_flags: number = 0;

    private parser: Struct;

    public fromBytes(raw: Bytes): void {
        this.parser = new Struct("3xB B BB BB B BBB", [
            "header",
            "flags",
            "v_min",
            "v_max",
            "h_min",
            "h_max",
            "p_max",
            "timing_support",
            "timing1",
            "timing2",
        ]);
        let parsed = this.parser.parse(raw);
        console.log("PARSED", parsed);
        this.flags = parsed["flags"] as number;
        this.min_v_rate = parsed["v_min"] as number;
        this.max_v_rate = parsed["v_max"] as number;
        this.min_h_rate = parsed["h_min"] as number;
        this.max_h_rate = parsed["h_max"] as number;
        this.max_pixelclock = parsed["p_max"] as number;
        this.timing_support_flags = parsed["timing_support"] as number;
    }

    public toBytes(): Bytes {
        return this.parser.pack({
            header: 0xFD,
            flags: this.flags,
            v_min: this.min_v_rate,
            v_max: this.max_v_rate,
            h_min: this.min_h_rate,
            h_max: this.max_h_rate,
            p_max: this.max_pixelclock,
            timing_support: this.timing_support_flags,
            timing1: 0x1a,
            timing2: 0x20,
        });
    }
}

export class DDProductName {
    type: string = "name";
    name: string = "";

    public fromBytes(raw: Bytes): void {
        this.name = String.fromCharCode(...raw.slice(5)).trim();
    }

    public toBytes(): Bytes {
        let result = Array(18).fill(0);
        let i = 0;
        for (i = 0; i < this.name.length; i++) {
            result[i] = this.name[i].charCodeAt(0) & 0xFF;
        }
        result[i++] = 0x1A;
        for (; i < 18; i++) {
            result[i] = 0x20;
        }
        return result;
    }
}

export class DTD {
    type: string = "dtd";
    pixel_clock: number = 0;
    h_addr_pixels: number = 0;
    v_addr_pixels: number = 0;
    h_blanking: number = 0;
    v_blanking: number = 0;
    h_front_porch: number = 0;
    v_front_porch: number = 0;
    h_sync: number = 0;
    v_sync: number = 0;

    bitmap: number = 0;
    h_border: number = 0;
    v_border: number = 0;

    width: number = 0;
    height: number = 0;
    private parser: Struct;

    public fromBytes(raw: Bytes): void {
        this.parser = new Struct("H BBB BBB BBB B BBB BB", [
            "pixel_clock",
            "h_addr_pixels",
            "h_blanking_pixels",
            "h_ab_upper",
            "v_addr_pixels",
            "v_blanking_pixels",
            "v_ab_upper",
            "h_front_porch",
            "h_sync_width",
            "h_fs_upper",
            "bitmap",
            "h_size",
            "v_size",
            "hv_size_upper",
            "h_border",
            "v_border",
        ]);
        let parsed = this.parser.parse(raw);
        console.log("DTD", parsed);

        this.pixel_clock = (parsed["pixel_clock"] as number) * 10;
        this.h_addr_pixels = (parsed["h_addr_pixels"] as number) | ((parsed["h_ab_upper"] as number) & 0xF0) << 4;
        this.v_addr_pixels = (parsed["v_addr_pixels"] as number) | ((parsed["v_ab_upper"] as number) & 0xF0) << 4;
        this.h_blanking = (parsed["h_blanking_pixels"] as number) | ((parsed["h_ab_upper"] as number) & 0x0F) << 8;
        this.v_blanking = (parsed["v_blanking_pixels"] as number) | ((parsed["v_ab_upper"] as number) & 0x0F) << 8;
        this.h_front_porch = (parsed["h_front_porch"] as number) | ((parsed["h_fs_upper"] as number) & 0xF0) << 4;
        this.h_sync = (parsed["h_sync_width"] as number) | ((parsed["h_fs_upper"] as number) & 0x0F) << 8;
        this.v_front_porch = (parsed["v_front_porch"] as number) | ((parsed["v_fs_upper"] as number) & 0xF0) << 4;
        this.v_sync = (parsed["v_sync_width"] as number) | ((parsed["v_fs_upper"] as number) & 0x0F) << 8;

        this.width = (parsed["h_size"] as number) | ((parsed["hv_size_upper"] as number) & 0xF0) << 4;
        this.height = (parsed["v_size"] as number) | ((parsed["hv_size_upper"] as number) & 0x0F) << 8;
        this.bitmap = parsed["bitmap"] as number;
        this.h_border = parsed["h_border"] as number;
        this.v_border = parsed["v_border"] as number;
    }

    public toBytes(): Bytes {
        return this.parser.pack({
            pixel_clock: Math.floor(this.pixel_clock / 10),
            h_addr_pixels: this.h_addr_pixels & 0xFF,
            h_blanking_pixels: this.h_blanking & 0xFF,
            h_ab_upper: (this.h_addr_pixels >> 8) << 4 | (this.h_blanking >> 8),
            v_addr_pixels: this.v_addr_pixels & 0xFF,
            v_blanking_pixels: this.v_blanking & 0xFF,
            v_ab_upper: (this.v_addr_pixels >> 8) << 4 | (this.v_blanking >> 8),
            h_front_porch: this.h_front_porch & 0xFF,
            h_sync_width: this.h_sync & 0xFF,
            h_fs_upper: (this.h_front_porch >> 8) << 4 | (this.h_sync >> 8),
            bitmap: this.bitmap,
            h_size: this.width & 0xFF,
            v_size: this.height & 0xFF,
            hv_size_upper: (this.width >> 8) << 4 | (this.height >> 8),
            h_border: this.h_border,
            v_border: this.v_border,
        });
    }

}

export type DD = DTD | DDSerialNumber | DDAlphanumericData | DDRangeLimits | DDProductName;

export class EDIDBaseBlock extends EDIDBlock {
    // VESA E-EDID 1.4 block 0

    _vendor_id: number = 0;

    product_id: number = 0;
    serial: number = 0;
    week: number = 0;
    year: number = 0;
    maj: number = 0;
    min: number = 0;
    version: string = "";
    bitmap: number = 0;
    hsize: number = 0;
    vsize: number = 0;
    size: string = "";
    gamma: number = 0;
    features: number = 0;
    chromasity: Chromasity = new Chromasity();
    timings: string[] = [];
    standard_timings: Timing[] = [];
    descriptor_1: DD | undefined = undefined;
    descriptor_2: DD | undefined = undefined;
    descriptor_3: DD | undefined = undefined;
    descriptor_4: DD | undefined = undefined;
    num_exts: number = 0;
    checksum: number = 0;

    video_interface: "analog" | "digital" = "analog";
    // Analog interface
    serrations: boolean = false;
    sync_on_green: boolean = false;
    sync_on_horizontal: boolean = false;
    sync_hv: boolean = false;
    blank_level: boolean = false;
    display_color_type: "monochrome" | "rgb" | "non-rgb" | "undefined" = "rgb";

    // Digital interface
    digital_interface: "undefined" | "DVI" | "HDMI-a" | "HDMI-b" | "MDDI" | "DisplayPort" | number = "undefined";
    color_bit_depth: number = 0;
    color_encoding_rgb444: boolean = false;
    color_encoding_ycrcb444: boolean = false;
    color_encoding_ycrcb422: boolean = false;

    // Feature support
    feature_dpms_standby: boolean = false;
    feature_dpms_suspend: boolean = false;
    feature_dpms_activeoff: boolean = false;

    public parser: Struct;

    constructor() {
        super();
        this.parser = new Struct("8s HHI 9B 10s 3s 16s 18s 18s 18s 18s 2B", [
            "magic",
            "vendor_id",
            "product_id",
            "serial",
            "week",
            "year",
            "maj",
            "min",
            "bitmap",
            "hsize",
            "vsize",
            "gamma",
            "features",
            "chromasity",
            "timings",
            "standard_timings",
            "descriptor_1",
            "descriptor_2",
            "descriptor_3",
            "descriptor_4",
            "num_exts",
            "checksum",
        ]);
    }

    private parseDTD(input: Bytes): DD | undefined {
        if (input[0] === 0 && input[1] === 0) {
            // Display Descriptor Definition
            let parser = new Struct("HB BB", [
                "descriptor",
                "reserved0",
                "tag",
                "reserved1",
            ]);
            let header = parser.parse(input);
            console.log("TAG", header);
            switch (header.tag) {
                case 0xFF:
                    // Display Product Serial Number
                    let serial = new DDSerialNumber();
                    serial.fromBytes(input);
                    return serial;
                case 0xFE:
                    // Alphanumeric Data String (ASCII)
                    let data = new DDAlphanumericData();
                    data.fromBytes(input);
                    return data;
                case 0xFD:
                    // Display Range Limits
                    let rl = new DDRangeLimits();
                    rl.fromBytes(input);
                    return rl;
                case 0xFC:
                    // Display Product Name
                    let pn = new DDProductName();
                    pn.fromBytes(input);
                    return pn;
            }
        } else {
            // Detailed Timing Descriptor
            let dtd = new DTD();
            dtd.fromBytes(input);
            return dtd;
        }
    }

    makeChecksum(input: Bytes): number {
        let sum = 0;
        for (let i = 0; i < 128; i++) {
            sum += input[i];
        }
        return sum % 256;
    }

    fromBytes(input: Bytes) {
        let parsed = this.parser.parse(input);
        let checksum = this.makeChecksum(input);

        // Vendor & Product Identification
        this._vendor_id = parsed["vendor_id"] as number;
        this.product_id = parsed["product_id"] as number;
        this.serial = parsed["serial"] as number;
        this.week = parsed["week"] as number;
        this.year = (parsed["year"] as number) + 1990;

        // EDIT Structure Version & Revision
        this.maj = parsed["maj"] as number;
        this.min = parsed["min"] as number;

        // Basic Display Parameters & Features
        this.bitmap = parsed["bitmap"] as number;
        this.hsize = parsed["hsize"] as number;
        this.vsize = parsed["vsize"] as number;

        if (this.hsize === 0) {
            this.size = "Aspect portrait";
        } else if (this.vsize === 0) {
            this.size = "Aspect landscape";
        } else {
            const diagonal = Math.sqrt((this.hsize * this.hsize) + (this.vsize * this.vsize));
            this.size = `${this.hsize}x${this.vsize}cm (${(diagonal / 2.54).toPrecision(3)}")`;
        }

        this.gamma = ((parsed["gamma"] as number) + 100) / 100;
        this.features = parsed["features"] as number;

        this.num_exts = parsed["num_exts"] as number;
        this.checksum = parsed["checksum"] as number;

        // Parse bitpacked data
        this.version = this.maj + "." + this.min;
        this.video_interface = this.bitmap & 0xF0 ? "digital" : "analog";
        if (this.video_interface === "analog") {
            this.serrations = (this.bitmap & 1) > 0;
            this.sync_on_green = (this.bitmap & 2) > 0;
            this.sync_on_horizontal = (this.bitmap & 4) > 0;
            this.sync_hv = (this.bitmap & 8) > 0;
            this.blank_level = (this.bitmap & 16) > 0;
        } else {
            switch (this.bitmap & 0x0F) {
                case 0:
                    this.digital_interface = "undefined";
                    break;
                case 1:
                    this.digital_interface = "DVI";
                    break;
                case 2:
                    this.digital_interface = "HDMI-a";
                    break;
                case 3:
                    this.digital_interface = "HDMI-b";
                    break;
                case 4:
                    this.digital_interface = "MDDI";
                    break;
                case 5:
                    this.digital_interface = "DisplayPort";
                    break;
                default:
                    this.digital_interface = this.bitmap & 0x0F;
            }

            switch (this.bitmap & 0x70) {
                case 0:
                    this.color_bit_depth = 0;
                    break;
                case 1:
                    this.color_bit_depth = 6;
                    break;
                case 2:
                    this.color_bit_depth = 8;
                    break;
                case 3:
                    this.color_bit_depth = 10;
                    break;
                case 4:
                    this.color_bit_depth = 12;
                    break;
                case 5:
                    this.color_bit_depth = 14;
                    break;
                case 6:
                    this.color_bit_depth = 16;
                    break;
                case 7:
                    this.color_bit_depth = 0;
                    break;
            }
        }

        this.feature_dpms_standby = (this.features & 0xF0) > 0;
        this.feature_dpms_suspend = (this.features & 0x7F) > 0;
        this.feature_dpms_activeoff = (this.features & 0x3F) > 0;

        const bit43 = this.features & 0b00011000;
        if (this.video_interface === "analog") {
            switch (bit43) {
                case 0:
                    this.display_color_type = "monochrome";
                    break;
                case 1:
                    this.display_color_type = "rgb";
                    break;
                case 2:
                    this.display_color_type = "non-rgb";
                    break;
                case 3:
                    this.display_color_type = "undefined";
                    break;
            }
        } else {
            this.color_encoding_rgb444 = true;
            if (bit43 & 1) {
                this.color_encoding_ycrcb444 = true;
            }
            if (bit43 & 2) {
                this.color_encoding_ycrcb422 = true;
            }
        }

        // Parse chromasity
        this.chromasity.fromBytes(parsed["chromasity"] as number[]);

        // Parse Established Timings I & II
        let timing1 = ["800x600@60", "800x600@56", "640x480@75", "640x480@72", "640x480@67", "640x480@60", "720x400@88", "720x400@70"];
        let timing2 = ["1280x1024@75", "1024x768@75", "1024x768@70", "1024x768@60", "1024x768@87", "832x624@75", "800x600@75", "800x600@72"];
        this.timings = [];
        for (let i = 0; i < 8; i++) {
            if ((parsed["timings"] as number[])[0] & (1 << i)) {
                this.timings.push(timing1[i]);
            }
            if ((parsed["timings"] as number[])[1] & (1 << i)) {
                this.timings.push(timing2[i]);
            }
        }

        // Parse Standard Timings
        this.standard_timings = [];
        let st = parsed["standard_timings"] as number[];
        for (let i = 0; i < 8; i++) {
            if (st[i * 2] === 0) {
                continue;
            }
            let horiz = (st[i * 2] + 31) * 8;
            const aspects = [16 / 10, 4 / 3, 5 / 4, 16 / 9];
            let aspect = aspects[st[i * 2 + 1] >> 6];
            let rate = (st[i * 2 + 1] & 0b00111111) + 60;
            let vert = horiz / aspect;
            let t = new Timing();
            t.hpixels = horiz;
            t.vpixels = vert;
            t.ratio = aspect;
            t.rate = rate;
            this.standard_timings.push(t);
        }

        this.descriptor_1 = this.parseDTD(parsed["descriptor_1"] as number[]);
        this.descriptor_2 = this.parseDTD(parsed["descriptor_2"] as number[]);
        this.descriptor_3 = this.parseDTD(parsed["descriptor_3"] as number[]);
        this.descriptor_4 = this.parseDTD(parsed["descriptor_4"] as number[]);

        // Load extension blocks

    }

    public toBytes(): Bytes {
        let dd1 = [];
        let dd2 = [];
        let dd3 = [];
        let dd4 = [];
        if (this.descriptor_1 !== undefined) {
            dd1 = this.descriptor_1.toBytes();
        }
        if (this.descriptor_2 !== undefined) {
            dd2 = this.descriptor_2.toBytes();
        }
        if (this.descriptor_3 !== undefined) {
            dd3 = this.descriptor_3.toBytes();
        }
        if (this.descriptor_4 !== undefined) {
            dd4 = this.descriptor_4.toBytes();
        }

        // Generate Established Timings I & II
        let timing1 = ["800x600@60", "800x600@56", "640x480@75", "640x480@72", "640x480@67", "640x480@60", "720x400@88", "720x400@70"];
        let timing2 = ["1280x1024@75", "1024x768@75", "1024x768@70", "1024x768@60", "1024x768@87", "832x624@75", "800x600@75", "800x600@72"];
        let timings = [0, 0, 0];
        for (let i = 0; i < 8; i++) {
            if (this.timings.includes(timing1[i])) {
                timings[0] += 1 << i;
            }
            if (this.timings.includes(timing2[i])) {
                timings[1] += 1 << i;
            }
        }

        // Generate Standard Timings
        let st = [];
        for (let i = 0; i < this.standard_timings.length; i++) {
            const b = this.standard_timings[i].toBytes();
            st.push(b[0]);
            st.push(b[1]);
        }
        for (let i = st.length; i < 16; i++) {
            st.push(0x00);
        }

        let block = this.parser.pack({
            magic: [0, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0],
            vendor_id: this._vendor_id,
            product_id: this.product_id,
            serial: this.serial,
            week: this.week,
            year: this.year - 1990,
            maj: this.maj,
            min: this.min,
            bitmap: this.bitmap,
            hsize: this.hsize,
            vsize: this.vsize,
            gamma: (this.gamma * 100) - 100,
            features: this.features,
            chromasity: this.chromasity.toBytes(),
            timings: timings,
            standard_timings: st,
            "descriptor_1": dd1,
            "descriptor_2": dd2,
            "descriptor_3": dd3,
            "descriptor_4": dd4,
            num_exts: this.num_exts,
            checksum: 0x00,
        });
        let checksum = this.makeChecksum(block);
        block[127] = 256 - checksum;
        return block;
    }

    public get vendor_name() {
        // Endianness is wrong for this for some reason...
        let temp = ((this._vendor_id & 0x00FF) << 8) | (this._vendor_id >> 8);
        let char1 = (temp >> 10) & 0x1F;
        let char2 = (temp >> 5) & 0x1F;
        let char3 = (temp >> 0) & 0x1F;
        return String.fromCharCode(char1 + 64, char2 + 64, char3 + 64);
    }

    public set vendor_name(name) {
        let vid = 0;
        let num: number[] = [];
        for (let i = 0; i < 3; i++) {
            num[i] = name.charCodeAt(i) - 64;
        }
        vid += num[2] & 0x1F;
        vid += (num[1] & 0x1F) << 5;
        vid += (num[0] & 0x1F) << 10;
        this._vendor_id = vid;
    }

    public get vendor_id() {
        return this._vendor_id;
    }

    public set vendor_id(val) {
        this._vendor_id = val;
    }
}