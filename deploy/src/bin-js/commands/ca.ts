import { BaseCommand } from "../base-command";

export enum CommandMode {
    createOrUpdate,
    overwrite
}

export interface ICaCommandArgs {
    mode: CommandMode
}

export default class Command extends BaseCommand<ICaCommandArgs> {
    public exec(): void {
    }

    public parseArgs(args: string[]): ICaCommandArgs {
        return {
            mode: CommandMode.createOrUpdate
        };
    }
}