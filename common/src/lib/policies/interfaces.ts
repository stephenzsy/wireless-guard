import { IResource, IResourceManifest } from "../common/resource";
import { IPrincipal } from "../principals/interfaces";

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

export type EffectManifest = "deny" | "allow";

export interface IPolicyMatcherInverseManifest<T> {
    not: IPolicyMatcherManifest<T>;
}

export type IPolicyMatcherManifest<T> = T | "*" | IPolicyMatcherInverseManifest<T>;

export interface IPolicyMatcher<T> {
    matches(target: T): boolean;
}

export interface IPolicyPrincipalsMatcher<P extends IPrincipal = IPrincipal> extends IPolicyMatcher<P> {
}

export interface IPolicyActionsMatcher<A extends string = string> extends IPolicyMatcher<A> {
}

export interface IPolicyResourcesMatcher extends IPolicyMatcher<string> {
}

export interface IPolicyManifest extends IResourceManifest {
    effect: EffectManifest;
    actions: IPolicyMatcherManifest<any>;
}

export interface IPrincipalPolicyManifest extends IPolicyManifest {
    resources: IPolicyMatcherManifest<any>;
}

export interface IResourcePolicyManifest extends IPolicyManifest {
    principals: IPolicyMatcherManifest<any>;
}

export interface IPolicy<A extends string = string> extends IResource {
    /**
     * Effect of the policy
     */
    readonly effect: PolicyEffect;
    /**
     * Matcher for actions
     */
    readonly actions: IPolicyActionsMatcher<A>;
}

export interface IPrincipalPolicy<A extends string = string> extends IPolicy<A> {
    /**
     * Matcher for resources
     */
    readonly resources: IPolicyResourcesMatcher;

}

export interface IResourcePolicy<P extends IPrincipal = IPrincipal, A extends string = string> extends IPolicy<A> {
    /**
     * Matcher for principals
     */
    readonly principals: IPolicyPrincipalsMatcher<P>;
}
