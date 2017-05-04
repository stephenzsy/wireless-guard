import { ConfigPath } from "./config-path";
import { IServicePrincipal } from "../principals/service-principal";
import { PrincipalsConfig, ExtendedPrincipalsConfig } from "./principals-config";

export class AppConfig {
    private readonly root: ConfigPath;
    private readonly _principals: PrincipalsConfig;

    constructor(rootConfigPath: ConfigPath) {
        this.root = rootConfigPath;
        this._principals = new PrincipalsConfig();
    }

    public get principals(): PrincipalsConfig {
        return this._principals;
    }
}

export class ExtendedAppConfig extends AppConfig {
    private readonly _extendedPrincipals: ExtendedPrincipalsConfig;

    constructor(rootConfigPath: ConfigPath) {
        super(rootConfigPath);
        this._extendedPrincipals = new ExtendedPrincipalsConfig();
    }

    public get principals(): ExtendedPrincipalsConfig {
        return this._extendedPrincipals;
    }
}