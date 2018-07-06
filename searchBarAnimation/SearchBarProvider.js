//  Created by Artem Bogoslavskiy on 7/5/18.

import React from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import SearchBarAnimation from './SearchBarAnimation';
import { SearchBarContext } from './SearchBarContext';

export default class SearchBarProvider extends React.Component {
  constructor(props) {
    super(props);

    this.searchBarAnimation = new SearchBarAnimation({
      scrollToOffset: (configScroll) => {
        let tab = configScroll.tab ? configScroll.tab : this.props.currentTab;

        let scrollToOffset = this._handlersScroll[tab];
        scrollToOffset && scrollToOffset(configScroll.offset, configScroll.animated);
      }
    });

    this.state = {
      currentTab: null,
      canJumpToTab: true,
      contextProvider: {
        animation: this.searchBarAnimation.animationProps, 
        addHandlerScroll: this._addHandlerScroll,
        _canJumpToTab: this._canJumpToTab
      }
    };
  }

  componentWillUnmount() {
    this.searchBarAnimation.destroy();
  }

  _handlersScroll = {};
  _addHandlerScroll = (tab, handler) => {
    this._handlersScroll[tab] = handler;
  };

  _canJumpToTab = (canJumpToTab) => this.setState({canJumpToTab});

  render() {
    return (
      <SearchBarContext.Provider value={this.state.contextProvider}>
        {this.props.children(this.searchBarAnimation, {
          canJumpToTab: this.state.canJumpToTab
        })}
      </SearchBarContext.Provider>
    );
  }
}