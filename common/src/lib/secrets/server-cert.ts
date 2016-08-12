import * as moment from "moment";
import WGOpenssl from "wireless-guard-openssl";

import Guid from "../common/guid";
import {
    Authorization as SecretAuthorization
} from "./secret";
import { CertBase, ICert, ICertManifest, getGuidSerial } from "./cert-base";
import {
    IRequestContext
} from "../request-context";
import { IAsymmetricPrivateKey } from "./private-key";
import {
    CaCertSuiteManifest,
    CaCertSuite
} from "./ca-cert";
import ManifestRepo from "./manifest-repo";
import ConfigPath from "../config/config-path";

export module Authorization {
    export module Resource {
        export const createServerCert: string = "secret:server-cert::";
    }
}

export interface IServerCert extends ICert { }
export interface IServerCertManifest extends ICertManifest { }

namespace ServerCerts {
    class ServerCert extends CertBase<IServerCertManifest> implements IServerCert {
        constructor(manifest: IServerCertManifest) {
            super(manifest);
        }
    }

    function createCsr(csrOutputPath: ConfigPath, privateKey: IAsymmetricPrivateKey, subject: string): Promise<void> {
        return WGOpenssl.req({
            new: true,
            key: privateKey.pemFilePath.fsPath,
            out: csrOutputPath.fsPath,
            digest: "sha384",
            subj: subject
        });
    }

    export async function createServerCertAsync(requestContext: IRequestContext,
        privateKey: IAsymmetricPrivateKey,
        caSuite: CaCertSuiteManifest,
        subject: string): Promise<ServerCert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createServerCert);

        let manifest: IServerCertManifest = ManifestRepo.initManifest(requestContext.userContext.user) as IServerCertManifest;
        let dirPath: ConfigPath = new ConfigPath(manifest.secretsDirPath);
        // create csr
        let csrPath: ConfigPath = dirPath.path("csr.pem");
        await createCsr(csrPath, privateKey, subject);
        return null;
    }
}

export async function createServerCertAsync(requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    caSuiteManifest: CaCertSuiteManifest,
    subject: string): Promise<IServerCert> {
    return ServerCerts.createServerCertAsync(requestContext, privateKey, caSuiteManifest, subject);
}
