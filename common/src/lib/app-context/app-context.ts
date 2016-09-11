import * as fs from "fs";

import Uuid from "../common/uuid";
import ConfigPath from "../config/config-path";
import { IUser } from "../users";
import UserContributions from "../users/contributions";
import { IRequestContext } from "../request-context";
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

    export interface AppConfigDefinition {
        deploymentId: string;
        deploymentTimestamp: string;
    }

    export interface AppConfig {
        deploymentId: Uuid;
        deploymentTimestamp: Date;
    }

    const settingsConfigDir: string = (process.env as WGProcessEnv).WG_SETTINGS_CONFIG_DIR;
    const instanceConfigDir: string = (process.env as WGProcessEnv).WG_INSTANCE_CONFIG_DIR;

    var appConfigs: Map<ModuleName, AppConfig> = new Map();

    function defaultConvertAppConfigFromDefinition<T extends AppConfig, TDefinition extends AppConfigDefinition>(
        definition: TDefinition,
        config: T): void {
        config.deploymentId = config.deploymentId || new Uuid(definition.deploymentId);
        config.deploymentTimestamp = config.deploymentTimestamp || new Date(definition.deploymentTimestamp);
    }

    function defaultConvertAppConfigToDefinition<T extends AppConfig, TDefinition extends AppConfigDefinition>(
        config: T,
        definition: TDefinition): void {
        definition.deploymentId = definition.deploymentId || config.deploymentId.toString();
        definition.deploymentTimestamp = definition.deploymentTimestamp || config.deploymentTimestamp.toISOString();
    }

    export function getAppConfig<T extends AppConfig, TDefinition extends AppConfigDefinition>(
        moduleName: ModuleName,
        fromDefinition: (definition: TDefinition, config: T) => void): T {
        let appConfig: T = appConfigs.get(moduleName) as T;
        if (!appConfigs[moduleName]) {
            let configPath = getInstanceConfigPath(moduleName).path("app.json");
            let configDefinition: TDefinition = require(configPath.fsPath);
            appConfig = {} as T
            fromDefinition(configDefinition, appConfig);
            defaultConvertAppConfigFromDefinition(configDefinition, appConfig);
            appConfigs.set(moduleName, appConfig);
        }
        return appConfig;
    }

    export function saveAppConfig<T extends AppConfig, TDefinition extends AppConfigDefinition>(
        moduleName: ModuleName,
        appConfig: T,
        toDefinition: (config: T, definition: TDefinition) => void): void {

        let configPath = getInstanceConfigPath(moduleName).path("app.json");
        let definition: TDefinition = {} as TDefinition;
        toDefinition(appConfig, definition);
        defaultConvertAppConfigToDefinition(appConfig, definition);
        configPath.ensureDirExists().saveJsonConfig(definition);
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
        userId: Uuid,
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

    export function newContributedUserRequestContext(moduleName: ModuleName, userId: Uuid, resolveGroups: boolean = true): IRequestContext {
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
