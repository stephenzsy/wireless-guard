import {
    AppContext,
    ConfigPath,
    Uuid,
    Secrets
} from "wireless-guard-common";

export interface DeployAppConfig extends AppContext.AppConfig {
    rootUserId: string;
    rootUserName: string;
    dbUserId: string;
    dbUserName: string;
    rootCaCert?: Secrets.ICertSuite;
    dbCaCert?: Secrets.ICertSuite;
    dbServerCert?: Secrets.ICertSuite;
    dbClientCert?: Secrets.ICertSuite;
}

export function saveConfig(config: DeployAppConfig) {
    return AppContext.saveAppConfig("deploy", config);
}

export function loadConfig(): DeployAppConfig {
    return AppContext.getAppConfig<DeployAppConfig>("deploy");
}
