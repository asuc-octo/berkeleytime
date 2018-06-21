'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _popper = require('popper.js');

var _popper2 = _interopRequireDefault(_popper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PopperComponent = function (_Component) {
  _inherits(PopperComponent, _Component);

  function PopperComponent() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, PopperComponent);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PopperComponent.__proto__ || Object.getPrototypeOf(PopperComponent)).call.apply(_ref, [this].concat(args))), _this), _this._referenceNode = null, _this._popperNode = null, _this._arrowNode = null, _this._popper = false, _this._addArrowNode = function (node) {
      _this._arrowNode = node;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(PopperComponent, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        popperManager: {
          addArrow: this._addArrowNode
        }
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._referenceNode = _reactDom2.default.findDOMNode(this);
      this._createPopperNode();
      this._renderPopper({ popperProps: {} });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(lastProps) {
      this._renderPopper(lastProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._destroy();
    }
  }, {
    key: '_createPopperNode',
    value: function _createPopperNode() {
      // create a node that we can stick our popper Component in
      this._popperNode = document.createElement(this.props.popperProps.tag);

      // append that node to the parent node
      this._popperParentNode.appendChild(this._popperNode);
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (this._popperParentNode) {
        // unmount component
        _reactDom2.default.unmountComponentAtNode(this._popperParentNode);

        // clean up DOM
        this._popperParentNode.parentNode.removeChild(this._popperNode);
      }

      if (this._popper) {
        this._popper.destroy();
      }

      this._popperNode = null;
      this._popper = null;
    }
  }, {
    key: '_renderPopper',
    value: function _renderPopper(lastProps) {
      var _this2 = this;

      var popperChild = _react.Children.toArray(this.props.children)[1];

      // if no popper child provided, bail out
      if (!popperChild) {
        // destroy Popper element if it has been created
        this._destroy();
        return;
      }

      // render element component into the DOM
      _reactDom2.default.unstable_renderSubtreeIntoContainer(this, popperChild, this._popperNode, function () {
        // don't update Popper until the subtree has finished rendering
        _this2._updatePopperNode(lastProps);
        _this2._updatePopper(lastProps);
      });
    }
  }, {
    key: '_updatePopperNode',
    value: function _updatePopperNode(lastProps) {
      var _this3 = this;

      var _props$popperProps = this.props.popperProps;
      var id = _props$popperProps.id;
      var className = _props$popperProps.className;
      var style = _props$popperProps.style;


      if (lastProps.popperProps.id !== id) {
        this._popperNode.id = id;
      }

      if (lastProps.popperProps.className !== className) {
        this._popperNode.className = className;
      }

      if (style) {
        Object.keys(style).forEach(function (key) {
          _this3._popperNode.style[key] = style[key];
        });
      }
    }
  }, {
    key: '_updatePopper',
    value: function _updatePopper(lastProps) {
      var _props = this.props;
      var placement = _props.placement;
      var modifiers = _props.modifiers;

      // TODO: check if props changed here, no need to update if nothing has changed

      // destroy any prior popper instance before creating another

      if (this._popper) {
        this._popper.destroy();
      }

      this._popper = new _popper2.default(this._referenceNode, this._popperNode, {
        placement: placement,
        modifiers: _extends({}, modifiers, {
          arrow: { element: this._arrowNode }
        })
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.toArray(this.props.children)[0];
    }
  }, {
    key: '_popperParentNode',
    get: function get() {
      var renderTo = this.props.popperProps.renderTo;

      if (typeof renderTo === 'string') {
        return document.querySelector(renderTo);
      } else {
        return renderTo || document.body;
      }
    }
  }]);

  return PopperComponent;
}(_react.Component);

PopperComponent.childContextTypes = {
  popperManager: _react.PropTypes.object.isRequired,
  placement: _react.PropTypes.oneOf(_popper2.default.placements)
};
PopperComponent.defaultProps = {
  popperProps: {
    tag: 'div',
    renderTo: null,
    id: '',
    className: 'popper',
    style: {}
  },
  placement: 'bottom',
  modifiers: {}
};
exports.default = PopperComponent;