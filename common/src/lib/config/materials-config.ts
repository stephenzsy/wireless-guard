import { ConfigPath } from "./config-path";
import { IMaterialManifest } from "../materials/interfaces";

export class MaterialsConfig {
    protected configPath: ConfigPath;
    private wellKnownManifests: StringMap<IMaterialManifest> = {}

    constructor(configPath: ConfigPath) {
        this.configPath = configPath.path("materials");
    }

    public getWellKnownMaterialManifest<T extends string, M extends IMaterialManifest>(
        identifier: T,
        refreshFromSource: boolean = false,
        forceRefresh: boolean = false): M | undefined {
        let currentManifest = this.wellKnownManifests[identifier] as (M | undefined);
        if (refreshFromSource) {
            if (!currentManifest || forceRefresh) {
                try {
                    currentManifest = this.wellKnownManifests[identifier] = this.configPath.path(identifier + ".json")
                        .ensureDirExists()
                        .loadJsonConfig<M>();
                } catch (err) {
                    return undefined;
                }
            }
        }
        return currentManifest;
    }

    public setWellKnownMaterialManifest<T extends string, M extends IMaterialManifest>(identifier: T, manifest: M) {
        this.wellKnownManifests[identifier] = manifest;
        this.configPath.path(identifier + ".json")
            .ensureDirExists()
            .saveJsonConfig(manifest);
    }

    public getMaterialConfigPath(identifier: string): ConfigPath {
        return this.configPath.path(identifier);
    }
}
