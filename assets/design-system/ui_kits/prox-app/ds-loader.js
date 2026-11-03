// Exposes the design-system components as window.Prox.
// Transpiles the component sources directly so the kit always reflects the latest components.
(function () {
  var files = ['core/Icon', 'core/Badge', 'core/Button', 'core/IconButton', 'core/Pill', 'core/CategoryChip',
    'forms/SearchField', 'forms/SegmentedControl', 'forms/QuantityStepper',
    'display/ProgressBar', 'display/Card', 'display/EmptyState', 'display/ReasonTag', 'display/SavingsCard',
    'navigation/AppHeader', 'navigation/TabBar', 'grocery/NotebookList', 'grocery/NotebookRow', 'grocery/RetailerRow'];
  var names = files.map(function (f) { return f.split('/')[1]; });
  var src = 'var __o = {};\n' + files.map(function (f, i) {
    var x = new XMLHttpRequest(); x.open('GET', '../../components/' + f + '.jsx', false); x.send();
    var body = x.responseText.replace(/^import .*$/gm, '').replace(/^export /gm, '');
    return '__o.' + names[i] + ' = (function(){' + body + '\nreturn ' + names[i] + ';})(); var ' + names[i] + ' = __o.' + names[i] + ';';
  }).join('\n');
  var code = Babel.transform(src, { presets: ['react'], sourceType: 'script' }).code;
  window.Prox = new Function('React', code + '\nreturn __o;')(React);
})();
