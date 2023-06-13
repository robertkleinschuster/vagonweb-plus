import {ReactiveController, ReactiveControllerHost} from "lit";
import {Client, Train} from "./client/Client.ts";

export default class Controller implements ReactiveController {
    private host: ReactiveControllerHost
    private client: Client = new Client()

    constructor(host: ReactiveControllerHost) {
        (this.host = host).addController(this)
    }

    public async search(input: string): Promise<Train[]> {
        this.client.abort()
        return await this.client.search(input)
    }

    public async train(operator: string, nr: string)
    {
        return await this.client.train(operator, nr)
    }

    public async realtime(operator: string, type: string, nr: string)
    {
        return await this.client.realtime(operator, type, nr)
    }

    hostDisconnected() {
        this.client.abort()
    }
}