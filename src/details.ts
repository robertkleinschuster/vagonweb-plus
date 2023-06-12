import {css, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {Client, TrainDetails} from "./client/Client.ts";

@customElement('v-details')
class Details extends LitElement {
    @property()
    public operator: string
    @property()
    public nr: string


    @state()
    private route: string = ''
    @state()
    private info: string = ''

    @state()
    private badges: TemplateResult[] = [];

    @state()
    private carriages: TemplateResult[] = []

    @state()
    private links: TemplateResult[] = [];

    public async fetchData(operator: string, nr: string) {
        const client = new Client()
        const train = await client.train(operator, nr)

        this.route = train.route ?? '';
        this.info = train.info ?? '<span class="info2j">i</span> täglich';
        this.badges = (train.badges ?? []).map(badge =>
            html`<img src="${badge.src}" alt="${badge.title}" title="${badge.title}">`
        );
        this.carriages = (train.carriages ?? []).map(carriage =>
            html`
                <span class="carriage" style="min-width: ${carriage.width}px">
                    <img src="${carriage.src}" width="${carriage.width}" height="${carriage.height}">
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
            <p class="info">${unsafeHTML(this.info)}</p>
            <p class="carriages">${this.carriages}</p>
            <p class="links">${this.links}</p>
        `
    }

    static styles = css`
      :host {
        display: block;
        height: 9.5rem;
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
        margin: .25rem 0;
        overflow: auto;
        white-space: nowrap;
      }

      .badges {
        display: flex;
        margin: .25rem 0;
        gap: .125rem;
        height: 1rem;
        overflow: auto;
      }

      .info:not(:empty) {
        border: var(--light-border);
        padding: 1px 2px;
        border-radius: 4px;
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
      }
    `
}