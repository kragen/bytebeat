var tbl = document.getElementById('iomatrix')
  , tB = tbl.firstChild          // tbody
;


function haz(tagName, attrs) {
    if (!attrs) attrs = {};
    var el = document.createElement(tagName);
    for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) el.setAttribute(attr, attrs[attr]);
    }

    return (
        { el: el
        , en: function(papa) {
          if (papa.el) papa = papa.el;
          papa.appendChild(this.el);
          return this;
        }
        , con: function(texto) {
          this.el.appendChild(document.createTextNode(texto));
          return this;
        }
        });
}

function AND(exprs) {
    if (exprs.length === 0) return '-1';
    if (exprs.length === 1) return exprs[0];
    return '(' + exprs.join(' & ') + ')';
}

var filas = [ {text: 't'}
            , {text: 'xa^xb^xc', 'class': 'xor'}
            , {text: 'oa|ob|oc', 'class': 'or'}
            , {text: 'sa+sb+sc', 'class': 'sum'}
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
              , {text: 'audio'}
              ];

for (var ii = 0; ii < filas.length; ii++) {
    var tr = haz('tr').en(tB)
      , fila = filas[ii]
    ;
    haz('th', {'class': fila['class']}).con(fila.text).en(tr);
    for (var jj = 0; jj < columns.length; jj++) {
        var col = columns[jj];
        if (!col.entradas) col.entradas = {};
        col.entradas[fila.text] = haz('input', {type: 'checkbox'}).en(haz('td').en(tr)).el;
    }
}

var fondo = haz('tr').en(tB);
haz('td', {'class': 'sum'}).en(fondo);

for (var jj = 0; jj < columns.length; jj++) {
    haz('th', {'class': columns[jj]['class']}).con(columns[jj].text).en(fondo);
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
        defs.push({name: col.text, expr: expr, entradas: expr.match(/[a-z_]\w+/g) || []});
    }

    // "definir" t
    for (var ii = 0; ii < defs.length; ii++) {
        var ee = defs[ii].entradas
          , idx = ee.indexOf('t')
        ;
        if (idx !== -1) ee.splice(idx, 1);
    }

    return tsort(defs);
}

var recomputer = null;

tB.addEventListener('click', function() {
    if (recomputer === null) recomputer = setTimeout(recompute, 1);
    return true;
});

function recompute() {
    recomputer = null;
    byId('code0').value = formulaActual();
    play();
}

// </script>
