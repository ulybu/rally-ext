<style>
underline {
	text-decoration: underline;
}
</style>

# Contribute

In a few words: 

* Fork the [repo](https://github.com/ulybu/rally-ext)
* Clone it
* Submit a Pull Request

## Get it running

After cloning it and made sure you have Node installed 
```
$ npm install
$ node_modules/.bin/bower install
$ # Or just `bower install` if you have the CLI installed
```
Go to [chrome://extensions](chrome://extensions) and hit *Load unpacked extension*. Check the official online doc for tips & tricks on how to developp and debug a chrome extension

<underline>Note 1:</underline> In order to see correctly the options page, you need to load the build folder of the extension (see the Build section)

<underline>Note 2:</underline> Disable (no need to uninstall) the version installed from the store to be sure of which extension you're running

## Build

[Gulp](http://gulpjs.com) is used for task automation.

The build product is located under `build/` and offers the same folder layout (allows to run both build and src unpacked code without having to modify `manifest.json`)

* `$ npm run build`
  * Minify the scripts in `scr/injection`
  * Perform a [polybuild](https://github.com/polymerlabs/polybuild) on the polymer based *options page* site 
* `$ npm run zip` - Perform a build and zip it under `rally-ext.zip` (root folder)
* `$ npm run sync` 1-way mirror any changes to the fields *name*, *version* and *description* from *manifest.json* to *package.json* and *bower.json*.

If you have gulp CLI installed you can directly call any task


## Structure

```
rally-ext
├── src
│   ├── injection
│   ├── options
│   └── shared
└── icons
```
* `injection` - Scripts that will be injected into the running Rally page
* `options` - The site of the <underline>`options`</underline> page
* `shared` - Contains JavaScript that is meant to be executed by material in `injection` and in `options` 

## Dependencies

Bower is used for library management

The options page is built with [Polymer](http://polymer-project.org) (version > 1)

[Lodash](https://github.com/lodash/lodash/) is used for his *Object* module (custom build)

## Adding a feature 

Create a new file *my-feature.js* and/or *my-feature.css* under `src/injection`. Then update the `content_scripts` section of `manifest.json`.

If you need icons, please first have a look at the [octicons](https://octicons.github.com/) -which are already available- before adding new ones to the package.

### Managing user configuration

Options are managed by the `window.rallyExtension.config` module located under *src/shared/config.js*

#### Add you default options/settings..
.. to the following block

```javascript
// src/shared/config.js

defaultUserConf: {
  injectionInterval : 4000,
  checkMarkFadeAwayDelay : 2000,
  simpleClickAction: 'url',
  doubleClickAction: 'key'
},
```

#### Retrieve them

* `getDefault()` will return the default (hardcoded) user config
* `get()` will return the user config sync between all chrome environment

Beware that they're loaded asynchronously from chrome sync storage.
Use the `initiator`! This function take a callback as unique parameter and we call it once it is sure the sync config is available by `get`: 

```javascript
function whenConfLoaded () {
  this.conf = rallyExtension.config.get();
	this.initEnv();
}
rallyExtension.config.initiator(whenConfLoaded.bind(this));
```

### Let the user customize your config in the option page 
// @TODO
