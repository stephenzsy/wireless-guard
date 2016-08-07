import {
    ISecret
} from "./secret"
import {
    IUser
} from "../users/user";
import Guid from "../common/guid";
import { IManifest } from "./manifest";
import ManifestRepo from "./manifest-repo";
import { WGOpenssl } from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";

export interface IAsymmetricPrivateKey extends ISecret {
}

namespace AsymmetricPrivateKey {
    interface IPrivateKeyManifestBase extends IManifest {
        algorithm: "ec" | "rsa";
        pemFilePath: string;
    }

    abstract class KeyBase<M extends IPrivateKeyManifestBase> implements IAsymmetricPrivateKey {
        private _id: Guid;

        constructor(manifest: M) {
            this._id = new Guid(manifest.id);
        }

        public get id(): Guid {
            return this._id;
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

    export async function createNewEcPrivateKeyAsync(user: IUser): Promise<EcPrivateKey> {
        let manifest: IEcManifest = ManifestRepo.initManifest(user) as IEcManifest;
        manifest.algorithm = "ec";
        manifest.curve = "secp384r1";
        let privateKeyPath = new ConfigPath(manifest.secretsDirPath).path("key.pem");
        await WGOpenssl.ecparam.ecparam({
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

export const createNewEcPrivateKeyAsync: (user: IUser) => Promise<IAsymmetricPrivateKey> = AsymmetricPrivateKey.createNewEcPrivateKeyAsync;
