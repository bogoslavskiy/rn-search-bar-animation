//  Created by Artem Bogoslavskiy on 7/5/18.

import React, { Component } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ifIphoneX, ifAndroid } from '../utils';
import {
  View,
  StyleSheet,
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';

export default class SearchBar extends Component {
  blurInputs() {
    this.inputSearch.blur();
    this.inputLocation.blur();
    this.props.changeInputFocus(false);
  }

  render() {
    const { animation, changeInputFocus, renderTabBar } = this.props;

    const transformWrapper = animation.getTransformWrapper();
    const transformSearchBar = animation.getTransformSearchBar();
    const opacitySearchBar = animation.getOpacitySearchBar();
    const opacityLocationInput = animation.getOpacityLocationInput();
    const arrowMinimizeStyle = animation.getArrowMinimizeStyle();
   
    return (
      <Animated.View style={[styles.wrapper, transformWrapper]}>
        <Animated.View style={opacitySearchBar}>
          <View style={styles.searchContainer}>
            <Animated.View style={[
              styles.arrowMinimizeContainer, 
              arrowMinimizeStyle
            ]}>
              <TouchableOpacity onPress={() => {
                animation.minimizeBar();
                this.blurInputs();
              }}>
                <MaterialIcons
                  name='keyboard-arrow-up' 
                  size={36} 
                  style={styles.arrowMinimizeIcon} 
                  color='#fff'
                />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[transformSearchBar]}>
              <View style={styles.searchInput}>
                <MaterialIcons
                  name='search' 
                  size={22} 
                  style={styles.searchIcon} 
                  color='#bbb'
                />
                <TextInput 
                  style={styles.inputText}
                  placeholder={'I\'m looking for...'}
                  placeholderTextColor={'#999'}
                  underlineColorAndroid={'#fff'}
                  autoCorrect={false}
                  onFocus={() => {
                    animation.expandBar();
                    this.props.changeInputFocus('search');
                  }}
                  ref={(inputSearch) => {
                    this.inputSearch = inputSearch;
                  }}
                />
              </View>
              <Animated.View style={[
                styles.searchInput, 
                styles.locationInput, 
                opacityLocationInput
              ]}>
                <MaterialIcons
                  name='place' 
                  size={22} 
                  style={styles.searchIcon} 
                  color='#bbb'
                />
                <TextInput 
                  style={styles.inputText}
                  placeholder={'Anywhere'}
                  placeholderTextColor={'#999'}
                  underlineColorAndroid={'#fff'}
                  autoCorrect={false}
                  onFocus={() => {
                    this.props.changeInputFocus('location');
                  }}
                  ref={(inputLocation) => {
                    this.inputLocation = inputLocation;
                  }}
                />
              </Animated.View>
            </Animated.View>
          </View>
        </Animated.View>
        {renderTabBar()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    zIndex: 99,
    backgroundColor: '#597fab',
    width: '100%',
    overflow: 'hidden',
    paddingBottom: 10,
    ...ifIphoneX({
      paddingTop: 40
    }, {
      paddingTop: 28
    }),
  },
  arrowMinimizeContainer: {
    position: 'relative',
    top: -3
  },
  arrowMinimizeIcon: {
    marginLeft: 12,
  },
  searchInput: {
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: 3,
    height: 45,
    marginTop: 3,
    marginLeft: 10,
    marginRight: 10,
  },
  locationInput: {
    marginTop: 10,
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: 12,
  },
  inputText: {
    display: 'flex',
    ...ifAndroid({
      marginTop: 9
    }, {
      marginTop: 13
    }),
    marginLeft: 43,
    fontSize: 15,
    color: '#999',
  },
});