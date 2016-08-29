import Guid from "../common/guid";
import {
    IUserEntity
} from "./user-interface"
import {
    IPolicy,
    IPolicyReference,
    PolicyEntityIdentifier,
    IdentifierType,
} from "../policies";
import {
    toPolicyReference
} from "../policies/utils";

export abstract class UserEntityBase implements IUserEntity {
    private _id: Guid;
    private _name: string;
    private _policies: IPolicy[];

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
    public get policies(): IPolicyReference[] {
        return this._policies.map(toPolicyReference);
    }

    public evalPolicies(action: string, resource: PolicyEntityIdentifier): IPolicyReference {
        for (let policy of this._policies) {
            if (policy.match(action,
                {
                    type: "user",
                    identifierType: IdentifierType.Id,
                    identifier: this.id.toString()
                },
                resource
            )) {
                return toPolicyReference(policy);
            }
        }
        return null;
    }

}
