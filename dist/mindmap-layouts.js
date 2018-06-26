(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["MindmapLayouts"] = factory();
	else
		root["MindmapLayouts"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var WrappedTree = __webpack_require__(6);

// node utils
function moveRight(node, move, isHorizontal) {
  if (isHorizontal) {
    node.y += move;
  } else {
    node.x += move;
  }
  node.children.forEach(function (child) {
    moveRight(child, move, isHorizontal);
  });
}

function getMin(node, isHorizontal) {
  var res = isHorizontal ? node.y : node.x;
  node.children.forEach(function (child) {
    res = Math.min(getMin(child, isHorizontal), res);
  });
  return res;
}

function normalize(node, isHorizontal) {
  var min = getMin(node, isHorizontal);
  moveRight(node, -min, isHorizontal);
}

function convertBack(converted /* Tree */, root /* TreeNode */, isHorizontal) {
  if (isHorizontal) {
    root.y = converted.x;
  } else {
    root.x = converted.x;
  }
  converted.c.forEach(function (child, i) {
    convertBack(child, root.children[i], isHorizontal);
  });
}

function layer(node, isHorizontal) {
  var d = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (isHorizontal) {
    node.x = d;
    d += node.width;
  } else {
    node.y = d;
    d += node.height;
  }
  node.children.forEach(function (child) {
    layer(child, isHorizontal, d);
  });
}

module.exports = function (root, isHorizontal) {
  function firstWalk(t) {
    if (t.cs === 0) {
      setExtremes(t);
      return;
    }
    firstWalk(t.c[0]);
    var ih = updateIYL(bottom(t.c[0].el), 0, null);
    for (var i = 1; i < t.cs; ++i) {
      firstWalk(t.c[i]);
      var min = bottom(t.c[i].er);
      separate(t, i, ih);
      ih = updateIYL(min, i, ih);
    }
    positionRoot(t);
    setExtremes(t);
  }

  function setExtremes(t) {
    if (t.cs === 0) {
      t.el = t;
      t.er = t;
      t.msel = t.mser = 0;
    } else {
      t.el = t.c[0].el;
      t.msel = t.c[0].msel;
      t.er = t.c[t.cs - 1].er;
      t.mser = t.c[t.cs - 1].mser;
    }
  }

  function separate(t, i, ih) {
    var sr = t.c[i - 1];
    var mssr = sr.mod;
    var cl = t.c[i];
    var mscl = cl.mod;
    while (sr != null && cl != null) {
      if (bottom(sr) > ih.low) ih = ih.nxt;
      var dist = mssr + sr.prelim + sr.w - (mscl + cl.prelim);
      if (dist > 0) {
        mscl += dist;
        moveSubtree(t, i, ih.index, dist);
      }
      var sy = bottom(sr);
      var cy = bottom(cl);
      if (sy <= cy) {
        sr = nextRightContour(sr);
        if (sr != null) mssr += sr.mod;
      }
      if (sy >= cy) {
        cl = nextLeftContour(cl);
        if (cl != null) mscl += cl.mod;
      }
    }
    if (!sr && !!cl) {
      setLeftThread(t, i, cl, mscl);
    } else if (!!sr && !cl) {
      setRightThread(t, i, sr, mssr);
    }
  }

  function moveSubtree(t, i, si, dist) {
    t.c[i].mod += dist;
    t.c[i].msel += dist;
    t.c[i].mser += dist;
    distributeExtra(t, i, si, dist);
  }

  function nextLeftContour(t) {
    return t.cs === 0 ? t.tl : t.c[0];
  }

  function nextRightContour(t) {
    return t.cs === 0 ? t.tr : t.c[t.cs - 1];
  }

  function bottom(t) {
    return t.y + t.h;
  }

  function setLeftThread(t, i, cl, modsumcl) {
    var li = t.c[0].el;
    li.tl = cl;
    var diff = modsumcl - cl.mod - t.c[0].msel;
    li.mod += diff;
    li.prelim -= diff;
    t.c[0].el = t.c[i].el;
    t.c[0].msel = t.c[i].msel;
  }

  function setRightThread(t, i, sr, modsumsr) {
    var ri = t.c[i].er;
    ri.tr = sr;
    var diff = modsumsr - sr.mod - t.c[i].mser;
    ri.mod += diff;
    ri.prelim -= diff;
    t.c[i].er = t.c[i - 1].er;
    t.c[i].mser = t.c[i - 1].mser;
  }

  function positionRoot(t) {
    t.prelim = (t.c[0].prelim + t.c[0].mod + t.c[t.cs - 1].mod + t.c[t.cs - 1].prelim + t.c[t.cs - 1].w) / 2 - t.w / 2;
  }

  function secondWalk(t, modsum) {
    modsum += t.mod;
    t.x = t.prelim + modsum;
    addChildSpacing(t);
    for (var i = 0; i < t.cs; i++) {
      secondWalk(t.c[i], modsum);
    }
  }

  function distributeExtra(t, i, si, dist) {
    if (si !== i - 1) {
      var nr = i - si;
      t.c[si + 1].shift += dist / nr;
      t.c[i].shift -= dist / nr;
      t.c[i].change -= dist - dist / nr;
    }
  }

  function addChildSpacing(t) {
    var d = 0;
    var modsumdelta = 0;
    for (var i = 0; i < t.cs; i++) {
      d += t.c[i].shift;
      modsumdelta += d + t.c[i].change;
      t.c[i].mod += modsumdelta;
    }
  }

  function updateIYL(low, index, ih) {
    while (ih !== null && low >= ih.low) {
      ih = ih.nxt;
    }
    return {
      low: low,
      index: index,
      nxt: ih
    };
  }

  // do layout
  layer(root, isHorizontal);
  var wt = WrappedTree.fromNode(root, isHorizontal);
  // console.log(wt)
  firstWalk(wt);
  secondWalk(wt, 0);
  convertBack(wt, root, isHorizontal);
  normalize(root, isHorizontal);

  return root;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = __webpack_require__(4);

var Layout = function () {
  function Layout(root) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var extraEdges = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Layout);

    var me = this;
    me.root = new Node(root, options);
    me.options = options;
    me.extraEdges = extraEdges;
  }

  _createClass(Layout, [{
    key: 'doLayout',
    value: function doLayout() {
      throw new Error('please override this method');
    }
  }, {
    key: 'getNodes',
    value: function getNodes() {
      var root = this.root;
      var nodes = [];
      var countByDepth = {};
      root.eachNode(function (node) {
        countByDepth[node.depth] = countByDepth[node.depth] || 0;
        countByDepth[node.depth]++;
        nodes.push({
          // origin data
          data: node.data,
          id: node.id,
          // position
          x: node.x,
          y: node.y,
          centX: node.x + node.width / 2,
          centY: node.y + node.height / 2,
          // size
          hgap: node.hgap,
          vgap: node.vgap,
          height: node.height,
          width: node.width,
          actualHeight: node.height - node.vgap * 2,
          actualWidth: node.width - node.hgap * 2,
          // depth
          depth: node.depth
        });
      });
      return nodes;
    }
  }, {
    key: 'getEdges',
    value: function getEdges() {
      var me = this;
      var extraEdges = me.extraEdges;
      var root = this.root;
      var edges = [];
      root.eachNode(function (node) {
        node.children.forEach(function (child) {
          edges.push({
            source: node.id,
            target: child.id
          });
        });
      });
      edges.concat(extraEdges);
      return edges;
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PEM = 18;
var DEFAULT_HEIGHT = PEM * 2;
var DEFAULT_GAP = PEM;

var DEFAULT_OPTIONS = {
  getId: function getId(d) {
    return d.id || d.name;
  },
  getHGap: function getHGap(d) {
    return d.hgap || DEFAULT_GAP;
  },
  getVGap: function getVGap(d) {
    return d.vgap || DEFAULT_GAP;
  },
  getChildren: function getChildren(d) {
    return d.children;
  },
  getHeight: function getHeight(d) {
    return d.height || DEFAULT_HEIGHT;
  },
  getWidth: function getWidth(d) {
    var name = d.name || ' ';
    return d.width || name.split('').length * PEM;
  }
};

function fallbackExecuteOnData(func1, func2, data) {
  if (func1) return func1(data);
  return func2(data);
}

var Node = function () {
  function Node(data) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var isolated = arguments[2];

    _classCallCheck(this, Node);

    var me = this;
    me.vgap = me.hgap = 0;
    if (data instanceof Node) return data;
    var hgap = fallbackExecuteOnData(options.getHGap, DEFAULT_OPTIONS.getHGap, data);
    var vgap = fallbackExecuteOnData(options.getVGap, DEFAULT_OPTIONS.getVGap, data);
    me.data = data;
    me.width = fallbackExecuteOnData(options.getWidth, DEFAULT_OPTIONS.getWidth, data);
    me.height = fallbackExecuteOnData(options.getHeight, DEFAULT_OPTIONS.getHeight, data);
    me.id = fallbackExecuteOnData(options.getId, DEFAULT_OPTIONS.getId, data);
    me.x = me.y = 0;
    me.depth = 0;
    if (!isolated && !data.isCollapsed) {
      var nodes = [me];
      var node = void 0;
      while (node = nodes.pop()) {
        if (!node.data.isCollapsed) {
          var children = fallbackExecuteOnData(options.getChildren, DEFAULT_OPTIONS.getChildren, node.data);
          var length = children ? children.length : 0;
          node.children = [];
          if (children && length) {
            for (var i = 0; i < length; i++) {
              var child = new Node(children[i], options);
              node.children.push(child);
              nodes.push(child);
              child.parent = node;
              child.depth = node.depth + 1;
            }
          }
        }
      }
    }
    if (!me.children) {
      me.children = [];
    }
    me.addGap(hgap, vgap);
  }

  _createClass(Node, [{
    key: 'isRoot',
    value: function isRoot() {
      return this.depth === 0;
    }
  }, {
    key: 'addGap',
    value: function addGap(hgap, vgap) {
      var me = this;
      me.hgap += hgap;
      me.vgap += vgap;
      me.width += 2 * hgap;
      me.height += 2 * vgap;
    }
  }, {
    key: 'eachNode',
    value: function eachNode(callback) {
      var me = this;
      var nodes = [me];
      var current = null;
      while (current = nodes.pop()) {
        callback(current);
        nodes = nodes.concat(current.children);
      }
    }
  }, {
    key: 'getBoundingBox',
    value: function getBoundingBox() {
      var bb = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        width: 0,
        height: 0
      };
      this.eachNode(function (node) {
        bb.left = Math.min(bb.left, node.x);
        bb.top = Math.min(bb.top, node.y);
        bb.width = Math.max(bb.width, node.x + node.width);
        bb.height = Math.max(bb.height, node.y + node.height);
      });
      return bb;
    }
  }, {
    key: 'translate',
    value: function translate() {
      var tx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var ty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      this.eachNode(function (node) {
        node.x += tx;
        node.y += ty;
      });
    }
  }, {
    key: 'right2left',
    value: function right2left() {
      var me = this;
      var bb = me.getBoundingBox();
      me.eachNode(function (node) {
        node.x = node.x - (node.x - bb.left) * 2 - node.width;
      });
      me.translate(bb.width, 0);
    }
  }, {
    key: 'down2up',
    value: function down2up() {
      var me = this;
      var bb = me.getBoundingBox();
      me.eachNode(function (node) {
        node.y = node.y - (node.y - bb.top) * 2 - node.height;
      });
      me.translate(0, bb.height);
    }
  }]);

  return Node;
}();

module.exports = Node;

/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WrappedTree =

// Array of children and number of children.


// Sum of modifiers at the extreme nodes.


// Extreme left and right nodes.


// Left and right thread.

// Width and height.
function WrappedTree(w, h, y) {
  var c = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  _classCallCheck(this, WrappedTree);

  this.w = 0;
  this.h = 0;
  this.x = 0;
  this.y = 0;
  this.prelim = 0;
  this.mod = 0;
  this.shift = 0;
  this.change = 0;
  this.tl = null;
  this.tr = null;
  this.el = null;
  this.er = null;
  this.msel = 0;
  this.mser = 0;
  this.c = [];
  this.cs = 0;

  this.w = w;
  this.h = h;
  this.y = y;
  this.c = c;
  this.cs = c.length;
};

WrappedTree.fromNode = function (root, isHorizontal) {
  if (!root) return null;
  var children = [];
  root.children.forEach(function (child) {
    children.push(WrappedTree.fromNode(child, isHorizontal));
  });
  if (isHorizontal) return new WrappedTree(root.height, root.width, root.x, children);
  return new WrappedTree(root.width, root.height, root.y, children);
};

module.exports = WrappedTree;

/***/ }),
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  Node: __webpack_require__(4),
  WrappedTree: __webpack_require__(6)
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = __webpack_require__(2);
var nonLayeredTidyTree = __webpack_require__(1);

var DownwardOrganizational = function (_Layout) {
  _inherits(DownwardOrganizational, _Layout);

  function DownwardOrganizational() {
    _classCallCheck(this, DownwardOrganizational);

    return _possibleConstructorReturn(this, (DownwardOrganizational.__proto__ || Object.getPrototypeOf(DownwardOrganizational)).apply(this, arguments));
  }

  _createClass(DownwardOrganizational, [{
    key: 'doLayout',
    value: function doLayout() {
      var root = this.root;
      return nonLayeredTidyTree(root, false);
    }
  }]);

  return DownwardOrganizational;
}(Layout);

module.exports = DownwardOrganizational;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = __webpack_require__(2);
var nonLayeredTidyTree = __webpack_require__(1);

var LeftLogical = function (_Layout) {
  _inherits(LeftLogical, _Layout);

  function LeftLogical() {
    _classCallCheck(this, LeftLogical);

    return _possibleConstructorReturn(this, (LeftLogical.__proto__ || Object.getPrototypeOf(LeftLogical)).apply(this, arguments));
  }

  _createClass(LeftLogical, [{
    key: 'doLayout',
    value: function doLayout() {
      var root = this.root;
      nonLayeredTidyTree(root, true);
      root.right2left();
      return root;
    }
  }]);

  return LeftLogical;
}(Layout);

module.exports = LeftLogical;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = __webpack_require__(2);
var nonLayeredTidyTree = __webpack_require__(1);

var RightLogical = function (_Layout) {
  _inherits(RightLogical, _Layout);

  function RightLogical() {
    _classCallCheck(this, RightLogical);

    return _possibleConstructorReturn(this, (RightLogical.__proto__ || Object.getPrototypeOf(RightLogical)).apply(this, arguments));
  }

  _createClass(RightLogical, [{
    key: 'doLayout',
    value: function doLayout() {
      var root = this.root;
      return nonLayeredTidyTree(root, true);
    }
  }]);

  return RightLogical;
}(Layout);

module.exports = RightLogical;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = __webpack_require__(2);
var Node = __webpack_require__(4);
var nonLayeredTidyTree = __webpack_require__(1);

var Standard = function (_Layout) {
  _inherits(Standard, _Layout);

  function Standard() {
    _classCallCheck(this, Standard);

    return _possibleConstructorReturn(this, (Standard.__proto__ || Object.getPrototypeOf(Standard)).apply(this, arguments));
  }

  _createClass(Standard, [{
    key: 'doLayout',
    value: function doLayout() {
      var me = this;
      var root = me.root;
      var options = me.options;
      // separate into left and right trees
      var leftTree = new Node(root.data, options, true);
      var rightTree = new Node(root.data, options, true);
      var treeSize = root.children.length;
      var rightTreeSize = Math.round(treeSize / 2);
      for (var i = 0; i < treeSize; i++) {
        var child = root.children[i];
        if (i < rightTreeSize) {
          rightTree.children.push(child);
        } else {
          leftTree.children.push(child);
        }
      }
      // do layout for left and right trees
      nonLayeredTidyTree(rightTree, true);
      nonLayeredTidyTree(leftTree, true);
      leftTree.right2left();
      // combine left and right trees
      rightTree.translate(leftTree.x - rightTree.x, leftTree.y - rightTree.y);
      // translate root
      root.x = leftTree.x;
      root.y = rightTree.y;
      var bb = root.getBoundingBox();
      if (bb.top < 0) {
        root.translate(0, -bb.top);
      }
      return root;
    }
  }]);

  return Standard;
}(Layout);

module.exports = Standard;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layout = __webpack_require__(2);
var nonLayeredTidyTree = __webpack_require__(1);

var UpwardOrganizational = function (_Layout) {
  _inherits(UpwardOrganizational, _Layout);

  function UpwardOrganizational() {
    _classCallCheck(this, UpwardOrganizational);

    return _possibleConstructorReturn(this, (UpwardOrganizational.__proto__ || Object.getPrototypeOf(UpwardOrganizational)).apply(this, arguments));
  }

  _createClass(UpwardOrganizational, [{
    key: 'doLayout',
    value: function doLayout() {
      var root = this.root;
      nonLayeredTidyTree(root, false);
      root.down2up();
      return root;
    }
  }]);

  return UpwardOrganizational;
}(Layout);

module.exports = UpwardOrganizational;

/***/ }),
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var RightLogical = __webpack_require__(21);
var DownwardOrganizational = __webpack_require__(19);
var UpwardOrganizational = __webpack_require__(23);
var LeftLogical = __webpack_require__(20);
var Standard = __webpack_require__(22);

var _require = __webpack_require__(18),
    Node = _require.Node,
    WrappedTree = _require.WrappedTree;

module.exports = {
  RightLogical: RightLogical,
  DownwardOrganizational: DownwardOrganizational,
  UpwardOrganizational: UpwardOrganizational,
  LeftLogical: LeftLogical,
  Standard: Standard,
  Node: Node,
  WrappedTree: WrappedTree
};

/***/ })
/******/ ]);
});