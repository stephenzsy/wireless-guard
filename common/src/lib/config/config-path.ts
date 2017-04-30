import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";

export class ConfigPath {
    private _fsPath: string;
    constructor(joinedPath: string) {
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
        try {
            let stat = fs.lstatSync(path.dirname(this.fsPath));
        } catch (e) {
            fse.mkdirpSync(path.dirname(this.fsPath));
        }
        return this;
    }

    public mkdirp(): this {
        fse.mkdirpSync(path.dirname(this.fsPath));
        return this;
    }

    public loadJsonConfig<T>(): T {
        return require(this.fsPath) as T;
    }

    public saveJsonConfig<T>(config: T): void {
        fse.writeJsonSync(this.fsPath, config);
    }

    public writeString(str: string): void {
        fse.writeFileSync(this.fsPath, str);
    }

    public async read(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(this.fsPath, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            })
        });
    }
}

export default ConfigPath;
