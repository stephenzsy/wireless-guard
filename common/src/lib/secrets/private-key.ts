import {
    ISecret,
    IManifest,
    IAsymmetricPrivateKeyManifest,
    IAsymmetricPrivateKey
} from "./secret-interface";
import SecretBase, { AuthorizationConstants } from "./secret-base";
import {
    IdentifierType
} from "../policies"
import {
    IRequestContext,
    PolicyDeniedError
} from "../request-context";
import ManifestRepo from "./manifest-repo";
import { WGOpenssl } from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";

export module Authorization {
    export const typePrivateKey: string = "private-key";
}

type IPrivateKeyManifestBase = IAsymmetricPrivateKeyManifest;

class KeyBase<M extends IPrivateKeyManifestBase> extends SecretBase<M> implements IAsymmetricPrivateKey {
    public get pemFilePath(): ConfigPath {
        return new ConfigPath(this.manifest.pemFilePath);
    }

    public readPrivateKey(requestContext: IRequestContext): Promise<Buffer> {
        requestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: Authorization.typePrivateKey,
                identifierType: IdentifierType.Id,
                identifier: this.manifest.id
            },
            { requireElevated: true });

        return this.pemFilePath.read();
    }
}

interface IEcManifest extends IPrivateKeyManifestBase {
    curve: "secp384r1";
}

class EcPrivateKey extends KeyBase<IEcManifest> {
    constructor(manifest: IEcManifest) {
        super(manifest);
    }
}

function authorizeCreatePrivateKeyRequest(requestContext: IRequestContext) {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typePrivateKey,
            identifierType: IdentifierType.Id,
            identifier: "*"
        },
        { requireElevated: true });
}

function authorizeReadPrivateKeyRequest(requestContext: IRequestContext, manifest: IAsymmetricPrivateKeyManifest) {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typePrivateKey,
            identifierType: IdentifierType.Id,
            identifier: manifest.id
        },
        { requireElevated: true });
    if (manifest.ownerId !== requestContext.userContext.user.id.toString()) {
        throw new PolicyDeniedError(undefined, "Only owner of the private key can read private key: " + manifest.id.toString());
    }
}

export async function createNewEcPrivateKeyAsync(requestContext: IRequestContext): Promise<IAsymmetricPrivateKey> {
    authorizeCreatePrivateKeyRequest(requestContext);

    let manifest: IEcManifest = ManifestRepo.initManifest(requestContext.userContext.user,
        requestContext.moduleName) as IEcManifest;
    manifest.algorithm = "ec";
    manifest.curve = "secp384r1";
    let privateKeyPath = new ConfigPath(manifest.secretsDirPath).path("key.pem");
    await WGOpenssl.ecparam({
        out: privateKeyPath.fsPath
    });
    manifest.pemFilePath = privateKeyPath.fsPath;
    // store new manifest
    new ConfigPath(manifest.manifestPath).saveJsonConfig(manifest);
    requestContext.log("info", "Created private key: " + manifest.id);
    return new EcPrivateKey(manifest);
}

interface IRsaManifest extends IPrivateKeyManifestBase {
    numbits: number;
}

class RsaPrivateKey extends KeyBase<IRsaManifest> {
    constructor(manifest: IRsaManifest) {
        super(manifest);
    }
}

export async function createNewRsaPrivateKeyAsync(requestContext: IRequestContext): Promise<IAsymmetricPrivateKey> {
    authorizeCreatePrivateKeyRequest(requestContext);

    let manifest: IRsaManifest = ManifestRepo.initManifest(requestContext.userContext.user,
        requestContext.moduleName) as IRsaManifest;
    manifest.algorithm = "rsa";
    manifest.numbits = 4096;
    let privateKeyPath = new ConfigPath(manifest.secretsDirPath).path("key.pem");
    await WGOpenssl.genrsa({
        out: privateKeyPath.fsPath,
        numbits: 4096
    });
    manifest.pemFilePath = privateKeyPath.fsPath;
    // store new manifest
    new ConfigPath(manifest.manifestPath).saveJsonConfig(manifest);
    requestContext.log("info", "Created private key: " + manifest.id);

    return new RsaPrivateKey(manifest);
}

export function loadPrivateKeyFromManifest(requestContext: IRequestContext, manifest: IAsymmetricPrivateKeyManifest): IAsymmetricPrivateKey {
    authorizeReadPrivateKeyRequest(requestContext, manifest);
    return new KeyBase(manifest);
}
