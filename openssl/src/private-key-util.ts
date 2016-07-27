import {
    EcparamOptions,
    ecparam
} from "./ecparam";

export interface CrateEcPrivateKeyOpt extends EcparamOptions {
    out: string;
}

export function createEcPrivateKey(opt: CrateEcPrivateKeyOpt) {
    return ecparam(opt);
}
