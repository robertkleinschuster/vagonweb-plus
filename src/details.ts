import {css, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {directTextContent} from "./utils.ts";
import {unsafeHTML} from "lit/directives/unsafe-html.js";

@customElement('v-details')
class Details extends LitElement {
    @property()
    public path: string

    @state()
    private route: string = ''
    @state()
    private info: string = ''

    @state()
    private carriages: TemplateResult[] = []

    public async fetchData(path: string) {
        const url = new URL(path, "http://vagonweb.snappy.blue")
        const response = await fetch(url)
        const htmlString = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')

        const route = directTextContent(doc.querySelector('.trasa'))

        this.route = route.split(',').shift() + ' - ' + route.split(',').pop()
        this.info = doc.querySelector('.omezeni_bord div')?.innerHTML ?? '';

        if (!this.info) {
            this.info = '<span class="info2j">i</span> täglich';
        }

        const firstPlanned = doc.querySelector('#planovane_razeni .vlacek')
        this.carriages = []
        if (firstPlanned) {
            const imageNodes = firstPlanned.querySelectorAll('.vagonek img') as NodeListOf<HTMLImageElement>
            for (const imgNode of imageNodes) {
                imgNode.setAttribute('src', `https://www.vagonweb.cz/${imgNode.getAttribute('src')}`)
                const targetHeight = imgNode.height * 0.8
                const targetWidth = targetHeight * imgNode.width / imgNode.height
                imgNode.height = targetHeight
                imgNode.width = targetWidth
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
            <p class="info">${unsafeHTML(this.info)}</p>
            <p class="carriages">${this.carriages}</p>
        `
    }

    static styles = css`
      :host {
        display: block;
        height: 8rem;
      }

      .info1j, .info2j {
        background: red;
        color: white;
        padding: 0 5px;
        font-weight: bold;
      }

      .info2j {
        background: #606060;
      }

      .route, .info {
        margin: .5rem 0;
        overflow: auto;
        white-space: nowrap;
      }

      .info:not(:empty) {
        border: var(--light-border);
        padding: 1px 2px;
        border-radius: 4px;
      }

      .carriages {
        margin: .5rem 0;
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