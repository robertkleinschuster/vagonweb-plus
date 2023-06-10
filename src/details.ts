import {css, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";

@customElement('v-details')
class Details extends LitElement {
    @property()
    public path: string;

    @state()
    private route: string = '';
    @state()
    private carriages: TemplateResult[] = []

    public async fetchData(path: string) {
        const url = new URL(path, "http://vagonweb.snappy.blue");
        const response = await fetch(url);
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const route = Array.prototype.filter
            .call(doc.querySelector('.trasa')?.childNodes ?? [], (child) => child.nodeType === Node.TEXT_NODE)
            .map((child) => child.textContent)
            .join('') as string;

        this.route = route.split(',').shift() + ' - ' + route.split(',').pop();

        const firstPlanned = doc.querySelector('#planovane_razeni .vlacek')
        this.carriages = [];
        if (firstPlanned) {
            const imageNodes = firstPlanned.querySelectorAll('.vagonek img') as NodeListOf<HTMLImageElement>;
            for (const imgNode of imageNodes) {
                imgNode.setAttribute('src', `https://www.vagonweb.cz/${imgNode.getAttribute('src')}`)
                const targetHeight = imgNode.height * 0.8;
                const targetWidth = targetHeight * imgNode.width / imgNode.height;
                imgNode.height = targetHeight;
                imgNode.width = targetWidth;
                this.carriages.push(html`
                    <span class="carriage" style="min-width: ${imgNode.width}px">${imgNode}</span>
                `)
            }
        }
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);
        if (_changedProperties.has('path')) {
            this.fetchData(this.path)
        }
    }

    protected render() {
        return html`
            <p class="route">${this.route ? this.route : html`<slot></slot>`}</p>
            <p class="carriages">${this.carriages}</p>
        `;
    }

    static styles = css`
      :host {
        display: block;
        height: 7rem;
      }
      
      .route {
        overflow: auto;
        white-space: nowrap;
      }
      
      .carriages {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      .carriage {
        height: 3rem;
        position: relative;
      }
      
      .carriage img {
        position: absolute;
        bottom: 0;
      }
    `
}