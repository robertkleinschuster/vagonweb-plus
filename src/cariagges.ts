import {css, html, LitElement, PropertyValues} from "lit";
import {customElement, property, state} from "lit/decorators.js";

@customElement('v-carriages')
class Cariagges extends LitElement {
    @property()
    public path: string;

    private images = []

    public async loadImages(path: string) {
        const url = new URL(path, "http://vagonweb.snappy.blue");
        const response = await fetch(url);
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const firstPlanned = doc.querySelector('#planovane_razeni .vlacek')
        const imageNodes = firstPlanned.querySelectorAll('.vagonek img') as NodeListOf<HTMLImageElement>;
        const images: string[] = [];
        for (const imgNode of imageNodes) {
            images.push('https://www.vagonweb.cz/' + imgNode.getAttribute('src'));
        }
        return images;
    }

    protected async scheduleUpdate():  Promise<void> {
        this.images = await this.loadImages(this.path)
        super.scheduleUpdate();
    }

    protected render() {
        return html`
            ${this.images.map(src => html`<img src="${src}" alt="">`)}
        `;
    }

    static styles = css`
      :host {
        display: flex;
        overflow: auto;
        height: 2rem;
      }
    `
}