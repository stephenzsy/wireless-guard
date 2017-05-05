import { IResource, IResourceManifest } from "../common/resource";
import { IPrincipal } from "../principals/interfaces";
import { ConfigPath } from "../config/config-path";
import { IRequest } from "../request/interfaces";
import { IPolicy, IPolicyManifest } from "../policies/interfaces";

export type MaterialsAuthorizationAction = "create";

export interface IMaterial extends IResource {
    readonly owner: IPrincipal;
}

export interface IMaterialManifest extends IResourceManifest {
    /**
     * Principal id of the material
     */
    owner: string;
}

export interface ICertBase extends IMaterial {
    /**
     * X509 certificate subject
     */
    readonly subject: string;
    readonly expiryDate: Date;
    readonly pemFilePath: ConfigPath;
    readCertificate(request: IRequest): Promise<Buffer>;
}