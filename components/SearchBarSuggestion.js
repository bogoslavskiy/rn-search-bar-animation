import React from 'react';
import { FlatList } from 'react-native';
import { ListItem } from 'react-native-elements';

export default class SeachBarSuggestion extends React.Component {
  state = {
    suggestion: [
      {id: 1, title: 'suggestion'},
      {id: 2, title: 'suggestion'},
      {id: 3, title: 'suggestion'}
    ]
  }

  render() {
    return (
      <FlatList
        data={this.state.suggestion}
        renderItem={({item}) => (
          <ListItem 
            key={item.id}
            title={item.title}
            hideChevron
            containerStyle={{ 
              borderBottomColor: '#eee' 
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    );
  }
} 