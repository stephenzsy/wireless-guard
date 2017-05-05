import { IResource, IResourceManifest } from "./resource";

export class BaseResource<M extends IResourceManifest = IResourceManifest> implements IResource {
    private readonly _manifest: M;

    constructor(manifest: M) {
        this._manifest = manifest;
    }

    public get id(): string {
        return this.manifest.id;
    }

    public get name(): string {
        return this.manifest.name;
    }

    public get dateCreated(): Date {
        return this.manifest.dateCreated;
    }

    public get manifest(): M {
        return this._manifest;
    }
}