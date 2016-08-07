export type IPolicyActionsType = "*" | string[];
export type IPolicyResource = string | RegExp;
export type IPolicyResourcesType = "*" | IPolicyResource[];

export enum PolicyEffect {
    Default, // fall through
    Allow,
    Deny
}

export interface IPolicy {
    id: string;
    name: string;
    actions: IPolicyActionsType;
    resources: IPolicyResourcesType;
    effect: PolicyEffect;
}

export class Policy implements IPolicy {
    private _id: string;
    private _name: string;
    private _actions: IPolicyActionsType;
    private _resources: IPolicyResourcesType;
    private _effect: PolicyEffect;

    constructor(id: string, name: string, actions: IPolicyActionsType, resources: IPolicyResourcesType, effect: PolicyEffect) {
        this._id = id;
        this._name = name;
        this._actions = actions;
        this._resources = resources;
        this._effect = effect;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get actions(): IPolicyActionsType {
        return [].concat(this._actions);
    }

    public get resources(): IPolicyResourcesType {
        return [].concat(this._resources);
    }

    public get effect(): PolicyEffect {
        return this._effect;
    }

    public test(action: string, resource: string): boolean {
        // test action
        if (this._actions !== "*" && !(this._actions as string[]).some(a => (a === action))) {
            return false;
        }

        if (this._resources !== "*" && !(this._resources as IPolicyResource[])
            .some(r => {
                if (typeof r === "string") {
                    return (r === resource);
                }
                return (r as RegExp).test(resource);
            })) {
            return false;
        }
        return true;
    }
}
