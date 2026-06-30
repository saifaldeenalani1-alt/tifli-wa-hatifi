import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Detector from '../services/Detector';

export default function HomeScreen() {
  const [isActive, setIsActive] = useState(false);
  const [statusText, setStatusText] = useState('اضغط على زر البدء لتفعيل المراقبة');
  const [alertCount, setAlertCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    Detector.setStatusCallback((msg) => {
      setStatusText(msg);
      if (msg.startsWith('⛔')) {
        Vibration.vibrate(500);
        countRef.current += 1;
        setAlertCount(countRef.current);
      }
    });

    return () => {
      Detector.stop();
    };
  }, []);

  const toggleDetection = async () => {
    if (isActive) {
      Detector.stop();
      setIsActive(false);
      setStatusText('متوقفة المراقبة');
    } else {
      await Detector.start();
      setIsActive(true);
      setAlertCount(0);
      countRef.current = 0;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color="#e94560" />
        <Text style={styles.title}>طفلي وهاتفي</Text>
        <Text style={styles.subtitle}>حماية الأطفال من الهواتف</Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: isActive ? '#4ecca3' : '#555' },
          ]}
        />
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{alertCount}</Text>
          <Text style={styles.statLabel}>تنبيه</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: isActive ? '#4ecca3' : '#888' }]}>
            {isActive ? 'نشط' : 'متوقف'}
          </Text>
          <Text style={styles.statLabel}>الحالة</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isActive ? styles.buttonStop : styles.buttonStart]}
        onPress={toggleDetection}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isActive ? 'stop-circle' : 'play-circle'}
          size={32}
          color="#fff"
        />
        <Text style={styles.buttonText}>
          {isActive ? 'إيقاف المراقبة' : 'بدء المراقبة'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>كيف يعمل؟</Text>
        <View style={styles.infoRow}>
          <Ionicons name="phone-portrait" size={20} color="#e94560" />
          <Text style={styles.infoText}>يكتشف التطبيق عند حمل الهاتف</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="hand-left" size={20} color="#e94560" />
          <Text style={styles.infoText}>يقيس حركة الهاتف والقرب</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="volume-high" size={20} color="#e94560" />
          <Text style={styles.infoText}>يصدر تنبيهات صوتية فورية</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  indicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    color: '#ddd',
    fontSize: 15,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    marginBottom: 30,
  },
  buttonStart: {
    backgroundColor: '#e94560',
  },
  buttonStop: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginRight: 10,
    flex: 1,
  },
});
