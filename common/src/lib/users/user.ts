import {
    IUserEntity,
    UserEntityBase
} from "./user-entity";
import {
    IPolicy,
} from "../policies/policy";
import {
    IUserGroup
} from "./user-group";
import Guid from "../common/guid";

export interface IUser extends IUserEntity {
    getMemberGroups(): IUserGroup[];
}

export abstract class UserBase extends UserEntityBase implements IUser {
    public abstract getMemberGroups(): IUserGroup[];
}
