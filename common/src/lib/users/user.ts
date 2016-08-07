import {
    IUserEntity
} from "./user-entity";
import {
    IPolicy,
    Policy
} from "../policies/policy";
import {
    IUserGroup
} from "./user-group";
import Guid from "../common/guid";

export interface IUser extends IUserEntity {
}

export abstract class UserBase implements IUser {
    private _id: Guid;
    private _name: string;

    constructor(id: Guid, name: string) {
        this._id = id;
        this._name = name;
    }

    public get id(): Guid {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public abstract getMemberGroups(): IUserGroup[];

    public abstract getPolicies(): IPolicy[];
}
