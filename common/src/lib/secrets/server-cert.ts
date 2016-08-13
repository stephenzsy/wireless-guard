import * as moment from "moment";
import * as fsExtra from "fs-extra";
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
        subject: string,
        subjectAltDnsNames: string[],
        subjectAltIps: string[]): Promise<ServerCert> {
        requestContext.authorize(SecretAuthorization.Action.createSecret, Authorization.Resource.createServerCert);

        let manifest: IServerCertManifest = ManifestRepo.initManifest(requestContext.userContext.user) as IServerCertManifest;
        let dirPath: ConfigPath = new ConfigPath(manifest.secretsDirPath);
        // create csr
        let csrPath: ConfigPath = dirPath.path("csr.pem");
        await createCsr(csrPath, privateKey, subject);
        // v3 ext
        let extPath: ConfigPath = dirPath.path("server.ext");
        await writeV3Ext(extPath, subjectAltDnsNames, subjectAltIps)

        let crtPath: ConfigPath = dirPath.path("crt.pem");
        await signCertificate(
            requestContext,
            csrPath,
            crtPath,
            extPath,
            caSuite,
            manifest.id,
            30
        );
        return null;
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
        caCertSuiteManifest: CaCertSuiteManifest,
        manifestId: string,
        days: number
    ): Promise<void> {
        let certSuite = new CaCertSuite(caCertSuiteManifest);
        return WGOpenssl.x509({
            req: true,
            in: csrInputPath.fsPath,
            out: crtOutputPath.fsPath,
            setSerial: getGuidSerial(new Guid(manifestId)),
            digest: "sha384",
            extfile: extFilePath.fsPath,
            extensions: "v3_req",
            CAKey: certSuite.getPrivateKey(caOwnerRequestContext).pemFilePath.fsPath,
            CA: certSuite.getCertificate().pemFilePath.fsPath,
            days: days
        });
    }
}


export async function createServerCertAsync(requestContext: IRequestContext,
    privateKey: IAsymmetricPrivateKey,
    caSuiteManifest: CaCertSuiteManifest,
    subject: string,
    subjectAltDnsNames: string[] = [],
    subjectAltIps: string[] = []): Promise<IServerCert> {
    return ServerCerts.createServerCertAsync(requestContext,
        privateKey, caSuiteManifest, subject, subjectAltDnsNames, subjectAltIps);
}
