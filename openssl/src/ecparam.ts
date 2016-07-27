import { execFile } from "./common";

export interface EcparamOptions {
    out?: string;
    name?: "secp384r1";
    genkey?: boolean;
    paramEnc?: "explicit";
}

export function ecparam(opt: EcparamOptions): Promise<void> {
    let args: string[] = ["ecparam"];

    if (opt.out) {
        args.push("-out", opt.out);
    }

    if (opt.name) {
        args.push("-name", opt.name);
    } else {
        args.push("-name", "secp384r1");
    }

    if (opt.genkey !== false) {
        args.push("-genkey");
    }

    if (opt.paramEnc) {
        args.push("-param_enc", opt.paramEnc);
    } else {
        args.push("-param_enc", "explicit");
    }

    return execFile("openssl", args);
}
