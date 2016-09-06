import Guid from "../common/guid";
import ConfigPath from "../config/config-path"
import { PolicyDefinition } from "../policies";

export interface ISecret {
    id: Guid;
}

export interface IManifest {
    id: string;
    ownerId: string;
    /**
     * Manifest absolute path
     */
    manifestPath: string;
    secretsDirPath: string;
    createdAt: string;
}

export interface IAsymmetricPrivateKey extends ISecret {
    pemFilePath: ConfigPath;
}

export interface IAsymmetricPrivateKeyManifest extends IManifest {
    algorithm: "ec" | "rsa";
    pemFilePath: string;
}

export interface ICertBase extends ISecret {
    /**
     * X509 certificate subject
     */
    subject: string;
    expiresAt: Date;
    pemFilePath: ConfigPath;
}

export interface ICertManifestBase extends IManifest {
    /**
     * X509 certificate subject
     */
    subject: string;
    expiresAt: string;
    pemFilePath: string;
}

export interface ICertificate extends ICertBase {
    /**
     * X509 certificate issuer
     */
    issuer: string;
    caChainPemFilePath: ConfigPath;
}

export interface ICertificateManifest extends ICertManifestBase {
    /**
     * X509 certificate issuer
     */
    issuer: string;
    caChainPemFilePath: string;
}

export interface IRootCaCert extends ICertBase { }
export interface IRootCaCertManifest extends ICertManifestBase { }

export interface ICertSuite {
    certId: Guid,
    privateKeyId: Guid
}

export interface ICertSuiteManifest {
    certId: string,
    privateKeyId: string
}
