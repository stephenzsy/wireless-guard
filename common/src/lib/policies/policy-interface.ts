import Uuid from "../common/uuid";
import {
    AuthorizationErrors
} from "../errors";

export type PolicyDefinitionMatch = "*" | string[];
export type PolicyDefinitionEffect = "allow" | "deny";

/**
 * Policy definition JSON writable
 */
export interface PolicyDefinition {
    id: string;
    name: string;
    actions: PolicyDefinitionMatch;
    effect: PolicyDefinitionEffect;
    users?: PolicyDefinitionMatch;
    resources?: PolicyDefinitionMatch;
}

export enum IdentifierType {
    Id
}

export function toIdentifierType(value: string): IdentifierType {
    switch (value) {
        case "id": return IdentifierType.Id;
        default: throw "Invalid identifier type: " + value;
    }
}

export interface PolicyEntityIdentifier {
    type: string;
    identifierType: IdentifierType;
    identifier: string;
}

export interface IPolicyReference {
    id: Uuid;
    name: string;
    allow: boolean;
}

export interface IPolicy extends IPolicyReference {
    match(action: string, userIdentifier: PolicyEntityIdentifier, resourceIdentifier: PolicyEntityIdentifier): boolean;
}
