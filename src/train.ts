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

    protected async willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);

        if (_changedProperties.has('type') || _changedProperties.has('nr')) {
            const realtime = await this.controller.realtime(this.operator, this.type, this.nr)
            this.realtime = null !== realtime;
            if (realtime) {
                this.delay = realtime.delay;
                this.arrival = realtime.arrival.toLocaleString();
                this.destination = realtime.destination;
            } else {
                this.delay = 0;
                this.arrival = null;
                this.destination = null;
            }
        }
    }

    private realtimeInfo() {
        if (this.realtime) {
            const result = []
            if (this.delay) {
                result.push(html`<span class="delay">${this.destination}: ${this.arrival}</span>`)
            } else {
                result.push(html`<span class="arrival">${this.destination}: ${this.arrival}</span>`)
            }
            return result;
        }
        return '';
    }

    private realtimeDelayInfo()
    {
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
            <div>${this.realtimeInfo()}</div>
        `;
    }

    static styles = css`
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