import {
    UserEntityBase
} from "./user-entity-base";
import {
    IUser,
    IUserGroup
} from "./user-interface"
import User from "./user"
import Guid from "../common/guid";

export default class UserGroup extends UserEntityBase implements IUserGroup {
    public get members(): User[] {
        return [];
    }
}
