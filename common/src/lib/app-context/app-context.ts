import * as fs from "fs";

import ConfigPath from "../config/config-path";
import { IUser } from "../users";
import UserContributions from "../users/contributions";
import {
    IRequestContext,
    IService
} from "../request-context/interfaces";
import { IPolicy, PolicyDefinition } from "../policies";
import Policy from "../policies/policy";
import RequestContext from "../request-context/request-context";
import UserContext from "../request-context/user-context";

interface WGProcessEnv {
    WG_SETTINGS_CONFIG_DIR: string;
    WG_INSTANCE_CONFIG_DIR: string;
}

export module AppContext {

    export type ModuleName = "deploy" | "data-access";

    export interface AppConfig {
        deploymentId: string;
        deploymentTimestamp: Date;
    }

    const settingsConfigDir: string = (process.env as WGProcessEnv).WG_SETTINGS_CONFIG_DIR;
    const instanceConfigDir: string = (process.env as WGProcessEnv).WG_INSTANCE_CONFIG_DIR;

    var appConfigs: Map<ModuleName, AppConfig> = new Map();

    export function getAppConfig<T extends AppConfig>(
        moduleName: ModuleName): T {
        let appConfig: T = appConfigs.get(moduleName) as T;
        if (!appConfigs[moduleName]) {
            appConfig = getInstanceConfigPath(moduleName).path("app.json").loadJsonConfig<T>();
            appConfigs.set(moduleName, appConfig);
        }
        return appConfig;
    }

    export function saveAppConfig<T extends AppConfig>(
        moduleName: ModuleName,
        appConfig: T): void {

        let configPath = getInstanceConfigPath(moduleName).path("app.json");
        configPath.ensureDirExists().saveJsonConfig(appConfig);
        appConfigs.set(moduleName, appConfig);
    }

    export function hasConfig(): boolean {
        return (settingsConfigDir &&
            instanceConfigDir &&
            fs.statSync(settingsConfigDir).isDirectory() &&
            fs.statSync(instanceConfigDir).isDirectory()) ? true : false;
    }

    export function getSettingsConfigPath(): ConfigPath {
        return new ConfigPath(settingsConfigDir);
    }

    const rootInstanceConfigPath = new ConfigPath(instanceConfigDir);
    export function getInstanceConfigPath(moduleName: ModuleName): ConfigPath {
        return rootInstanceConfigPath.path(moduleName);
    }

    export function getConfig<T>(path: ConfigPath): T {
        return path.loadJsonConfig() as T;
    }

    export function contributePolicy(policyDefinition: PolicyDefinition): IPolicy {
        return new Policy(policyDefinition);
    }

    const contributedUsers: Map<ModuleName, UserContributions> = new Map();
    export function contributeUser(
        moduleName: ModuleName,
        userId: string,
        userName: string,
        policies: IPolicy[]): IUser {
        let contributions = contributedUsers.get(moduleName);
        if (!contributions) {
            contributions = new UserContributions();
            contributedUsers.set(moduleName, contributions);
        }
        let user = contributions.contributeUser(userId, userName);
        user.setPolicies(policies);
        return user;
    }

    export function newContributedUserRequestContext(moduleName: ModuleName,
        userId: string,
        resolveGroups: boolean = true): IRequestContext {
        let contributions = contributedUsers.get(moduleName);
        if (!contributions) {
            throw `Module: ${moduleName} does not contain contributed user ${userId.toString()}`;
        }
        let user = contributions.getContributedUser(userId);
        if (!user) {
            throw `Module: ${moduleName} does not contain contributed user ${userId.toString()}`;
        }
        let requestContext = new RequestContext();
        requestContext.moduleName = moduleName;
        requestContext.userContext = new UserContext(user, resolveGroups);
        return requestContext;
    }
}

export default AppContext;
