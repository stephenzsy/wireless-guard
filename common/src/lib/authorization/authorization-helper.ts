import { IRequest } from "../request/interfaces";
import { IResource } from "../common/resource";
import { IAutorizationContext } from "./interfaces";
import { IPolicy } from "../policies/interfaces";
import { denyAllPolicy } from "../policies/policies";

export class AuthorizationHelper {
    public authorizeRequest<A, R extends IResource>(
        request: IRequest,
        action: A,
        resource: R,
        resourcePolicies: IPolicy<any, A, R>[]): IAutorizationContext {
        return {
            authorized: false,
            deinedPolicy: denyAllPolicy
        };
    }
}
