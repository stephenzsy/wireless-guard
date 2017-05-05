import { PrincipalsConfig } from "../config/principals-config";
import { IMaterial, IMaterialManifest } from "./interfaces";
import { BaseMaterial } from "./base-material";
import { BasePolicy } from "../policies/base-policy";
import { IRequest } from "../request/interfaces";
export interface IPrivateKey extends IMaterial {
}

export interface IAsymmetricPrivateKeyManifest extends IMaterialManifest {
    algorithm: "ec" | "rsa";
    pemFilePath: string;
}

interface IEcPrivateKeyManifest extends IAsymmetricPrivateKeyManifest {
    curve: "secp384r1";
}

export class AsymmetricPrivateKey<T extends IAsymmetricPrivateKeyManifest> extends BaseMaterial<T> {
    constructor(principalsConfig: PrincipalsConfig, manifest: T) {
        super(principalsConfig, manifest);
    }
}

export class EcPrivateKey extends AsymmetricPrivateKey<IEcPrivateKeyManifest> {
    constructor(principalsConfig: PrincipalsConfig, manifest: IEcPrivateKeyManifest) {
        super(principalsConfig, manifest);
    }
}

function authorizeCreatePrivateKeyRequest(request: IRequest) {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typePrivateKey,
            identifierType: IdentifierType.Id,
            identifier: "*"
        },
        { requireElevated: true });
}

export async function newEcPrivateKeyAsync(request: IRequest): Promise<EcPrivateKey> {
    authorizeCreatePrivateKeyRequest(request);

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