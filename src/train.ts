import {css, html, LitElement, nothing, PropertyValues} from "lit";
import {customElement, property, state} from "lit/decorators.js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import Controller from "./controller.ts";

@customElement('v-train')
class Train extends LitElement {
    private controller = new Controller(this)

    @property()
    public web: string;
    @property()
    public title: string;
    @property()
    public operator: string;
    @property()
    public type: string;
    @property()
    public nr: string;

    @state()
    private delay = 0;

    @state()
    private realtime = false;

    @state()
    private arrival = null

    @state()
    private destination = null

    @state()
    private platform = null

    @state()
    private remarks = [];

    protected async willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);

        if (_changedProperties.has('type') || _changedProperties.has('nr')) {
            const realtime = await this.controller.realtime(this.operator, this.type, this.nr)
            this.realtime = null !== realtime;
            if (realtime) {
                this.delay = realtime.delay;
                this.arrival = realtime.arrival.toLocaleString();
                this.destination = realtime.destination;
                this.remarks = realtime.remarks;
                this.platform = realtime.arrivalPlatform;
            } else {
                this.delay = 0;
                this.arrival = null;
                this.destination = null;
                this.platform = null;
                this.remarks = []
            }
        }
    }

    private realtimeInfo() {
        if (this.realtime) {
            const result = []
            result.push(html`
                <div>Echtzeitdaten (DB Navigator):</div>`)
            result.push(html`<span
                    class="${this.delay ? 'delay' : 'arrival'}">${this.destination}${this.platform ? html` (${this.platform})` : nothing}
                : ${this.arrival}</span>`)
            result.push(html`<p class="remarks">${this.remarks.map(remark => html`
                <span class="${remark.type}">${remark.text}</span>
            `)}</p>`)

            return result;
        }
        return html`Echtzeitdaten nicht verfügbar.`;
    }

    private realtimeDelayInfo() {
        if (this.realtime && this.delay) {
            return html`<span class="delay"> (+${this.delay} min)</span>`
        }
        return nothing;
    }

    protected render() {
        return html`
            <a href="${this.web}">
                <span>${unsafeHTML(this.title)}${this.realtimeDelayInfo()}</span>
                <span class="logos">
                    <img src="/operators/${this.operator}.svg" alt="${this.operator}"
                         @error="${this.imageError}">
                    <img src="/types/${this.type.replace(':', '-')}.svg" alt="${this.type.split(':').pop()}"
                         @error="${this.trainTypeFallbackImage.bind(this, this.type)}">
                </span>
            </a>
            <div class="${this.realtime ? 'realtime' : 'realtime unavailable'}">${this.realtimeInfo()}</div>
        `;
    }

    static styles = css`
      *, *:before, *:after {
        box-sizing: border-box;
      }

      .realtime {
        padding: 2px;
        margin: .5rem 0;
        border: 1px solid;
      }

      .realtime.unavailable {
        color: grey;
        border-color: grey;
      }

      .remarks {
        display: flex;
        margin: 0;
        gap: .5rem;
        white-space: nowrap;
        overflow: auto;
      }

      .remarks > * {
        display: flex;
        gap: .25rem;
        align-items: center;
      }

      .remarks > *:before {
        content: "i";
        font-size: 10px;
        font-weight: bolder;
        text-align: center;
        height: 1rem;
        width: 1rem;
        border-radius: 10px;
        border: 1px solid;
      }

      .delay {
        color: red;
        font-weight: bold;
      }

      .arrival {
        color: green;
        font-weight: bold;
      }

      .logos {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
        padding: 4px;
        border-radius: 2px;
        background: #fff;
      }

      .logos img {
        height: 1.5rem;
        width: auto;
        max-width: 10rem;
      }

      .logos span {
        color: black;
        font-weight: bold;
        font-style: italic;
        font-size: 1.5rem;
        padding: 0 .25rem;
        height: 1.5rem;
        line-height: 1;
        width: auto;
      }

      a {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: .5rem;
        padding: 2px;
        font-size: 1.25rem;

        font-weight: 500;
        color: inherit;
        text-decoration: none;
      }

      a:hover {
        color: inherit;
      }
    `

    private imageError(event: Event) {
        const img = event.target as HTMLImageElement
        if (img.src.endsWith('.svg')) {
            img.src = img.src.replace('.svg', '.png')
            return;
        }
        const replace = document.createElement('span')
        replace.innerText = img.alt
        img.replaceWith(replace)
    }

    private trainTypeFallbackImage(type: string, event: Event) {
        const img = event.target as HTMLImageElement
        const normalizedType = type.replace(':', '-');
        if (type.includes(':') && img.src.includes(encodeURIComponent(normalizedType))) {
            img.src = img.src.replace(encodeURIComponent(normalizedType), type.split(':').pop())
        } else {
            this.imageError(event)
        }
    }
}