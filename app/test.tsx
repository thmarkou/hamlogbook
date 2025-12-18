import { View, Text } from 'react-native';

export default function Test() {
  return (
    <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 40 }}>TEST SCREEN</Text>
      <Text style={{ color: 'white', fontSize: 20 }}>If you see this, routing works!</Text>
    </View>
  );
}

