import { IResource, IResourceManifest } from "./resource";

export function toResourceManifest(resource: IResource): IResourceManifest {
    return {
        id: resource.id,
        name: resource.name,
        dateCreated: resource.dateCreated
    };
}
