import * as child_process from "child_process";
import * as fs from "fs";

export async function execFile(command: string, args?: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        child_process.execFile(command, args, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export async function readFileAsString(filename: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.toString());
        });
    });
}

export async function fsRename(oldPath: string, newPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
