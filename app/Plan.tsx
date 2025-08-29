import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ACCENT = '#7c3aed';
const ACCENT_LIGHT = '#a855f7';
const CARD_BG = '#ffffff';
const TEXT_PRIMARY = '#1f2937';
const TEXT_SECONDARY = '#6b7280';
const BG_GRADIENT = ['#faf5ff', '#f3e8ff', '#fefefe'] as const;


export default function Plan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planData = params.planData ? JSON.parse(params.planData as string) : null;


  if (!planData) {
    return (
      <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Error loading plan</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Parse the plan content into structured sections
  const parsePlanContent = (content: string) => {
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'General';
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Check for section headers
      if (trimmedLine.includes('**') && trimmedLine.includes(':')) {
        const sectionName = trimmedLine.replace(/\*\*/g, '').replace(':', '').trim();
        currentSection = sectionName;
        sections[currentSection] = [];
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        // Bullet points
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(trimmedLine.substring(1).trim());
      } else if (trimmedLine.includes(':')) {
        // Key-value pairs
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(trimmedLine);
      } else if (trimmedLine.length > 0) {
        // Regular text
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(trimmedLine);
      }
    }
    
    return sections;
  };

  const planSections = parsePlanContent(planData.plan.join('\n'));



  const renderSection = (sectionName: string, items: string[]) => {
    if (items.length === 0) return null;

    return (
      <View key={sectionName} style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{sectionName}</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            {item.startsWith('-') || item.startsWith('•') ? (
              <Text style={styles.bulletPoint}>•</Text>
            ) : null}
            <Text style={styles.itemText}>
              {item.startsWith('-') || item.startsWith('•') ? item.substring(1).trim() : item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Your Personalized Plan</Text>
          <Text style={styles.subtitle}>Tailored to your goals and preferences</Text>
        </View>

        {Object.entries(planSections).map(([sectionName, items]) => 
          renderSection(sectionName, items)
        )}

        <View style={styles.actionCard}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.push('/Welcome')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 40,
  },
  headerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
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
    lineHeight: 24,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.05)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  itemText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    lineHeight: 24,
    flex: 1,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 28,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 