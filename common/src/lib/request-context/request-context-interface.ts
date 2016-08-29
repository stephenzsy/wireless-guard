import Guid from "../common/guid";
import {
    IUser,
    IUserGroup
} from "../users";
import {
    IPolicyReference,
    PolicyEntityIdentifier
} from "../policies";
import {
    AuthorizationErrors
} from "../errors";

export type LogLevel = "info" | "debug";

export interface AuthorizeOptions {
    requireElevated?: boolean;
    allowAnonymous?: boolean;
}

export interface IUserContext {
    user: IUser;
    groups: IUserGroup[];
    evalPolicies(action: string, resource: PolicyEntityIdentifier): IPolicyReference;
}

export interface IRequestContext {
    requestId: Guid;
    userContext: IUserContext;
    authorize(action: string, resource: PolicyEntityIdentifier, options?: AuthorizeOptions): IPolicyReference;
    log(level: LogLevel, message: string);
    /**
     * Elevate to server request, can only be done by server
     */
    elevate(): IRequestContext;
}

export class AnonymousNotAllowedError extends AuthorizationErrors.NotAuthorized { }
export class ElevatedRequestContextRequiredError extends AuthorizationErrors.NotAuthorized { }
export class PolicyDeniedError extends AuthorizationErrors.NotAuthorized {
    constructor(deniedPolicy?: IPolicyReference) {
        let errorMessage: string = deniedPolicy ?
            "Access denied by policy: " + deniedPolicy.id.toString() + " (" + deniedPolicy.name + ")" :
            "Access denied by default";
        super(errorMessage);
    }
}
