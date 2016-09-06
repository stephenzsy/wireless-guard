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

    public get subject(): string {
        return this.manifest.subject;
    }

    public get expiresAt(): Date {
        return new Date(this.manifest.expiresAt);
    }
}

export function getGuidSerial(guid: Guid): string {
    return "0x" + Guid.convertToHexString(guid);
}
