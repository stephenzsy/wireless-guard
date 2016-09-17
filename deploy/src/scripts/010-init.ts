import {
    AppContext,
    ConfigPath,
    Uuid,
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
    deploymentId: Uuid.v4(),
    deploymentTimestamp: new Date(),
    rootUserId: Uuid.v4(),
    rootUserName: "deploy@system",
    dbUserId: Uuid.v4(),
    dbUserName: "db@system"
};

saveConfig(config);
