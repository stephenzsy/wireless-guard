import {
    IUserEntity
} from "./user-entity";
import {
    IUser
} from "./user"
import Guid from "../common/guid";

export interface IUserGroup extends IUserEntity {
}

export abstract class UserGroupBase implements IUserGroup {
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

    public abstract getMembers(): IUserEntity[];
}
