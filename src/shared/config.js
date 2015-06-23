window.rallyExtension = window.rallyExtension || {};
window.rallyExtension.config = {
  defaultUserConf: {
    injectionInterval : 4000,
    checkMarkFadeAwayDelay : 2000
  },
  confLoaded: false,
  userConf:{},
  get: function() {
    return this.userConf;
  },
  set: function(confToSave) {
    if(!confToSave || !Object.keys(confToSave).length){
      console.error("Trying to save to sync storage an empty config")
      return;
    }
    chrome.storage.sync.set({
      userConf: confToSave
    }, function() {
      console.log("[config] New config sync'ed: ", confToSave);
    })
  },
  getDefault: function() {
    return this.defaultUserConf;
  },
  initConfig: function() {
    var loadedEvent = new Event('rallyExt-configLoaded')
      ;
    chrome.storage.sync.get(["userConf"], function(detail){
      if(detail.userConf) {
        this.userConf= detail.userConf;
      } else {
        this.userConf = JSON.parse(JSON.stringify(this.getDefault()));
        chrome.storage.sync.set({
          userConf:this.userConf
        },function() {
          console.warn("Didn't find any user configuration in sync storage, added default one")
        });
      }
      document.dispatchEvent(loadedEvent);
      this.confLoaded = true;
    }.bind(this));
  }
}
window.rallyExtension.config.initConfig();
