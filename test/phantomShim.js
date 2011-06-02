
if (!phantom.state){
  phantom.state = true;
  phantom.open(phantom.args[0]);
}else{
  $(function(){
    localStorage.clear();

    if (phantom.args[1] == '-v')
      hs.log.concat();
    else
      hs.log.disable();

    QUnit.moduleStart = function(obj){
      console.log(''+obj.name+'\n');
    }
    QUnit.testStart = function(obj){
      localStorage.clear();
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
      console.log('  '+obj.failed+' failed, '+obj.passed+' passed.\n');
    }
    QUnit.moduleDone = function(obj){
      console.log(obj.failed+' failed, '+obj.passed+' passed.\n\n');
    }
    QUnit.done = function(obj){
      console.log(obj.total+' test run in '+obj.runtime+' miliseconds.');
      console.log(obj.failed+' failed, '+obj.passed+' passed.');
      phantom.exit();
    }
  });
}
