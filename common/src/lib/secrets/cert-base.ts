import {
    ISecret,
    IManifest,
    ICertBase,
    ICertManifestBase
} from "./secret-interface";
import SecretBase from "./secret-base";
import Guid from "../common/guid";
import ConfigPath from "../config/config-path";


export abstract class CertBase<M extends ICertManifestBase> extends SecretBase<M> implements ICertBase {
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
