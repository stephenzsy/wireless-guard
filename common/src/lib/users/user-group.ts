import {
    UserEntityBase
} from "./user-entity-base";
import {
    IUser,
    IUserGroup
} from "./user-interface"
import User from "./user"
import Uuid from "../common/uuid";

export default class UserGroup extends UserEntityBase implements IUserGroup {
    public get members(): User[] {
        return [];
    }
}
