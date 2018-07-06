//  Created by Artem Bogoslavskiy on 7/5/18.

import { Animated, StatusBar } from 'react-native'; 
import { ifIphoneX, isAndroid } from '../utils';

export default class SearchBarAnimation {
  /**
   * SearchBar Sizes
   *
   * SearchBar height consists of nested components
   * See styles /components/SearchBar.js
   * 
   * arrowHeight = 36
   * inputHeight = 45
   * tabBarHeight = 45
   * inputPaddingBottom = 3
   * containerPaddingTop = 28
   * containerPaddingBottom = 10
   * locationInputPaddingTop = 10
   * 
   * Calculate
   *  
   * containerPaddingTop + inputHeight + inputHeight +
   * containerPaddingBottom + arrowHeight + 
   * inputPaddingBottom + locationInputPaddingTop = 177 (Wrapper Height)
   *
   * 177 + tabBarHeight = 222 (Full height)
   * 
   */

  statusBarHeight = 21;
  wrapperHeight = 177;
  paddingStatusBar = 41;
  arrowHeight = 36 - ifIphoneX(2, 0);
  topPartHeight = this.arrowHeight + 45 + 10; // arrowHeight + inputHeight + padding (Top part)
  fullHeight = this.topPartHeight + 131; // = 222
  distanceRange = this.fullHeight - this.topPartHeight;
  maxClamp = this.fullHeight - (this.paddingStatusBar + this.statusBarHeight);
  minClamp = this.topPartHeight;
  diffClamp = this.maxClamp - this.minClamp;

  initialScroll = this.topPartHeight;
  maxActionAnimated = 88; // Location input height + padding (Bottom part)
  actionAnimated = new Animated.Value(0);
  scrollY = new Animated.Value(this.initialScroll);
  _clampedScrollValue = 0;
  _scrollValue = 0;
  initialState = null;
  _statusBarStyle = null;

  stateBarTypes = { CLAMPED: 1, NORMAL: 2, EXPANDED: 3 };
  stateBar = this.stateBarTypes.NORMAL;

  constructor(initialState) {
    this.initialState = initialState;

    this._createClampedScroll();
    this.scrollY.addListener(this._updateScroll);
  }

  destroy() {
    this.scrollY.removeAllListeners();
  }

  _updateScroll = ({value, manually}) => {
    if(value && manually) {
     this._clampedScrollValue = value;
    } else {
      const diff = value - this._scrollValue;
      this._scrollValue = Math.max(value, this.topPartHeight); // Fix normal state
      this._clampedScrollValue = Math.min(
        Math.max(this._clampedScrollValue + diff, this.minClamp), 
        this.maxClamp
      );
    }

    this._changeStatusBarStyle();
    this._changeStateBar();
  };

  _createClampedScroll() {
    this.clampedScroll = Animated.diffClamp(
      this.scrollY.interpolate({ // Only positive
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: 'clamp',
      }).interpolate({ // Fix normal state
        inputRange: [0, this.topPartHeight],
        outputRange: [this.topPartHeight, this.topPartHeight],
        extrapolate: 'identity',
      }), 
      this.minClamp,
      this.maxClamp,
    );
  }

