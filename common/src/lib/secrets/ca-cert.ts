import {
    ISecret,
    IManifest,
    IAsymmetricPrivateKey,
    IAsymmetricPrivateKeyManifest,
    IRootCaCert,
    IRootCaCertManifest,
    ICertSuite
} from "./secret-interface"
import SecretBase, { AuthorizationConstants } from "./secret-base";
import {
    IdentifierType,
    IPolicyReference
} from "../policies"
import Policy from "../policies/policy";
import {
    IUser,
    AuthorizationConstants as UsersAuthorizationConstants
} from "../users";
import AppContext from "../app-context";
import {
    IRequestContext,
    PolicyDeniedError
} from "../request-context";
import Uuid from "../common/uuid";
import ManifestRepo from "./manifest-repo";
import WGOpenssl from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";
import * as moment from "moment";
import {
    loadPrivateKeyFromManifest,
    Authorization as PrivateKeyAuthorizationConstants
} from "./private-key";
import { CertBase, getGuidSerial } from "./cert-base";
import {
    toPolicyReference
} from "../policies/utils";

namespace Authorization {
    export const typeRootCa: string = "root-ca";
}

class RootCaCert extends CertBase<IRootCaCertManifest> implements IRootCaCert {
    constructor(manifest: IRootCaCertManifest) {
        super(manifest, Authorization.typeRootCa);
    }
}

export async function createRootCaCertAsync(requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    subject: string): Promise<IRootCaCert> {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typeRootCa,
            identifierType: IdentifierType.Id,
            identifier: "*"
        },
        { requireElevated: true });

    let manifest: IRootCaCertManifest = ManifestRepo.initManifest(requestContext.userContext.user,
        requestContext.moduleName) as IRootCaCertManifest;
    // expiry to be actual expiry - 1 day
    let expiryDateStr: string = moment.utc().add({ days: 364 }).toISOString();
    manifest.expiresAt = expiryDateStr;
    manifest.subject = subject;
    let certPath = new ConfigPath(manifest.secretsDirPath).path("crt.pem");
    await WGOpenssl.req({
        new: true,
        x509: true,
        extensions: "v3_ca",
        key: privateKey.pemFilePath.fsPath,
        setSerial: getGuidSerial(new Uuid(manifest.id)),
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

export class CaCertSuite {
    private config: ICertSuite;
    private _rootCaCert: RootCaCert;

    constructor(config: ICertSuite) {
        this.config = config;
    }

    private getPrivateKey(caOwnerRequestContext: IRequestContext): IAsymmetricPrivateKey {
        caOwnerRequestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: PrivateKeyAuthorizationConstants.typePrivateKey,
                identifierType: IdentifierType.Id,
                identifier: this.config.privateKeyId.toString()
            },
            { requireElevated: true });

        let manifest = ManifestRepo.loadManifest<IAsymmetricPrivateKeyManifest>(this.config.privateKeyId, caOwnerRequestContext.moduleName);
        return loadPrivateKeyFromManifest(caOwnerRequestContext, manifest);
    }

    public getCertificate(requestContext: IRequestContext): IRootCaCert {
        requestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: Authorization.typeRootCa,
                identifierType: IdentifierType.Id,
                identifier: this.config.certId.toString()
            },
            { requireElevated: true });
        if (this._rootCaCert) {
            return this._rootCaCert;
        }
        let manifest = ManifestRepo.loadManifest<IRootCaCertManifest>(this.config.certId, requestContext.moduleName);
        this._rootCaCert = new RootCaCert(manifest);
        return this._rootCaCert;
    }

    public async signCertificate(
        requestContext: IRequestContext,
        caOwnerRequestContext: IRequestContext,
        csrInputPath: ConfigPath,
        crtOutputPath: ConfigPath,
        extFilePath: ConfigPath,
        manifestId: string,
        days: number
    ): Promise<void> {
        requestContext.authorize(
            AuthorizationConstants.Action.signCertificate,
            {
                type: Authorization.typeRootCa,
                identifierType: IdentifierType.Id,
                identifier: this.config.certId.toString()
            },
            { requireElevated: true });
        return WGOpenssl.x509({
            req: true,
            in: csrInputPath.fsPath,
            out: crtOutputPath.fsPath,
            setSerial: getGuidSerial(new Uuid(manifestId)),
            digest: "sha384",
            extfile: extFilePath.fsPath,
            extensions: "v3_req",
            CAKey: this.getPrivateKey(caOwnerRequestContext).pemFilePath.fsPath,
            CA: this.getCertificate(requestContext).pemFilePath.fsPath,
            days: days
        });
    }
}

export function loadRootCaCertFromManifest(requestContext: IRequestContext, manifest: IRootCaCertManifest): IRootCaCert {
    requestContext.authorize(
        AuthorizationConstants.Action.readSecret,
        {
            type: Authorization.typeRootCa,
            identifierType: IdentifierType.Id,
            identifier: manifest.id
        },
        { requireElevated: true });
    return new RootCaCert(manifest);
}
