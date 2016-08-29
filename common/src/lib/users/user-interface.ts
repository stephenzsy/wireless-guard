import Guid from "../common/guid";
import {
    IPolicyReference,
} from "../policies";

export interface IUserEntityReference {
    id: Guid;
    name: string;
}

export interface IUserEntity extends IUserEntityReference {
    policies: IPolicyReference[];
}

export interface IUser extends IUserEntity {
    groups: IUserGroup[];
}

export interface IUserGroup extends IUserEntity {
    members: IUser[];
}

export module AuthorizationConstants {
    export const typeUser: string = "user";
}
