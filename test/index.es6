/* global window chai */
/* eslint-disable id-match */
import AdPanel from '..';
import React from 'react';

const addEventListener = window.addEventListener;
const removeEventListener = window.removeEventListener;
describe('AdPanel', () => {
  let instance = null;
  beforeEach(() => {
    instance = new AdPanel({ adTag: 'test-ad-tag' });
    instance.refs = {};
    instance.state = {};
    instance.generateAd = chai.spy('generateAd');
    instance.showElementWhenInView = chai.spy('showElementWhenInView');
    if (typeof window !== 'undefined') {
      window.addEventListener = chai.spy('addEventListener', addEventListener);
      window.removeEventListener = chai.spy('removeEventListener', removeEventListener);
    }
  });

  describe('react component', () => {
    it('should exist', () => {
      AdPanel.should.be.a('function');
    });

    it('renders a component', () => {
      (<AdPanel adTag="fake-tag" />).should.be.an('object');
    });

    it('is a react component', () => {
      (new AdPanel({ adTag: 'fake-tag' })).should.be.an.instanceOf(React.Component);
    });
  });

  it('Renders empty div if state.adFailed is true', () => {
    instance.state.adFailed = true;
    const rendered = instance.render();
    rendered.type.should.equal('div');
    (typeof rendered.props.children).should.equal('undefined');
  })

  describe('componentDidMount', () => {
    beforeEach(() => {
      // Remove actual loadElementWhenInView function
      instance.loadElementWhenInView = chai.spy('loadElementWhenInView');
    });
    it('calls generateAd', () => {
      instance.state = { tagId: true };
      instance.componentDidMount();
      instance.generateAd
        .should.have.been.called.exactly(1);
    });

    it('adds loadElementWhenInView() to scroll event listener', () => {
      chai.spy.on(window, 'addEventListener');

      instance.componentDidMount();

      window.addEventListener
        .should.have.been.called.with('scroll', instance.loadElementWhenInView);
    });

    it('adds loadElementWhenInView() to resize event listener', () => {
      chai.spy.on(window, 'addEventListener');

      instance.componentDidMount();

      window.addEventListener
        .should.have.been.called.with('resize', instance.loadElementWhenInView);
    });

    it('calls loadElementWhenInView', () => {
      chai.spy.on(instance, 'loadElementWhenInView');
      instance.componentDidMount();

      instance.loadElementWhenInView
        .should.have.been.called();
    });

  });

  describe('generateAd', () => {
    let sizeMappingBuilder;
    let adSlot;
    let fakeMapping;
    let fakePubAds;
    beforeEach(() => {
      // These tests actually want to call generateAd
      instance.generateAd = chai.spy(AdPanel.prototype.generateAd);
      instance.setState = chai.spy();
      instance.props.sizeMapping = [
        [ [ 800, 600 ], [ [ 300, 250 ] ] ],
        [ [ 640, 480 ], [  ] ]
      ];
      instance.props.targeting = [
        [ 'foo', 'bar' ],
        [ 'baz', 'qux' ],
      ];
      fakeMapping = {};  // <- Just for reference equality. Not a symbol because it crashes on IE and Safari.
      sizeMappingBuilder = {
        addSize() {
          return this;
        },
        build() {
          return fakeMapping;
        }
      };
      chai.spy.on(sizeMappingBuilder, 'addSize');
      chai.spy.on(sizeMappingBuilder, 'build');
      adSlot = {
        addService() {
          return this;
        },
        defineSizeMapping() {
          return this;
        },
        setTargeting() {
          return this;
        }
      };
      chai.spy.on(adSlot, 'addService');
      chai.spy.on(adSlot, 'defineSizeMapping');
      chai.spy.on(adSlot, 'setTargeting');
      fakePubAds = {
        enableSingleRequest: () => null,
        collapseEmptyDivs: () => null,
        _listeners: [],
        addEventListener: (ev, listener) => {
          fakePubAds._listeners.push([ev, listener])
        },
      };
      chai.spy.on(fakePubAds, 'enableSingleRequest');
      chai.spy.on(fakePubAds, 'collapseEmptyDivs');
      chai.spy.on(fakePubAds, 'addEventListener');
      chai.spy.on(fakePubAds, 'removeEventListener');
      instance.props.googletag = {
        sizeMapping: () => sizeMappingBuilder,
        defineSlot: () => adSlot,
        pubads: () => fakePubAds,
        enableServices: () => null,
        display: () => null,
        cmd: {
          push(fn) {
            fn();
          },
        },
      };
      chai.spy.on(instance.props.googletag, 'display');
    });
    it('uses the googletag API to add sizes and targeting options', () => {
      instance.generateAd();
      instance.setState.should.have.been.called.with({ adGenerated: true });
      sizeMappingBuilder.addSize.should.have.been.called.with(
        instance.props.sizeMapping[0][0],
        instance.props.sizeMapping[0][1]
      );
      sizeMappingBuilder.addSize.should.have.been.called.with(
        instance.props.sizeMapping[1][0],
        instance.props.sizeMapping[1][1]
      );
      sizeMappingBuilder.build.should.have.been.called();
      adSlot.defineSizeMapping.should.have.been.called.with(fakeMapping);
      adSlot.setTargeting.should.have.been.called.with(
        'foo', 'bar'
      );
      adSlot.setTargeting.should.have.been.called.with(
        'baz', 'qux'
      );
      fakePubAds.enableSingleRequest.should.have.been.called();
      fakePubAds.collapseEmptyDivs.should.have.been.called();
    });
    describe('slotRenderEnded listener', () => {
      beforeEach(() => {
        instance.generateAd();
        chai.spy.on(instance, 'unlistenSlotRenderEnded');
        chai.spy.on(instance, 'cleanupEventListeners');
      });
      it('is attached', () => {
        fakePubAds.addEventListener.should.have.been.called.with('slotRenderEnded');
        fakePubAds._listeners.should.have.length(1)
      });
      it('calls setState({ adFailed: true }) and cleanupEventListeners if it receives an event from DFP telling it that there is no ad for the zone', () => {
        fakePubAds._listeners[0][1]({ slot: instance.adSlot, isEmpty: true });
        instance.setState.should.have.been.called.with({ adFailed: true });
        instance.cleanupEventListeners.should.have.been.called();
      });
      it('only calls unlistenSlotRenderEnded if DFP tells it the ad is okay', () => {
        fakePubAds._listeners[0][1]({ slot: instance.adSlot, isEmpty: false });
        instance.setState.should.not.have.been.called.with({ adFailed: true });
        instance.cleanupEventListeners.should.not.have.been.called();
        instance.unlistenSlotRenderEnded.should.have.been.called();
      });
      it('does nothing if the slot is wrong', () => {
        fakePubAds._listeners[0][1]({ slot: { wrong: 'slot' }, isEmpty: false });
        instance.setState.should.not.have.been.called.with({ adFailed: true });
        instance.cleanupEventListeners.should.not.have.been.called();
        instance.unlistenSlotRenderEnded.should.not.have.been.called();
      });
      describe('unlistenSlotRenderEnded', () => {
        beforeEach(() => {
          instance.unlistenSlotRenderEnded();
        });
        it('disables the slotRenderEnded listener', ()=> {
          fakePubAds._listeners[0][1]({ slot: instance.adSlot, isEmpty: false });
          instance.setState.should.not.have.been.called.with({ adFailed: true });
          instance.cleanupEventListeners.should.not.have.been.called();
        });
      });
    });
  });

  describe('cleanupEventListeners', () => {
    it('removes loadElementWhenInView() from the scroll event', () => {
      chai.spy.on(window, 'removeEventListener');

      instance.cleanupEventListeners();

      window.removeEventListener
        .should.have.been.called.with('scroll', instance.loadElementWhenInView);
    });

    it('removes loadElementWhenInView() from resize event listener', () => {
      chai.spy.on(window, 'removeEventListener');

      instance.cleanupEventListeners();

      window.removeEventListener
        .should.have.been.called.exactly(2);
      window.removeEventListener
        .should.have.been.called.with('resize', instance.loadElementWhenInView);
    });

  });

  describe('componentWillUnmount', () => {

    it('calls cleanupEventListeners', () => {
      chai.spy.on(instance, 'cleanupEventListeners');

      instance.componentWillUnmount();

      instance.cleanupEventListeners
        .should.have.been.called();
    });

  });

  describe('loadElementWhenInView', () => {
    beforeEach(() => {
      instance.isElementInViewport = chai.spy('isElementInViewport');
      instance.generateAd = chai.spy('generateAd');
      instance.cleanupEventListeners = chai.spy('cleanupEventListeners');
      instance.getContainerDOMElement = chai.spy(() => ({ className: '' }));
    });
    it('calls isElementInViewport', () => {
      instance.refs.container = { fake: 'element' };
      instance.loadElementWhenInView();
      instance.isElementInViewport.should.have.been.called.with(instance.refs.container);
    });
    describe('When the component is not near the view at all', () => {
      beforeEach(() => {
        instance.isElementInViewport = () => false;
      });
      it('calls nothing', () => {
        instance.loadElementWhenInView();
        instance.generateAd.should.not.have.been.called();
        instance.cleanupEventListeners.should.not.have.been.called();
        instance.getContainerDOMElement.should.not.have.been.called();
      });
    });
    describe('When the component is near the view, but not inside', () => {
      beforeEach(() => {
        instance.isElementInViewport = function () {
          if (arguments.length === 2) {
            // Called with margin
            return true;
          }
          if (arguments.length === 1) {
            return false;
          }
          false.should.equal(true);
        };
      });
      it('Doesn\'t call cleanupEventListeners, because we still need to listen to the scroll event', () => {
        instance.loadElementWhenInView();
        instance.cleanupEventListeners.should.not.have.been.called();
      });
      it('Calls generateAd()', () => {
        instance.loadElementWhenInView();
        instance.generateAd.should.have.been.called();
      });
      it('If the ad was already generated, calls nothing', () => {
        instance.state.adGenerated = true;
        instance.loadElementWhenInView();
        instance.generateAd.should.not.have.been.called();
      });
    });
    describe('When the component is inside the viewport', () => {
      let fakeElement = null;
      beforeEach(() => {
        instance.isElementInViewport = () => true;
        instance.getContainerDOMElement = chai.spy(() => fakeElement);
        fakeElement = { className: '' };
      });
      it('Calls generateAd() and cleanupEventListeners()', () => {
        instance.loadElementWhenInView();
        instance.generateAd.should.have.been.called();
        instance.cleanupEventListeners.should.have.been.called();
      });
      it('Adds the ad-panel--visible class to the container element', () => {
        instance.loadElementWhenInView();
        instance.getContainerDOMElement.should.have.been.called();
        fakeElement.className.should.equal(' ad-panel--visible');
      });
    });
  });

});
