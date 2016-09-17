import {
    ISecret,
    IManifest,
    ICertBase,
    ICertManifestBase
} from "./secret-interface";
import SecretBase, {
    AuthorizationConstants
} from "./secret-base";
import Uuid from "../common/uuid";
import ConfigPath from "../config/config-path";
import {
    IRequestContext
} from "../request-context";
import {
    IdentifierType
} from "../policies"

export abstract class CertBase<M extends ICertManifestBase> extends SecretBase<M> implements ICertBase {
    protected authorizationType: string;

    constructor(manifest: M, authoricationType: string) {
        super(manifest);
        this.authorizationType = authoricationType;
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

    public readCertificate(requestContext: IRequestContext): Promise<Buffer> {
        requestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: this.authorizationType,
                identifierType: IdentifierType.Id,
                identifier: this.manifest.id
            });

        return this.pemFilePath.read();
    }
}

export function getUuidSerial(uuid: string): string {
    return "0x" + Uuid.convertToHexString(uuid);
}
