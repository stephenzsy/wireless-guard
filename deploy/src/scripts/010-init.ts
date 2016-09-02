import {
    AppContext,
    ConfigPath,
    Guid,
    Users
} from "wireless-guard-common";
import {
    DeployAppConfig,
    saveConfig
} from "../lib/config";

if (!AppContext.hasConfig()) {
    throw "Config must be specified";
}

let config: DeployAppConfig = {
    deploymentId: new Guid(),
    deploymentTimestamp: new Date(),
    rootUserId: new Guid(),
    rootUserName: "deploy@system"
};

saveConfig(config);
