import { IResource, IResourceManifest } from "../common/resource";

export enum PrincipalType {
    service,
    user,
    group
}

export interface IPrincipal extends IResource {
    readonly type: PrincipalType;
}

export type PrincipalTypeManifest = "service" | "user" | "group";

export interface IPrincipalManifest extends IResourceManifest {
    type: PrincipalTypeManifest;
}
