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
import AppContext from "../app-context";

export type LogLevel = "info" | "debug";

export interface AuthorizeOptions {
    requireElevated?: boolean;
    allowAnonymous?: boolean;
}

export interface IUserContext {
    user: IUser;
    groups: IUserGroup[];
    evalPolicies(action: string, resource: PolicyEntityIdentifier): IPolicyReference | null;
}

export interface IService {
    serviceTypeId: string;
}

export interface IRequestContext {
    requestId: string;
    moduleName: AppContext.ModuleName;
    userContext: IUserContext;
    authorize(action: string, resource: PolicyEntityIdentifier, options?: AuthorizeOptions): IPolicyReference | null;
    log(level: LogLevel, message: string);
    /**
     * Elevate to server request, can only be done by server
     */
    elevate(): IRequestContext;
    getService<T extends IService>(serviceTypeId: string): T;
    setService<T extends IService>(service: T): void;
}

export class AnonymousNotAllowedError extends AuthorizationErrors.NotAuthorized { }
export class ElevatedRequestContextRequiredError extends AuthorizationErrors.NotAuthorized { }
export class PolicyDeniedError extends AuthorizationErrors.NotAuthorized {
    constructor(deniedPolicy?: IPolicyReference, errorMessage?: string) {
        errorMessage = errorMessage || (deniedPolicy ?
            "Access denied by policy: " + deniedPolicy.id.toString() + " (" + deniedPolicy.name + ")" :
            "Access denied by default");
        super(errorMessage);
    }
}
