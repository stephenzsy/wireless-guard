import { IResource, IResourceManifest } from "../common/resource";

export enum PrincipalType {
    user,
    group,
    service
}

export interface IPrincipal extends IResource {
    readonly type: PrincipalType;
}

export interface IPrincipalManifest extends IResourceManifest {
    type: "user" | "group" | "service";
}
