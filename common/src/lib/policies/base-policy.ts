import { IResource } from "../common/resource";
import { BaseResource } from "../common/base-resource";
import { IPrincipal } from "../principals/interfaces";
import {
    IPolicy,
    PolicyEffect,
    IPolicyManifest,
    IPolicyPrincipalsMatcher,
    IPolicyActionsMatcher,
    IPolicyResourcesMatcher
} from "./interfaces";

export class BasePolicy<P extends IPrincipal, A, R extends IResource> extends BaseResource implements IPolicy<P, A, R> {
    private readonly _principals: IPolicyPrincipalsMatcher<P, any>;
    private readonly _actions: IPolicyActionsMatcher<A, any>;
    private readonly _resources: IPolicyResourcesMatcher<R, any>;
    private readonly _effect: PolicyEffect;

    constructor(manifest: IPolicyManifest<any, any, any>,
        principals: IPolicyPrincipalsMatcher<P, any>,
        actions: IPolicyActionsMatcher<A, any>,
        resources: IPolicyResourcesMatcher<R, any>) {
        super(manifest);
        switch (manifest.effect) {
            case "deny":
                this._effect = PolicyEffect.deny;
                break;
            case "allow":
                this._effect = PolicyEffect.allow;
                break;
        }
        this._principals = principals;
        this._actions = actions;
        this._resources = resources;
    }

    public get principals(): IPolicyPrincipalsMatcher<P, any> {
        return this._principals;
    }

    public get actions(): IPolicyActionsMatcher<A, any> {
        return this._actions;
    }

    public get resources(): IPolicyResourcesMatcher<R, any> {
        return this._resources;
    }

    public get effect(): PolicyEffect {
        return this._effect;
    }
}