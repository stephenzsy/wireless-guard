import * as crypto from "crypto";
import * as moment from "moment";
import {
    readFileAsString,
    fsRename,
} from "./common";
import {
    EcparamOptions,
    ecparam
} from "./ecparam";

export interface CrateEcPrivateKeyOptions {
    out: string | {
        prefix: string;
        useDigest?: boolean;
        useTimestamp?: boolean;
        suffix?: string;
    };
}

export interface KeyConfig {
  
}

async function getDigest(filename: string, length?: number): Promise<string> {
    let hash = crypto.createHash("sha384");
    let content: string = await readFileAsString(filename);
    let digest: string = hash.update(content).digest("hex");
    if (length) {
        digest = digest.substr(0, length);
    }
    return digest;
}

function getTimestamp(): string {
    return moment.utc().format("YMMDD-HHmmss");
}

export async function createEcPrivateKey(opt: CrateEcPrivateKeyOptions): Promise<string> {
    let useGivenName: boolean = (typeof opt.out === "string");
    let outFile: string = useGivenName ? opt.out as string : "_.key";
    let ecParamOpts: EcparamOptions = {
        out: outFile
    };
    await ecparam(ecParamOpts);
    if (useGivenName) {
        return opt.out as string;
    }
    let optOut = opt.out as {
        prefix: string;
        useDigest?: boolean;
        useTimestamp?: boolean;
        suffix?: string;
    };
    let newFilename: string = optOut.prefix +
        ((optOut.useTimestamp !== false) ? ("-" + getTimestamp()) : "") +
        ((optOut.useDigest !== false) ? ("-" + getDigest(outFile, 8)) : "") +
        ((optOut.suffix) ? optOut.suffix : ".key");
    await fsRename(outFile, newFilename);
    return newFilename;
}
