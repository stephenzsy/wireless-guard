import { Uuid } from "../common/uuid";
import { BasePolicy } from "./base-policy";
import { IPolicyManifest, IPolicy } from "./interfaces";
import {
    matchAllPolicyMatcher,
    MatchAllManifest,
    InverseMatcher,
    IInverseMatcherManifest
} from "./matchers";
import { matchAllSerivicePrincipalsMatcher, MatchAllServicePrincipalsManifest } from "../principals/service-principal";

const denyAllPolicyManifest: IPolicyManifest<MatchAllManifest, MatchAllManifest, MatchAllManifest> = {
    id: Uuid.v4(),
    name: "deny-all",
    principals: "*",
    actions: "*",
    resources: "*",
    effect: "deny",
    dateCreated: new Date()
};

export const denyAllPolicy: IPolicy = new BasePolicy(denyAllPolicyManifest,
    matchAllPolicyMatcher,
    matchAllPolicyMatcher,
    matchAllPolicyMatcher);

const requireServicePrincipalPolicyManifest: IPolicyManifest<IInverseMatcherManifest<MatchAllServicePrincipalsManifest>, MatchAllManifest, MatchAllManifest> = {
    id: Uuid.v4(),
    name: "require-service-principal",
    principals: {
        not: "service-principal:*"
    },
    actions: "*",
    resources: "*",
    effect: "deny",
    dateCreated: new Date()
};

export const requireServicePrincipalPolicy: IPolicy = new BasePolicy(requireServicePrincipalPolicyManifest,
    new InverseMatcher(matchAllSerivicePrincipalsMatcher),
    matchAllPolicyMatcher,
    matchAllPolicyMatcher);
