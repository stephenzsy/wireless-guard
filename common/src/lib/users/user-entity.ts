import Guid from "../common/guid";
import {
    IPolicy,
    Policy,
    PolicyEffect,
} from "../policies/policy";

export interface IUserEntity {
    id: Guid;
    name: string;
    policies: IPolicy[];
    evalPolicies(action: string, resource: string): IPolicy;
}

export abstract class UserEntityBase implements IUserEntity {
    private _id: Guid;
    private _name: string;
    protected _policies: Policy[];

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

    /**
     * @override
     */
    public get policies(): IPolicy[] {
        return this._policies.map(p => ({
            id: p.id,
            name: p.name,
            actions: p.actions,
            resources: p.resources,
            effect: p.effect
        }));
    }

    public evalPolicies(action: string, resource: string): IPolicy {
        for (let policy of this._policies) {
            if (policy.test(action, resource)) {
                if (policy.effect === PolicyEffect.Allow || policy.effect === PolicyEffect.Deny) {
                    return policy;
                }
            }
        }
        return null;
    }
}
