/**
 * FARMS International — Interactive World Map
 *
 * Renders an SVG world map with highlighted countries grouped by region.
 * To change which countries are highlighted, edit the regions array below.
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────
  // Each region lists ISO 3166-1 alpha-2 country codes.
  var regions = [
    {
      name: 'Caribbean &\nCentral America',
      codes: ['CU', 'SV'],
      labelX: 200,
      labelY: 235
    },
    {
      name: 'Eastern\nEurope',
      codes: ['MD'],
      labelX: 545,
      labelY: 140
    },
    {
      name: 'Africa',
      codes: ['GH', 'CD', 'UG', 'KE', 'RW', 'BI', 'TZ', 'ZM', 'MW', 'ZW'],
      labelX: 510,
      labelY: 270
    },
    {
      name: 'SE Asia',
      codes: [
        'IN', 'NP', 'BT', 'BD', 'LK', 'MM', 'TH', 'LA', 'KH', 'VN',
        'MY', 'ID', 'PH'
      ],
      labelX: 790,
      labelY: 215
    }
  ];

  // ── Colors (matching existing site palette) ────────────────────────
  var COLORS = {
    bg:           '#262626',
    land:         '#3a3a3a',
    landStroke:   '#262626',
    highlight:    '#c8d83f',
    highlightHov: '#e0ee60',
    label:        '#ffffff',
    labelShadow:  'rgba(0,0,0,0.6)',
    tooltip:      '#c8d83f',
    tooltipBg:    '#222'
  };

  // ── Build lookup of highlighted codes → region name ────────────────
  var codeToRegion = {};
  for (var r = 0; r < regions.length; r++) {
    for (var c = 0; c < regions[r].codes.length; c++) {
      codeToRegion[regions[r].codes[c]] = regions[r].name.replace(/\n/g, ' ');
    }
  }

  function init() {
    var container = document.getElementById('farms-map-container');
    if (!container) return;

    // Fetch the SVG and embed it inline
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'img/world-map.svg', true);
    xhr.onload = function () {
      if (xhr.status !== 200) return;

      container.innerHTML = xhr.responseText;
      var svg = container.querySelector('svg');
      if (!svg) return;

      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'World map showing FARMS International project regions');

      // ── Style the SVG ──────────────────────────────────────────
      var style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = [
        '#farms-world-map { background:' + COLORS.bg + '; border-radius:8px; width:100%; height:auto; display:block; }',
        '#farms-world-map path { fill:' + COLORS.land + '; stroke:' + COLORS.landStroke + '; stroke-width:0.5; transition: fill 0.2s; }',
        '#farms-world-map path.highlighted { fill:' + COLORS.highlight + '; cursor:pointer; }',
        '#farms-world-map path.highlighted:hover { fill:' + COLORS.highlightHov + '; }',
        '#farms-world-map .region-label { font-family:Montserrat,sans-serif; font-size:11px; fill:' + COLORS.label + '; pointer-events:none; text-anchor:middle; font-weight:600; paint-order:stroke; stroke:' + COLORS.labelShadow + '; stroke-width:3px; stroke-linejoin:round; }',
        '#farms-world-map .map-tooltip { font-family:Montserrat,sans-serif; font-size:11px; pointer-events:none; opacity:0; transition:opacity 0.15s; }',
        '#farms-world-map .map-tooltip rect { fill:' + COLORS.tooltipBg + '; rx:4; ry:4; }',
        '#farms-world-map .map-tooltip text { fill:' + COLORS.tooltip + '; text-anchor:middle; font-weight:600; }'
      ].join('\n');
      svg.insertBefore(style, svg.firstChild);

      // ── Highlight countries ────────────────────────────────────
      var paths = svg.querySelectorAll('path');
      for (var i = 0; i < paths.length; i++) {
        var id = paths[i].getAttribute('id');
        if (codeToRegion[id]) {
          paths[i].classList.add('highlighted');
          paths[i].setAttribute('data-country', id);
          paths[i].setAttribute('data-region', codeToRegion[id]);
        }
      }

      // ── Region labels (multiline via <tspan>) ─────────────────
      for (var j = 0; j < regions.length; j++) {
        var reg = regions[j];
        var textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('class', 'region-label');
        textEl.setAttribute('x', reg.labelX);
        textEl.setAttribute('y', reg.labelY);

        var lines = reg.name.split('\n');
        for (var k = 0; k < lines.length; k++) {
          var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', reg.labelX);
          if (k > 0) tspan.setAttribute('dy', '14');
          tspan.textContent = lines[k];
          textEl.appendChild(tspan);
        }
        svg.appendChild(textEl);
      }

      // ── Tooltip ────────────────────────────────────────────────
      var tooltipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tooltipGroup.setAttribute('class', 'map-tooltip');
      var tooltipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      var tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tooltipGroup.appendChild(tooltipRect);
      tooltipGroup.appendChild(tooltipText);
      svg.appendChild(tooltipGroup);

      // Country name lookup for tooltip
      var countryNames = {
        'CU':'Cuba','SV':'El Salvador','MD':'Moldova',
        'GH':'Ghana','CD':'DR Congo','UG':'Uganda','KE':'Kenya',
        'RW':'Rwanda','BI':'Burundi','TZ':'Tanzania','ZM':'Zambia',
        'MW':'Malawi','ZW':'Zimbabwe',
        'IN':'India','NP':'Nepal','BT':'Bhutan','BD':'Bangladesh',
        'LK':'Sri Lanka','MM':'Myanmar','TH':'Thailand','LA':'Laos',
        'KH':'Cambodia','VN':'Vietnam','MY':'Malaysia','ID':'Indonesia',
        'PH':'Philippines'
      };

      svg.addEventListener('mousemove', function (e) {
        var target = e.target.closest('.highlighted');
        if (!target) {
          tooltipGroup.style.opacity = '0';
          return;
        }

        var code = target.getAttribute('data-country');
        var name = countryNames[code] || code;

        // Position tooltip near cursor in SVG coordinates
        var pt = svg.createSVGPoint();
        var ctm = svg.getScreenCTM();
        if (!ctm) return;
        pt.x = e.clientX;
        pt.y = e.clientY;
        var svgPt = pt.matrixTransform(ctm.inverse());

        tooltipText.textContent = name;
        var textLen = name.length * 6.5 + 16;
        var tx = Math.min(Math.max(svgPt.x, textLen / 2 + 5), 960 - textLen / 2 - 5);
        var ty = svgPt.y - 18;

        tooltipRect.setAttribute('x', tx - textLen / 2);
        tooltipRect.setAttribute('y', ty - 14);
        tooltipRect.setAttribute('width', textLen);
        tooltipRect.setAttribute('height', 22);
        tooltipText.setAttribute('x', tx);
        tooltipText.setAttribute('y', ty);
        tooltipGroup.style.opacity = '1';
      });

      svg.addEventListener('mouseleave', function () {
        tooltipGroup.style.opacity = '0';
      });
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
