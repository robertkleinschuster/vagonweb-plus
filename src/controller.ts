import {ReactiveController} from "lit";
import App from "./app.ts";

export default class Controller implements ReactiveController {
    private host: App;

    constructor(host: App) {
        (this.host = host).addController(this);
    }

    public async search(input: string) {
        const url = new URL(`https://vagonweb.snappy.blue/search.php?q=${input}`);
        const response = await fetch(url);
        return await response.json();
    }

    hostConnected() {
    }
}