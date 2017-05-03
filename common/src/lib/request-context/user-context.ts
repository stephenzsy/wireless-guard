import {
    IUser,
    IUserGroup
} from "../users";
import User from "../users/user";
import UserGroup from "../users/user-group";
import {
    IPolicyReference,
    PolicyEntityIdentifier
} from "../policies";
import {
    IUserContext
} from "./interfaces";

export default class UserContext implements IUserContext {
    private _user: User;
    private _groups: UserGroup[];

    constructor(user: User, resolveGroups: boolean = false) {
        this._user = user;
        if (resolveGroups) {
            this._groups = user.groups;
        }
    }

    public get user(): IUser {
        return this._user;
    }

    public get groups(): IUserGroup[] {
        return this._groups;
    }

    public evalPolicies(action: string, resource: PolicyEntityIdentifier): IPolicyReference | null {
        let result = this._user.evalPolicies(action, resource);
        if (result) {
            return result;
        }

        if (this.groups) {
            for (let group of this._groups) {
                result = group.evalPolicies(action, resource);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
}
