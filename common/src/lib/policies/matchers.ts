import { IPolicyMatcher } from "./interfaces";

export type MatchAllManifest = "*";

class MatchAllPolicyMatcher implements IPolicyMatcher<any, MatchAllManifest> {
    public matches(target: any) {
        return true;
    }

    public get manifest(): MatchAllManifest {
        return "*";
    }
}

export const matchAllPolicyMatcher: IPolicyMatcher<any, MatchAllManifest> = new MatchAllPolicyMatcher();
