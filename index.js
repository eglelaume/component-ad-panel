'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

/* global window: false */
/* global document: false */

var AdPanel = (function (_React$Component) {
  _inherits(AdPanel, _React$Component);

  _createClass(AdPanel, null, [{
    key: 'propTypes',
    get: function get() {
      return {
        animated: _react2['default'].PropTypes.bool,
        adTag: _react2['default'].PropTypes.string.isRequired,
        className: _react2['default'].PropTypes.string,
        lazyLoad: _react2['default'].PropTypes.bool,
        lazyLoadMargin: _react2['default'].PropTypes.number,
        sizes: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.array),
        sizeMapping: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.array),
        onFailure: _react2['default'].PropTypes.func,
        targeting: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.string)),
        reserveHeight: _react2['default'].PropTypes.number,
        styled: _react2['default'].PropTypes.bool,
        googletag: _react2['default'].PropTypes.object };
    }
  }, {
    key: 'defaultProps',
    // Testing hook
    get: function get() {
      return {
        animated: true,
        lazyLoad: true,
        lazyLoadMargin: 600,
        sizes: [[60, 60], [70, 70], [300, 250], [1024, 768]],
        sizeMapping: [[[980, 200], [[1024, 768]]], [[0, 0], [[300, 250]]]],
        targeting: [],
        styled: true
      };
    }
  }]);

  function AdPanel() {
    _classCallCheck(this, AdPanel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _React$Component.call.apply(_React$Component, [this].concat(args));
    this.loadElementWhenInView = this.loadElementWhenInView.bind(this);
    this.unlistenSlotRenderEnded = function () {
      return null;
    };
  }

  AdPanel.prototype.componentWillMount = function componentWillMount() {
    this.setState({
      tagId: 'googlead-' + (Math.random() * 1e17).toString(16),
      adGenerated: false,
      adFailed: false
    });
  };

  AdPanel.prototype.componentDidMount = function componentDidMount() {
    if (this.state && this.state.tagId) {
      this.getOrCreateGoogleTag();
    }
    if (!this.props.lazyLoad && this.state && this.state.tagId && !this.state.adGenerated) {
      this.generateAd();
    }
    window.addEventListener('scroll', this.loadElementWhenInView);
    window.addEventListener('resize', this.loadElementWhenInView);
    this.loadElementWhenInView();
  };

  AdPanel.prototype.componentWillUnmount = function componentWillUnmount() {
    this.cleanupEventListeners();
  };

  AdPanel.prototype.getOrCreateGoogleTag = function getOrCreateGoogleTag() {
    /* global window document */
    if (this.props.googletag) {
      return this.props.googletag;
    } else if (typeof window !== 'undefined' && window.document && !window.googletag) {
      window.googletag = { cmd: [] };
      var gads = document.createElement('script');
      gads.async = true;
      gads.type = 'text/javascript';
      var useSsl = window.location.protocol === 'https:';
      gads.src = (useSsl ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
      document.head.appendChild(gads);
      return window.googletag;
    } else if (typeof window !== 'undefined' && window.googletag) {
      return window.googletag;
    }
  };

  AdPanel.prototype.isElementInViewport = function isElementInViewport(elm) {
    var margin = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    var rect = this.getContainerDOMElement().getBoundingClientRect();
    return rect.bottom > -margin && rect.right > -margin && rect.left < (window.innerWidth || document.documentElement.clientWidth) + margin && rect.top < (window.innerHeight || document.documentElement.clientHeight) + margin;
  };

  AdPanel.prototype.getContainerDOMElement = function getContainerDOMElement() {
    return _reactDom2['default'].findDOMNode(this.refs.container);
  };

  AdPanel.prototype.loadElementWhenInView = function loadElementWhenInView() {
    var containerElement = this.refs.container;
    if (!this.state.adGenerated && this.isElementInViewport(containerElement, this.props.lazyLoadMargin)) {
      this.generateAd();
    }
    if (this.isElementInViewport(containerElement) === true) {
      var targetContainerElement = this.getContainerDOMElement();
      targetContainerElement.className += ' ad-panel--visible';
      this.cleanupEventListeners();
    }
  };

  AdPanel.prototype.cleanupEventListeners = function cleanupEventListeners() {
    window.removeEventListener('scroll', this.loadElementWhenInView);
    window.removeEventListener('resize', this.loadElementWhenInView);
    this.unlistenSlotRenderEnded();
  };

  AdPanel.prototype.listenToSlotRenderEnded = function listenToSlotRenderEnded(_ref2) {
    var _this = this;

    var googleTag = _ref2.googleTag;

    if (!googleTag.pubads) {
      throw new Error('listenToSlotRenderEnded() must be called inside a googletag.cmd.push()\'ed function!');
    }
    if (!this.adSlot) {
      throw new Error('listenToSlotRenderEnded() must be called with this.adSlot available!');
    }

    var slot = this.adSlot;
    var unlistened = false;
    var slotRenderEndedListener = function slotRenderEndedListener(ev) {
      if (unlistened) {
        return;
      } // the GPT API doesn't have a removeEventListener function
      if (ev.slot !== slot) {
        return;
      }
      if (ev.isEmpty) {
        _this.setState({ adFailed: true });
        _this.cleanupEventListeners(); // not interested in 'scroll' and 'resize' events any more
        if (_this.props.onFailure) {
          _this.props.onFailure();
        }
        return;
      }
      _this.unlistenSlotRenderEnded();
    };

    googleTag.pubads().addEventListener('slotRenderEnded', slotRenderEndedListener);

    this.unlistenSlotRenderEnded = function () {
      unlistened = true;
    };
  };

  AdPanel.prototype.buildSizeMapping = function buildSizeMapping() {
    var mapping = this.props.sizeMapping || [];
    var googleTag = this.getOrCreateGoogleTag();
    if (!googleTag.sizeMapping) {
      throw new Error('buildSizeMapping() must be called inside a googletag.cmd.push()\'ed function!');
    }
    var sizeMappingBuilder = googleTag.sizeMapping();
    return mapping.reduce(function (builder, _ref3) {
      var viewportSize = _ref3[0];
      var adSizes = _ref3[1];

      return builder.addSize(viewportSize, adSizes);
    }, sizeMappingBuilder).build();
  };

  AdPanel.prototype.generateAd = function generateAd() {
    var _this2 = this;

    this.setState({ adGenerated: true });
    var googleTag = this.getOrCreateGoogleTag();
    googleTag.cmd.push(function () {
      var sizeMapping = _this2.buildSizeMapping();
      var slot = _this2.adSlot = googleTag.defineSlot(_this2.props.adTag, _this2.props.sizes, _this2.state.tagId).addService(googleTag.pubads()).defineSizeMapping(sizeMapping);

      for (var _iterator = _this2.props.targeting, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var key = _ref[0];
        var value = _ref[1];

        slot.setTargeting(key, value);
      }
      googleTag.pubads().enableSingleRequest();
      googleTag.pubads().collapseEmptyDivs();
      googleTag.enableServices();
      googleTag.display(_this2.state.tagId);

      _this2.listenToSlotRenderEnded({ googleTag: googleTag });
    });
  };

  AdPanel.prototype.render = function render() {
    if (this.state && this.state.adFailed) {
      return _react2['default'].createElement('div', null);
    }
    var tag = [];
    if (this.state && this.state.tagId) {
      var adStyle = {};
      if (this.props.reserveHeight) {
        adStyle = { minHeight: this.props.reserveHeight };
      }
      tag = _react2['default'].createElement('div', { className: 'ad-panel__googlead', id: this.state.tagId, style: adStyle, title: 'Advertisement' });
    }
    var rootClassNames = ['ad-panel__container'];
    if (this.props.styled) {
      rootClassNames = rootClassNames.concat(['ad-panel__container--styled']);
    }
    if (this.props.animated) {
      rootClassNames = rootClassNames.concat(['ad-panel__animated']);
    }
    if (this.props.className) {
      rootClassNames = rootClassNames.concat([this.props.className]);
    }
    var aria = {
      role: 'complementary',
      itemScope: 'https://schema.org/WPAdBlock'
    };
    return _react2['default'].createElement(
      'div',
      _extends({ ref: 'container', className: rootClassNames.join(' ') }, aria),
      tag
    );
  };

  return AdPanel;
})(_react2['default'].Component);

exports['default'] = AdPanel;
module.exports = exports['default'];