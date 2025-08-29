import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
// import CheckBox from '@react-native-community/checkbox'; // Remove this import

const { width } = Dimensions.get('window');

const ACCENT = '#7c3aed';
const ACCENT_LIGHT = '#a855f7';
const ACCENT_DARK = '#5b21b6';
const BG_GRADIENT = ['#faf5ff', '#f3e8ff', '#fefefe'] as const;
const CARD_BG = '#ffffff';
const TEXT_PRIMARY = '#1f2937';
const TEXT_SECONDARY = '#6b7280';
const BORDER_COLOR = '#e5e7eb';
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';

const equipmentOptions = [
  'Treadmill', 'Elliptical', 'Stationary Bike', 'Rowing Machine', 'Leg Press', 'Chest Press',
  'Lat Pulldown', 'Cable Machine', 'Smith Machine', 'Squat Rack', 'Bench', 'Dumbbells',
  'Barbells', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Dip Station', 'Medicine Ball',
  'Leg Extension Machine', 'Leg Curl Machine', 'Shoulder Press Machine', 
  'Chest Fly Machine', 'Seated Row Machine', 'Bicep Curl Machine', 'Tricep Extension Machine',
  'Abdominal Machine', 'Hip Adductor/Abductor Machine', 'Calf Raise Machine', 'Glute Machine',
  'Incline/Decline Bench', 'Power Rack', 'Weight Plates', 'EZ Bar', 'Trap Bar', 'Safety Squat Bar',
  'Swiss Ball', 'Bosu Ball', 'Foam Roller', 'Lacrosse Ball', 'Massage Gun', 'Other'
];

const questions = [
  { key: 'age', question: 'What is your age?', type: 'age' },
  { key: 'biologicalSex', question: 'What is your sex?', type: 'text' },
  { key: 'height', question: 'What is your current height?', type: 'height' },
  { key: 'weight', question: 'What is your current weight?', type: 'weight' },
  { key: 'experienceLevel', question: 'What is your training experience level?', type: 'choice', options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'] },
  { key: 'weightGoal', question: 'What is your weight goal?', type: 'choice', options: ['Weight maintenance (maintenance)', 'Weight gain (bulking)', 'Weight loss (cutting)'] },
  { key: 'daysPerWeek', question: 'How many days per week can you commit to training?', type: 'choice', options: ['1-2 days', '3-4 days', '5-6 days', '7 days'] },
  { key: 'timePerWorkout', question: 'How much time per workout session do you have available?', type: 'choice', options: ['30 minutes or less', '30-60 minutes', '60-90 minutes', '90+ minutes'] },
  { key: 'equipment', question: 'What type of equipment do you have access to? (Select all that apply)', type: 'multi', options: equipmentOptions },
  { key: 'injuries', question: 'Do you have any injuries or physical limitations?', type: 'injury' },
  { key: 'trainingSplit', question: 'What is your preferred training split?', type: 'choice', options: ['Full body', 'Push/pull/legs', 'Upper/lower', 'No preference'] },
  { key: 'currentRoutine', question: 'Do you have a current workout routine?', type: 'routine' },
  { key: 'supplements', question: 'Are you currently taking any supplements? (Select all that apply)', type: 'supplements' },
  { key: 'recoveryAbility', question: 'What is your recovery ability?', type: 'choice', options: ['Fast', 'Moderate', 'Slow', 'I don\'t know'] },
];

const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18); // 18-100
const heightFtOptions = Array.from({ length: 4 }, (_, i) => i + 4); // 4-7 ft
const heightInOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 in
const heightCmOptions = Array.from({ length: 101 }, (_, i) => i + 120); // 120-220 cm
const weightLbsOptions = Array.from({ length: 281 }, (_, i) => i + 70); // 70-350 lbs
const weightKgOptions = Array.from({ length: 181 }, (_, i) => i + 32); // 32-212 kg

