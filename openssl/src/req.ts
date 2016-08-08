import { execFile } from "./common";

export interface ReqOptions {
    new?: boolean,
    x509?: boolean,
    extensions?: "v3_ca",
    setSerial?: number,
    key?: string,
    out?: string,
    digest?: "sha384",
    subj?: string,
    days?: number
}

export function req(opt: ReqOptions): Promise<void> {
    let args: string[] = ["req"];

    if (opt.new) {
        args.push("-new");
    }

    if (opt.x509) {
        args.push("-x509");
    }

    if (opt.extensions) {
        args.push("-extensions", opt.extensions);
    }

    if (opt.setSerial) {
        args.push("-set_serial", opt.setSerial.toString());
    }

    if (opt.key) {
        args.push("-key", opt.key);
    }

    if (opt.out) {
        args.push("-out", opt.out);
    }

    if (opt.digest) {
        args.push("-" + opt.digest);
    }

    if (opt.subj) {
        args.push("-subj", opt.subj);
    }

    if (opt.days) {
        args.push("-days", opt.days.toString());
    }

    return execFile("openssl", args);
}

export default req;
