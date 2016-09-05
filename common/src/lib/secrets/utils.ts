
import Guid from "../common/guid";
import { IRequestContext } from "../request-context";
import {
    ICertSuite,
    IAsymmetricPrivateKey,
    IAsymmetricPrivateKeyManifest,
    IRootCaCert,
    IRootCaCertManifest,
    ICertificate,
    ICertificateManifest
} from "./secret-interface";
import ManifestRepo from "./manifest-repo";
import {
    createNewEcPrivateKeyAsync,
    createNewRsaPrivateKeyAsync,
    loadPrivateKeyFromManifest
} from "./private-key";
import {
    createRootCaCertAsync,
    loadRootCaCertFromManifest
} from "./ca-cert";
import {
    createServerCertAsync,
    createClientCertAsync,
    loadServerCertFromManifest,
    loadClientCertFromManifest
} from "./certificate";

export async function createEcRootCaCertSuiteAsync(requestContext: IRequestContext, subject: string): Promise<ICertSuite> {
    let privateKey = await createNewEcPrivateKeyAsync(requestContext);
    let cert = await createRootCaCertAsync(requestContext,
        privateKey,
        subject);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    }
}

export async function createRsaRootCaCertSuiteAsync(requestContext: IRequestContext, subject: string): Promise<ICertSuite> {
    let privateKey = await createNewRsaPrivateKeyAsync(requestContext);
    let cert = await createRootCaCertAsync(requestContext,
        privateKey,
        subject);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    }
}

export async function createRsaServerCertificateSuite(requestContext: IRequestContext,
    caOwnerRequestContext: IRequestContext,
    caCertSuite: ICertSuite,
    days: number,
    subject: string,
    subjectAltDnsNames: string[] = [],
    subjectAltIps: string[] = []): Promise<ICertSuite> {
    let privateKey = await createNewRsaPrivateKeyAsync(requestContext);
    let cert = await createServerCertAsync(requestContext,
        caOwnerRequestContext,
        privateKey,
        caCertSuite,
        days,
        subject,
        subjectAltDnsNames,
        subjectAltIps);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    };
}

export async function createRsaClientCertificate(requestContext: IRequestContext,
    caOwnerRequestContext: IRequestContext,
    caCertSuite: ICertSuite,
    days: number,
    subject: string): Promise<ICertSuite> {
    let privateKey = await createNewRsaPrivateKeyAsync(requestContext);
    let cert = await createClientCertAsync(requestContext,
        caOwnerRequestContext,
        privateKey,
        caCertSuite,
        days,
        subject);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    };
}

export function loadPrivateKey(requestContext: IRequestContext, id: Guid): IAsymmetricPrivateKey {
    let manifest = ManifestRepo.loadManifest<IAsymmetricPrivateKeyManifest>(id, requestContext.moduleName);
    return loadPrivateKeyFromManifest(requestContext, manifest);
};

export function loadRootCaCert(requestContext: IRequestContext, id: Guid): IRootCaCert {
    let manifest = ManifestRepo.loadManifest<IRootCaCertManifest>(id, requestContext.moduleName);
    return loadRootCaCertFromManifest(requestContext, manifest);
};

export function loadServerCert(requestContext: IRequestContext, id: Guid): ICertificate {
    let manifest = ManifestRepo.loadManifest<ICertificateManifest>(id, requestContext.moduleName);
    return loadServerCertFromManifest(requestContext, manifest);
};

export function loadClientCert(requestContext: IRequestContext, id: Guid): ICertificate {
    let manifest = ManifestRepo.loadManifest<ICertificateManifest>(id, requestContext.moduleName);
    return loadClientCertFromManifest(requestContext, manifest);
};
