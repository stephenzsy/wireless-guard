import Guid from "../common/guid";

import {
    IManifest,
    ISecret
} from "./secret-interface";

export default class SecretBase<M extends IManifest> {
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

export module AuthorizationConstants {
    export module Action {
        export const createSecret: string = "create";
        export const readSecret: string = "read";
        export const deleteSecret: string = "delete";
        export const signCertificate: string = "sign";
    }
}
