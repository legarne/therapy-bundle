/**
 * Default files that are created when starting a new project
 * for the first time.
 * @module
 */

const denoJson = `{
  "tasks": {
    "dev": "deno run -RWNE --allow-run jsr:@therapy/bundle/dev",
    "build": "deno run -RWNE --allow-run jsr:@therapy/bundle/build"
  },
  "imports": {},
  "compilerOptions": {
    "lib": ["deno.ns", "dom", "dom.iterable"],
    "types": ["./content-types.d.ts"]
  }
}`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"></meta>
    <title>Deno App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.ts"></script>
  </body>
</html>`;

const mainCss = `html, body {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
}`;

const mainTs = `import "./main.css";

const root = document.querySelector("#root")!;
root.innerHTML = "Hello Deno";
`;

const dTs = `declare module "!(*.module).css" {
  const content: string;
  export default content;
}
declare module "!(*.module).scss" {
  const content: string;
  export default content;
}
declare module "!(*.module).sass" {
  const content: string;
  export default content;
}

declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}
declare module "*.module.scss" {
  const content: Record<string, string>;
  export default content;
}
declare module "*.module.sass" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.json" {
  const content: unknown;
  export default content;
}
declare module "*.txt" {
  const content: string;
  export default content;
}
declare module "*.data" {
  const content: Uint8Array;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}`;

export default {
  "deno.json": denoJson,
  "index.html": indexHtml,
  "content-types.d.ts": dTs,
  "src/main.ts": mainTs,
  "src/main.css": mainCss,
};
