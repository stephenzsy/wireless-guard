import * as path from "path";
import * as fs from "fs";

export class ConfigPath {
    private fsPath: string;
    constructor(joinedPath) {
        this.fsPath = joinedPath;
    }

    public path(...paths: string[]): ConfigPath {
        let subFsPath: string = this.fsPath;
        for (let p of paths) {
            subFsPath = path.join(subFsPath, p);
        }
        return new ConfigPath(subFsPath);
    }

    public loadConfig(): any {
        return require(this.fsPath).config;
    }
}

export default ConfigPath;
