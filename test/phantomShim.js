
if (!phantom.state){
  phantom.state = true;
  phantom.open(phantom.args[0]);
}

$(function(){
  QUnit.begin = function(obj){
    console.log('Stating Tests');
  }
  QUnit.moduleStart = function(obj){
    console.log('  '+obj.name);
  }
  QUnit.testStart = function(obj){}
  QUnit.testDone = function(obj){
    console.log('    '+obj.name);
    console.log('      '+obj.failed+' failed, '+obj.passed+' passed.');
  }
  QUnit.moduleDone = function(obj){
    console.log('    Done: '+obj.name);
    console.log('    '+obj.failed+' failed, '+obj.passed+' passed.');
  }
  QUnit.done = function(obj){
    console.log(obj.total+' test run in '+obj.runtime+' miliseconds.');
    console.log(obj.failed+' failed, '+obj.passed+' passed.');
    phantom.exit();
  }
});
