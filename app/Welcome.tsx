import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Hypertrophy Planner</Text>
      <Text style={styles.subtitle}>Get your personalized muscle growth plan!</Text>
      <Button title="Start" onPress={() => router.push('/Questions')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
}); 