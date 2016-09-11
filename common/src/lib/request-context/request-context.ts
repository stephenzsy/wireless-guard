import * as winston from "winston";

import Uuid from "../common/uuid";
import AppContext from "../app-context";
import {
    IRequestContext,
    IUserContext,
    AnonymousNotAllowedError,
    ElevatedRequestContextRequiredError,
    PolicyDeniedError,
    AuthorizeOptions,
    LogLevel
} from "./request-context-interface";
import UserContext from "./user-context";
import {
    IPolicy,
    IPolicyReference,
    PolicyEntityIdentifier,
} from "../policies";
import { IUser } from "../users"
import User from "../users/user";

export default class RequestContext implements IRequestContext {
    private _requestId: Uuid;
    public userContext: IUserContext;
    public moduleName: AppContext.ModuleName;
    private isElevated: boolean;

    constructor(original?: RequestContext, isElevated: boolean = false) {
        if (original) {
            this._requestId = original.requestId;
            this.userContext = original.userContext;
            this.moduleName = original.moduleName;
        } else {
            this._requestId = new Uuid();
        }
        this.isElevated = isElevated;
    }

    public get requestId(): Uuid {
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
