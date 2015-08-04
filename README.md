<style>
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

![clipboard added](https://cloud.githubusercontent.com/assets/2479249/9069200/2ef222b2-3ae8-11e5-8e08-077234092f00.png)

##### Currently supported links:

* Url - `https://xxx.rallydev.com/path/to/task`
* Key - `US12345` or `F123` or `TA1234` or `DE1234`
* Markdown - `[FE123: something good somewhere](https://xxx.rallydev.com/path/to/task)`
* Confluence - `[FE123: something good somewhere|https://xxx.rallydev.com/path/to/task]`
* Simple HTML - `<a href="https://xxx.rallydev.com/path/to/task">FE123: something good somewhere<a/>`

### Customizable

Go to [chrome://extensions](chrome://extensions), look for the rally extension and click <underline>`options`</underline>

![link to options](https://cloud.githubusercontent.com/assets/2479249/9069208/36d71640-3ae8-11e5-9e41-68341a7af260.png)

Modify,save and reload the Rally to see the changes 

![option page](https://cloud.githubusercontent.com/assets/2479249/9069305/d5e8344e-3ae8-11e5-811f-f5b0ee1f8580.png)

## Install (chrome)
The extension is published on the chrome web store [**HERE**](https://chrome.google.com/webstore/detail/rally/gaoglodjegfcmjckjagjhbollbibjjnf/related)

Once installed it will automatically receive updates


## Uninstall
Official [instructions](https://support.google.com/chrome/answer/167997?hl=en-GB)

## Suscribe to new release
There is an available RSS feed at https://github.com/ulybu/rally-ext/releases
