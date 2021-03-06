import {
    PolicyDefinitionMatch
} from "./policy-definition";
import {
    IdentifierType,
    toIdentifierType,
    PolicyEntityIdentifier,
    IPolicy,
    IPolicyReference
} from "./policy-interface";

export type MatchWithAllDefinition<T> = "*" | T;

export interface IMatcher<T> {
    matches(identifier: T): boolean;
}

abstract class MatchAllMatcher<T> implements IMatcher<T> {
    private _isMatchAll: boolean;
    constructor(matchRule: MatchWithAllDefinition<any>) {
        this._isMatchAll = (matchRule === "*");
    }

    public matches(identifier: T): boolean {
        return this.isMatchAll;
    }

    protected get isMatchAll(): boolean {
        return this._isMatchAll;
    }
}

class MultipleStringsMatcher extends MatchAllMatcher<string>  {
    private matchedStrings: Map<string, boolean> = new Map();
    constructor(matchRule: MatchWithAllDefinition<string[]>) {
        super(matchRule);
        if (!this.isMatchAll) {
            for (let str of matchRule as string[]) {
                this.matchedStrings.set(str, true);
            }
        }
    }

    /**
     * @override
     */
    public matches(identifier: string): boolean {
        if (super.matches(identifier)) {
            return true;
        }
        return !!this.matchedStrings.get(identifier);
    }
}

class SingleValueMatcher<T extends string | IdentifierType> extends MatchAllMatcher<T>  {
    private matchedValue: T;
    constructor(matchRule: MatchWithAllDefinition<T>) {
        super(matchRule);
        if (!this.isMatchAll) {
            this.matchedValue = matchRule as T;
        }
    }

    /**
     * @override
     */
    public matches(identifier: T): boolean {
        if (super.matches(identifier)) {
            return true;
        }
        return this.matchedValue === identifier;
    }
}

class PolicyEntityIdentifierMatcher implements IMatcher<PolicyEntityIdentifier> {
    private typeMatcher: SingleValueMatcher<string>;
    private identifierTypeMatcher: SingleValueMatcher<IdentifierType>;
    private identifierMatcher: SingleValueMatcher<string>;

    constructor(entityType: MatchWithAllDefinition<string>,
        identifierType: MatchWithAllDefinition<string>,
        identifier: MatchWithAllDefinition<string>
    ) {
        this.typeMatcher = new SingleValueMatcher<string>(entityType);
        let identifierTypeMatchDefinition: MatchWithAllDefinition<IdentifierType>;
        if (identifierType === "*") {
            identifierTypeMatchDefinition = "*";
        } else {
            identifierTypeMatchDefinition = toIdentifierType(identifierType);
        }
        this.identifierTypeMatcher = new SingleValueMatcher<IdentifierType>(identifierTypeMatchDefinition);
        this.identifierMatcher = new SingleValueMatcher<string>(entityType);
    }

    public matches(identifier: PolicyEntityIdentifier): boolean {
        if (!this.typeMatcher.matches(identifier.type)) {
            return false;
        }
        if (!this.identifierTypeMatcher.matches(identifier.identifierType)) {
            return false;
        }
        return this.identifierMatcher.matches(identifier.identifier);
    }
}

class PolicyDefinitionMatcher extends MatchAllMatcher<PolicyEntityIdentifier> {
    private entityMatchers: IMatcher<PolicyEntityIdentifier>[] = [];
    constructor(matchDefinition: PolicyDefinitionMatch) {
        super(matchDefinition);
        if (!this.isMatchAll) {
            for (let identifierString of matchDefinition as string[]) {
                let parts = identifierString.split(":");
                if (parts.length !== 3) {
                    throw "Invalid policy definition: " + matchDefinition;
                }
                let entityType = parts[0];
                let identifierType = parts[1];
                let identifier = parts[2];
                this.entityMatchers.push(new PolicyEntityIdentifierMatcher(
                    entityType, identifierType, identifier
                ));
            }
        }
    }

    /**
     * @override
     */
    public matches(identifier: PolicyEntityIdentifier): boolean {
        if (super.matches(identifier)) {
            return true;
        }
        return false;
    }
}

export function newPolicyDefinitionMatcher(matchDefinition: PolicyDefinitionMatch): IMatcher<PolicyEntityIdentifier> {
    return new PolicyDefinitionMatcher(matchDefinition);
}

export function newMultipleStringsMatcher(matchDefinition: PolicyDefinitionMatch): IMatcher<string> {
    return new MultipleStringsMatcher(matchDefinition);
}

export function toPolicyReference(policy: IPolicy): IPolicyReference {
    return {
        id: policy.id,
        name: policy.name,
        allow: policy.allow
    };
}
