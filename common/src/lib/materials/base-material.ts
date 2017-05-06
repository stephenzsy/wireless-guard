import { IMaterial, IMaterialManifest } from "./interfaces";
import { IPrincipal } from "../principals/interfaces";
import { BaseResource } from "../common/base-resource";
import { getAppConfig } from "../config/app-config";

export abstract class BaseMaterial<T extends IMaterialManifest = IMaterialManifest> extends BaseResource<T> implements IMaterial {
    private _owner: IPrincipal | null | undefined = null;

    constructor(
        manifest: T) {
        super(manifest);
    }

    public get owner(): IPrincipal {
        if (this._owner === null) {
            this._owner = getAppConfig().principals.resolvePrincipal(this.manifest.owner);
        }
        if (!this._owner) {
            throw "Unable to resolve principal with id: " + this.manifest.owner;
        }
        return this._owner;
    }
}