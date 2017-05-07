import { IResource, IResourceManifest } from "../common/resource";
import { IPrincipal } from "../principals/interfaces";
import { ConfigPath } from "../config/config-path";
import { IRequest } from "../request/interfaces";
import { IResourcePolicy, IResourcePolicyManifest } from "../policies/interfaces";

export type MaterialsAuthorizationAction = "create";

export interface IMaterial extends IResource {
    readonly owner: IPrincipal;
    readonly policies: IResource[];
}

export interface IMaterialManifest extends IResourceManifest {
    /**
     * Principal id of the material
     */
    owner: string;
    policies: IResourcePolicyManifest[];
}
