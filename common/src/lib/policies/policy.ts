export enum GeneralPolicyResourceType {
    All
}

export type IPolicyResource = GeneralPolicyResourceType | string | RegExp;

export enum PolicyAction {
    Default, // fall through
    Allow,
    Deny
}

export interface IPolicy {
    id: string;
    resource: IPolicyResource;
    action: PolicyAction;
    matches(resource: string): boolean;
}

export class Policy implements IPolicy {
    private _id: string;
    private _resource: IPolicyResource;
    private _action: PolicyAction;

    constructor(id: string, resource: IPolicyResource, action: PolicyAction) {
        this._id = id;
        this._resource = resource;
        this._action = action;
    }

    public get id(): string {
        return this._id;
    }

    public get resource(): IPolicyResource {
        return this._resource;
    }

    public get action(): PolicyAction {
        return this._action;
    }

    public matches(resource: string): boolean {
        if (this._resource === GeneralPolicyResourceType.All) {
            return true;
        }
        if (typeof this._resource === "string") {
            return this._resource === resource;
        }
        return (this._resource as RegExp).test(resource);
    }
}
