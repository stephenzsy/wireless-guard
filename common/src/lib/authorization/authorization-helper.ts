import { IRequest } from "../request/interfaces";
import { IResource } from "../common/resource";
import { IAutorizationContext } from "./interfaces";
import { IPolicy } from "../policies/interfaces";
import { denyAllPolicy } from "../policies/policies";

export function authorizeRequest<A>(
    request: IRequest,
    action: A,
    resourceIdentifier: string,
    resourcePolicies: IPolicy<any, A>[] = []): IAutorizationContext {
    return {
        authorized: false,
        deinedPolicy: denyAllPolicy
    };
}
