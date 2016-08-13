import {
    ISecret,
    SecretBase,
    Authorization as SecretAuthorization
} from "./secret"
import {
    IUser
} from "../users/user";
import AppContext from "../app-context";
import {
    IRequestContext
} from "../request-context";
import Guid from "../common/guid";
import { IManifest } from "./manifest";
import ManifestRepo from "./manifest-repo";
import WGOpenssl from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";
import * as moment from "moment";
import { IAsymmetricPrivateKey, IAsymmetricPrivateKeyManifest, loadPrivateKeyFromManifest } from "./private-key";
import { CertBase, ICert, ICertManifest, getGuidSerial } from "./cert-base";

export module Authorization {
    export module Resource {
        export const createRootCa: string = "secret:root-ca::";
        export const readPrivateKey: string = "secret:private-key::";
    }
}

interface IRootCaCertManifest extends ICertManifest { }
export interface IRootCaCert extends ICert { }

namespace RootCaCert {

    export class RootCaCert extends CertBase<IRootCaCertManifest> implements IRootCaCert {
        constructor(manifest: IRootCaCertManifest) {
            super(manifest);
        }
    }

    export async function createRootCaCertAsync(requestContext: IRequestContext,
        privateKey: IAsymmetricPrivateKey,
        subject: string): Promise<RootCaCert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createRootCa);

        let manifest: IRootCaCertManifest = ManifestRepo.initManifest(requestContext.userContext.user) as IRootCaCertManifest;
        // expiry to be actual expiry - 1 day
        let expiryDateStr: string = moment.utc().add({ days: 364 }).toISOString();
        manifest.expireAt = expiryDateStr;
        let certPath = new ConfigPath(manifest.secretsDirPath).path("crt.pem");
        await WGOpenssl.req({
            new: true,
            x509: true,
            extensions: "v3_ca",
            key: privateKey.pemFilePath.fsPath,
            setSerial: getGuidSerial(new Guid(manifest.id)),
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
    subject: string) => Promise<IRootCaCert> = RootCaCert.createRootCaCertAsync;

export interface CaCertSuiteManifest {
    certId: string,
    privateKeyId: string
}

export interface ICaCertSuite {
    getPrivateKey(requestContext: IRequestContext): IAsymmetricPrivateKey;
    getCertificate(): IRootCaCert;
}

export class CaCertSuite implements ICaCertSuite {
    private manifest: CaCertSuiteManifest;
    constructor(manifest: CaCertSuiteManifest) {
        this.manifest = manifest;
    }

    public getPrivateKey(requestContext: IRequestContext): IAsymmetricPrivateKey {
        // TODO: enhance authorization
        requestContext.authorize(SecretAuthorization.Action.readSecret, Authorization.Resource.readPrivateKey);
        let manifest = ManifestRepo.loadManifest<IAsymmetricPrivateKeyManifest>(this.manifest.privateKeyId);
        return loadPrivateKeyFromManifest(requestContext, manifest);
    }

    public getCertificate(): IRootCaCert {
        let manifest = ManifestRepo.loadManifest<IRootCaCertManifest>(this.manifest.certId);
        return new RootCaCert.RootCaCert(manifest);
    }
}

export module BuiltInCaCertSuites {
    const certDirPath = AppContext.getInstanceConfigPath().path("certs");
    const caPath = certDirPath.path("ca.json");
    const dbCaPath = certDirPath.path("db-ca.json");

    export function getCaCertSuiteManifest(): CaCertSuiteManifest {
        return require(caPath.fsPath) as CaCertSuiteManifest;
    }

    export function getDbCaCertSuiteManifest(): CaCertSuiteManifest {
        return require(dbCaPath.fsPath) as CaCertSuiteManifest;
    }

    export function setCaCertSuiteManifest(suite: CaCertSuiteManifest): void {
        caPath.ensureDirExists()
            .saveJsonConfig(suite);
    }

    export function setDbCaCertSuiteManifest(suite: CaCertSuiteManifest): void {
        dbCaPath.ensureDirExists()
            .saveJsonConfig(suite);
    }
}
