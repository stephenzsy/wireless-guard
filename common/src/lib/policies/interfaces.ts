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

export interface IPolicyMatcher<T, M> {
    manifest: M;
    matches(target: T): boolean;
}

export interface IPolicyPrincipalsMatcher<P extends IPrincipal, M> extends IPolicyMatcher<P, M> {
}

export interface IPolicyActionsMatcher<A, M> extends IPolicyMatcher<A, M> {
}

export interface IPolicyResourcesMatcher<M> extends IPolicyMatcher<string, M> {
}

export interface IPolicyManifest<P, A, R> extends IResourceManifest {
    principals: P;
    actions: A;
    resources: R;
    effect: EffectManifest;
}

export interface IPolicy<P extends IPrincipal = IPrincipal, A = any> extends IResource {
    /**
     * Matcher for principals
     */
    readonly principals: IPolicyPrincipalsMatcher<P, any>;
    /**
     * Matcher for actions
     */
    readonly actions: IPolicyActionsMatcher<A, any>;
    /**
     * Matcher for resources
     */
    readonly resources: IPolicyResourcesMatcher<any>;
    /**
     * Effect of the policy
     */
    readonly effect: PolicyEffect;
}
