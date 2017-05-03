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
    LogLevel,
    IService
} from "./interfaces";
import UserContext from "./user-context";
import {
    IPolicy,
    IPolicyReference,
    PolicyEntityIdentifier,
} from "../policies";
import { IUser } from "../users"
import User from "../users/user";

export default class RequestContext implements IRequestContext {
    private _requestId: string;
    public userContext: IUserContext;
    public moduleName: AppContext.ModuleName;
    private isElevated: boolean;
    private services: IDictionaryStringTo<IService> = {};

    constructor(original?: RequestContext, isElevated: boolean = false) {
        if (original) {
            this._requestId = original.requestId;
            this.userContext = original.userContext;
            this.moduleName = original.moduleName;
        } else {
            this._requestId = Uuid.v4();
        }
        this.isElevated = isElevated;
    }

    public get requestId(): string {
        return this._requestId;
    }

    public authorize(action: string, resource: PolicyEntityIdentifier, options: AuthorizeOptions = {}): IPolicyReference | null {
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
            throw new PolicyDeniedError(result === null ? undefined : result);
        }
        return null;
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

    public getService<T extends IService>(serviceTypeId: string): T {
        return this.services[serviceTypeId] as T;
    }

    public setService<T extends IService>(service: T): void {
        this.services[service.serviceTypeId] = service;
    }

    public withService<T extends IService>(service: T): this {
        this.services[service.serviceTypeId] = service;
        return this;
    }
}
