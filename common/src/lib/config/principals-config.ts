import { IServicePrincipal, ServicePrincipal, IServicePrincipalManifest } from "../principals/service-principal";

export class PrincipalsConfig {
    protected wellKnownServicePrincipals: StringMap<IServicePrincipal> = {};
    public getWellKnownServicePrincipal<T extends string>(identifier: T): IServicePrincipal | undefined {
        return this.wellKnownServicePrincipals[identifier];
    }
}

export class ExtendedPrincipalsConfig extends PrincipalsConfig {
    public contributeServicePrincipal<T extends string>(
        identifier: T,
        manifest: IServicePrincipalManifest,
        overwrite: boolean = false): IServicePrincipal {
        let principal = this.wellKnownServicePrincipals[identifier] = new ServicePrincipal(manifest);
        return principal;
    }
}
