window.rallyExtension = window.rallyExtension || {};
window.rallyExtension.uly = {
  userConf: {},
  _conf : {
    iconClass: 'uly-clip-icon',
    farOnTopClass: 'uly-farOnTop',
    fontUrl: '',
    injectedFlagClass: 'uly-injected',
    linkPatterns: {
      url: "%url",
      key: "%key",
      markdown:"[%key: %headline](%url)",
      confluence:"[%key: %headline|%url]",
      simpleHtml: "<a href='%url'>%key: %headline</a>"
    }
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
  handler: function(e) {
    e.stopPropagation();
    var iconNode, linkNode, nameCellNode
      , key, url, headline
      , isDoubleClick
      , action
      , infos = {}
      , linkText
      ;
    // Retrieve Elements
    iconNode = e.target  
    linkNode = iconNode.parentElement.querySelector('.formatted-id-link')
    nameCellNode = this.getNextCell(linkNode)
    // Extract text
    key = linkNode.textContent.trim()
    url = linkNode.href
    headline = nameCellNode.textContent.trim()
    
    isDoubleClick = (e.type==='dblclick')
    action = this.userConf[(isDoubleClick?'double':'simple')+ 'ClickAction']
    infos = {
      key: key,
      url: url,
      headline: headline,
      isDoubleClick: isDoubleClick,
      action: action
    }
    linkText = this.createLinkText(infos)

    this.templateAction(iconNode,linkText,infos.isDoubleClick);
  },
  createLinkText: function(infos) {
    var pattern = this._conf.linkPatterns[infos.action]
      ;
    pattern = pattern.replace(/%key/,infos.key);
    pattern = pattern.replace(/%url/,infos.url);
    pattern = pattern.replace(/%headline/,infos.headline);
    return pattern;
  },
  getNextCell: function(link) {
    for(var i=0,parent=link.parentElement; i<4; parent = parent.parentElement, i++) {
      if(parent.tagName === "TD") {
        return parent.nextSibling;
      }
    }
    return false;
  },
  templateAction: function(icon,text,isDoubleClick) {
    var succeeded = this.copyToClipb(text)
      , successIcon = isDoubleClick ? 'octicon-checklist': 'octicon-check'
      , whichIcon = succeeded ? successIcon : 'octicon-x'
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
      iconElem.addEventListener('click', this.handler.bind(this));
      iconElem.addEventListener('dblclick', this.handler.bind(this));
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
