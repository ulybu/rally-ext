var ConfMgr =  function(){
  var _confObj = {}
    , confLoaded = false
    , domLoaded = false
    ;
  function _conf(val) {
    if(arguments.length>0) {
      rallyExtension.config.set(val,function(e){
        if(e) {
          console.log("Error during preferences saving");
        } else {
          _confObj = val;
        }
      })
      return this;
    } else {
      return _confObj;
    }
  }
  this.saveOptions = function(){
    var userConf = retrieveFromUI()
      , confToSave = _.clone(_conf())
      ;
    _.assign(confToSave,userConf);
    _conf(confToSave);
  }
  function retrieveFromUI() {
    var userConf = {};
    var simpleInputs = document.querySelectorAll('section.simpleAction input');
    for (var i = 0, input = undefined; input=simpleInputs[i]; i++) {
      if (input.checked) {
        userConf.simpleClickAction = input.value;
        break;
      }
    }
    var doubleInputs = document.querySelectorAll('section.doubleAction input');
    for (var i = 0, input = undefined; input=doubleInputs[i]; i++) {
      if (input.checked) {
        userConf.doubleClickAction = input.value;
        break;
      }
    }
    return userConf;
  }
  function restoreOptions() {
    var conf = _conf();
    document.querySelector('section.simpleAction input#simple-'+ conf.simpleClickAction).checked = true;
    document.querySelector('section.doubleAction input#double-'+ conf.doubleClickAction).checked = true;
  }
  function whenConfLoaded () {
    _confObj = rallyExtension.config.get();
    confLoaded = true;
    if (confLoaded && domLoaded) {
      restoreOptions();
    }
    console.log("Conf loaded:",_conf());
  }
  document.addEventListener('DOMContentLoaded', function(){
    domLoaded = true;
    if (confLoaded && domLoaded) {
      restoreOptions();
    }
  });
  document.querySelector('button#save').addEventListener('click', this.saveOptions);
  rallyExtension.config.initiator(whenConfLoaded.bind(this));
}
var mgr = new ConfMgr();
