import {css, html, LitElement, nothing, PropertyValues, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import Controller from "./controller.ts";

@customElement('v-details')
class Details extends LitElement {

    private controller = new Controller(this)

    @property()
    public operator: string
    @property()
    public nr: string
    @property()
    public type: string


    @state()
    private route: string = ''
    @state()
    private info: string = ''

    @state()
    private infoWarning = false;

    @state()
    private badges: TemplateResult[] = [];

    @state()
    private carriages: TemplateResult[] = []

    @state()
    private links: TemplateResult[] = [];

    public async fetchData(operator: string, nr: string) {
        const train = await this.controller.train(operator, nr)

        this.route = train.route ?? '';
        this.infoWarning = !!train.info;
        this.info = train.info ?? '<span class="info2j">i</span> täglich';
        this.badges = (train.badges ?? []).map(badge =>
            html`
                <span class="badge">
                    <img src="${badge.src}" alt="${badge.title}" title="${badge.title}">
                </span>
            `
        );
        this.carriages = (train.carriages ?? []).map(carriage =>
            html`
                <span class="carriage" style="min-width: ${parseInt(carriage.width) * .8}px">
                    <img src="${carriage.src}" width="${parseInt(carriage.width) * .8}" height="${parseInt(carriage.height) * 0.8}">
                </span>
            `)
        this.links = (train.links ?? []).map(link =>
            html`<a href="${link.href}">${link.name}</a>`
        )
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);
        if (_changedProperties.has('operator') || _changedProperties.has('nr')) {
            this.fetchData(this.operator, this.nr)
        }
    }

    protected render() {
        return html`
            <p class="route">${this.route ? this.route : html`
                <slot></slot>`}</p>
            <p class="badges">${this.badges}</p>
            <p class="${this.infoWarning ? 'info warning' : 'info'}">${unsafeHTML(this.info)}</p>
            <p class="carriages">${this.carriages}</p>
            <p class="links">${this.links}</p>
        `
    }

    static styles = css`
      :host {
        display: block;
        height: 9.5rem;
      }
      
      a {
        color: inherit;
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
        margin: 0;
        overflow: auto;
        white-space: nowrap;
      }

      .warning:not(:empty) {
        padding: 3px;
        background: hsl(40, 100%, 49%);
        font-weight: bolder;
        color: black;
      }

      .badges {
        display: flex;
        margin: .25rem 0;
        gap: .25rem;
        height: 1rem;
        overflow: auto;
      }

      .badge {
        display: flex;
        overflow: hidden;
        justify-content: center;
        border-radius: 4px;
        height: 1rem;
        width: 1rem;
        background: #0204c7;
      }

      .badge img {
        height: 1rem;
        width: auto;
      }
      
    
      .carriages {
        margin: .25rem 0;
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

      .links {
        margin: 0;
        display: flex;
        overflow: auto;
        gap: .5rem;
        white-space: nowrap;
      }
    `
}