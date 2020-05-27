import { ApiConsole } from './src/ApiConsole';

declare global {
  interface HTMLElementTagNameMap {
    "api-console": ApiConsole;
  }
}
