import { IManifest } from "./manifest";
import Guid from "../common/guid";
import AppContext from "../app-context";
import ConfigPath from "../config/config-path";
import { IUser } from "../users/user";
import { GeneralErrors } from "../errors";

export module SecretManifiestRepository {
    const secretsDir: string = "secrets";
    const manifestFilename: string = "manifest.json";

    export class ManifestDoesNotExistError extends GeneralErrors.ResourceNotExistError {
        constructor(manifestId: string) {
            super("Manifest " + manifestId + " is not found.");
        }
    }

    export function initManifest(owner: IUser): IManifest {
        let id = new Guid();
        let secretDirPath = AppContext.getInstanceConfigPath()
            .path(secretsDir)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);
        let manifest: IManifest = {
            id: id.toString(),
            ownerId: owner.id.toString(),
            manifestPath: manifestPath.fsPath,
            secretsDirPath: secretDirPath.fsPath
        };
        manifestPath.ensureDirExists().saveJsonConfig(manifest);
        return manifest;
    }

    export function loadManifest<T extends IManifest>(id: string): T {
        let secretDirPath = AppContext.getInstanceConfigPath()
            .path(secretsDir)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);

        if (!manifestPath.exists) {
            throw new ManifestDoesNotExistError(id);
        }

        return require(manifestPath.fsPath) as T;
    }
}

export default SecretManifiestRepository;
