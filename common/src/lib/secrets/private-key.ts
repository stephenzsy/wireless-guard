import {
    ISecret,
    SecretBase
} from "./secret"
import {
    IUser
} from "../users/user";
import {
    IRequestContext
} from "../request-context";
import Guid from "../common/guid";
import { IManifest } from "./manifest";
import ManifestRepo from "./manifest-repo";
import { WGOpenssl } from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";

export module Authorization {
    export module Action {
        export const createPrivateKey: string = "create";
    }

    export module Resource {
        export const createPrivateKey: string = "secret:private-key::";
    }
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

    export async function createNewEcPrivateKeyAsync(requestContext: IRequestContext): Promise<EcPrivateKey> {
        requestContext.authorize(Authorization.Action.createPrivateKey, Authorization.Resource.createPrivateKey);

        let manifest: IEcManifest = ManifestRepo.initManifest(requestContext.userContext.user) as IEcManifest;
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

    export async function createNewRsaPrivateKeyAsync(requestContext: IRequestContext,
        configPath?: ConfigPath): Promise<RsaPrivateKey> {
        requestContext.authorize(Authorization.Action.createPrivateKey, Authorization.Resource.createPrivateKey);

        let manifest: IRsaManifest = ManifestRepo.initManifest(requestContext.userContext.user, configPath) as IRsaManifest;
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

export function createNewRsaPrivateKeyAsync(requestContext: IRequestContext,
    configPath?: ConfigPath): Promise<IAsymmetricPrivateKey> {
    return AsymmetricPrivateKey.createNewRsaPrivateKeyAsync(requestContext, configPath);
}

export function loadPrivateKeyFromManifest(requestContext: IRequestContext, manifest: IAsymmetricPrivateKeyManifest): IAsymmetricPrivateKey {
    return AsymmetricPrivateKey.loadPrivateKeyFromManifest(requestContext, manifest);
}
