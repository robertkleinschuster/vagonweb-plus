import {ReactiveController} from "lit";
import App from "./app.ts";

export default class Controller implements ReactiveController {
    private host: App;

    constructor(host: App) {
        (this.host = host).addController(this);
    }

    public async search(input: string) {
        const url = new URL(`http://vagonweb.snappy.blue/search.php?q=${input}`);
        const response = await fetch(url);
        return await response.json();
    }

    public async details(path: string) {
        const url = new URL(path, "http://vagonweb.snappy.blue");
        const response = await fetch(url);
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        console.log(doc)
        const imageNodes = doc.querySelectorAll('#planovane_razeni .vagonek img') as NodeListOf<HTMLImageElement>;
        const images: string[] = [];
        for (const imgNode of imageNodes) {
            images.push('https://www.vagonweb.cz/' + imgNode.getAttribute('src'));
        }

        return {
            images: images
        };
    }

    hostConnected() {
    }
}