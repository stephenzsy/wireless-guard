import {
    PolicyEffect,
    IPolicy,
    Policy
} from "./policy";

export module BuiltInPolicyIds {
    export const denyAll: string = "9ef2912c-a78d-459c-b0cc-8e178fdb19ef";
    export const allowAll: string = "1de6d199-f4dd-4ffe-895d-30f6542addb8";
    export const allowCreatePrivateKey: string = "edcea241-b19e-43d4-a4d6-7adc203b1a4d";
    export const allowReadPrivateKey: string = "e57d68da-c6c9-4cf7-806d-9efd19f42d52";
    export const allowCreateCsr: string = "ce1686ad-b08a-48d3-a332-efb14218efde";
}

export const denyAll: IPolicy = new Policy(BuiltInPolicyIds.denyAll, "deny-all", "*", "*", PolicyEffect.Deny);
export const allowAll: IPolicy = new Policy(BuiltInPolicyIds.allowAll, "allow-all", "*", "*", PolicyEffect.Allow);
