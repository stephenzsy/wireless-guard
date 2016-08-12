import {
    IManifest
} from "./manifest";
import {
    SecretBase,
    ISecret
} from "./secret";
import Guid from "../common/guid";

export interface ICert extends ISecret {
}

export interface ICertManifest extends IManifest {
    expireAt: string;
    pemFilePath: string;
}

export abstract class CertBase<M extends ICertManifest> extends SecretBase<M> implements ICert {
    constructor(manifest: M) {
        super(manifest);
    }
}

export function getGuidSerial(guid: Guid): string {
    return "0x" + Guid.convertToHexString(guid);
}
