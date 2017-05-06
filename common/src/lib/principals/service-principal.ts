import { IPrincipal, IPrincipalManifest, PrincipalType } from "./interfaces";
import { IPolicyPrincipalsMatcher } from "../policies/interfaces";
import { BasePrincipal } from "./base-principal";
import { Uuid } from "../common/uuid";

export interface IServicePrincipal extends IPrincipal {
}

export class ServicePrincipal extends BasePrincipal implements IServicePrincipal {
    public get identifier(): string {
        return "service-principal:" + this.id;
    }
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

export type MatchAllServicePrincipalsManifest = "service-principal:*";

class MatchAllServicePrincipalsMatcher implements IPolicyPrincipalsMatcher<IPrincipal, MatchAllServicePrincipalsManifest> {
    public get manifest(): MatchAllServicePrincipalsManifest {
        return "service-principal:*";
    }

    public matches(target: IPrincipal): boolean {
        return (target.type === PrincipalType.service);
    }

    public get isSpecific(): boolean {
        return false;
    }
}

export const matchAllSerivicePrincipalsMatcher: IPolicyPrincipalsMatcher<IPrincipal, MatchAllServicePrincipalsManifest>
    = new MatchAllServicePrincipalsMatcher();
