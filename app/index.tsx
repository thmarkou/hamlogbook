import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold' }}>HamLogbook</Text>
      <Text style={{ color: '#AAA', fontSize: 16, marginTop: 10 }}>Smart Amateur Radio Logbook</Text>
    </View>
  );
}
