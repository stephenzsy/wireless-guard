export interface IResource {

    /**
     * ID of the resource
     */
    readonly id: string;

    /**
     * Display name of the resources
     */
    readonly name: string;

    /**
     * Timestamp of when the resource is created
     */
    readonly dateCreated: Date;
    /**
     * Manifest of the resource
     */
    readonly manifest: IResourceManifest;
}

/**
 * Json serializible manifest for {@type IResource}
 */
export interface IResourceManifest {
    id: string;
    name: string;
    dateCreated: Date;
}
