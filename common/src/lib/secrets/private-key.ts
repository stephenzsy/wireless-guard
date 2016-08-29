import {
    ISecret,
    IManifest,
} from "./secret-interface";
import SecretBase, { AuthorizationConstants } from "./secret-base";
import {
    IdentifierType
} from "../policies"
import {
    IRequestContext
} from "../request-context";
import Guid from "../common/guid";
import ManifestRepo from "./manifest-repo";
import { WGOpenssl } from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";

export module Authorization {
    export const typePrivateKey: string = "private-key";
}

export interface IAsymmetricPrivateKey extends ISecret {
    pemFilePath: ConfigPath;
}

export interface IAsymmetricPrivateKeyManifest extends IManifest {
    algorithm: "ec" | "rsa";
    pemFilePath: string;
}

namespace AsymmetricPrivateKey {
    type IPrivateKeyManifestBase = IAsymmetricPrivateKeyManifest;

    class KeyBase<M extends IPrivateKeyManifestBase> extends SecretBase<M> implements IAsymmetricPrivateKey {
        public get pemFilePath(): ConfigPath {
            return new ConfigPath(this.manifest.pemFilePath);
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

    export async function createNewEcPrivateKeyAsync(requestContext: IRequestContext): Promise<EcPrivateKey> {
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

    export async function createNewRsaPrivateKeyAsync(requestContext: IRequestContext): Promise<RsaPrivateKey> {
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
        return new KeyBase(manifest);
    }
}

export function createNewEcPrivateKeyAsync(requestContext: IRequestContext): Promise<IAsymmetricPrivateKey> {
    return AsymmetricPrivateKey.createNewEcPrivateKeyAsync(requestContext);
}

export function createNewRsaPrivateKeyAsync(requestContext: IRequestContext): Promise<IAsymmetricPrivateKey> {
    return AsymmetricPrivateKey.createNewRsaPrivateKeyAsync(requestContext);
}

export function loadPrivateKeyFromManifest(requestContext: IRequestContext, manifest: IAsymmetricPrivateKeyManifest): IAsymmetricPrivateKey {
    return AsymmetricPrivateKey.loadPrivateKeyFromManifest(requestContext, manifest);
}
