import { execFile } from "./common";

export interface X509Options {
    req?: boolean,
    in?: string,
    out?: string,
    extfile?: string,
    extensions?: "v3_req",
    setSerial?: string,
    CA?: string,
    CAKey?: string,
    digest?: "sha384",
    days?: number
}

export function x509(opt: X509Options): Promise<void> {
    let args: string[] = ["x509"];

    if (opt.req) {
        args.push("-req");
    }

    if (opt.in) {
        args.push("-in", opt.in);
    }

    if (opt.out) {
        args.push("-out", opt.out);
    }

    if (opt.extfile) {
        args.push("-extfile", opt.extfile);
    }

    if (opt.extensions) {
        args.push("-extensions", opt.extensions);
    }

    if (opt.setSerial) {
        args.push("-set_serial", opt.setSerial);
    }

    if (opt.CA) {
        args.push("-CA", opt.CA);
    }

    if (opt.CAKey) {
        args.push("-CAkey", opt.CAKey);
    }

    if (opt.digest) {
        args.push("-" + opt.digest);
    }

    if (opt.days) {
        args.push("-days", opt.days.toString());
    }

    return execFile("openssl", args);
}

export default x509;
