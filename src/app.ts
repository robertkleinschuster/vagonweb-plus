import {LitElement, css, html, nothing, PropertyValues} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import Controller from "./controller.ts";
import "./details.ts"
import "./train.ts"
import {Train} from "./client/Client.ts";

@customElement('v-app')
export default class App extends LitElement {
    private controller: Controller = new Controller(this)

    @query('#search')
    private searchInput: HTMLInputElement

    @state()
    private trains: Train[] = []

    render() {
        return html`
            <header @touchmove="${e => e.preventDefault()}">
                <h1>vagonWEB +</h1>
                <div class="search">
                    <input id="search" type="search" @change="${this.search}" @keyup="${this.search}"
                           placeholder="Zug suchen (Nr. o. Name)" autocomplete="off" spellcheck="false"
                           autocapitalize="off" autocorrect="off" autofocus>
                    <button @click="${this.reset}">Löschen</button>
                </div>
            </header>
            <main>
                <ul>
                    ${repeat(this.trains, train => train.operator + train.nr, train => html`
                        <li>
                            <v-train title="${train.title}" type="${train.type}" operator="${train.operator}" nr="${train.nr}" web="${train.web}"></v-train>
                            <v-details operator="${train.operator}" type="${train.type}" nr="${train.nr}">${train.route}</v-details>
                        </li>`
                    )}
                </ul>
            </main>
        `
    }

    reset(e) {
        e.preventDefault()
        this.searchInput.focus()
        this.searchInput.value = ''
        this.searchInput.dispatchEvent(new Event('change'))
    }

    async search(event) {
        if ('' === this.searchInput.value.trim()) {
            this.searchInput.focus()
            this.trains = [];
            return
        }
        if (event instanceof KeyboardEvent && event.code === 'Enter') {
            this.searchInput.blur()
            return
        }
        this.trains = await this.controller.search(this.searchInput.value)
    }

    static styles = css`
      :host {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      h1 {
        color: hsl(5, 84%, 40%);
        font-size: 1.5rem;
        background: white;
        border: 4px solid hsl(5, 84%, 40%);
        border-radius: 5px;
        padding: .25rem .5rem;
        align-self: flex-start;
      }

      header {
        border-bottom: 2px solid #D9D9D6;
        top: 0;
        display: flex;
        flex-direction: column;
        padding: 1rem 2rem;
        overscroll-behavior: none;
      }

      main {
        overflow: auto;
        overscroll-behavior: none;
      }

      h1 {
        margin: 0 0 1rem 0;
      }

      input {
        padding: .5rem;
        font-size: 16px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: .5rem;
      }

      li {
        padding: .5rem;
        border-bottom: var(--light-border);
      }

      li:last-of-type {
        border: none;
      }

      a {
        display: flex;
        justify-content: space-between;
        gap: .5rem;
        padding: 2px;

        font-weight: 500;
        color: inherit;
      }

      a:hover {
        color: inherit;
      }

      button {
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: #1a1a1a;
        cursor: pointer;
        transition: border-color 0.25s;
      }

      button:hover {
        border-color: #646cff;
      }

      button:focus,
      button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
      }

      .search {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search input {
        flex-grow: 1;
      }
    `
}
