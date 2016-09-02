import {
    Guid,
    AppContext,
    Users,
} from "wireless-guard-common";
import {
    loadConfig
} from "./config";

let deployAppConfig = loadConfig();

export const rootUser: Users.IUser = AppContext.contributeUser("deploy", deployAppConfig.rootUserId, deployAppConfig.rootUserName);
