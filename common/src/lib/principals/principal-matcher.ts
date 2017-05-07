import { IPolicyPrincipalsMatcher, IPolicyMatcherManifest } from "../policies/interfaces";
import { createMatcher, SetMatcher } from "../policies/matchers";
import { IPrincipal, PrincipalTypeManifest, PrincipalType } from "./interfaces";

export interface IPolicyPrincipalsMatcherManifest {
    "service-principal"?: "*" | string[];
}

class PolicyPrincipalsIdMatcher extends SetMatcher<IPrincipal, string> implements IPolicyPrincipalsMatcher {
    constructor(manifest: string[]) {
        super(manifest, (principal: IPrincipal) => principal.id);
    }
}

class PolicyPrincipalsMatcher implements IPolicyPrincipalsMatcher {
    private readonly principalMatchers: NumberMap<IPolicyPrincipalsMatcher> = {};

    constructor(manifest: IPolicyPrincipalsMatcherManifest) {
        if (manifest["service-principal"]) {
            this.principalMatchers[PrincipalType.service] =
                createMatcher<IPrincipal>(manifest["service-principal"], PolicyPrincipalsIdMatcher);
        }
    }

    public matches(target: IPrincipal): boolean {
        if (this.principalMatchers[target.type]) {
            return this.principalMatchers[target.type].matches(target);
        }
        return false;
    }
}

export function createPolicyPrincipalsMatcher<P extends IPrincipal>(manifest: IPolicyMatcherManifest<any>): IPolicyPrincipalsMatcher<P> {
    return createMatcher<P>(manifest, PolicyPrincipalsMatcher);
}

