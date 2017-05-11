import { ConfigPath } from "./config-path";
import { IServicePrincipal } from "../principals/service-principal";
import { PrincipalsConfig, ExtendedPrincipalsConfig } from "./principals-config";
import { MaterialsConfig } from "./materials-config";

export interface IAppConfig {
    readonly principals: PrincipalsConfig;
    readonly materials: MaterialsConfig;
}

export interface IExtendedAppConfig extends IAppConfig {
    readonly principals: ExtendedPrincipalsConfig;
}

class AppConfig implements IAppConfig {
    private readonly root: ConfigPath;
    private readonly _principals: PrincipalsConfig;
    private readonly _materials: MaterialsConfig;

    constructor(rootConfigPath: ConfigPath) {
        this.root = rootConfigPath;
        this._principals = new PrincipalsConfig(rootConfigPath);
        this._materials = new MaterialsConfig(rootConfigPath);
    }

    public get principals(): PrincipalsConfig {
        return this._principals;
    }

    public get materials(): MaterialsConfig {
        return this._materials;
    }
}

class ExtendedAppConfig extends AppConfig implements IExtendedAppConfig {
    private readonly _extendedPrincipals: ExtendedPrincipalsConfig;

    constructor(rootConfigPath: ConfigPath) {
        super(rootConfigPath);
        this._extendedPrincipals = new ExtendedPrincipalsConfig(rootConfigPath);
    }

    public get principals(): ExtendedPrincipalsConfig {
        return this._extendedPrincipals;
    }
}

var appConfig: AppConfig;

export function initAppConfig(configPath: ConfigPath): IAppConfig {
    if (!appConfig) {
        appConfig = new AppConfig(configPath);
    }
    return appConfig;
}

export function initExtendedAppConfig(configPath: ConfigPath): IExtendedAppConfig {
    if (!appConfig) {
        appConfig = new ExtendedAppConfig(configPath);
        return appConfig as ExtendedAppConfig;
    } else if (appConfig instanceof ExtendedAppConfig) {
        return appConfig;
    }
    throw "AppConfig initialized is not extended";
}

export function getAppConfig(): IAppConfig {
    return appConfig;
}
