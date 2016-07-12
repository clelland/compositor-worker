(function(scope) {
  "use strict";

  scope.isMain = function() {
    return scope.window;
  };

  // Log on worker by posting message to main.
  scope.log = isMain() ? console.log : scope.postMessage;


  scope.tick = function(timestamp) {

    //log('tick: ' + scroller.scrollTop);

    var t = bg.transform;
    t.m42 = Math.round(scroller.scrollTop*0.8);
    bg.transform = t;
    var t2 = bg2.transform;
    t2.m42 = Math.round(scroller.scrollTop*0.6);
    bg2.transform = t2;
    scope.requestAnimationFrame(tick);
  };

  // Returns a promise which is resolved once proxy is initialized and can be
  // mutated.
  scope.awaitProxyInit = function(proxy) {
    return new Promise(function(resolve, reject) {
      function check() {
        log('checking:' + proxy.initialized);
        if (proxy.initialized)
          resolve(proxy);
        else
          requestAnimationFrame(check);
      }
      requestAnimationFrame(check);
    });
  }


  scope.initWorker = function() {
    log("init worker");

    self.onmessage = function(e) {
      scope.scroller = e.data[0];
      scope.bg = e.data[1];
      scope.bg2 = e.data[2];

      var proxyInitPromises = e.data.map(awaitProxyInit);
      Promise.all(proxyInitPromises).then(function() {
        scope.requestAnimationFrame(scope.tick);
      });
    };
  };

  scope.initMain = function() {
    log("init main");

    scope.worker = new CompositorWorker("parallax.js");
    scope.worker.onmessage = function(e) {
      console.log(e.data);
    }

    scope.scroller = new CompositorProxy(document.getElementById("content"), ['scrollTop']);
    scope.bg = new CompositorProxy(document.getElementById("bg"), ['transform']);
    scope.bg2 = new CompositorProxy(document.getElementById("bg2"), ['transform']);

    worker.postMessage([scroller, bg, bg2]);
  };

  if (isMain())
    initMain();
  else
    initWorker();
})(self);
