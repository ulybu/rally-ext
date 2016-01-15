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
        , reg = /detail\/.*(userstory|task|feature|defect)\/\d*/
      ;
      return reg.test(hash);
    }
    var bar;
    if(isATicketPage()) {
      if(bar=hasTicketBar()) {
        var icons = this.injectTicketIcons(bar);
        icons.forEach(function(e) {
          e.elem.addEventListener('click',this.ticketHandler.bind(this));
        },this);
      } else {
        setTimeout(this.hashChanged.bind(this), 1000);
      }
    }
  },
  visualSuccess: function (target, isSuccess) {
    var statusClass = isSuccess ? 'status-success' : 'status-fail'
      , iconClass = isSuccess ? 'octicon-check' : 'octicon-x'
      , targetIcon = target.querySelector('.status-shim')
      ;
    targetIcon.classList.add(iconClass);
    target.classList.add(statusClass);
    setTimeout(function(){
      target.classList.add('status-fadeaway');
      setTimeout(function(){
        target.classList.remove(statusClass);
        target.classList.remove('status-fadeaway');
        targetIcon.classList.remove(iconClass);
      },2000);
    },200);
  },
  injectTicketIcons: function(keyBox) {
    if (!keyBox) {
      return false;
    }
    function addborder(elem, action){
      var border = document.createElement('span');
      border.classList.add('ticket-bar-border');
      border.appendChild(elem);
      var shim = buildIcon('status-shim');
      border.appendChild(shim);
      if(action) {
        border.setAttribute('data-action', action);
      }
      return border;
    }
    function buildText(text, action) {
      var elem = document.createElement('span');
      elem.classList.add('ticket-bar-text');
      elem.textContent = text || '';
      if(action) {
        elem.setAttribute('data-action', action);
      }
      return elem;
    }
    function buildIcon(className, action) {
      var elem = document.createElement('span');
      elem.className += ('ticket-bar-icon octicon ' + (className||''));
      if(action) {
        elem.setAttribute('data-action', action);
      }
      return elem;
    }
    var titleBar = keyBox.parentElement.children[1]
      , barLeft = titleBar.style.left
      , barWidth = titleBar.style.width
      , mdIcon = buildIcon('octicon-markdown')
      , linkIcon = buildIcon('octicon-link')
      , htmlIcon = buildText('Html')
      , widthByIcon = 28
      , iconsCount = 0
    ;
    mdIcon.classList.add();
    linkIcon.classList.add();
    
    mdIcon = addborder(mdIcon, 'markdown');
    linkIcon = addborder(linkIcon, 'url');
    htmlIcon = addborder(htmlIcon, 'simpleHtml');

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
  ticketHandler: function(e) {
    e.stopPropagation();
    function getLink() {
      var rawLink = window.location.href;
      var reg = /^(http.*\/detail\/(userstory|task|feature|defect)\/\d+)/;
      var res = reg.exec(rawLink);
      if (!res) {
        console.warning("Looks like the navigation pattern has been updated."
      +" If this persist please log an issue (link available in the options chrome://extensions )");
        return '';
      } else {
        return res[0];
      }
    }
    var iconNode, linkNode, nameCellNode
    , key, url, headline
    , isDoubleClick
    , action
    , infos = {}
    , linkText
    , target = e.currentTarget
    ;
    key = target.parentElement.textContent.split('Html').shift();
    url = getLink();
    headline = target.parentElement.parentElement.querySelector('input.simpleTextDetailField').value
    action = target.getAttribute('data-action');
    
    infos = {
      key: key,
      url: url,
      headline: headline,
      action: action
    }
    linkText = this.createLinkText(infos);
    var isHtml = ('simpleHtml' === infos.action)
      , succeeded = this.copyToClipb(linkText, (isHtml?infos.url:undefined))
      ;
    this.visualSuccess(target,succeeded);
  },
  dashboardHandler: function(e) {
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
      , succeeded = this.copyToClipb(text, (isHtml?infos.url:undefined))
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
  copyToClipb : function(text, urlToLink) {
    // get the text from the sibling link
    var succeeded = true
      ;
    function getClone(txt,type) {
      var a = document.createElement('a');
      a.classList.add('formatted-id-link');
      a.setAttribute('href', urlToLink);
      var span = document.createElement('span');
      span.classList.add('artifact-icon', 'icon-');
      var textNode = document.createTextNode(txt);
      a.appendChild(span);
      a.appendChild(textNode);
      return a;
    }
     // to avoid discontiguous selection
    window.getSelection().empty();
    if(urlToLink) {
      var a = getClone(text);
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
      console.warn("Oops, unable to copy the following text: '"+text+"'","\n",err);
    } finally {
      this.p.value = '';
      this.p.blur();
      window.getSelection().empty();
      if(urlToLink){
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
      iconElem.addEventListener('click', this.dashboardHandler.bind(this));
      iconElem.addEventListener('dblclick', this.dashboardHandler.bind(this));
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
