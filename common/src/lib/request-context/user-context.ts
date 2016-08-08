import {
    IUserEntity
} from "../users/user-entity";
import {
    UserBase,
    IUser
} from "../users/user";
import {
    IUserGroup,
    UserGroupBase
} from "../users/user-group";
import {
    rootUser
} from "../users/builtin-user-entities";
import {
    IPolicy,
    PolicyEffect,
} from "../policies/policy";

export interface IUserContext {
    user: IUser;
    groups?: IUserGroup[];
    evalPolicies(action: string, resource: string): IPolicy;
}

export class UserContext implements IUserContext {
    private _user: IUser;
    private _groups: IUserEntity[];

    constructor(user: IUser, resolveGroups: boolean = false) {
        this._user = user;
        if (resolveGroups) {
            this._groups = user.getMemberGroups();
        }
    }

    public get user(): IUser {
        return this._user;
    }

    public get groups(): IUserGroup[] {
        return this._groups;
    }

    public evalPolicies(action: string, resource: string): IPolicy {
        let policy = this.user.evalPolicies(action, resource);
        if (policy && (policy.effect === PolicyEffect.Allow || policy.effect === PolicyEffect.Deny)) {
            return policy;
        }
        if (this.groups) {
            for (let group of this.groups) {
                policy = group.evalPolicies(action, resource);
                if (policy && (policy.effect === PolicyEffect.Allow || policy.effect === PolicyEffect.Deny)) {
                    return policy;
                }
            }
        }
        return null;
    }
}
