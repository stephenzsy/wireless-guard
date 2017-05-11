import { IPrincipal, IPrincipalManifest, PrincipalType } from "./interfaces";
import { BaseResource } from "../common/base-resource";
export abstract class BasePrincipal extends BaseResource implements IPrincipal {

    private readonly _type: PrincipalType;

    constructor(manifest: IPrincipalManifest) {
        super(manifest);
        switch (manifest.type) {
            case "service":
                this._type = PrincipalType.service;
                break;
            case "user":
                this._type = PrincipalType.user;
                break;
            case "group":
                this._type = PrincipalType.group;
                break;
        }
    }

    public get type(): PrincipalType {
        return this._type;
    }
}
