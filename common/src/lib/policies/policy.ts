import Guid from "../common/guid";
import {
    PolicyDefinition,
    PolicyDefinitionEffect,
    PolicyDefinitionMatch,
    IPolicy,
    PolicyEntityIdentifier
} from "./policy-interface";
import {
    IMatcher,
    newMultipleStringsMatcher,
    newPolicyDefinitionMatcher,
} from "./utils";

function toPolicyEffectAllow(value: string): boolean {
    return "allow" === value;
}

export default class Policy implements IPolicy {
    private _id: Guid;
    private _name: string;
    private _allow: boolean;

    private isMatchAllActions: boolean = false;
    private actionsMatcher: IMatcher<string>;
    private usersMatcher: IMatcher<PolicyEntityIdentifier>;
    private resourcesMatcher: IMatcher<PolicyEntityIdentifier>;

    constructor(policyDefinition: PolicyDefinition) {
        this._id = new Guid(policyDefinition.id);
        this._name = policyDefinition.name;
        this._allow = toPolicyEffectAllow(policyDefinition.effect);

        this.actionsMatcher = newMultipleStringsMatcher(policyDefinition.actions);
        if (policyDefinition.users) {
            this.usersMatcher = newPolicyDefinitionMatcher(policyDefinition.users);
        }
        if (policyDefinition.resources) {
            this.resourcesMatcher = newPolicyDefinitionMatcher(policyDefinition.resources);
        }
    }

    public get id(): Guid {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get allow(): boolean {
        return this._allow;
    }

    public match(action: string, userIdentifier: PolicyEntityIdentifier, resourceIdentifier: PolicyEntityIdentifier): boolean {
        if (!this.actionsMatcher.match(action)) {
            return false;
        }
        if (this.usersMatcher && !this.usersMatcher.match(userIdentifier)) {
            return false;
        }
        if (this.resourcesMatcher && !this.resourcesMatcher.match(resourceIdentifier)) {
            return false;
        }
        return true;
    }
}
