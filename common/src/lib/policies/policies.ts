import { Uuid } from "../common/uuid";
import { ResourcePolicy, Policy } from "./base-policy";
import { IPolicyManifest, IPolicy, IResourcePolicy, IResourcePolicyManifest } from "./interfaces";
import {
    MatchAllManifest,
} from "./matchers";
import { IPolicyPrincipalsMatcherManifest } from "../principals/principal-matcher";

const denyAllPolicyManifest: IPolicyManifest = {
    id: Uuid.v4(),
    name: "deny-all",
    actions: "*",
    effect: "deny",
    dateCreated: new Date()
};

export const denyAllPolicy: IPolicy = new Policy(denyAllPolicyManifest);

const requireServicePrincipalResourcePolicyManifest: IResourcePolicyManifest = {
    id: Uuid.v4(),
    name: "require-service-principal",
    principals: {
        not: {
            "service-principal": "*"
        } as IPolicyPrincipalsMatcherManifest
    },
    actions: "*",
    effect: "deny",
    dateCreated: new Date()
};

export const requireServicePrincipalResourePolicy: IResourcePolicy = new ResourcePolicy(requireServicePrincipalResourcePolicyManifest);
