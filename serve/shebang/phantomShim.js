
if (!phantom.state){
  phantom.state = true;
  phantom.open(phantom.args[0]);
}

// (function checkHS(){
//   console.log('checking');
//   if (typeof hs != 'undefined' && typeof hs.controllers != 'undefined'){
//     console.log('true');
//     hs.controllers.bind('loaded', function(){
//       console.log('loaded');
//       console.log(new XMLSerializer().serializeToString(document));
//       phantom.end();
//     });
//   }else{
//     console.log('false');
//     setTimeout(checkHS, 1);
//   }
// })();

setTimeout(function(){
  console.log(new XMLSerializer().serializeToString(document));
  phantom.exit();
}, 500);
