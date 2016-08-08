import {
    IUserEntity,
    UserEntityBase
} from "./user-entity";
import {
    IUser
} from "./user"
import {
    IPolicy,
} from "../policies/policy";
import Guid from "../common/guid";

export interface IUserGroup extends IUserEntity {
}

export abstract class UserGroupBase extends UserEntityBase implements IUserGroup {
    public abstract getMembers(): IUserEntity[];
}
