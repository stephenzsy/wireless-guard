import {
    AppContext,
    ConfigPath,
    Guid
} from "wireless-guard-common";

export interface DeployAppConfigDefinition extends AppContext.AppConfigDefinition {
    rootUserId: string;
    rootUserName: string;
}

export interface DeployAppConfig extends AppContext.AppConfig {
    rootUserId: Guid;
    rootUserName: string;
}

export function saveConfig(config: DeployAppConfig) {
    return AppContext.saveAppConfig("deploy", config, (config: DeployAppConfig, definition: DeployAppConfigDefinition): void => {
        definition.rootUserId = definition.rootUserId || config.rootUserId.toString();
        definition.rootUserName = definition.rootUserName || config.rootUserName;
    });
}

export function loadConfig(): DeployAppConfig {
    return AppContext.getAppConfig("deploy", (definition: DeployAppConfigDefinition, config: DeployAppConfig): void => {
        config.rootUserId = config.rootUserId || new Guid(definition.rootUserId);
        config.rootUserName = config.rootUserName || definition.rootUserName;
    });
}
