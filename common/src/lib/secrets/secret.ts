import Guid from "../common/guid";
import { IManifest } from "./manifest";

export interface ISecret {
    id: Guid;
}

export class SecretBase<M extends IManifest> {
    private _id: Guid;
    protected manifest: M;

    constructor(manifest: M) {
        this.manifest = manifest;
        this._id = new Guid(manifest.id);
    }

    public get id(): Guid {
        return this._id;
    }
}
