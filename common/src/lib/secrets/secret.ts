import Guid from "../common/guid";
import { IManifest } from "./manifest";

export interface ISecret {
    id: Guid;
}

export module Authorization {
    export module Action {
        export const createSecret: string = "create";
        export const readSecret: string = "read";
        export const deleteSecret: string = "delete";
    }
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
