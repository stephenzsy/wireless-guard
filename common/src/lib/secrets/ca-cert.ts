import {
    ISecret,
    IManifest
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
import Guid from "../common/guid";
import ManifestRepo from "./manifest-repo";
import WGOpenssl from "wireless-guard-openssl";
import ConfigPath from "../config/config-path";
import * as moment from "moment";
import {
    IAsymmetricPrivateKey,
    IAsymmetricPrivateKeyManifest,
    loadPrivateKeyFromManifest,
    Authorization as PrivateKeyAuthorizationConstants
} from "./private-key";
import { CertBase, ICert, ICertManifest, getGuidSerial, ICertSuiteConfig } from "./cert-base";
import {
    toPolicyReference
} from "../policies/utils";

namespace Authorization {
    export const typeRootCa: string = "root-ca";
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

export interface ICaCertSuite {
    getPrivateKey(requestContext: IRequestContext): IAsymmetricPrivateKey;
    getCertificate(requestContext: IRequestContext): IRootCaCert;
}

export class CaCertSuite implements ICaCertSuite {
    private config: ICertSuiteConfig;
    constructor(config: ICertSuiteConfig) {
        this.config = config;
    }

    public getPrivateKey(requestContext: IRequestContext): IAsymmetricPrivateKey {
        requestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: PrivateKeyAuthorizationConstants.typePrivateKey,
                identifierType: IdentifierType.Id,
                identifier: "*"
            },
            { requireElevated: true });

        let manifest = ManifestRepo.loadManifest<IAsymmetricPrivateKeyManifest>(this.config.privateKeyId, requestContext.moduleName);
        let authPolicy = CaCertSuite.authorizeAccessPrivateKey(requestContext, manifest);
        if (!authPolicy || !authPolicy.allow) {
            throw new PolicyDeniedError(authPolicy);
        }
        return loadPrivateKeyFromManifest(requestContext, manifest);
    }

    private static authorizeAccessPrivateKey(requestContext: IRequestContext, manifest: IManifest): IPolicyReference {
        for (let policyDefinition of manifest.policies) {
            let policy = new Policy(policyDefinition);
            if (policy.match(
                AuthorizationConstants.Action.readSecret,
                {
                    type: UsersAuthorizationConstants.typeUser,
                    identifierType: IdentifierType.Id,
                    identifier: requestContext.userContext.user.id.toString()
                },
                {
                    type: PrivateKeyAuthorizationConstants.typePrivateKey,
                    identifierType: IdentifierType.Id,
                    identifier: manifest.id
                }
            )) {
                return toPolicyReference(policy);
            }
        }
    }

    public getCertificate(requestContext: IRequestContext): IRootCaCert {
        requestContext.authorize(
            AuthorizationConstants.Action.readSecret,
            {
                type: Authorization.typeRootCa,
                identifierType: IdentifierType.Id,
                identifier: "*"
            },
            { requireElevated: true });
        let manifest = ManifestRepo.loadManifest<IRootCaCertManifest>(this.config.certId, requestContext.moduleName);
        return new RootCaCert.RootCaCert(manifest);
    }
}
