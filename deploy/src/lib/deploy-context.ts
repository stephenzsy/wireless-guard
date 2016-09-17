import {
    Uuid,
    AppContext,
    Users,
    Policies,
    Secrets,
    ConfigPath
} from "wireless-guard-common";
import {
    DeployAppConfig,
    loadConfig
} from "./config";

const deployAppConfig: DeployAppConfig = loadConfig();

const allowAllPolicy: Policies.IPolicy = AppContext.contributePolicy({
    id: Uuid.v4(),
    name: "deploy-allow-all",
    actions: "*",
    effect: "allow",
    resources: "*"
});

export const rootUser: Users.IUser = AppContext.contributeUser("deploy", deployAppConfig.rootUserId, deployAppConfig.rootUserName, [
    allowAllPolicy
]);

export const dbUser: Users.IUser = AppContext.contributeUser("deploy", deployAppConfig.dbUserId, deployAppConfig.dbUserName, [
    allowAllPolicy
]);
