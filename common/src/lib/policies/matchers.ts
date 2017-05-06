import { IPolicyMatcher } from "./interfaces";

export type MatchAllManifest = "*";

class MatchAllPolicyMatcher implements IPolicyMatcher<any, MatchAllManifest> {
    public matches(target: any): boolean {
        return true;
    }

    public get manifest(): MatchAllManifest {
        return "*";
    }
}

export const matchAllPolicyMatcher: IPolicyMatcher<any, MatchAllManifest> = new MatchAllPolicyMatcher();

export class SpecificTargetMatcher<T> implements IPolicyMatcher<T, T> {
    private readonly matchTarget: T;

    constructor(matchTarget: T) {
        this.matchTarget = matchTarget;
    }

    public matches(target: T): boolean {
        return this.matchTarget === target;
    }

    public get manifest(): T {
        return this.matchTarget;
    }

    public get isSpecific(): boolean {
        return true;
    }
}

export interface IInverseMatcherManifest<M> {
    not: M;
}

export class InverseMatcher<T, M> implements IPolicyMatcher<T, IInverseMatcherManifest<M>> {
    private readonly innerMatcher: IPolicyMatcher<T, M>;
    constructor(matcher: IPolicyMatcher<T, M>) {
        this.innerMatcher = matcher;
    }

    public get manifest(): IInverseMatcherManifest<M> {
        return { not: this.innerMatcher.manifest };
    }

    public matches(target: T): boolean {
        return !this.innerMatcher.matches(target);
    }
}
