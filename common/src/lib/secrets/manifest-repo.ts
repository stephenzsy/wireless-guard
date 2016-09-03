import { IManifest } from "./secret-interface";
import Guid from "../common/guid";
import AppContext from "../app-context";
import ConfigPath from "../config/config-path";
import { IUser } from "../users";
import { GeneralErrors } from "../errors";

export module SecretManifiestRepository {
    const secretsDir: string = "secrets";
    const manifestFilename: string = "manifest.json";

    export class ManifestDoesNotExistError extends GeneralErrors.ResourceNotExistError {
        constructor(manifestId: Guid) {
            super(`Manifest ${manifestId.toString()} is not found.`);
        }
    }

    function getManifestDirectory(moduleName: AppContext.ModuleName): ConfigPath {
        return AppContext.getInstanceConfigPath(moduleName)
            .path(secretsDir);
    }

    export function initManifest(owner: IUser, moduleName: AppContext.ModuleName): IManifest {
        let id = new Guid();
        let secretDirPath = getManifestDirectory(moduleName)
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

    export function loadManifest<T extends IManifest>(id: Guid, moduleName: AppContext.ModuleName): T {
        let secretDirPath = getManifestDirectory(moduleName)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);

        if (!manifestPath.exists) {
            throw new ManifestDoesNotExistError(id);
        }

        return require(manifestPath.fsPath) as T;
    }
}

export default SecretManifiestRepository;
