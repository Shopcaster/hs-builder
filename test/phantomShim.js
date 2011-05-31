
if (!phantom.state){
  phantom.state = true;
  phantom.open(phantom.args[0]);
}

$(function(){
  QUnit.moduleStart = function(obj){
    console.log(obj.name);
  }
  QUnit.testStart = function(obj){
    console.log('  '+obj.name);
  }
  QUnit.log = function(obj){
    var op = '    '
    op += obj.result ? 'passed: ' : 'failed: ';
    op += obj.message;
    if (!obj.result && obj.expected && obj.actual)
      op += ' (expected '+obj.expected+' got '+obj.actual+')'
    console.log(op);
  }
  QUnit.testDone = function(obj){
    console.log('  '+obj.failed+' failed, '+obj.passed+' passed.');
  }
  QUnit.moduleDone = function(obj){
    console.log('Done: '+obj.name);
    console.log(obj.failed+' failed, '+obj.passed+' passed.');
  }
  QUnit.done = function(obj){
    console.log(obj.total+' test run in '+obj.runtime+' miliseconds.');
    console.log(obj.failed+' failed, '+obj.passed+' passed.');
    phantom.exit();
  }
});
