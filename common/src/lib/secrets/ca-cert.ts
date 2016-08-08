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
import * as moment from "moment";
import { IAsymmetricPrivateKey } from "./private-key";

export module Authorization {
    export module Action {
        export const createRootCa: string = "create";
    }

    export module Resource {
        export const createRootCa: string = "secret:root-ca::";
    }
}

export interface IRootCaCert extends ISecret {
}

namespace RootCaCert {
    interface IRootCaCertManifest extends IManifest {
        expireAt: string;
        pemFilePath: string;
    }

    class RootCaCert extends SecretBase<IRootCaCertManifest> implements IRootCaCert {
        constructor(manifest: IRootCaCertManifest) {
            super(manifest);
        }
    }

    export async function createRootCaCertAsync(requestContext: IRequestContext,
        privateKey: IAsymmetricPrivateKey,
        serial: number,
        subject: string): Promise<RootCaCert> {
        requestContext.authorize(Authorization.Action.createRootCa, Authorization.Resource.createRootCa);

        let manifest: IRootCaCertManifest = ManifestRepo.initManifest(requestContext.userContext.user) as IRootCaCertManifest;
        // expiry to be actual expiry - 1 day
        let expiryDateStr: string = moment.utc().add({ days: 364 }).toISOString();
        manifest.expireAt = expiryDateStr;
        let certPath = new ConfigPath(manifest.secretsDirPath).path("crt.pem");
        await WGOpenssl.req({
            new: true,
            x509: true,
            extensions: "v3_ca",
            setSerial: serial,
            key: privateKey.pemFilePath.fsPath,
            out: certPath.fsPath,
            digest: "sha384",
            subj: subject,
            days: 365
        });
        manifest.pemFilePath = certPath.fsPath;
        // store new manifest
        new ConfigPath(manifest.manifestPath).saveJsonConfig(manifest);
        return new RootCaCert(manifest);
    }
}

export const createRootCaCertAsync: (requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    serial: number,
    subject: string) => Promise<IRootCaCert> = RootCaCert.createRootCaCertAsync;
