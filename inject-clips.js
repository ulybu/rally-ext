window.uly = {};
uly.iconClass = 'uly-clip-icon';
uly.fontUrl = chrome.extension.getURL('icons/octicons.woff');

var fontFaceStyle = document.createElement('style');
fontFaceStyle.appendChild(document.createTextNode("\
@font-face {\
    font-family: 'octicons';\
    src: url('" + uly.fontUrl + "') format('woff');\
}\
"));
document.head.appendChild(fontFaceStyle);

// Dummy element to use as a text buffer
uly.p = document.createElement("p");
uly.p.classList.add('uly-farOnTop');
document.body.appendChild(uly.p); // needs to have a parent
// Dummy range to use as a text buffer (also)
uly.range = document.createRange();
uly.range.selectNode(uly.p);

/**
 * Handler to the click on the paperclip
 * @param {[Object event]} e The dom event object
 */
uly.copyToClipb = function(e) {
  // get the text from the sibling link
  var url = e.target.parentElement.querySelector('.formatted-id-link').href;
  uly.p.textContent = url;
  window.getSelection().addRange(uly.range);

  try {
    // Now that we've selected the url, execute the copy command
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copy email command was ' + msg);
  } catch(err) {
    console.log('Oops, unable to copy');
  }
}

uly.injectLinks = function() {
  uly.links = document.querySelectorAll(".formatted-id-template");
	// Not very performance friendly, but currently got now way
	// to know when links are created (after async calls to a back-end)
  if ( uly.areClipsInjected() ) {
    console.log("Clips already injected");
    return;
  }

  for (var i=0, link, iconElem; (link=uly.links[i]); i++) {
    iconElem = document.createElement("span");
    iconElem.classList.add(uly.iconClass);
    iconElem.classList.add('octicon-clippy');
    iconElem.classList.add('octicon');
    iconElem.addEventListener('click', uly.copyToClipb);
    link.parentElement.appendChild(iconElem);
  }
}

uly.areClipsInjected = function() {
  return document.querySelectorAll('.' + uly.iconClass).length !== 0;
}

uly.intervalId = setInterval(uly.injectLinks, 5000);
