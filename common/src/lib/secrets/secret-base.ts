import {
    IManifest,
    ISecret
} from "./secret-interface";

export default class SecretBase<M extends IManifest> {
    protected manifest: M;

    constructor(manifest: M) {
        this.manifest = manifest;
    }

    public get id(): string {
        return this.manifest.id;
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
