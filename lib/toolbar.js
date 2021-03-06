'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = Toolbar;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _constants = require('./constants');

var _icons = require('./icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STYLE_TOOLBAR = {
  backgroundColor: '#28292D',
  padding: "5px 2px 2px",
  width: "24px",
  borderRadius: "2px"
};

var STYLE_ELEMENT = {
  display: "block",
  width: "24px",
  height: "24px",
  marginBottom: "5px"
};

var ICON_COLOR_OFF = '#FFF';
var ICON_COLOR_ON = '#1CA6FC';

function Toolbar(_ref) {
  var tool = _ref.tool;
  var onChangeTool = _ref.onChangeTool;
  var style = _ref.style;


  var handleChangeTool = function handleChangeTool(event, tool) {
    event.stopPropagation();
    event.preventDefault();
    onChangeTool(tool);
  };

  return _react2.default.createElement(
    'div',
    { style: _extends({}, STYLE_TOOLBAR, style) },
    _react2.default.createElement(
      'a',
      { href: true, style: STYLE_ELEMENT, title: 'Selection', onClick: function onClick(event) {
          return handleChangeTool(event, _constants.TOOL_NONE);
        } },
      _react2.default.createElement(
        'svg',
        { width: 24, height: 24 },
        _react2.default.createElement(_icons.IconCursor, { color: tool === _constants.TOOL_NONE ? ICON_COLOR_ON : ICON_COLOR_OFF })
      )
    ),
    _react2.default.createElement(
      'a',
      { style: STYLE_ELEMENT, href: 'javascript:;', title: 'Pan', onClick: function onClick(event) {
          return onChangeTool(_constants.TOOL_PAN);
        } },
      _react2.default.createElement(
        'svg',
        { width: 24, height: 24 },
        _react2.default.createElement(_icons.IconPan, { color: tool === _constants.TOOL_PAN ? ICON_COLOR_ON : ICON_COLOR_OFF })
      )
    ),
    _react2.default.createElement(
      'a',
      { style: STYLE_ELEMENT, href: 'javascript:;', title: 'Zoom', onClick: function onClick(event) {
          return onChangeTool(_constants.TOOL_ZOOM);
        } },
      _react2.default.createElement(
        'svg',
        { width: 24, height: 24 },
        _react2.default.createElement(_icons.IconZoom, { color: tool === _constants.TOOL_ZOOM ? ICON_COLOR_ON : ICON_COLOR_OFF })
      )
    ),
    _react2.default.createElement(
      'a',
      { style: STYLE_ELEMENT, href: 'javascript:;', title: 'Zoom in', onClick: function onClick(event) {
          return onChangeTool(_constants.TOOL_ZOOM_IN);
        } },
      _react2.default.createElement(
        'svg',
        { width: 24, height: 24 },
        _react2.default.createElement(_icons.IconZoomIn, { color: tool === _constants.TOOL_ZOOM_IN ? ICON_COLOR_ON : ICON_COLOR_OFF })
      )
    ),
    _react2.default.createElement(
      'a',
      { style: STYLE_ELEMENT, href: 'javascript:;', title: 'Zoom out', onClick: function onClick(event) {
          return onChangeTool(_constants.TOOL_ZOOM_OUT);
        } },
      _react2.default.createElement(
        'svg',
        { width: 24, height: 24 },
        _react2.default.createElement(_icons.IconZoomOut, { color: tool === _constants.TOOL_ZOOM_OUT ? ICON_COLOR_ON : ICON_COLOR_OFF })
      )
    )
  );
}

Toolbar.propTypes = {
  tool: _react.PropTypes.oneOf([_constants.TOOL_NONE, _constants.TOOL_PAN, _constants.TOOL_ZOOM, _constants.TOOL_ZOOM_IN, _constants.TOOL_ZOOM_OUT]).isRequired,
  onChangeTool: _react.PropTypes.func.isRequired,
  style: _react.PropTypes.object
};

Toolbar.defaultProps = {
  style: {}
};