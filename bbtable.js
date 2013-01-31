// To do next:
// - make dropdowns actually control the shift

var tbl = document.getElementById('iomatrix')
  , tB = tbl.firstChild          // tbody
;

function select(varname) {
    var rv = haz('select');
    for (var ii = 0; ii < 10; ii++) haz('option').con(ii).en(rv);
    rv.el.addEventListener('change', function(ev) {
        window[varname] = rv.el.options[rv.el.selectedIndex].value;
    });
    return rv;
}

function Hechicero(el) {
    this.el = el;
}
Hechicero.prototype =
    { en: function(papa) {
          if (papa.el) papa = papa.el;
          papa.appendChild(this.el);
          return this;
      }
    , con: function(texto) {
          this.el.appendChild(document.createTextNode(texto));
          return this;
      }
    };

function haz(tagName, attrs) {
    if (!attrs) attrs = {};
    var el = document.createElement(tagName);
    for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) el.setAttribute(attr, attrs[attr]);
    }
    return new Hechicero(el);
}

function AND(exprs) {
    if (exprs.length === 0) return '-1';
    if (exprs.length === 1) return exprs[0];
    return '(' + exprs.join(' & ') + ')';
}

function Fila(texto, class_) {
    this.texto = texto;
    this['class'] = class_;
}
Fila.prototype.hazTitulo = function() {
    return haz('th', {'class': this['class']}).con(this.texto);
};

function fila(texto, class_) {
    return new Fila(texto, class_);
}

function FilaSelect(texto, textoParcial, select) {
    this.texto = texto;
    this.textoParcial = textoParcial;
    this.select = select;
}
FilaSelect.prototype.hazTitulo = function() {
    var th = haz('th').con(this.textoParcial);
    this.select.en(th);
    return th;
}

var tCorrido = haz('th').con('t <<')
  , corridoSelect = haz('select').en(tCorrido)
;
for (var ii = 0; ii < 10; ii++) haz('option').con(ii).en(corridoSelect);

window.e1 = window.e2 = window.e3 = window.rshift = 0;

var filas = [ fila('t')
            , new FilaSelect('t << e1', 't <<', select('e1'))
            , new FilaSelect('t << e2', 't <<', select('e2'))
            , new FilaSelect('t << e3', 't <<', select('e3'))
            , fila('xa^xb^xc', 'xor')
            , fila('oa|ob|oc', 'or')
            , fila('sa+sb+sc', 'sum')
            ];
var columns = [ {text: 'sa', 'class': 'sum'}
              , {text: 'sb', 'class': 'sum'}
              , {text: 'sc', 'class': 'sum'}
              , {text: 'oa', 'class': 'or'}
              , {text: 'ob', 'class': 'or'}
              , {text: 'oc', 'class': 'or'}
              , {text: 'xa', 'class': 'xor'}
              , {text: 'xb', 'class': 'xor'}
              , {text: 'xc', 'class': 'xor'}
              , {text: 'audio', select: 'rshift'}
              ];

for (var ii = 0; ii < filas.length; ii++) {
    var tr = haz('tr').en(tB)
      , fila = filas[ii]
    ;

    fila.hazTitulo().en(tr);

    for (var jj = 0; jj < columns.length; jj++) {
        var col = columns[jj];
        if (!col.entradas) col.entradas = {};
        col.entradas[fila.texto] = haz('input', {type: 'checkbox'}).en(haz('td').en(tr)).el;
    }
}

var fondo = haz('tr').en(tB);
haz('td', {'class': 'sum'}).en(fondo);

for (var jj = 0; jj < columns.length; jj++) {
    var col = columns[jj];
    var th = haz('th', {'class': col['class']}).con(col.text).en(fondo);
    if (col.select) select(col.select).en(th);
}

function tsort(variables) {
    var res = [];
    variables: while (variables.length) {
        for (var ii = 0; ii < variables.length; ii++) {
            var vv = variables[ii];
            if (vv.entradas.length === 0) {
                res.push(vv.name + ' = ' + vv.expr);
                for (jj = 0; jj < variables.length; jj++) {
                    var ee = variables[jj].entradas
                      , kk = ee.indexOf(vv.name)
                    ;
                    if (kk !== -1) ee.splice(kk, 1);
                }
                variables.splice(ii, 1);
                continue variables;
            }
        }

        // ciclo de dependencias; romperlo
        var vb = variables[0];
        vb.expr = '-1';
        vb.entradas = [];
    }
    return res.join(', ');
}


// Considerar nombre como un input de afuera, así que no hace falta en las dependencias.

function definir(defs, nombre) {
    for (var ii = 0; ii < defs.length; ii++) {
        var ee = defs[ii].entradas
          , idx = ee.indexOf(nombre)
        ;
        if (idx !== -1) ee.splice(idx, 1);
    }
}

function formulaActual() {
    var defs = [];
    for (var ii = 0; ii < columns.length; ii++) {
        var col = columns[ii]
          , factores = []
        ;

        for (var entrada in col.entradas) {
            if (col.entradas.hasOwnProperty(entrada)) {
                if (col.entradas[entrada].checked) {
                    factores.push('(' + entrada + ')');
                }
            }
        }
        var expr = AND(factores);
        if (col.text === 'audio') expr += '>> rshift';
        defs.push({name: col.text, expr: expr, entradas: expr.match(/[a-z_]\w+/g) || []});
    }

    definir(defs, 't');
    definir(defs, 'e1');
    definir(defs, 'e2');
    definir(defs, 'e3');
    definir(defs, 'rshift');
    return tsort(defs);
}

var recomputer = null;

tB.addEventListener('change', function() {
    if (recomputer !== null) clearTimeout(recomputer);
    recomputer = setTimeout(recompute, 200);
    return true;
});

function recompute() {
    recomputer = null;
    byId('code0').value = formulaActual();
    play();
}

// </script>
