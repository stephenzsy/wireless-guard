import * as process from "process";

export abstract class BaseCommand<TOpt> {
    protected readonly options: TOpt;
    constructor(args: string[]) {
        this.options = this.parseArgs(args);
    }

    protected abstract parseArgs(args: string[]): TOpt;

    public abstract exec():void;
}
