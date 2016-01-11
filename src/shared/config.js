window.rallyExtension = window.rallyExtension || {};
window.rallyExtension.config = {
  defaultUserConf: {
    injectionInterval : 4000,
    checkMarkFadeAwayDelay : 2000,
    simpleClickAction: 'url',
    doubleClickAction: 'key'
  },
  initQueue: [],
  confLoaded: false,
  userConf:{},
  get: function() {
    return this.userConf;
  },
  set: function(confToSave,cb) {
    if(!confToSave || !Object.keys(confToSave).length){
      console.error("Trying to save to sync storage an empty config")
      return false;
    }
    chrome.storage.sync.set({
      userConf: confToSave
    }, function() {
      if(!chrome.runtime.lastError) {
        console.log("[config] New config sync'ed: ", confToSave);
      }
      cb(chrome.runtime.lastError);
    })
  },
  getDefault: function() {
    return this.defaultUserConf;
  },
  initiator: function(cb) {
    if (this.confLoaded) {
      cb();
    } else {
      this.initQueue.push(cb);
    }
  },
  callCbQueue: function() {
    for(var i=0, cb; cb = this.initQueue[i]; i++) {
      cb();
    }
  },
  initConfig: function() {
    var loadedEvent = new Event('rallyExt-configLoaded')
      , consoleMsg
      ;
    chrome.storage.sync.get(["userConf"], function(detail){
      // There is an existing userConf
      if(detail.userConf) {
        this.userConf= detail.userConf;
        var syncConfKeys = Object.keys(this.userConf)
          , defaultConfKeys = Object.keys(this.getDefault())
          ;

        // @TODO Only test is new settings. Need to test if missing or replaced
        if(syncConfKeys.length !== defaultConfKeys.length){
          console.log('user',this.userConf,'defaut',this.getDefault());
          var defaults = _.partialRight(_.assign, function(value, other) {
            return _.isUndefined(value) ? other : value;
          });
          defaults(this.userConf,this.getDefault());
          console.log('user',this.userConf,'defaut',this.getDefault());
          chrome.storage.sync.set({
            userConf:this.userConf
          },function(e) {
            console.warn("A new setting has been created in this package and will be added to your sync'ed settings",e)
          });
        }
      } else { // No existing (synced User Conf)
        this.userConf = JSON.parse(JSON.stringify(this.getDefault()));
        chrome.storage.sync.set({
          userConf:this.userConf
        },function() {
          console.warn("Didn't find any user configuration in sync storage, added default one")
        });
      }
      // Race condition here
      this.callCbQueue();
      this.confLoaded = true;
    }.bind(this));
  }
}
window.rallyExtension.config.initConfig();
