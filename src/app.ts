import {LitElement, css, html, nothing, PropertyValues} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import Controller from "./controller.ts";

@customElement('v-app')
export default class App extends LitElement {
    private controller: Controller = new Controller(this)

    @query('#search')
    private searchInput: HTMLInputElement

    @state()
    private results = []

    render() {
        return html`
            <header>
                <h1>vagonWEB +</h1>
                <div class="search">
                    <input id="search" type="search" @change="${this.search}" @keyup="${this.search}"
                           placeholder="Zug suchen (Nr. o. Name)" autocomplete="off" spellcheck="false"
                           autocapitalize="off" autocorrect="off" autofocus>
                    <button @click="${this.reset}">Löschen</button>
                </div>
            </header>
            <ul>
                ${this.results.map(item =>
                        html`
                            <li>
                                <a href="${item.vagonweb}">${item.type}
                                    ${item.nr}${item.name ? html` (${item.name})` : nothing}</a>
                                <p>${item.route}</p>
                            </li>`
                )}
            </ul>
        `
    }

    reset() {
        this.searchInput.focus()
        this.searchInput.value = ''
    }

    async search(event) {
        if ('' === this.searchInput.value.trim()) {
            this.searchInput.focus()
            return
        }
        if (event instanceof KeyboardEvent && event.code === 'Enter') {
            this.searchInput.blur()
            return
        }
        this.results = await this.controller.search(this.searchInput.value)
    }

    static styles = css`
      :host {
        width: 100%;
      }

      header {
        background: #3b3b3b;
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        padding: 1rem 2rem;
      }

      h1 {
        margin: 0 0 1rem 0;
      }

      input {
        padding: .5rem;
        font-size: 16px;
      }

      a {
        font-weight: 500;
        color: #646cff;
        text-decoration: inherit;
      }

      a:hover {
        color: #535bf2;
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

      @media (prefers-color-scheme: light) {
        a:hover {
          color: #747bff;
        }

        button {
          background-color: #f9f9f9;
        }

        header {
          background: #e3e3e3;
        }
      }
    `
}
