import { IResource, IResourceManifest } from "./resource";

export class BaseResource implements IResource {
    protected readonly manifest;

    constructor(manifest: IResourceManifest) {
        this.manifest = manifest;
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
}