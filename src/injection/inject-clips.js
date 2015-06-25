window.rallyExtension = window.rallyExtension || {};
window.rallyExtension.uly = {
  userConf: {},
  _conf : {
    iconClass: 'uly-clip-icon',
    farOnTopClass: 'uly-farOnTop',
    fontUrl: '',
    injectedFlagClass: 'uly-injected'
  },
  init : function() {
    this._conf.fontUrl = chrome.extension.getURL('icons/octicons.woff');

    this.addFontFace(this._conf.fontUrl);

    this.p = document.createElement("p");
    this.p.classList.add(this._conf.farOnTopClass);
    document.body.appendChild(this.p); // needs to have a parent
    // Dummy range to use as a text buffer (also)
    this.range = document.createRange();
    this.range.selectNode(this.p);

    this.iconTemplate = this.makeIconElemTemplate();
  },
  addFontFace : function(fontUrl) {
    var fontFaceStyle = document.createElement('style');
    fontFaceStyle.appendChild(document.createTextNode("\
    @font-face {\
        font-family: 'octicons';\
        src: url('" + fontUrl + "') format('woff');\
    }\
    "));
    document.head.appendChild(fontFaceStyle);
  },
  makeIconElemTemplate : function() {
    var tempNode = document.createElement("span");
    tempNode.classList.add(this._conf.iconClass);
    tempNode.classList.add('octicon-clippy');
    tempNode.classList.add('octicon');
    return tempNode;
  },
  doubleClickHandler : function(e) {
    e.stopPropagation();
    var icon = e.target
      , url = icon.parentElement.querySelector('.formatted-id-link').textContent.trim()
      , succeeded = this.copyToClipb(url)
      , whichIcon = succeeded ? 'octicon-checklist' : 'octicon-x'
      ;
    this.displayFeedbackIcon(icon, whichIcon);
  },
  clickHandler : function(e) {
    e.stopPropagation();
    var icon = e.target
      , url = icon.parentElement.querySelector('.formatted-id-link').href
      , succeeded = this.copyToClipb(url)
      , whichIcon = succeeded ? 'octicon-check' : 'octicon-x'
      ;
    this.displayFeedbackIcon(icon, whichIcon);
  },
  displayFeedbackIcon : function(icon, className) {
    icon.classList.add(className);
    icon.classList.remove('octicon-clippy');
    setTimeout(function(){
      icon.classList.remove(className);
      icon.classList.add('octicon-clippy');
    },this.userConf.checkMarkFadeAwayDelay);
  },
  copyToClipb : function(text, cb) {
    // get the text from the sibling link
    var succeeded = true
      ;
    this.p.textContent = text;
    window.getSelection().addRange(this.range);

    try {
      // Now that we've selected the url, execute the copy command
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copy US/Task was ' + msg);
    } catch(err) {
      succeeded = false;
      console.warn('Oops, unable to copy');
    }
    return succeeded;
  },
  injectLinks : function() {
    var injectedClass = this._conf.injectedFlagClass
    var links = document.querySelectorAll(".formatted-id-template:not(."+injectedClass+")");
    // Not very performance friendly, but currently got now way
    // to know when links are created (after async calls to a back-end)
    if ( links.length > 0 ) {
      console.log('Found '+links.length+' links without copy-to-clip button');
    }

    for (var i=0, link, iconElem; (link=links[i]); i++) {
      link.classList.add(injectedClass);
      iconElem = this.iconTemplate.cloneNode();
      iconElem.addEventListener('click', this.clickHandler.bind(this));
      iconElem.addEventListener('dblclick', this.doubleClickHandler.bind(this));
      link.parentElement.appendChild(iconElem);
    }
  },
  startInjecting : function() {
    this.intervalID = setInterval(this.injectLinks.bind(this), this.userConf.injectionInterval);
  },
  stopInjecting : function() {
    clearInterval(this.intervalID);
  }
};
(function() {
  function whenConfLoaded () {
    rallyExtension.uly.userConf = rallyExtension.config.get();
    rallyExtension.uly.init();
    rallyExtension.uly.startInjecting();
  }

  if(rallyExtension.config.confLoaded){
    whenConfLoaded();
  } else {
    document.addEventListener("rallyExt-configLoaded", whenConfLoaded)
  }
})()