export default function Questions() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [input, setInput] = useState('');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [injuryYes, setInjuryYes] = useState<boolean | null>(null);
  const [injuryText, setInjuryText] = useState('');
  const [routineYes, setRoutineYes] = useState<boolean | null>(null);
  const [routineText, setRoutineText] = useState('');
  const [sexOther, setSexOther] = useState<boolean>(false);
  const [sexOtherText, setSexOtherText] = useState('');
  const [supplementOther, setSupplementOther] = useState<boolean>(false);
  const [supplementOtherText, setSupplementOtherText] = useState('');
  const [equipmentOther, setEquipmentOther] = useState<boolean>(false);
  const [equipmentOtherText, setEquipmentOtherText] = useState('');
  const [heightUnit, setHeightUnit] = useState<'us' | 'metric'>('us');
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(8);
  const [heightCm, setHeightCm] = useState(170);
  const [weightUnit, setWeightUnit] = useState<'us' | 'metric'>('us');
  const [weightLbs, setWeightLbs] = useState(150);
  const [weightKg, setWeightKg] = useState(68);
  const [age, setAge] = useState(25);
  const router = useRouter();

  const currentQuestion = questions[step];
  const progress = (step + 1) / questions.length;

  const handleNext = () => {
    let answer;
    if (currentQuestion.type === 'age') {
      answer = age;
    } else if (currentQuestion.type === 'text') {
      answer = input;
    } else if (currentQuestion.type === 'height') {
      answer = heightUnit === 'us' ? `${heightFt} ft ${heightIn} in` : `${heightCm} cm`;
    } else if (currentQuestion.type === 'weight') {
      answer = weightUnit === 'us' ? `${weightLbs} lbs` : `${weightKg} kg`;
    } else if (currentQuestion.type === 'multi') {
      if (currentQuestion.key === 'equipment') {
        let equipment = [...selectedEquipment];
        if (equipmentOther && equipmentOtherText.trim()) {
          equipment = equipment.filter(e => e !== 'Other');
          equipment.push(equipmentOtherText.trim());
        }
        answer = equipment;
      } else {
        answer = selectedSupplements;
      }
    } else if (currentQuestion.type === 'supplements') {
      let supplements = [...selectedSupplements];
      if (supplementOther && supplementOtherText.trim()) {
        supplements = supplements.filter(s => s !== 'Other');
        supplements.push(supplementOtherText.trim());
      }
      answer = supplements;
    } else if (currentQuestion.type === 'injury') {
      answer = injuryYes ? injuryText : 'No';
    } else if (currentQuestion.type === 'routine') {
      answer = routineYes ? routineText : 'No';
    } else if (currentQuestion.type === 'choice') {
      answer = selectedChoice;
    } else {
      answer = input;
    }
    setAnswers({ ...answers, [currentQuestion.key]: answer });
    if (step < questions.length - 1) {
      setStep(step + 1);
      setInput('');
      setSelectedChoice('');
      setSelectedEquipment([]);
      setSelectedSupplements([]);
      setInjuryYes(null);
      setInjuryText('');
      setRoutineYes(null);
      setRoutineText('');
      setSexOther(false);
      setSexOtherText('');
      setSupplementOther(false);
      setSupplementOtherText('');
      setEquipmentOther(false);
      setEquipmentOtherText('');
    } else {
      // Navigate to review screen instead of generating plan directly
      router.push({ pathname: '/Review', params: { answers: JSON.stringify({ ...answers, [currentQuestion.key]: answer }) } });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // Save current answer before going back
      let currentAnswer;
      if (currentQuestion.type === 'age') {
        currentAnswer = age;
      } else if (currentQuestion.type === 'text') {
        currentAnswer = input;
      } else if (currentQuestion.type === 'height') {
        currentAnswer = heightUnit === 'us' ? `${heightFt} ft ${heightIn} in` : `${heightCm} cm`;
      } else if (currentQuestion.type === 'weight') {
        currentAnswer = weightUnit === 'us' ? `${weightLbs} lbs` : `${weightKg} kg`;
      } else if (currentQuestion.type === 'multi') {
        if (currentQuestion.key === 'equipment') {
          let equipment = [...selectedEquipment];
          if (equipmentOther && equipmentOtherText.trim()) {
            equipment = equipment.filter(e => e !== 'Other');
            equipment.push(equipmentOtherText.trim());
          }
          currentAnswer = equipment;
        } else {
          currentAnswer = selectedSupplements;
        }
      } else if (currentQuestion.type === 'supplements') {
        let supplements = [...selectedSupplements];
        if (supplementOther && supplementOtherText.trim()) {
          supplements = supplements.filter(s => s !== 'Other');
          supplements.push(supplementOtherText.trim());
        }
        currentAnswer = supplements;
      } else if (currentQuestion.type === 'injury') {
        currentAnswer = injuryYes ? injuryText : 'No';
      } else if (currentQuestion.type === 'routine') {
        currentAnswer = routineYes ? routineText : 'No';
      } else if (currentQuestion.type === 'choice') {
        currentAnswer = selectedChoice;
      } else {
        currentAnswer = input;
      }
      setAnswers({ ...answers, [currentQuestion.key]: currentAnswer });
      
      // Go back to previous question
      setStep(step - 1);
      
      // Restore previous question's state
      const prevQuestion = questions[step - 1];
      const prevAnswer = answers[prevQuestion.key];
      
      if (prevQuestion.type === 'age') {
        setAge(prevAnswer || 25);
      } else if (prevQuestion.type === 'text') {
        setInput(prevAnswer || '');
      } else if (prevQuestion.type === 'height') {
        if (typeof prevAnswer === 'string') {
          if (prevAnswer.includes('ft')) {
            const match = prevAnswer.match(/(\d+) ft (\d+) in/);
            if (match) {
              setHeightUnit('us');
              setHeightFt(parseInt(match[1]));
              setHeightIn(parseInt(match[2]));
            }
          } else if (prevAnswer.includes('cm')) {
            const match = prevAnswer.match(/(\d+) cm/);
            if (match) {
              setHeightUnit('metric');
              setHeightCm(parseInt(match[1]));
            }
          }
        }
      } else if (prevQuestion.type === 'weight') {
        if (typeof prevAnswer === 'string') {
          if (prevAnswer.includes('lbs')) {
            const match = prevAnswer.match(/(\d+) lbs/);
            if (match) {
              setWeightUnit('us');
              setWeightLbs(parseInt(match[1]));
            }
          } else if (prevAnswer.includes('kg')) {
            const match = prevAnswer.match(/(\d+) kg/);
            if (match) {
              setWeightUnit('metric');
              setWeightKg(parseInt(match[1]));
            }
          }
        }
      } else if (prevQuestion.type === 'multi') {
        if (prevQuestion.key === 'equipment') {
          if (Array.isArray(prevAnswer)) {
            const otherEquipment = prevAnswer.filter(e => !equipmentOptions.includes(e));
            if (otherEquipment.length > 0) {
              setEquipmentOther(true);
              setEquipmentOtherText(otherEquipment[0]);
              setSelectedEquipment(prevAnswer.filter(e => e !== otherEquipment[0]));
            } else {
              setEquipmentOther(false);
              setEquipmentOtherText('');
              setSelectedEquipment(prevAnswer);
            }
          }
        } else {
          setSelectedSupplements(Array.isArray(prevAnswer) ? prevAnswer : []);
        }
      } else if (prevQuestion.type === 'supplements') {
        if (Array.isArray(prevAnswer)) {
          const otherSupplements = prevAnswer.filter(s => !['None', 'Protein powder', 'Creatine', 'Pre-workout', 'Multivitamin', 'Omega-3', 'Vitamin D', 'BCAAs', 'Other'].includes(s));
          if (otherSupplements.length > 0) {
            setSupplementOther(true);
            setSupplementOtherText(otherSupplements[0]);
            setSelectedSupplements(prevAnswer.filter(s => s !== otherSupplements[0]));
          } else {
            setSupplementOther(false);
            setSupplementOtherText('');
            setSelectedSupplements(prevAnswer);
          }
        }
      } else if (prevQuestion.type === 'injury') {
        if (prevAnswer === 'No') {
          setInjuryYes(false);
          setInjuryText('');
        } else {
          setInjuryYes(true);
          setInjuryText(prevAnswer || '');
        }
      } else if (prevQuestion.type === 'routine') {
        if (prevAnswer === 'No') {
          setRoutineYes(false);
          setRoutineText('');
        } else {
          setRoutineYes(true);
          setRoutineText(prevAnswer || '');
        }
      } else if (prevQuestion.type === 'choice') {
        setSelectedChoice(prevAnswer || '');
      } else {
        setInput(prevAnswer || '');
      }
    }
  };

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
  };

  const handleEquipmentToggle = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSupplementsToggle = (item: string) => {
    setSelectedSupplements(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Renderers for each input type
  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'age':
        return (
          <Picker
            selectedValue={age}
            onValueChange={setAge}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {ageOptions.map(val => (
              <Picker.Item key={val} label={val.toString()} value={val} />
            ))}
          </Picker>
        );
      case 'height':
        return (
          <View style={{ width: '100%' }}>
            <View style={styles.unitToggleRow}>
              <TouchableOpacity
                style={[styles.unitToggle, heightUnit === 'us' && styles.unitToggleActive]}
                onPress={() => setHeightUnit('us')}
              >
                <Text style={heightUnit === 'us' ? styles.unitToggleTextActive : styles.unitToggleText}>US (ft/in)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitToggle, heightUnit === 'metric' && styles.unitToggleActive]}
                onPress={() => setHeightUnit('metric')}
              >
                <Text style={heightUnit === 'metric' ? styles.unitToggleTextActive : styles.unitToggleText}>Metric (cm)</Text>
              </TouchableOpacity>
            </View>
            {heightUnit === 'us' ? (
              <View style={styles.heightRow}>
                <Picker
                  selectedValue={heightFt}
                  onValueChange={setHeightFt}
                  style={[styles.picker, { flex: 1 }]}
                  itemStyle={styles.pickerItem}
                >
                  {heightFtOptions.map(val => (
                    <Picker.Item key={val} label={`${val} ft`} value={val} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={heightIn}
                  onValueChange={setHeightIn}
                  style={[styles.picker, { flex: 1 }]}
                  itemStyle={styles.pickerItem}
                >
                  {heightInOptions.map(val => (
                    <Picker.Item key={val} label={`${val} in`} value={val} />
                  ))}
                </Picker>
              </View>
            ) : (
              <Picker
                selectedValue={heightCm}
                onValueChange={setHeightCm}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {heightCmOptions.map(val => (
                  <Picker.Item key={val} label={`${val} cm`} value={val} />
                ))}
              </Picker>
            )}
          </View>
        );
      case 'weight':
        return (
          <View style={{ width: '100%' }}>
            <View style={styles.unitToggleRow}>
              <TouchableOpacity
                style={[styles.unitToggle, weightUnit === 'us' && styles.unitToggleActive]}
                onPress={() => setWeightUnit('us')}
              >
                <Text style={weightUnit === 'us' ? styles.unitToggleTextActive : styles.unitToggleText}>US (lbs)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitToggle, weightUnit === 'metric' && styles.unitToggleActive]}
                onPress={() => setWeightUnit('metric')}
              >
                <Text style={weightUnit === 'metric' ? styles.unitToggleTextActive : styles.unitToggleText}>Metric (kg)</Text>
              </TouchableOpacity>
            </View>
            {weightUnit === 'us' ? (
              <Picker
                selectedValue={weightLbs}
                onValueChange={setWeightLbs}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {weightLbsOptions.map(val => (
                  <Picker.Item key={val} label={`${val} lbs`} value={val} />
                ))}
              </Picker>
            ) : (
              <Picker
                selectedValue={weightKg}
                onValueChange={setWeightKg}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {weightKgOptions.map(val => (
                  <Picker.Item key={val} label={`${val} kg`} value={val} />
                ))}
              </Picker>
            )}
          </View>
        );
      case 'multi':
        return (
          <ScrollView style={styles.multiContainer} showsVerticalScrollIndicator={true}>
            {currentQuestion.options?.map((item: string) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.multiRow,
                  (currentQuestion.key === 'equipment' ? selectedEquipment : selectedSupplements).includes(item) && styles.multiRowSelected
                ]}
                onPress={() => {
                  if (currentQuestion.key === 'equipment') {
                    if (item === 'Other') {
                      setEquipmentOther(!equipmentOther);
                      if (equipmentOther) {
                        setEquipmentOtherText('');
                      }
                    } else {
                      handleEquipmentToggle(item);
                    }
                  } else {
                    if (item === 'Other') {
                      setSupplementOther(!supplementOther);
                      if (supplementOther) {
                        setSupplementOtherText('');
                      }
                    } else {
                      handleSupplementsToggle(item);
                    }
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  (currentQuestion.key === 'equipment' ? 
                    (selectedEquipment.includes(item) || (item === 'Other' && equipmentOther)) : 
                    (selectedSupplements.includes(item) || (item === 'Other' && supplementOther))) && styles.checkboxSelected
                ]}>
                  {(currentQuestion.key === 'equipment' ? 
                    (selectedEquipment.includes(item) || (item === 'Other' && equipmentOther)) : 
                    (selectedSupplements.includes(item) || (item === 'Other' && supplementOther))) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.multiLabel,
                  (currentQuestion.key === 'equipment' ? 
                    (selectedEquipment.includes(item) || (item === 'Other' && equipmentOther)) : 
                    (selectedSupplements.includes(item) || (item === 'Other' && supplementOther))) && styles.multiLabelSelected
                ]}>{item}</Text>
              </TouchableOpacity>
            ))}
            {(currentQuestion.key === 'equipment' && equipmentOther) && (
              <TextInput
                style={styles.input}
                value={equipmentOtherText}
                onChangeText={setEquipmentOtherText}
                placeholder="Please specify other equipment"
                placeholderTextColor="#a0aec0"
              />
            )}
          </ScrollView>
        );
      case 'supplements':
        return (
          <View style={{ width: '100%' }}>
            <ScrollView style={styles.multiContainer} showsVerticalScrollIndicator={true}>
              {['None', 'Protein powder', 'Creatine', 'Pre-workout', 'Multivitamin', 'Omega-3', 'Vitamin D', 'BCAAs', 'Other'].map((item: string) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.multiRow,
                    selectedSupplements.includes(item) && styles.multiRowSelected
                  ]}
                  onPress={() => {
                    if (item === 'Other') {
                      setSupplementOther(!supplementOther);
                      if (supplementOther) {
                        setSupplementOtherText('');
                      }
                    } else {
                      handleSupplementsToggle(item);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    (selectedSupplements.includes(item) || (item === 'Other' && supplementOther)) && styles.checkboxSelected
                  ]}>
                    {(selectedSupplements.includes(item) || (item === 'Other' && supplementOther)) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.multiLabel,
                    (selectedSupplements.includes(item) || (item === 'Other' && supplementOther)) && styles.multiLabelSelected
                  ]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {supplementOther && (
              <TextInput
                style={styles.input}
                value={supplementOtherText}
                onChangeText={setSupplementOtherText}
                placeholder="Please specify other supplements"
                placeholderTextColor="#a0aec0"
              />
            )}
          </View>
        );
      case 'injury':
        return (
          <View style={{ width: '100%' }}>
            <View style={styles.injuryRow}>
              <TouchableOpacity
                style={[styles.injuryBtn, injuryYes === true && styles.injuryBtnActive]}
                onPress={() => setInjuryYes(true)}
              >
                <Text style={injuryYes === true ? styles.injuryBtnTextActive : styles.injuryBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.injuryBtn, injuryYes === false && styles.injuryBtnActive]}
                onPress={() => setInjuryYes(false)}
              >
                <Text style={injuryYes === false ? styles.injuryBtnTextActive : styles.injuryBtnText}>No</Text>
              </TouchableOpacity>
            </View>
            {injuryYes && (
              <TextInput
                style={styles.input}
                value={injuryText}
                onChangeText={setInjuryText}
                placeholder="Please describe your injuries or limitations"
                multiline
                placeholderTextColor="#a0aec0"
              />
            )}
          </View>
        );
      case 'routine':
        return (
          <View style={{ width: '100%' }}>
            <View style={styles.injuryRow}>
              <TouchableOpacity
                style={[styles.injuryBtn, routineYes === true && styles.injuryBtnActive]}
                onPress={() => setRoutineYes(true)}
              >
                <Text style={routineYes === true ? styles.injuryBtnTextActive : styles.injuryBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.injuryBtn, routineYes === false && styles.injuryBtnActive]}
                onPress={() => setRoutineYes(false)}
              >
                <Text style={routineYes === false ? styles.injuryBtnTextActive : styles.injuryBtnText}>No</Text>
              </TouchableOpacity>
            </View>
            {routineYes && (
              <TextInput
                style={styles.input}
                value={routineText}
                onChangeText={setRoutineText}
                placeholder="Please describe your current workout routine"
                multiline
                placeholderTextColor="#a0aec0"
              />
            )}
          </View>
        );
      case 'choice':
        return (
          <View style={styles.choiceContainer}>
            {currentQuestion.options?.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.choiceButton,
                  selectedChoice === option && styles.selectedChoice
                ]}
                onPress={() => handleChoiceSelect(option)}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.choiceText,
                  selectedChoice === option && styles.selectedChoiceText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return (
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your answer..."
            multiline
            placeholderTextColor="#a0aec0"
          />
        );
    }
  };

  // Validation for next button
  let canProceed = false;
  switch (currentQuestion.type) {
    case 'age':
      canProceed = !!age;
      break;
    case 'text':
      canProceed = !!input.trim();
      break;
    case 'height':
      canProceed = heightUnit === 'us' ? !!heightFt && heightIn >= 0 : !!heightCm;
      break;
    case 'weight':
      canProceed = weightUnit === 'us' ? !!weightLbs : !!weightKg;
      break;
    case 'multi':
      if (currentQuestion.key === 'equipment') {
        canProceed = selectedEquipment.length > 0 || (equipmentOther && equipmentOtherText.trim().length > 0);
      } else {
        canProceed = selectedSupplements.length > 0;
      }
      break;
    case 'supplements':
      canProceed = selectedSupplements.length > 0 || (supplementOther && supplementOtherText.trim().length > 0);
      break;
    case 'injury':
      canProceed = injuryYes !== null && (injuryYes === false || (injuryYes === true && injuryText.trim().length > 0));
      break;
    case 'routine':
      canProceed = routineYes !== null && (routineYes === false || (routineYes === true && routineText.trim().length > 0));
      break;
    case 'choice':
      canProceed = !!selectedChoice;
      break;
    default:
      canProceed = !!input;
  }

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.gradient}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.progress}>{step + 1} of {questions.length}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          {renderInput()}
          {step === questions.length - 1 ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !canProceed && styles.nextButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!canProceed}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              {step > 0 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.push('/Welcome')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !canProceed && styles.nextButtonDisabled,
                  step === 0 && styles.nextButtonFullWidth
                ]}
                onPress={handleNext}
                disabled={!canProceed}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  progressBarBg: {
    height: 10,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 40,
    marginBottom: 0,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: ACCENT,
    borderRadius: 12,
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
  progress: {
    fontSize: 16,
    color: ACCENT,
    marginBottom: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 24,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    fontSize: 16,
    minHeight: 56,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  choiceContainer: {
    width: '100%',
    marginBottom: 24,
  },
  choiceButton: {
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedChoice: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.15,
  },
  choiceText: {
    fontSize: 16,
    textAlign: 'center',
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  selectedChoiceText: {
    color: '#fff',
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    flex: 0,
    marginLeft: 12,
    minWidth: 120,
  },
  nextButtonFullWidth: {
    marginLeft: 0,
  },
  generateButton: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'center',
    flex: 0,
    width: 'auto',
  },
  nextButtonDisabled: {
    backgroundColor: ACCENT_LIGHT,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  buttonRowCentered: {
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: TEXT_SECONDARY,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
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
  picker: {
    width: '100%',
    backgroundColor: '#f8fafc',
    color: '#22223b',
    marginBottom: 16,
    borderRadius: 12,
    ...Platform.select({ ios: { height: 120 }, android: {} }),
  },
  pickerItem: {
    fontSize: 18,
    color: '#22223b',
  },
  unitToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  unitToggle: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unitToggleActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.15,
  },
  unitToggleText: {
    color: '#22223b',
    fontWeight: '500',
  },
  unitToggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  heightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  multiContainer: {
    width: '100%',
    marginBottom: 16,
    maxHeight: 300,
  },
  multiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  multiRowSelected: {
    backgroundColor: '#f3e8ff',
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.1,
  },
  multiLabel: {
    fontSize: 16,
    color: '#22223b',
    marginLeft: 12,
    flex: 1,
  },
  multiLabelSelected: {
    color: ACCENT,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  injuryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  injuryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  injuryBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.15,
  },
  injuryBtnText: {
    color: '#22223b',
    fontWeight: '500',
  },
  injuryBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  recoveryContainer: {
    width: '100%',
    marginBottom: 24,
  },
  recoveryButton: {
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recoveryButtonSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.2,
  },
  recoveryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  recoveryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22223b',
    marginBottom: 4,
  },
  recoveryTextSelected: {
    color: '#fff',
  },
  recoveryDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 