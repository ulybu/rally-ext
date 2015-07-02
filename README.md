<style>
.underline {
	text-decoration: underline;
}
underline {
	text-decoration: underline;
}
</style>

# Rally-ext

Add some goodies to the rally website

Currently only supports Chrome.

Suggestions, feature requests or bugs **are welcome** as [issues](https://github.com/ulybu/rally-ext/issues)

## Features

### Copy/generate links

A _copy-to-clipboard-ish_ icon is added next to every link and will generate and copy a link.
It can handle a click and a double click so you can at any time copy two different types of link

##### Currently supported links:

* Url - `https://xxx.rallydev.com/path/to/task`
* Key - `US12345` or `F123` or `TA1234` or `DE1234`
* Markdown - `[FE123: something good somewhere](https://xxx.rallydev.com/path/to/task)`
* Confluence - `[FE123: something good somewhere|https://xxx.rallydev.com/path/to/task]`
* Simple HTML - `<a href="https://xxx.rallydev.com/path/to/task">FE123: something good somewhere<a/>`

### Customizable

Go to [chrome://extensions](chrome://extensions), look for the rally extension and click <underline>`options`</underline>

Modify,save, reload the rally page 

## Install (chrome)
The extension is published on the chrome web store [here](https://chrome.google.com/webstore/detail/rally/gaoglodjegfcmjckjagjhbollbibjjnf/related)

Once installed it will automatically receive updates


## Uninstall
Official [instructions](https://support.google.com/chrome/answer/167997?hl=en-GB)

## Suscribe to new release
There is an available RSS feed at https://github.com/ulybu/rally-ext/releases