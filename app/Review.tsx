import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import serverConfig from '../utils/serverConfig';

const { width } = Dimensions.get('window');

const ACCENT = '#7c3aed';
const ACCENT_LIGHT = '#a855f7';
const CARD_BG = '#ffffff';
const TEXT_PRIMARY = '#1f2937';
const TEXT_SECONDARY = '#6b7280';
const BG_GRADIENT = ['#faf5ff', '#f3e8ff', '#fefefe'] as const;

const questionLabels: { [key: string]: string } = {
  age: 'Age',
  biologicalSex: 'Sex',
  height: 'Height',
  weight: 'Weight',
  experienceLevel: 'Training Experience',
  weightGoal: 'Weight Goal',
  daysPerWeek: 'Training Days per Week',
  timePerWorkout: 'Time per Workout',
  equipment: 'Available Equipment',
  injuries: 'Injuries or Limitations',
  trainingSplit: 'Preferred Training Split',
  currentRoutine: 'Current Workout Routine',
  supplements: 'Current Supplements',
  recoveryAbility: 'Recovery Ability'
};

export default function Review() {
  const router = useRouter();
  const { answers } = useLocalSearchParams();
  const userAnswers = answers ? JSON.parse(answers as string) : {};
  const [isDetectingServer, setIsDetectingServer] = useState(true);
  const [serverStatus, setServerStatus] = useState('Detecting server...');

  // Auto-detect server IP when component mounts
  useEffect(() => {
    detectServer();
  }, []);

  const detectServer = async () => {
    try {
      setIsDetectingServer(true);
      setServerStatus('Detecting server...');
      
      await serverConfig.detectServerIP();
      setServerStatus(`✅ Connected to: ${serverConfig.getServerURL()}`);
    } catch (error) {
      console.error('Server detection failed:', error);
      setServerStatus('❌ Server detection failed');
    } finally {
      setIsDetectingServer(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setServerStatus('Generating plan...');
      
      const response = await fetch(serverConfig.getPlanEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userAnswers),
      });
      
      const data = await response.json();
      router.push({ pathname: '/Plan', params: { planData: JSON.stringify(data) } });
    } catch (error) {
      console.error('Error:', error);
      setServerStatus('❌ Network error - check server connection');
      router.push({ pathname: '/Plan', params: { planData: JSON.stringify({ profile: userAnswers, plan: ['Mock plan due to error'] }) } });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatAnswer = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Review Your Answers</Text>
          <Text style={styles.subtitle}>Please review your information before generating your personalized plan</Text>
          
          {/* Server Status */}
          <View style={styles.serverStatusContainer}>
            <Text style={styles.serverStatusText}>{serverStatus}</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={detectServer}
              disabled={isDetectingServer}
            >
              <Text style={styles.refreshButtonText}>
                {isDetectingServer ? 'Detecting...' : '🔄 Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.answersContainer}>
            {Object.entries(userAnswers).map(([key, value]) => (
              <View key={key} style={styles.answerRow}>
                <Text style={styles.questionLabel}>{questionLabels[key] || key}</Text>
                <Text style={styles.answerValue}>{formatAnswer(key, value)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
                          <TouchableOpacity
                style={styles.nextButton}
                onPress={handleGeneratePlan}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 600,
  },
  card: {
    width: width > 500 ? 440 : '100%',
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  answersContainer: {
    width: '100%',
    marginBottom: 32,
  },
  answerRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerValue: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: TEXT_SECONDARY,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: TEXT_SECONDARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    flex: 1,
    marginRight: 12,
    minWidth: 100,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    flex: 1,
    marginLeft: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    flex: 0,
    marginLeft: 12,
    minWidth: 120,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  serverStatusText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    flex: 1,
    marginRight: 12,
  },
  refreshButton: {
    backgroundColor: ACCENT_LIGHT,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 