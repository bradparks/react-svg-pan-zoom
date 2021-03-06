'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _viewerHelper = require('./viewer-helper');

var _viewerHelper2 = _interopRequireDefault(_viewerHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewerEvent = function () {
  function ViewerEvent(originalEvent, value, SVGViewer) {
    _classCallCheck(this, ViewerEvent);

    this.originalEvent = originalEvent;
    this.value = value;
    this.SVGViewer = SVGViewer;
  }

  _createClass(ViewerEvent, [{
    key: 'point',
    get: function get() {
      if (!this._cachePoint) {
        var event = this.originalEvent,
            value = this.value,
            SVGViewer = this.SVGViewer;

        var rect = SVGViewer.getBoundingClientRect();
        var x = event.clientX - Math.round(rect.left);
        var y = event.clientY - Math.round(rect.top);

        this._cachePoint = _viewerHelper2.default.getSVGPoint(value, x, y);
      }
      return this._cachePoint;
    }
  }, {
    key: 'x',
    get: function get() {
      return this.point.x;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.point.y;
    }
  }, {
    key: 'scaleFactor',
    get: function get() {
      if (!this._cacheDecomposedValue) {
        var value = this.value;
        this._cacheDecomposedValue = _viewerHelper2.default.decomposeValue(value);
      }
      return this._cacheDecomposedValue.scaleFactor;
    }
  }, {
    key: 'translationX',
    get: function get() {
      if (!this._cacheDecomposedValue) {
        var value = this.value;
        this._cacheDecomposedValue = _viewerHelper2.default.decomposeValue(value);
      }
      return this._cacheDecomposedValue.translationX;
    }
  }, {
    key: 'translationY',
    get: function get() {
      if (!this._cacheDecomposedValue) {
        var value = this.value;
        this._cacheDecomposedValue = _viewerHelper2.default.decomposeValue(value);
      }
      return this._cacheDecomposedValue.translationY;
    }
  }]);

  return ViewerEvent;
}();

exports.default = ViewerEvent;