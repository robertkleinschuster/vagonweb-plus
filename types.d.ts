import App from "./src/app";

declare global {
    interface HTMLElementTagNameMap {
        'v-app': App
    }
}