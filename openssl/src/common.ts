import * as child_process from "child_process";

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
