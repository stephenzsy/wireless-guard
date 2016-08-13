import {
    IManifest
} from "./manifest";
import {
    SecretBase,
    ISecret
} from "./secret";
import Guid from "../common/guid";
import ConfigPath from "../config/config-path";

export interface ICert extends ISecret {
    pemFilePath: ConfigPath;
}

export interface ICertManifest extends IManifest {
    expireAt: string;
    pemFilePath: string;
}

export abstract class CertBase<M extends ICertManifest> extends SecretBase<M> implements ICert {
    constructor(manifest: M) {
        super(manifest);
    }

    public get pemFilePath(): ConfigPath {
        return new ConfigPath(this.manifest.pemFilePath);
    }
}

export function getGuidSerial(guid: Guid): string {
    return "0x" + Guid.convertToHexString(guid);
}
