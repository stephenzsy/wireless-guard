import {
    IUserEntity
} from "../users/user-entity";
import {
    UserBase
} from "../users/user";
import {
    UserGroupBase
} from "../users/user-group";
import {
    rootUser
} from "../users/builtin-user-entities";

export interface IUserContext {
    user: IUserEntity;
    groups?: IUserEntity[];
}

export class UserContext implements IUserContext {
    private _user: UserBase;
    private _groups: IUserEntity[];

    constructor(user: UserBase, resolveGroups: boolean = false) {
        this._user = user;
        if (resolveGroups) {
            this._groups = user.getMemberGroups();
        }
    }

    public get user(): UserBase {
        return this._user;
    }

    public get groups(): IUserEntity[] {
        return this._groups;
    }
}
