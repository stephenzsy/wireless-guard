import { IPolicyMatcher, IPolicyMatcherManifest, IPolicyMatcherInverseManifest } from "./interfaces";

export type MatchAllManifest = "*";

class MatchNonePolicyMatcher implements IPolicyMatcher<any> {
    public matches(target: any): boolean {
        return false;
    }
}

class MatchAllPolicyMatcher implements IPolicyMatcher<any> {
    public matches(target: any): boolean {
        return true;
    }
}

const matchNonePolicyMatcher: IPolicyMatcher<any> = new MatchNonePolicyMatcher();
const matchAllPolicyMatcher: IPolicyMatcher<any> = new MatchAllPolicyMatcher();

export class TargetMatcher<T> implements IPolicyMatcher<T> {
    private readonly matchTarget: T;

    constructor(matchTarget: T) {
        this.matchTarget = matchTarget;
    }

    public matches(target: T): boolean {
        return this.matchTarget === target;
    }
}

export class SetMatcher<T, V> implements IPolicyMatcher<T> {
    private readonly valueSet: Set<V>;
    private readonly toValue: (target: T) => V;

    constructor(manifest: V[], toValue: (target: T) => V) {
        this.valueSet = new Set<V>(manifest);
        this.toValue = toValue;
    }

    public matches(target: T): boolean {
        return this.valueSet.has(this.toValue(target));
    }
}

class InverseMatcher<T> implements IPolicyMatcher<T> {
    private readonly innerMatcher: IPolicyMatcher<T>;
    constructor(matcher: IPolicyMatcher<T>) {
        this.innerMatcher = matcher;
    }

    public matches(target: T): boolean {
        return !this.innerMatcher.matches(target);
    }
}

export interface IMatcherConstructor<T> {
    new (manifest: any): IPolicyMatcher<T>;
}

export function createMatcher<T>(manifest: any, matcherConstructor?: IMatcherConstructor<T>): IPolicyMatcher<T> {
    if (manifest === "*") {
        return matchAllPolicyMatcher;
    } else if ((manifest as IPolicyMatcherInverseManifest<any>).not) {
        return new InverseMatcher<T>(createMatcher(
            (manifest as IPolicyMatcherInverseManifest<any>).not,
            matcherConstructor));
    }
    return matcherConstructor ? new matcherConstructor(manifest) : matchNonePolicyMatcher;
}
