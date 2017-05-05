/// <reference path="../types.d.ts" />

import { ConfigPath } from "./config-path";
import { IPrincipal } from "../principals/interfaces";
import { PrincipalsStore } from "../principals/principals-store";
import { IServicePrincipal, ServicePrincipal, IServicePrincipalManifest } from "../principals/service-principal";

export class PrincipalsConfig {
    protected configPath: ConfigPath;
    protected store: PrincipalsStore;
    protected wellKnownServicePrincipals: StringMap<IServicePrincipal> = {};

    constructor(configPath: ConfigPath) {
        this.configPath = configPath.path("principals");
    }

    public getWellKnownServicePrincipal<T extends string>(
        identifier: T,
        refreshFromSource: boolean = false,
        forceRefresh: boolean = false): IServicePrincipal | undefined {
        let currentPrincipal: IServicePrincipal | undefined = this.wellKnownServicePrincipals[identifier];
        if (refreshFromSource) {
            if (!currentPrincipal || forceRefresh) {
                try {
                    let manifest = this.configPath.path(identifier + ".json")
                        .ensureDirExists()
                        .loadJsonConfig<IServicePrincipalManifest>();
                    currentPrincipal = new ServicePrincipal(manifest);
                    this.wellKnownServicePrincipals[identifier] = currentPrincipal;
                    this.store.add(currentPrincipal);
                } catch (e) {
                    // does not exist
                    currentPrincipal = undefined;
                }
            }
        }
        return currentPrincipal;
    }

    public resolvePrincipal(principalId: string): IPrincipal | undefined {
        return this.store.resolve(principalId);
    }
}

export class ExtendedPrincipalsConfig extends PrincipalsConfig {
    public contributeServicePrincipal<T extends string>(
        identifier: T,
        manifest: IServicePrincipalManifest,
        overwrite: boolean = false): IServicePrincipal {
        if (this.wellKnownServicePrincipals[identifier] && !overwrite) {
            throw "Well known service principal already exists for identifier: " + identifier;
        }
        let principal = this.wellKnownServicePrincipals[identifier] = new ServicePrincipal(manifest);
        this.store.add(principal);
        this.configPath.path(identifier + ".json")
            .ensureDirExists()
            .saveJsonConfig<IServicePrincipalManifest>(manifest);
        return principal;
    }
}
