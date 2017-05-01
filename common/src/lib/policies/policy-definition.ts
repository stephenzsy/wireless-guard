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
