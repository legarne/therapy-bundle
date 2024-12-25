# @therapy/bundle
[![JSR](https://jsr.io/badges/@therapy/bundle)](https://jsr.io/@therapy/bundle)
## Description

@therapy/bundle is a simple web bundler and development server for Deno,
designed to be plain and simple. It is built on top of esbuild and aids in quick
setup for a web project. There isn't much that @therapy/bundle does on its own,
only serving as a light wrapper around Deno and esbuild.

## Permissions

@therapy/bundle requires the following permissions:

- read
- write
- net
- env
- run

## Installation

### Create new Project

```bash
deno run -RWNE --allow-run jsr:@therapy/bundle
```

The main creation script will create a new project in the current working
directory. It will have the following format:

```
/project
|-- /src
|---- main.ts
|---- main.css
|-- content-types.d.ts
|-- deno.json
|-- index.html
```

### Running development server & building

```bash
# Running dev server
deno task dev
```

The included dev task runs on port 4200 and is served from a temporary directory
by default. _Note: if the default temporary directory is changed, the dev script
will **clear** its contents before serving. The temp directory is the `outdir`,
specified in the esbuild options._

```bash
# Build project
deno task build
```

The build task will bundle the project and export to `./dist` by default.

## Content/Loader Types

@therapy/bundle handles the following esbuild content loaders by default:

```json
{
  "css": "css",
  "module.css": "local-css",
  "json": "json",
  "txt": "text",
  "data": "binary",
  "png": "dataurl",
  "svg": "dataurl"
}
```

Sass plugins are also included, allowing use of
`scss, module.scss, sass, module.sass` files, as well.

Additional loaders can be added through the configuration file.

```ts
// therapy.config.ts
import type { Config } from "@therapy/bundle/types";

export const buildConfig: Config {
  extraTypes: [
    ["bin", "binary"],
    ["csv", "text"]
  ];
};
```

The included `content-types.d.ts` declaration file is automatically added to
`deno.json:compilerOptions`. If you add any extra types, be sure to update this
file to include your types, as appropriate.

## Configuration File

Further customization can be passed to esbuild through use of a configuration
file. If needed, add a `therapy.config.ts` file to the root of your project. The
interface exposes `port` and `extraTypes`, while the remainder of the type are
esbuild options.

```ts
// therapy.config.ts
import type { Config } from "@therapy/bundle/types";

export const serveConfig: Config = {
  port: 4300,
  outdir: "./serve", // override serving from tmp to ./serve
  extraTypes: [
    ["bin", "binary"],
    ["csv", "text"],
  ],
};

export const buildConfig: Config = {
  extraTypes: [
    ["bin", "binary"],
    ["csv", "text"],
  ],
  minify: false,
};
```

If not provided or specified, the dev and build tasks will use defaults; the
config file is not required and is optional.

## Current Issues

Non-relative imports that are not TypeScript files are not currently supported.
The following will not resolve:

```json
{
  "name": "project",
  "imports": {
    "css-lib": "..."
  }
}
```

```ts
import "css-lib/styles.css"; // will not resolve
import "./styles.css"; // will resolve
```

## License

MIT
