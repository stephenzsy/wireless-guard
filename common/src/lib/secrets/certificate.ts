import * as moment from "moment";
import * as fsExtra from "fs-extra";
import WGOpenssl from "wireless-guard-openssl";

import Guid from "../common/guid";
import AppContext from "../app-context";
import {
    AuthorizationConstants
} from "./secret-base";
import { CertBase, getGuidSerial } from "./cert-base";
import {
    IRequestContext
} from "../request-context";
import {
    IAsymmetricPrivateKey,
    ICertificate,
    ICertificateManifest,
    ICertSuite
} from "./secret-interface";
import {
    CaCertSuite
} from "./ca-cert";
import ManifestRepo from "./manifest-repo";
import ConfigPath from "../config/config-path";
import { IdentifierType } from "../policies";

export module Authorization {
    export const typeServerCert: string = "server-cert";
    export const typeClientCert: string = "client-cert";
}

class Cert extends CertBase<ICertificateManifest> implements ICertificate {
    constructor(manifest: ICertificateManifest) {
        super(manifest);
    }

    public get issuer(): string {
        return this.manifest.issuer;
    }

    public get caChainPemFilePath(): ConfigPath {
        return new ConfigPath(this.manifest.caChainPemFilePath);
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

async function createCertAsync(requestContext: IRequestContext,
    caOwnerRequestContext: IRequestContext,
    manifest: ICertificateManifest,
    privateKey: IAsymmetricPrivateKey,
    caCertSuiteConfig: ICertSuite,
    days: number,
    subject: string,
    subjectAltDnsNames: string[] = [],
    subjectAltIps: string[] = []): Promise<Cert> {

    let dirPath: ConfigPath = new ConfigPath(manifest.secretsDirPath);
    // create csr
    let csrPath: ConfigPath = dirPath.path("csr.pem");
    await createCsr(csrPath, privateKey, subject);
    // v3 ext
    let extPath: ConfigPath = dirPath.path("server.ext");
    await writeV3Ext(extPath, subjectAltDnsNames, subjectAltIps)

    let crtPath: ConfigPath = dirPath.path("crt.pem");
    let caSuite = new CaCertSuite(caCertSuiteConfig);
    await caSuite.signCertificate(
        requestContext,
        caOwnerRequestContext,
        csrPath,
        crtPath,
        extPath,
        manifest.id,
        days
    );
    manifest.issuer = caSuite.getCertificate(requestContext).subject;
    manifest.expiresAt = moment.utc().add({ days: days }).toISOString();
    manifest.pemFilePath = crtPath.fsPath;
    manifest.subject = subject;
    let caChainPath: ConfigPath = dirPath.path("chain.pem");
    fsExtra.copySync(caSuite.getCertificate(requestContext).pemFilePath.fsPath, caChainPath.fsPath);
    manifest.caChainPemFilePath = caChainPath.fsPath;
    new ConfigPath(manifest.manifestPath).saveJsonConfig(manifest);
    requestContext.log("info", "Created server certificate: " + manifest.id);
    return new Cert(manifest);
}

async function writeV3Ext(configPath: ConfigPath, subjectAltDnsNames: string[] = [], subjectAltIps: string[] = []) {
    var lines: string[] = [
        '[ v3_req ]',
        'subjectKeyIdentifier = hash',
        'authorityKeyIdentifier	= keyid,issuer',
        'basicConstraints	= CA:false'
    ];
    if (subjectAltDnsNames.length > 0 || subjectAltIps.length > 0) {
        lines = lines.concat([
            'subjectAltName = @alt_names',
            '',
            '[ alt_names ]'
        ]);
        {
            let counter: number = 0;
            subjectAltDnsNames.forEach(dnsName => {
                ++counter;
                lines.push('DNS.' + counter + ' = ' + dnsName);
            });
        }
        {
            let counter: number = 0;
            subjectAltIps.forEach(ip => {
                ++counter;
                lines.push('IP.' + counter + ' = ' + ip);
            });
        }
    }
    return writeFile(configPath.fsPath, lines.join("\n"));
}

export async function createServerCertAsync(requestContext: IRequestContext,
    caOwnerRequestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    caCertSuiteConfig: ICertSuite,
    days: number,
    subject: string,
    subjectAltDnsNames: string[],
    subjectAltIps: string[]): Promise<ICertificate> {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typeServerCert,
            identifierType: IdentifierType.Id,
            identifier: "*"
        },
        { requireElevated: true });
    let manifest: ICertificateManifest = ManifestRepo.initManifest(requestContext.userContext.user,
        requestContext.moduleName) as ICertificateManifest;
    return createCertAsync(requestContext,
        caOwnerRequestContext,
        manifest,
        privateKey,
        caCertSuiteConfig,
        days,
        subject,
        subjectAltDnsNames,
        subjectAltIps);
}

export async function createClientCertAsync(requestContext: IRequestContext,
    caOwnerRequestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    caCertSuiteConfig: ICertSuite,
    days: number,
    subject: string): Promise<ICertificate> {
    requestContext.authorize(
        AuthorizationConstants.Action.createSecret,
        {
            type: Authorization.typeClientCert,
            identifierType: IdentifierType.Id,
            identifier: "*"
        },
        { requireElevated: true });
    let manifest: ICertificateManifest = ManifestRepo.initManifest(requestContext.userContext.user,
        requestContext.moduleName) as ICertificateManifest;
    return createCertAsync(requestContext,
        caOwnerRequestContext,
        manifest,
        privateKey,
        caCertSuiteConfig,
        days,
        subject);
}

async function writeFile(path: string, content: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fsExtra.writeFile(path, content, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function loadCertFromManifest(requestContext: IRequestContext, manifest: ICertificateManifest, authorizationResourceType: string): ICertificate {
    requestContext.authorize(
        AuthorizationConstants.Action.readSecret,
        {
            type: authorizationResourceType,
            identifierType: IdentifierType.Id,
            identifier: manifest.id
        },
        { requireElevated: true });
    return new Cert(manifest);
}

export function loadServerCertFromManifest(requestContext: IRequestContext, manifest: ICertificateManifest): ICertificate {
    return loadCertFromManifest(requestContext, manifest, Authorization.typeServerCert);
}

export function loadClientCertFromManifest(requestContext: IRequestContext, manifest: ICertificateManifest): ICertificate {
    return loadCertFromManifest(requestContext, manifest, Authorization.typeClientCert);
}
