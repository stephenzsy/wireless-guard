import { Uuid } from "../common/uuid";
import { BasePolicy } from "./base-policy";
import { IPolicyManifest, IPolicy } from "./interfaces";
import {
    matchAllPolicyMatcher
} from "./matchers";

const denyAllPolicyManifest: IPolicyManifest<any, any, any> = {
    id: Uuid.v4(),
    name: "deny-all",
    principals: "*",
    actions: "*",
    resources: "*",
    effect: "deny",
    dateCreated: new Date()
}

export const denyAllPolicy: IPolicy<any, any, any> = new BasePolicy(denyAllPolicyManifest,
    matchAllPolicyMatcher,
    matchAllPolicyMatcher,
    matchAllPolicyMatcher);
