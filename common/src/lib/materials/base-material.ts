import { PrincipalsConfig } from "../config/principals-config";
import { IMaterial, IMaterialManifest } from "./interfaces";
import { IPrincipal } from "../principals/interfaces";
import { BaseResource } from "../common/base-resource";

export class BaseMaterial<T extends IMaterialManifest = IMaterialManifest> extends BaseResource<T> implements IMaterial {
    private readonly principalsConfig: PrincipalsConfig;
    private _owner: IPrincipal | null | undefined = null;

    constructor(
        principalsConfig: PrincipalsConfig,
        manifest: T) {
        super(manifest);

        this.principalsConfig = principalsConfig;
    }

    public get owner(): IPrincipal {
        if (this._owner === null) {
            this._owner = this.principalsConfig.resolvePrincipal(this.manifest.owner);
        }
        if (!this._owner) {
            throw "Unable to resolve principal with id: " + this.manifest.owner;
        }
        return this._owner;
    }
}