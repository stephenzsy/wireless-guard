import { IPrincipal, IPrincipalManifest } from "./interfaces";
import { BasePrincipal } from "./base-principal";
import { Uuid } from "../common/uuid";

export interface IServicePrincipal extends IPrincipal {
}

export class ServicePrincipal extends BasePrincipal implements IServicePrincipal {
}

export interface IServicePrincipalManifest extends IPrincipalManifest {
}

export function newServicePrincipalManifest(name: string): IServicePrincipalManifest {
    return {
        id: Uuid.v4(),
        name: name,
        type: "service",
        dateCreated: new Date()
    }
}