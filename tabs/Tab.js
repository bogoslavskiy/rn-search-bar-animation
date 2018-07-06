//  Created by Artem Bogoslavskiy on 7/5/18.

import React from 'react';
import { View, StyleSheet } from 'react-native'; 
import { FlatList } from '../searchBarAnimation';

export default class Tab extends React.PureComponent {
   constructor(props) {
    super(props);

    this.state = {
      dataSource: Array(20).fill().map((_, index) => ({id: index}))
    };
  }

  render() {
    return (
      <FlatList
        style={styles.wrapper}
        data={this.state.dataSource}
        renderItem={this._renderRow}
        keyExtractor={(item) => item.id.toString()}
        tabRoute={this.props.route.key}
        renderItem={({item}) => (
          <View style={styles.item} />
        )}
      />
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15
  },
  item: {
    height: 150,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: 'rgb(75, 89, 101)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1
  }
})