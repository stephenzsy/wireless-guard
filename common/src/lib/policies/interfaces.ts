import { IResource } from "../common/resource";

export enum PolicyEffect {
    /**
     * Deny
     */
    deny = 0,
    /**
     * Allow
     */
    allow = 1,
}

export interface IPolicyMatcher<T> {
    matches(target: T): boolean;
}

export interface IPolicyPrincipalsMatcher<P> {
}

export interface IPolicyActionsMatcher<A> {
}

export interface IPolicyResourcesMatcher<R> extends IPolicyMatcher<R> {
}

export interface IPolicy<P, A, R> extends IResource {
    /**
     * Matcher for principals
     */
    readonly principals: IPolicyPrincipalsMatcher<P>;
    /**
     * Matcher for actions
     */
    readonly actions: IPolicyActionsMatcher<A>;
    /**
     * Matcher for resources
     */
    readonly resources: IPolicyResourcesMatcher<R>;
    /**
     * Effect of the policy
     */
    readonly effect: PolicyEffect;
}
