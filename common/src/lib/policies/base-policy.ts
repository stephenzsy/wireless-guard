import { IResource } from "../common/resource";
import { BaseResource } from "../common/base-resource";
import { IPrincipal } from "../principals/interfaces";
import { createMatcher } from "./matchers";
import { createPolicyPrincipalsMatcher } from "../principals/principal-matcher";
import {
    IPolicy,
    IResourcePolicy,
    IPrincipalPolicy,
    PolicyEffect,
    IPolicyManifest,
    IResourcePolicyManifest,
    IPrincipalPolicyManifest,
    IPolicyPrincipalsMatcher,
    IPolicyActionsMatcher,
    IPolicyResourcesMatcher
} from "./interfaces";

export class Policy<A extends string = string> extends BaseResource implements IPolicy<A> {
    private readonly _actions: IPolicyActionsMatcher<A>;
    private readonly _effect: PolicyEffect;

    constructor(manifest: IPolicyManifest) {
        super(manifest);
        switch (manifest.effect) {
            case "deny":
                this._effect = PolicyEffect.deny;
                break;
            case "allow":
                this._effect = PolicyEffect.allow;
                break;
        }
        this._actions = createMatcher(manifest.actions);
    }

    public get actions(): IPolicyActionsMatcher<A> {
        return this._actions;
    }

    public get effect(): PolicyEffect {
        return this._effect;
    }

    public get identifier(): string {
        return "policy:" + this.id;
    }
}

export class ResourcePolicy<P extends IPrincipal = IPrincipal, A extends string = string> extends Policy<A> implements IResourcePolicy<P, A> {
    private readonly _principals: IPolicyPrincipalsMatcher<P>;

    constructor(manifest: IResourcePolicyManifest) {
        super(manifest);
        this._principals = createPolicyPrincipalsMatcher(manifest.principals);
    }

    public get principals(): IPolicyPrincipalsMatcher<P> {
        return this._principals;
    }
}

export class PrincipalPolicy<A extends string = string> extends Policy<A> implements IPrincipalPolicy<A> {
    private readonly _resources: IPolicyResourcesMatcher;

    constructor(manifest: IPrincipalPolicyManifest) {
        super(manifest);
        this._resources = createMatcher(manifest.resources);
    }

    public get resources(): IPolicyResourcesMatcher {
        return this._resources;
    }
}
