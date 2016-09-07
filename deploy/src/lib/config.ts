import {
    AppContext,
    ConfigPath,
    Guid,
    Secrets
} from "wireless-guard-common";

export interface DeployAppConfigDefinition extends AppContext.AppConfigDefinition {
    rootUserId: string;
    rootUserName: string;
    dbUserId: string;
    dbUserName: string;
    rootCaCert?: Secrets.ICertSuiteManifest;
    dbCaCert?: Secrets.ICertSuiteManifest;
    dbServerCert?: Secrets.ICertSuiteManifest;
    dbClientCert?: Secrets.ICertSuiteManifest;
}

export interface DeployAppConfig extends AppContext.AppConfig {
    rootUserId: Guid;
    rootUserName: string;
    dbUserId: Guid;
    dbUserName: string;
    rootCaCert?: Secrets.ICertSuite;
    dbCaCert?: Secrets.ICertSuite;
    dbServerCert?: Secrets.ICertSuite;
    dbClientCert?: Secrets.ICertSuite;
}

export function saveConfig(config: DeployAppConfig) {
    return AppContext.saveAppConfig("deploy", config, (config: DeployAppConfig, definition: DeployAppConfigDefinition): void => {
        definition.rootUserId = definition.rootUserId || config.rootUserId.toString();
        definition.rootUserName = definition.rootUserName || config.rootUserName;
        definition.dbUserId = definition.dbUserId || config.dbUserId.toString()
        definition.dbUserName = definition.dbUserName || config.dbUserName;
        if (config.rootCaCert) {
            definition.rootCaCert = definition.rootCaCert || {
                certId: config.rootCaCert.certId.toString(),
                privateKeyId: config.rootCaCert.privateKeyId.toString()
            };
        }
        if (config.dbCaCert) {
            definition.dbCaCert = definition.dbCaCert || {
                certId: config.dbCaCert.certId.toString(),
                privateKeyId: config.dbCaCert.privateKeyId.toString()
            };
        }
        if (config.dbServerCert) {
            definition.dbServerCert = definition.dbServerCert || {
                certId: config.dbServerCert.certId.toString(),
                privateKeyId: config.dbServerCert.privateKeyId.toString()
            };
        }
        if (config.dbClientCert) {
            definition.dbClientCert = definition.dbClientCert || {
                certId: config.dbClientCert.certId.toString(),
                privateKeyId: config.dbClientCert.privateKeyId.toString()
            };
        }
    });
}

export function loadConfig(): DeployAppConfig {
    return AppContext.getAppConfig("deploy", (definition: DeployAppConfigDefinition, config: DeployAppConfig): void => {
        config.rootUserId = config.rootUserId || new Guid(definition.rootUserId);
        config.rootUserName = config.rootUserName || definition.rootUserName;
        config.dbUserId = config.dbUserId || new Guid(definition.dbUserId);
        config.dbUserName = config.dbUserName || definition.dbUserName;
        if (definition.rootCaCert) {
            config.rootCaCert = config.rootCaCert || {
                certId: new Guid(definition.rootCaCert.certId),
                privateKeyId: new Guid(definition.rootCaCert.privateKeyId)
            };
        }
        if (definition.dbCaCert) {
            config.dbCaCert = config.dbCaCert || {
                certId: new Guid(definition.dbCaCert.certId),
                privateKeyId: new Guid(definition.dbCaCert.privateKeyId)
            };
        }
        if (definition.dbServerCert) {
            config.dbServerCert = config.dbServerCert || {
                certId: new Guid(definition.dbServerCert.certId),
                privateKeyId: new Guid(definition.dbServerCert.privateKeyId)
            };
        }
        if (definition.dbClientCert) {
            config.dbClientCert = config.dbClientCert || {
                certId: new Guid(definition.dbClientCert.certId),
                privateKeyId: new Guid(definition.dbClientCert.privateKeyId)
            };
        }
    });
}
