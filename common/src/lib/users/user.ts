import {
    IUserEntity
} from "./user-entity";
import {
    IPolicy,
    Policy
} from "../policies/policy";

export abstract class UserBase implements IUserEntity {
    private _id: string;
    private _name: string;

    constructor(id, name) {
        this._id = id;
        this._name = name;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public abstract getMemberGroups(): IUserEntity[];

    public abstract getPolicies(): IPolicy[];
}
