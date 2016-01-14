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
      simpleHtml: "%key: %headline"
    }
  },
  lastInfos: false,
  init : function() {
    this._conf.fontUrl = chrome.extension.getURL('icons/octicons.woff');

    this.addFontFace(this._conf.fontUrl);

    this.listenHash();
    this.hashChanged();

    this.range = document.createRange();
    this.p = document.createElement("input");
    this.p.classList.add(this._conf.farOnTopClass);
    document.body.appendChild(this.p); // needs to have a parent

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
    function hasTicketBar() {
      return document.querySelector(".x4-box-target > .x4-box-item")
    }
    function isATicketPage() {
      var hash= window.location.hash
        , reg = /detail\/.*(userstory|task|feature|defect)\/\d*$/
      ;
      return reg.test(hash);
    }
    var bar;
    if(isATicketPage()) {
      if(bar=hasTicketBar()) {
        var icons = this.injectTicketIcons(bar);
        icons.forEach(function(e) {
          e.elem.addEventListener('click',this.visualSuccess);
        },this);
      } else {
        setTimeout(this.hashChanged.bind(this), 1000);
      }
    }
  },
  visualSuccess: function (e){
    var target = e.currentTarget;
    target.classList.add('copy-succeeding');
    setTimeout(function(){
      target.classList.remove('copy-succeeding');
      target.classList.add('copy-away');
      setTimeout(function(){
        target.classList.remove('copy-away');
      },2000);
    },200);
  },
  injectTicketIcons: function(keyBox) {
    if (!keyBox) {
      return false;
    }
    function addborder(elem ){
      var border = document.createElement('span');
      border.classList.add('ticket-bar-border');
      border.appendChild(elem);
      var shim = buildIcon();
      shim.classList.add('success-shim','octicon-check');
      border.appendChild(shim)
      return border;
    }
    function buildText(text) {
      var elem = document.createElement('span');
      elem.classList.add('ticket-bar-text');
      elem.textContent = text || '';
      return elem;
    }
    function buildIcon(customClass) {
      var elem = document.createElement('span');
      elem.classList.add('ticket-bar-icon', 'octicon');
      return elem;
    }
    var titleBar = keyBox.parentElement.children[1]
      , barLeft = titleBar.style.left
      , barWidth = titleBar.style.width
      , mdIcon = buildIcon()
      , linkIcon = buildIcon()
      , htmlIcon = buildText('Html')
      , widthByIcon = 28
      , iconsCount = 0
    ;
    mdIcon.classList.add('octicon-markdown')
    linkIcon.classList.add('octicon-link')
    
    linkIcon = addborder(linkIcon);
    mdIcon = addborder(mdIcon);
    htmlIcon = addborder(htmlIcon);

    // this will fixed the displayed order
    keyBox.appendChild(htmlIcon);
    keyBox.appendChild(mdIcon);
    keyBox.appendChild(linkIcon);
    
    barLeft = Number.parseInt(barLeft.substring(0,barLeft.indexOf('p')),10);
    barWidth = Number.parseInt(barWidth.substring(0,barWidth.indexOf('p')),10);
    titleBar.style.left = (barLeft + (widthByIcon*keyBox.childElementCount)) + 'px';
    titleBar.style.width = (barWidth - (widthByIcon*keyBox.childElementCount)) + 'px';

    return [
      {elem: mdIcon, action:'markdown'},
      {elem: htmlIcon, action:'simpleHtml'},
      {elem: linkIcon, action:'link'}
    ];
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
    linkText = this.createLinkText(infos);

    this.templateAction(
      {
        icon:iconNode,
        link:linkNode
      },
      linkText,infos);
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
  templateAction: function(nodes,text,infos) {
    var isHtml = ('simpleHtml' === infos.action)
      , succeeded = this.copyToClipb(text, (isHtml?nodes.link:undefined))
      , successIcon = infos.isDoubleClick ? 'octicon-checklist': 'octicon-check'
      , whichIcon = succeeded ? successIcon : 'octicon-x'
      ;
    this.displayFeedbackIcon(nodes.icon, whichIcon);
  },
  displayFeedbackIcon : function(icon, className) {
    icon.classList.add(className);
    icon.classList.remove('octicon-clippy');
    setTimeout(function(){
      icon.classList.remove(className);
      icon.classList.add('octicon-clippy');
    },this.userConf.checkMarkFadeAwayDelay);
  },
  copyToClipb : function(text, linkNode) {
    // get the text from the sibling link
    var succeeded = true
      ;
     // to avoid discontiguous selection
    window.getSelection().empty();
    if(linkNode) {
      var a = linkNode.cloneNode(true)
      var txt = document.createTextNode(text);
      a.childNodes[1].remove();
      a.appendChild(txt);
      document.body.appendChild(a)
      this.range.selectNode(a)
      window.getSelection().addRange(this.range);
    } else {
      this.p.value = text;
      this.p.select();
      this.p.focus();
    }

    try {
      // Now that we've selected the url, execute the copy command
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copy US/Task was ' + msg);
    } catch(err) {
      succeeded = false;
      console.warn('Oops, unable to copy');
    } finally {
      this.p.value = '';
      this.p.blur();
      window.getSelection().empty();
      if(linkNode){
          a.remove();
      }
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
