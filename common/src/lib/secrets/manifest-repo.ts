import { IManifest } from "./secret-interface";
import Uuid from "../common/uuid";
import AppContext from "../app-context";
import ConfigPath from "../config/config-path";
import { IUser } from "../users";
import { GeneralErrors } from "../errors";

export module SecretManifiestRepository {
    const secretsDir: string = "secrets";
    const manifestFilename: string = "manifest.json";

    export class ManifestDoesNotExistError extends GeneralErrors.ResourceNotExistError {
        constructor(manifestId: string) {
            super(`Manifest ${manifestId.toString()} is not found.`);
        }
    }

    function getManifestDirectory(moduleName: AppContext.ModuleName): ConfigPath {
        return AppContext.getInstanceConfigPath(moduleName)
            .path(secretsDir);
    }

    export function initManifest(owner: IUser, moduleName: AppContext.ModuleName): IManifest {
        let id = Uuid.v4();
        let secretDirPath = getManifestDirectory(moduleName)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);
        let manifest: IManifest = {
            id: id.toString(),
            ownerId: owner.id.toString(),
            manifestPath: manifestPath.fsPath,
            secretsDirPath: secretDirPath.fsPath,
            createdAt: new Date().toISOString()
        };
        manifestPath.ensureDirExists().saveJsonConfig(manifest);
        return manifest;
    }

    export function loadManifest<T extends IManifest>(id: string, moduleName: AppContext.ModuleName): T {
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
