import { execFile } from "./common";

export interface GenrsaOptions {
    numbits?: number,
    out: string,
}

export function genrsa(opt: GenrsaOptions): Promise<void> {
    let args: string[] = ["genrsa"];
    args.push("-out", opt.out);

    var numbits: number = opt.numbits ? opt.numbits : 4096;
    args.push(numbits.toString());

    return execFile("openssl", args);
}

export default genrsa;
