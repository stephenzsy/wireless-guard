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

namespace AsymmetricPrivateKey {
    interface IPrivateKeyManifestBase extends IManifest {
        algorithm: "ec" | "rsa";
        pemFilePath: string;
    }

    abstract class KeyBase<M extends IPrivateKeyManifestBase> extends SecretBase<M> implements IAsymmetricPrivateKey {
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
        return new EcPrivateKey(manifest);
    }

    interface IRsaManifest extends IPrivateKeyManifestBase {
    }

    class RsaPrivateKey extends KeyBase<IRsaManifest> {
        constructor(manifest: IRsaManifest) {
            super(manifest);
        }
    }
}

export const createNewEcPrivateKeyAsync: (requestContext: IRequestContext) => Promise<IAsymmetricPrivateKey> = AsymmetricPrivateKey.createNewEcPrivateKeyAsync;
