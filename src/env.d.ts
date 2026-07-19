/// <reference types="astro/client" />

declare const __BUILD_REVISION__: string;

declare namespace App {
  interface Locals {
    cspNonce: string;
  }
}
