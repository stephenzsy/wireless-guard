import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";

export class ConfigPath {
    private _fsPath: string;
    constructor(joinedPath) {
        this._fsPath = joinedPath;
    }

    public get fsPath(): string {
        return this._fsPath;
    }

    public path(...paths: string[]): ConfigPath {
        let subFsPath: string = this.fsPath;
        for (let p of paths) {
            subFsPath = path.join(subFsPath, p);
        }
        return new ConfigPath(subFsPath);
    }

    public get exists(): boolean {
        return fs.existsSync(this.fsPath);
    }

    public get isDirectory(): boolean {
        return fs.statSync(this.fsPath).isDirectory();
    }

    public ensureDirExists(): this {
        fse.mkdirpSync(path.dirname(this.fsPath));
        return this;
    }

    public loadJsonConfig<T>(): T {
        return require(this.fsPath) as T;
    }

    public saveJsonConfig<T>(config: T): void {
        fse.writeJsonSync(this.fsPath, config);
    }
}

export default ConfigPath;
