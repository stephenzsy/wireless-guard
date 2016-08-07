export interface IManifest {
    id: string;
    ownerId: string;
    /**
     * Manifest absolute path
     */
    manifestPath: string;
    secretsDirPath: string;
}
