export default class AsyncScriptExecutor {
    private action: () => Promise<void>;
    constructor(action: () => Promise<void>) {
        this.action = action;
    }

    public async execute(): Promise<void> {
        try {
            return await this.action();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
