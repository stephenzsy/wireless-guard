import {
    UserEntityBase
} from "./user-entity-base";
import {
    IUser,
    IUserGroup
} from "./user-interface"
import UserGroup from "./user-group";
import Uuid from "../common/uuid";

export default class User extends UserEntityBase implements IUser {
    public get groups(): UserGroup[] {
        return [];
    }
}
