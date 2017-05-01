import {
    AuthorizationErrors
} from "../errors";

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
    id: string;
    name: string;
    allow: boolean;
}

export interface IPolicy extends IPolicyReference {
    matches(action: string, userIdentifier: PolicyEntityIdentifier, resourceIdentifier: PolicyEntityIdentifier): boolean;
}
