/******/ (() => { // webpackBootstrap
/*!*************************************************!*\
  !*** ./examples/importScript/scriptToImport.js ***!
  \*************************************************/

console.info("Sandboxed script has been imported and initialized successfully");
document.body.innerHTML = "Content is generated from the sandbox";
Websandbox.connection.remote.testApiFn("some argument");
/******/ })()
;
//# sourceMappingURL=scriptToImport.js.map