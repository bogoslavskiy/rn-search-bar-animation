//  Created by Artem Bogoslavskiy on 7/5/18.

import { Dimensions, Platform } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export function isIphoneX() {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 812 || width === 812)
  );
}

export function ifIphoneX(iphoneXStyle, regularStyle) {
  if (isIphoneX()) {
    return iphoneXStyle;
  }
  return regularStyle;
}

export function isAndroid() {
  return (Platform.OS === 'android');
}

export function ifAndroid(androidStyle, regularStyle) {
  if (isAndroid()) {
    return androidStyle;
  }
  return regularStyle;
}

const isFunction = input => typeof input === 'function';
export function renderIf(predicate) {
  return function(elemOrThunk) {
    return predicate ? (isFunction(elemOrThunk) ? elemOrThunk() : elemOrThunk) : null;
  }
} 