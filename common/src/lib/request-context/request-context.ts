import * as winston from "winston";

import Guid from "../common/guid";
import {
    IRequestContext,
    IUserContext,
    AnonymousNotAllowedError,
    ElevatedRequestContextRequiredError,
    PolicyDeniedError,
    AuthorizeOptions,
    LogLevel
} from "./request-context-interface";
import {
    UserContext
} from "./user-context";
import {
    IPolicy,
    IPolicyReference,
    PolicyEntityIdentifier,
} from "../policies";
import User from "../users/user";

class RequestContext implements IRequestContext {
    private _requestId: Guid;
    public userContext: IUserContext;
    private isElevated: boolean;

    constructor(original?: RequestContext, isElevated: boolean = false) {
        if (original) {
            this._requestId = original.requestId;
            this.userContext = original.userContext;
        } else {
            this._requestId = new Guid();
        }
        this.isElevated = isElevated;
    }

    public get requestId(): Guid {
        return this._requestId;
    }

    public authorize(action: string, resource: PolicyEntityIdentifier, options: AuthorizeOptions = {}): IPolicyReference {
        if (options.allowAnonymous) {
            return null;
        }
        if (options.requireElevated && !this.isElevated) {
            throw new ElevatedRequestContextRequiredError();
        }
        if (!this.userContext) {
            throw new AnonymousNotAllowedError();
        }
        let result = this.userContext.evalPolicies(action, resource);
        if (!result || !result.allow) {
            throw new PolicyDeniedError(result);
        }
    }

    public log(level: LogLevel, message: string) {
        winston.log(level, message, {
            requestId: this.requestId.toString(),
            userId: (this.userContext ? this.userContext.user.id.toString() : "anonymous")
        })
    }

    public elevate(): IRequestContext {
        return new RequestContext(this, true);
    }
}

export function newUserRequestContext(user: User, resolveGroups: boolean = true): IRequestContext {
    let requestContext = new RequestContext();
    requestContext.userContext = new UserContext(user, resolveGroups);
    return requestContext;
}
