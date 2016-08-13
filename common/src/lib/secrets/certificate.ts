import * as moment from "moment";
import * as fsExtra from "fs-extra";
import WGOpenssl from "wireless-guard-openssl";

import Guid from "../common/guid";
import AppContext from "../app-context";
import {
    Authorization as SecretAuthorization
} from "./secret";
import { CertBase, ICert, ICertManifest, getGuidSerial, ICertSuiteConfig } from "./cert-base";
import {
    IRequestContext
} from "../request-context";
import { IAsymmetricPrivateKey } from "./private-key";
import {
    CaCertSuite
} from "./ca-cert";
import ManifestRepo from "./manifest-repo";
import ConfigPath from "../config/config-path";

export module Authorization {
    export module Resource {
        export const createServerCert: string = "secret:server-cert::";
        export const createClientCert: string = "secret:client-cert::";
    }
}

export interface ICertificate extends ICert { }
export interface ICertificateManifest extends ICertManifest {
    caChainPemFilePath: string;
}

namespace Certs {
    class Cert extends CertBase<ICertificateManifest> implements ICertificate {
        constructor(manifest: ICertificateManifest) {
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

    export async function createCertAsync(requestContext: IRequestContext,
        manifest: ICertificateManifest,
        privateKey: IAsymmetricPrivateKey,
        caCertSuiteConfig: ICertSuiteConfig,
        days: number,
        subject: string,
        subjectAltDnsNames: string[],
        subjectAltIps: string[]): Promise<Cert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createServerCert);

        let dirPath: ConfigPath = new ConfigPath(manifest.secretsDirPath);
        // create csr
        let csrPath: ConfigPath = dirPath.path("csr.pem");
        await createCsr(csrPath, privateKey, subject);
        // v3 ext
        let extPath: ConfigPath = dirPath.path("server.ext");
        await writeV3Ext(extPath, subjectAltDnsNames, subjectAltIps)

        let crtPath: ConfigPath = dirPath.path("crt.pem");
        let caSuite = new CaCertSuite(caCertSuiteConfig);
        await signCertificate(
            requestContext,
            csrPath,
            crtPath,
            extPath,
            caSuite,
            manifest.id,
            days
        );
        manifest.expireAt = moment.utc().add({ days: days }).toISOString();
        manifest.pemFilePath = crtPath.fsPath;
        let caChainPath: ConfigPath = dirPath.path("chain.pem");
        fsExtra.copySync(caSuite.getCertificate().pemFilePath.fsPath, caChainPath.fsPath);
        manifest.caChainPemFilePath = caChainPath.fsPath;
        new ConfigPath(manifest.manifestPath).saveJsonConfig(manifest);
        requestContext.log("info", "Created server certificate: " + manifest.id);
        return new Cert(manifest);
    }

    async function writeV3Ext(configPath: ConfigPath, subjectAltDnsNames: string[], subjectAltIps: string[]) {
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
        }
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
        return writeFile(configPath.fsPath, lines.join("\n"));
    }

    export async function createServerCertAsync(requestContext: IRequestContext,
        privateKey: IAsymmetricPrivateKey,
        caCertSuiteConfig: ICertSuiteConfig,
        days: number,
        subject: string,
        subjectAltDnsNames: string[],
        subjectAltIps: string[]): Promise<Cert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createServerCert);
        let manifest: ICertificateManifest = ManifestRepo.initManifest(requestContext.userContext.user) as ICertificateManifest;
        return createCertAsync(requestContext,
            manifest,
            privateKey,
            caCertSuiteConfig,
            days,
            subject,
            subjectAltDnsNames,
            subjectAltIps);
    }

    export async function createClientCertAsync(requestContext: IRequestContext,
        configPath: ConfigPath,
        privateKey: IAsymmetricPrivateKey,
        caCertSuiteConfig: ICertSuiteConfig,
        days: number,
        subject: string,
        subjectAltDnsNames: string[],
        subjectAltIps: string[]): Promise<Cert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createServerCert);
        let manifest: ICertificateManifest = ManifestRepo.initManifest(requestContext.userContext.user, configPath) as ICertificateManifest;
        return createCertAsync(requestContext,
            manifest,
            privateKey,
            caCertSuiteConfig,
            days,
            subject,
            subjectAltDnsNames,
            subjectAltIps);
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

    async function signCertificate(
        caOwnerRequestContext: IRequestContext,
        csrInputPath: ConfigPath,
        crtOutputPath: ConfigPath,
        extFilePath: ConfigPath,
        caCertSuite: CaCertSuite,
        manifestId: string,
        days: number
    ): Promise<void> {
        return WGOpenssl.x509({
            req: true,
            in: csrInputPath.fsPath,
            out: crtOutputPath.fsPath,
            setSerial: getGuidSerial(new Guid(manifestId)),
            digest: "sha384",
            extfile: extFilePath.fsPath,
            extensions: "v3_req",
            CAKey: caCertSuite.getPrivateKey(caOwnerRequestContext).pemFilePath.fsPath,
            CA: caCertSuite.getCertificate().pemFilePath.fsPath,
            days: days
        });
    }
}

export async function createServerCertAsync(requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    certSuiteConfig: ICertSuiteConfig,
    days: number,
    subject: string,
    subjectAltDnsNames: string[] = [],
    subjectAltIps: string[] = []): Promise<ICertificate> {
    return Certs.createServerCertAsync(requestContext,
        privateKey,
        certSuiteConfig,
        days,
        subject,
        subjectAltDnsNames, subjectAltIps);
}

export async function createClientCertAsync(requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    certSuiteConfig: ICertSuiteConfig,
    days: number,
    subject: string,
    configPath?: ConfigPath
): Promise<ICertificate> {
    return Certs.createClientCertAsync(requestContext,
        configPath,
        privateKey,
        certSuiteConfig,
        days,
        subject,
        [], []);
}

export module BuiltInCertSuites {
    const certDirPath = AppContext.getInstanceConfigPath().path("certs");
    const dbServerPath = certDirPath.path("db-server.json");

    export function getDbServerCertSuiteConfig(): ICertSuiteConfig {
        return require(dbServerPath.fsPath) as ICertSuiteConfig;
    }

    export function setDbServerCertSuiteConfig(suite: ICertSuiteConfig): void {
        dbServerPath.ensureDirExists().saveJsonConfig(suite);
    }
}
