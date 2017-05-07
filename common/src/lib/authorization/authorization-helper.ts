import { IRequest } from "../request/interfaces";
import { IResource } from "../common/resource";
import { IAutorizationContext } from "./interfaces";
import { IPrincipal } from "../principals/interfaces";
import { IResourcePolicy } from "../policies/interfaces";
import { denyAllPolicy } from "../policies/policies";

export function authorizeRequest<A extends string>(
    request: IRequest,
    action: A,
    resourceIdentifier: string,
    resourcePolicies: IResourcePolicy<IPrincipal, A>[] = []): IAutorizationContext {
    return {
        authorized: false,
        deinedPolicy: denyAllPolicy
    };
}