  _setStateBar(state) {
    let toValue = state == 'full' ? this.maxActionAnimated : 0;
    Animated.timing(this.actionAnimated, {
      toValue: toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();

    this.stateBar = state;
  }

  _changeStateBar() {
    let newState, types = this.stateBarTypes;
    let clampedValue = Math.round(this._clampedScrollValue);
    if(Math.round(this.scrollY._value) < this.topPartHeight) {
      newState = types.EXPANDED;
    } else if(clampedValue == this.minClamp) {
      newState = types.NORMAL;
    } else if(clampedValue == this.maxClamp) {
      newState = types.CLAMPED;
    }

    if(newState != undefined && newState != this.stateBar) {
      this.stateBar = newState;
    }
  }

  _changeStatusBarStyle() {
    let statusBarStyle = Math.round(this._clampedScrollValue) != this.maxClamp ? 
                        'light-content' : 
                        'dark-content';
    
    if(statusBarStyle != this._statusBarStyle) {
      StatusBar.setBarStyle(statusBarStyle);
      this._statusBarStyle = statusBarStyle;
    }
  }

  _handleIntermediateState = (scrollToOffset) => {
    let scrollY = this.scrollY._value;
    if(scrollY < this.topPartHeight) { // Full
      scrollToOffset(scrollY > (this.topPartHeight / 2) ? this.topPartHeight : 0);
    } else { // Clamped
      if(
        this._clampedScrollValue < this.maxClamp && 
        this._clampedScrollValue > this.minClamp
      ) {
        let scrollTo;
        if(this._clampedScrollValue > (this.maxClamp + this.minClamp) / 2) {
          scrollTo = scrollY + this._interpolate(
            this._clampedScrollValue, 
            [this.maxClamp, this.minClamp], 
            [0, this.diffClamp]
          );
        } else {
          scrollTo = scrollY - this._interpolate(
            this._clampedScrollValue, 
            [this.minClamp, this.maxClamp], 
            [0, this.diffClamp]
          );
        }

        scrollToOffset(scrollTo);
      }
    }
  }

  _interpolate = (x, inputRange, outputRange) => {
    let minX = inputRange[0];
    let maxX = inputRange[1];
    let minY = outputRange[0];
    let maxY = outputRange[1];

    return (x - minX) * ((maxY - minY) / (maxX - minX) + minY);
  }

  minimizeBar = () => {
    if(Math.round(this.scrollY._value) == 0) { // Full
      this.scrollToOffset(this.topPartHeight);
    } else { // Clamped
      this._setStateBar('normal');
    }
  };

  expandBar = () => {
    if(this.stateBarTypes.EXPANDED == this.stateBar) {
      return;
    }

    if(Math.round(this.scrollY._value) == this.topPartHeight) { // Full
      this.scrollToOffset(0);
    } else { // Clamped
      this._setStateBar('full');
    }
  };

  onTabPress = (route) => {
    let type = this.stateBarTypes;
    let offset = (this.stateBar == type.NORMAL) ? this.topPartHeight : 
                 (this.stateBar == type.CLAMPED) ? this.maxClamp : 0;

    this.initialState.scrollToOffset({
      offset: offset,
      animated: false,
      tab: route.key
    });

    this.scrollY.setValue(offset);
    this._createClampedScroll();
    this._updateScroll({value: offset, manually: true});
  }

  scrollToOffset(offset, animated) {
    if(offset != this.scrollY._value) {
      this.initialState.scrollToOffset({offset, animated});
    }
  }

  animationProps = {
    initialScroll: this.initialScroll,
    scrollY: this.scrollY,
    fullHeight: this.fullHeight,
    handleIntermediateState: this._handleIntermediateState
  };

  getTransformWrapper() {
    let byScroll = Animated.add(
      Animated.multiply(this.clampedScroll, -1),
      this.scrollY.interpolate({ // To negative
        inputRange: [0, 1],
        outputRange: [0, -1],
      }).interpolate({ // Add bottom height part 
        inputRange: [-this.topPartHeight, 0],
        outputRange: [0, this.minClamp],
        extrapolate: 'clamp',
      })
    );

    return {
      transform: [{
        translateY: Animated.add(byScroll, this.actionAnimated)
      }]
    };
  }

  getTransformSearchBar() {
    return {
      transform: [{
        translateY: Animated.add(
          this.actionAnimated.interpolate({
            inputRange: [0, this.maxActionAnimated],
            outputRange: [0, -this.topPartHeight + this.arrowHeight],
            extrapolate: 'clamp',
          }), 
          this.scrollY.interpolate({
          inputRange: [0, this.topPartHeight],
          outputRange: [0, this.topPartHeight - this.arrowHeight],
          extrapolate: 'clamp',
        }))
      }]
    };
  }

  getOpacitySearchBar() {
    return {
      opacity: this.clampedScroll.interpolate({
        inputRange: [this.topPartHeight, this.maxClamp],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    };
  }

  getOpacityLocationInput() {
    return {
      opacity: Animated.add(
        this.actionAnimated.interpolate({
          inputRange: [0, this.maxActionAnimated],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }), 
        this.scrollY.interpolate({
          inputRange: [0, this.topPartHeight],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        })
      )
    };
  }

  getArrowMinimizeStyle() {
    return {
      transform: [{
        translateY: Animated.add(
          this.actionAnimated.interpolate({
            inputRange: [0, this.maxActionAnimated],
            outputRange: [0, -this.topPartHeight],
            extrapolate: 'clamp',
          }),
          this.scrollY.interpolate({
            inputRange: [0, this.topPartHeight],
            outputRange: [0, this.topPartHeight],
            extrapolate: 'clamp',
          })
        )
      }],
      opacity: Animated.add(
        this.actionAnimated.interpolate({
          inputRange: [0, this.maxActionAnimated],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }),
        this.scrollY.interpolate({
          inputRange: [0, this.topPartHeight],
          outputRange: [1, 0],
          extrapolate: 'clamp',
        })
      )
    };
  }

  getStyleSuggestion() {
    let scroll = this.scrollY.interpolate({ // To negative
      inputRange: [0, 1],
      outputRange: [0, -1],
    });

    return {
      opacity: Animated.add(
        this.actionAnimated.interpolate({
          inputRange: [0, this.maxActionAnimated],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }),
        scroll.interpolate({
          inputRange: [-this.topPartHeight, 0],
          outputRange: [0, 1],
          extrapolate: 'clamp'
        })
      ),
      transform: [{
        translateY: Animated.add(
          this.actionAnimated.interpolate({
            inputRange: [0, this.maxActionAnimated],
            outputRange: [0, this.topPartHeight + ifIphoneX(10, 0)],
            extrapolate: 'clamp',
          }),
          scroll.interpolate({
            inputRange: [-this.topPartHeight, 0],
            outputRange: [this.topPartHeight, this.wrapperHeight + ifIphoneX(11, 0)],
            extrapolate: 'clamp'
          })
        )
      }]
    };
  }
}