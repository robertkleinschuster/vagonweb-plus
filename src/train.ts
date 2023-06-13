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

    private arrival = null;

    protected async willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);

        if (_changedProperties.has('type') || _changedProperties.has('nr')) {
            const realtime = await this.controller.realtime(this.operator, this.type, this.nr)
            this.realtime = null !== realtime;
            if (realtime) {
                this.delay = realtime.delay;
                this.arrival = realtime.arrival.toLocaleString();
            } else {
                this.delay = 0;
                this.arrival = null;
            }
        }
    }

    private realtimeInfo() {
        if (this.realtime) {
            const result = []
            if (this.delay) {
                result.push(html`<span class="delay">Ank.: ${this.arrival} (+${this.delay} min)</span>`)
            } else {
                result.push(html`<span class="arrival">Ank.: ${this.arrival}</span>`)
            }
            return result;
        }
        return '';
    }

    protected render() {
        return html`
            <a href="${this.web}">
                <span>${unsafeHTML(this.title)} ${this.realtimeInfo()}</span>
                <span class="logos">
                    <img src="/logos/${this.operator}.svg" alt="${this.operator}"
                         @error="${this.imageError}">
                    <img src="/logos/${this.type.replace(':', '-')}.svg" alt="${this.type}"
                         @error="${this.trainTypeFallbackImage.bind(this, this.type)}">
                </span>
            </a>
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
        gap: .5rem;
        padding: 2px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.5);
      }

      .logos img {
        height: 1.5rem;
        width: auto;
      }

      .logos span {
        color: var(--color);
        height: 1.5rem;
        width: auto;
      }

      a {
        display: flex;
        justify-content: space-between;
        gap: .5rem;
        padding: 2px;

        font-weight: 500;
        color: #646cff;
        text-decoration: inherit;
      }

      a:hover {
        color: #535bf2;
      }


      @media (prefers-color-scheme: light) {
        a:hover {
          color: #747bff;
        }


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