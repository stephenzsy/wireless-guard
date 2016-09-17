import {
    IPolicyReference,
} from "../policies";
import {IRequestContext} from "../request-context";

export interface IUserEntityReference {
    id: string;
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
