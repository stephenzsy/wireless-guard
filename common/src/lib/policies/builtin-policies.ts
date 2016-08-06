import {
    GeneralPolicyResourceType,
    PolicyAction,
    IPolicy,
    Policy
} from "./policy";

export module BuiltInPolicyIds {
    export const denyAll: string = "9ef2912c-a78d-459c-b0cc-8e178fdb19ef";
    export const allowAll: string = "1de6d199-f4dd-4ffe-895d-30f6542addb8";
}

export const denyAll: IPolicy = new Policy(BuiltInPolicyIds.denyAll, GeneralPolicyResourceType.All, PolicyAction.Deny);
export const allowAll: IPolicy = new Policy(BuiltInPolicyIds.allowAll, GeneralPolicyResourceType.All, PolicyAction.Allow);
