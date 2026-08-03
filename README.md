# gooseback

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).

## Annual Rollover

When a new festival year's program is ready to go live, the outgoing year needs to move into the archive and the CMS needs to start defaulting new films to the new year. There are four steps; steps 2 and 3 are edits to `public/admin/config.yml`, which also carries a comment block above the `films` collection listing them for anyone editing that file directly.

1. Add a new edition file at `content/editions/<year>.md` (year, heading, dates, isAnnounced, sections, body).
2. In `public/admin/config.yml`, update the `films` collection's `filter: { field: year, value: 2025 }` to the new year, so the CMS Films list shows the new year's films by default.
3. In the same `films` collection, update the Year field's `default: 2025` to the new year, so films created in the CMS are pre-filled correctly.
4. Update `content/settings.yml`'s `currentEdition` to the new year, either directly or via Site Settings > Current Edition in the CMS. This is the step that actually switches `/movies` to the new program and moves the previous year into `/archive/<year>`.

No film content is ever deleted — step 4 alone is what moves the previous year into the archive.

If step 2 or 3 is missed, every film an editor creates afterwards silently gets the outgoing year's `year` value — it will appear on the wrong archive page and never on `/movies`.
