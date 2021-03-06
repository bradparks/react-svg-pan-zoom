import React from 'react';
import ViewerHelper from './viewer-helper';
import ViewerEvent from './viewer-event';
import cursor from './cursor';
import {calculateBox, mapRange} from './utils';
import Gradient from './gradient';

import {
  TOOL_NONE, TOOL_PAN, TOOL_ZOOM, TOOL_ZOOM_IN, TOOL_ZOOM_OUT,
  MODE_IDLE, MODE_PANNING, MODE_ZOOMING,
  DIRECTION_NONE, DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN, DIRECTION_LEFT
} from './constants';

export default class Viewer extends React.Component {

  constructor(props) {
    super(props);
    this.handleSpecialKeyChange = this.handleSpecialKeyChange.bind(this);
    this.handleAutoPan = this.handleAutoPan.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleStartPan(event) {
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange} = this.props;
    value = value || ViewerHelper.getDefaultValue();

    if (tool !== TOOL_PAN) return;
    if (value.mode !== MODE_IDLE) return;

    let nextValue = ViewerHelper.startPan(value, x, y);

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleUpdatePan(event) {
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange, width, height, children} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let SVGWidth = children.props.width, SVGHeight = children.props.height;

    if (tool !== TOOL_PAN) return;
    if (value.mode !== MODE_PANNING) return;

    //the mouse exited and reentered into svg
    let forceExit = (value.mode === MODE_PANNING && event.buttons === 0);

    let nextValue = forceExit ?
      ViewerHelper.stopPan(value) :
      ViewerHelper.updatePan(value, x, y, 20, SVGWidth, SVGHeight, width, height);

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleStopPan(event) {
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange} = this.props;
    value = value || ViewerHelper.getDefaultValue();

    if (tool !== TOOL_PAN) return;
    if (value.mode !== MODE_PANNING) return;

    let nextValue = ViewerHelper.stopPan(value, x, y);

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleStartZoom(event) {
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange, children} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let SVGWidth = children.props.width, SVGHeight = children.props.height;

    if ([TOOL_ZOOM, TOOL_ZOOM_IN].indexOf(tool) === -1) return;
    if (value.mode !== MODE_IDLE) return;

    //let point = ViewerHelper.getSVGPoint(value, x, y);
    //if(!ViewerHelper.isPointInsideSVG(point.x, point.y, SVGWidth, SVGHeight)) return;

    let nextValue = ViewerHelper.startZoomSelection(value, x, y);

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleUpdateZoom(event) {
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange, width, height} = this.props;
    value = value || ViewerHelper.getDefaultValue();

    if ([TOOL_ZOOM, TOOL_ZOOM_IN].indexOf(tool) === -1) return;
    if (value.mode !== MODE_ZOOMING) return;

    //the mouse exited and reentered into svg
    let forceExit = (event.buttons === 0);

    let nextValue = forceExit ?
      ViewerHelper.stopZoomSelection(value, width, height)
      : ViewerHelper.updateZoomSelection(value, x, y);

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleStopZoom(event) {
    let abs = Math.abs;
    let x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    let {value, tool, onChange, width, height} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let {startX, endX, startY, endY, specialKeyEnabled} = value;

    if ([TOOL_ZOOM, TOOL_ZOOM_IN, TOOL_ZOOM_OUT].indexOf(tool) === -1) return;
    if (value.mode !== MODE_ZOOMING && tool !== TOOL_ZOOM_OUT) return;

    let selectionMode = abs(startX - endX) > 7 && abs(startY - endY) > 7 && tool !== TOOL_ZOOM_OUT;

    let nextValue;

    if (selectionMode) {
      nextValue = ViewerHelper.stopZoomSelection(value, width, height);
    } else {
      let needZoomIn = (tool === TOOL_ZOOM_IN) || (tool === TOOL_ZOOM && !specialKeyEnabled);
      let scaleFactor = needZoomIn ? 1.1 : 0.9;
      nextValue = ViewerHelper.zoom(value, scaleFactor, x, y);
    }

    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleEvent(event) {
    let {value, tool, onClick, onMouseUp, onMouseMove, onMouseDown} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let eventsHandler = {click: onClick, mousemove: onMouseMove, mouseup: onMouseUp, mousedown: onMouseDown};

    if (tool !== TOOL_NONE) return;
    let onEventHandler = eventsHandler[event.type];
    if (!onEventHandler) return;

    onEventHandler(new ViewerEvent(event, value, this.refs.svg));
  }

  handleSpecialKeyChange(event) {
    let {value, specialKeys, onChange} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let key = event.which;
    let active = event.type === "keydown";

    if (specialKeys.indexOf(key) === -1) return;

    let nextValue = active ? ViewerHelper.enableSpecialKey(value) : ViewerHelper.disableSpecialKey(value);

    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handlePinch(event) {
    let {value, onChange, detectPinch} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    if (!detectPinch) return;

    let rect = this.refs.svg.getBoundingClientRect();
    let x = event.clientX - Math.round(rect.left);
    let y = event.clientY - Math.round(rect.top);
    var delta = Math.max(-1, Math.min(1, event.deltaY));
    let scaleFactor = mapRange(delta, -1, 1, 1.06, 0.96);

    let nextValue = ViewerHelper.zoom(value, scaleFactor, x, y);
    event.preventDefault();
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleAutoPanDetection(event) {
    let {value, onChange, width, height, tool} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    if (tool !== TOOL_NONE) return;

    let rect = this.refs.svg.getBoundingClientRect();
    let x = event.clientX - Math.round(rect.left);
    let y = event.clientY - Math.round(rect.top);

    let nextValue = ViewerHelper.updateAutoPan(value, x, y, width, height);
    if (value !== nextValue) onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  handleAutoPan() {
    let {value, onChange, tool, detectAutoPan} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let {autoPanX, autoPanY} = value;
    let deltaX = 0, deltaY = 0, delta = 30;

    if (tool !== TOOL_NONE) return;
    if (!value.focus) return;
    if (!detectAutoPan) return;
    if (autoPanX === DIRECTION_NONE && autoPanY === DIRECTION_NONE) return;

    if (autoPanX === DIRECTION_LEFT) {
      deltaX = delta;
    } else if (autoPanX === DIRECTION_RIGHT) {
      deltaX = -delta;
    }

    if (autoPanY === DIRECTION_UP) {
      deltaY = delta
    } else if (autoPanY === DIRECTION_DOWN) {
      deltaY = -delta;
    }

    let nextValue = ViewerHelper.pan(value, deltaX, deltaY);
    onChange(new ViewerEvent(null, nextValue, this.refs.svg));
  }

  handleUpdateFocus(event, focus) {
    let {value, onChange} = this.props;
    value = value || ViewerHelper.getDefaultValue();
    let nextValue = ViewerHelper.updateFocus(value, focus);
    onChange(new ViewerEvent(event, nextValue, this.refs.svg));
  }

  componentWillMount(event) {
    window.addEventListener("keydown", this.handleSpecialKeyChange, false);
    window.addEventListener("keyup", this.handleSpecialKeyChange, false);
  }

  componentDidMount() {
    this.autoPanTimer = setInterval(this.handleAutoPan, 200);
  }

  componentWillUnmount(event) {
    window.removeEventListener("keydown", this.handleSpecialKeyChange, false);
    window.removeEventListener("keyup", this.handleSpecialKeyChange, false);
    clearTimeout(this.autoPanTimer);
  }

  render() {
    let originalSVG = this.props.children;
    let value = this.props.value || ViewerHelper.getDefaultValue();
    let {matrix, mode, specialKeyEnabled, autoPanX, autoPanY, focus} = value;
    let {width: SVGWidth, height: SVGHeight, detectAutoPan, tool} = this.props;
    let matrixStr = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;

    let style = {};
    let gStyle = tool === TOOL_NONE ? {} : {pointerEvents: "none"};
    if (tool === TOOL_PAN) style.cursor = cursor(mode === MODE_PANNING ? 'grabbing' : 'grab');
    if ([TOOL_ZOOM, TOOL_ZOOM_IN, TOOL_ZOOM_OUT].indexOf(tool) >= 0) {
      let needZoomIn = (tool === TOOL_ZOOM_IN) || (tool === TOOL_ZOOM && !specialKeyEnabled);
      style.cursor = cursor(needZoomIn ? 'zoom-in' : 'zoom-out');
    }


    let zoomSelectionRect;
    if (mode === MODE_ZOOMING) {
      let {startX, startY, endX, endY} = value;
      let box = calculateBox({x: startX, y: startY}, {x: endX, y: endY});

      zoomSelectionRect =
        <rect
          stroke="#969FFF"
          strokeOpacity={0.7}
          fill="#F3F4FF"
          fillOpacity={0.7}
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}/>
    }


    return (
      <svg
        ref="svg"
        width={SVGWidth}
        height={SVGHeight}
        style={Object.assign(style, this.props.style)}
        onMouseDown={ event => {
          this.handleStartPan(event);
          this.handleStartZoom(event)
        } }
        onMouseMove={ event => {
          this.handleUpdatePan(event);
          this.handleUpdateZoom(event);
          this.handleAutoPanDetection(event);
        } }
        onMouseUp={ event => {
          this.handleStopPan(event);
          this.handleStopZoom(event)
        } }
        onWheel={ event => {
          this.handlePinch(event)
        }}
        onMouseEnter={event => {
          this.handleUpdateFocus(event, true);
        }}
        onMouseLeave={event => {
          this.handleUpdateFocus(event, false);
        }}
      >

        <rect
          fill={this.props.background}
          x={0}
          y={0}
          width={this.props.width}
          height={this.props.height}
          style={{pointerEvents: "none"}}
        />

        <g
          ref="originalSVG"
          transform={matrixStr}
          style={gStyle}
          onMouseDown={ event => this.handleEvent(event)}
          onMouseMove={event => this.handleEvent(event)}
          onMouseUp={event => this.handleEvent(event)}
          onClick={event => this.handleEvent(event)}
        >
          <rect
            fill={this.props.SVGBackground}
            x={0}
            y={0}
            width={originalSVG.props.width}
            height={originalSVG.props.height}/>
          <g ref="content">
            {originalSVG.props.children}
          </g>
        </g>

        {focus && (tool === TOOL_NONE) && detectAutoPan ?
          <g style={{pointerEvents: "none"}}>
            <Gradient direction={autoPanX} SVGWidth={SVGWidth} SVGHeight={SVGHeight}/>
            <Gradient direction={autoPanY} SVGWidth={SVGWidth} SVGHeight={SVGHeight}/>
          </g> : null}

        {zoomSelectionRect}
      </svg>
    );
  }
}

Viewer.propTypes = {
  //width of the viewer displayed on screen
  width: React.PropTypes.number.isRequired,

  //height of the viewer displayed on screen
  height: React.PropTypes.number.isRequired,

  //background of the viewer
  background: React.PropTypes.string,

  //background of the svg
  SVGBackground: React.PropTypes.string,

  //value of the viewer (current point of view)
  value: React.PropTypes.object,

  //CSS style of the SVG tag
  style: React.PropTypes.object,

  //array of keys that in zoom mode switch zoom in and zoom out
  specialKeys: React.PropTypes.arrayOf(React.PropTypes.number),

  //detect zoom operation performed trough pinch gesture or mouse scroll
  detectPinch: React.PropTypes.bool,

  //perform PAN if the mouse is on viewer border
  detectAutoPan: React.PropTypes.bool,

  //handler something changed
  onChange: React.PropTypes.func.isRequired,

  //handler click
  onClick: React.PropTypes.func,

  //handler mouseup
  onMouseUp: React.PropTypes.func,

  //handler mousemove
  onMouseMove: React.PropTypes.func,

  //handler mousedown
  onMouseDown: React.PropTypes.func,

  //current active tool (TOOL_NONE, TOOL_PAN, TOOL_ZOOM)
  tool: React.PropTypes.oneOf([TOOL_NONE, TOOL_PAN, TOOL_ZOOM, TOOL_ZOOM_IN, TOOL_ZOOM_OUT]),

  //accept only one node SVG
  children: function (props, propName, componentName) {
    // Only accept a single child, of the appropriate type
    //credits: http://www.mattzabriskie.com/blog/react-validating-children
    var prop = props[propName];
    var types = ['svg'];
    if (React.Children.count(prop) !== 1 ||
      types.indexOf(prop.type) === -1) {
      return new Error(
        '`' + componentName + '` ' +
        'should have a single child of the following types: ' +
        ' `' + types.join('`, `') + '`.'
      );
    }
    if (!prop.props.hasOwnProperty('width') || !prop.props.hasOwnProperty('height')) {
      return new Error('SVG should have props `width` and `height`');
    }

  }
};

Viewer.defaultProps = {
  value: null,
  style: {},
  background: "#616264",
  SVGBackground: "#fff",
  tool: TOOL_NONE,
  detectPinch: true,
  detectAutoPan: true,
  specialKeys: [91, 17] //91=Win/Cmd 17=Ctrl,
};
