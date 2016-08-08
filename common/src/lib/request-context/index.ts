import {
    IUserContext,
    UserContext
} from "./user-context";
import {
    AuthorizationErrors
} from "../errors";
import Guid from "../common/guid";
import {
    IPolicy,
    PolicyEffect
} from "../policies/policy";
import {
    IUser
} from "../users/user";

export interface IRequestContext {
    userContext: IUserContext;
    authorize(action: string, resource: string);
}

class AnonymousNotAllowedError extends AuthorizationErrors.NotAuthorized { }
class PolicyDeniedError extends AuthorizationErrors.NotAuthorized {
    constructor(deniedPolicy: IPolicy) {
        let errorMessage: string = deniedPolicy ?
            "Access denied by policy: " + deniedPolicy.id.toString() + " (" + deniedPolicy.name + ")" :
            "Access denied by default";
        super(errorMessage);
    }
}

class RequestContext implements IRequestContext {
    private requestId: Guid;
    public userContext: IUserContext;

    constructor() {
        this.requestId = new Guid();
    }

    public authorize(action: string, resource: string, allowAnonymous: boolean = false) {
        if (allowAnonymous) {
            return;
        }
        if (!this.userContext) {
            throw new AnonymousNotAllowedError();
        }
        let result = this.userContext.evalPolicies(action, resource);
        if (!result || result.effect !== PolicyEffect.Allow) {
            throw new PolicyDeniedError(result);
        }
    }
}

export function newUserRequestContext(user: IUser): IRequestContext {
    let requestContext = new RequestContext();
    requestContext.userContext = new UserContext(user, true);
    return requestContext;
}
