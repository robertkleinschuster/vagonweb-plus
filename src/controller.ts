import {ReactiveController} from "lit";
import App from "./app.ts";
import {Client, Train} from "./client/Client.ts";

export default class Controller implements ReactiveController {
    private host: App;
    private client: Client = new Client();

    constructor(host: App) {
        (this.host = host).addController(this);
    }

    public async search(input: string): Promise<Train[]> {
        return await this.client.search(input);
    }

    hostConnected() {
    }
}