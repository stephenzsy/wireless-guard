import * as process from "process";

export abstract class BaseCommand<TOpt> {
    protected options: TOpt;
    constructor() {
        let argv = process.argv;
        argv.shift();
        argv.shift();
        this.options = this.parseArgs(argv);
    }

    protected abstract parseArgs(args: string[]): TOpt;

    public abstract exec():void;
}
