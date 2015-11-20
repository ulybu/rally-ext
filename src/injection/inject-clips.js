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
  lastInfos: false,
  setLastInfoToStorage: function(infos) {
    chrome.storage.local.set({lastInfos:infos},function(){});
  },
  init : function() {
    this._conf.fontUrl = chrome.extension.getURL('icons/octicons.woff');

    this.addFontFace(this._conf.fontUrl);

    this.listenHash();
    this.hashChanged();

    this.p = document.createElement("p");
    this.p.classList.add(this._conf.farOnTopClass);
    document.body.appendChild(this.p); // needs to have a parent
    // Dummy range to use as a text buffer (also)
    this.range = document.createRange();
    this.range.selectNode(this.p);

    this.iconTemplate = this.makeIconElemTemplate();

    chrome.storage.onChanged.addListener(function(changes,areaName){
      if(areaName ==='local' && changes.lastInfos) {
        this.lastInfos = changes.lastInfos.newValue;
      }
    }.bind(this))
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
  listenHash: function() {
    window.addEventListener('hashchange',this.hashChanged.bind(this));
  },
  hashChanged: function() {
    function hasAnEditor() {
      return !! document.querySelector('iframe.richTextContent.editable');
    }
    function isAnEditionPage() {
      var hash= window.location.hash
        , reg = /detail\/.*(userstory|task|feature|defect)\/\d*($|\/discussion)/
      ;
      return reg.test(hash);
    }
    if(hasAnEditor() || isAnEditionPage()) {
      this.startListeningToLinks()
    }
  },
  startListeningToLinks: function() {
    this.stopListeningToLinks();
    this.linkIconIntervalID = setInterval(this.addListenersToLinksIcon.bind(this), 1000);
    console.log("start interval id #",this.linkIconIntervalID);
  },
  stopListeningToLinks: function() {
    clearInterval(this.linkIconIntervalID);
    console.log('cleared interval id #',this.linkIconIntervalID);
  },
  addListenersToLinksIcon: function() {
    var links = document.querySelectorAll('.tr-link.tr-icon');
    if(links.length !== 0) {
      this.stopListeningToLinks();
      Array.prototype.forEach.call(links, function(link) {
        link.addEventListener('click',this.fillAndSetTheLinkDialog.bind(this))
      },this);
      console.log("Found "+links.length+" link icons in text editors");
    }
  },
  fillAndSetTheLinkDialog: function() {
    if(!this.lastInfos) return;
    var box = document.querySelector('.tr-dialog.non-draggable.rly-modal-dialog')
      , text = box.querySelector('#linkdialog-text')
      , url = box.querySelector('#linkdialog-onweb-tab-input')
      , buttonBox = box.querySelector('.modal-dialog-buttons')
      , button = buttonBox.querySelector("a:first-child")
      , cancelButton = buttonBox.querySelector("a:last-child")
      , injButton = button.cloneNode(true)
      , innerText = injButton.querySelector('.x4-btn-inner')
      , innerSpan = button.querySelector('span[role]')
      , evt = new MouseEvent('click',{bubbles:true});
    ;

    innerText.textContent = 'Insert '+this.lastInfos.key
    injButton.classList.remove('x4-btn-disabled');
    injButton.classList.remove('x4-item-disabled');
    injButton.classList.remove('x4-disabled');
    injButton.classList.remove('x4-btn-default-small-disabled');
    injButton.addEventListener('click',fillFields.bind(this))
    function fillFields(){
      url.value = this.lastInfos.url;
      text.value = this.lastInfos.key;
      // To trick rally into not cloning the url into the text
      text.dispatchEvent(new KeyboardEvent("keyup", {bubbles:true}))
    }
    buttonBox.insertBefore(injButton,cancelButton);
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
    iconNode = e.target;
    linkNode = iconNode.parentElement.querySelector('.formatted-id-link');
    nameCellNode = this.getHeadlineElem(linkNode);
    // Extract text
    key = linkNode.textContent.trim();
    url = linkNode.href;
    headline = nameCellNode.textContent.trim();

    isDoubleClick = (e.type==='dblclick');
    action = this.userConf[(isDoubleClick?'double':'simple')+ 'ClickAction'];
    infos = {
      key: key,
      url: url,
      headline: headline,
      isDoubleClick: isDoubleClick,
      action: action
    }
    this.setLastInfoToStorage(infos);
    linkText = this.createLinkText(infos);

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
  getHeadlineElem: function(link) {
    return this.getHeadlineGrid(link) || this.getHeadlineTable(link);
  },
  getHeadlineGrid: function(link) {
    for(var i=0,parent=link.parentElement; i<4; parent = parent.parentElement, i++) {
      if(parent.classList.contains("left-header")) {
        return parent.nextElementSibling;
      }
    }
    return false;
  },
  getHeadlineTable: function(link) {
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
  rallyExtension.config.initiator(whenConfLoaded.bind(rallyExtension.uly))
})()
