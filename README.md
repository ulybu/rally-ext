# Clipboard for Rally

Add some goodies to the rally website

Currently only supports Chrome.

Suggestions, feature requests or bugs **are welcome** as [issues](https://github.com/ulybu/rally-ext/issues)

## Features

### Dashbords and lists

A _copy-to-clipboard-ish_ icon is added next to every link and will generate and copy a link.
It can handle a click and a double click so you can at any time copy two different types of link

![clipboard added](https://cloud.githubusercontent.com/assets/2479249/9069200/2ef222b2-3ae8-11e5-8e08-077234092f00.png)

##### Currently supported links:

* Url - `https://xxx.rallydev.com/path/to/task`
* Key - `US12345` or `F123` or `TA1234` or `DE1234`
* Markdown - `[FE123: something good somewhere](https://xxx.rallydev.com/path/to/task)`
* Confluence - `[FE123: something good somewhere|https://xxx.rallydev.com/path/to/task]`
* Html - [FE123: something good somewhere](https://xxx.rallydev.com/path/to/task)
   (*Supported by most email clients*)

### Single ticket page (US, TA, DE, FE)

When you're already working on a ticket, you don't need to go back to the list/grid to copy it. You have three types of links ready to be copied, between the ticket identifier and the description, available from any tab.

Those three types are *Html*, *Markdown* and *Url* (see previous section for details)

  ![ticket page with additionnal buttons](https://cloud.githubusercontent.com/assets/2479249/13863525/bd69a2e0-ec9a-11e5-9eeb-da9c096057f4.png)
 
### Customizable

Go to [chrome://extensions](chrome://extensions), look for the rally extension and click <underline>`options`</underline>

![link to options](https://cloud.githubusercontent.com/assets/2479249/9069208/36d71640-3ae8-11e5-9e41-68341a7af260.png)

Modify,save and reload the Rally to see the changes 

![option page](https://cloud.githubusercontent.com/assets/2479249/13864011/8656c568-ec9e-11e5-9ed0-de7383ad3f20.png)

## Install (chrome)
The extension is published on the [**chrome web store**](https://chrome.google.com/webstore/detail/rally/gaoglodjegfcmjckjagjhbollbibjjnf/related)

Once installed it will automatically receive updates


## Uninstall
Official [instructions](https://support.google.com/chrome/answer/167997?hl=en-GB)

## Suscribe to new release
There is an available RSS feed at https://github.com/ulybu/rally-ext/releases
