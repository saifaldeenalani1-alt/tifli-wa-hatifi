import { Accelerometer, Proximity } from 'expo-sensors';
import * as Speech from 'expo-speech';
import { AppState } from 'react-native';

const MOVEMENT_THRESHOLD = 1.5;
const PROXIMITY_THRESHOLD = 5;
const SAMPLE_INTERVAL = 150;
const MOVEMENT_COOLDOWN = 3000;

const MESSAGES = [
  'لا تحمل الموبايل',
  'اترك الهاتف وابتعد',
  'هذا ليس لعبة',
  'أعد الهاتف لمكانه',
];

class Detector {
  constructor() {
    this.isRunning = false;
    this.accelerometerSubscription = null;
    this.proximitySubscription = null;
    this.appStateSubscription = null;
    this.lastAlertTime = 0;
    this.isSpeaking = false;
    this.onStatusChange = null;
  }

  setStatusCallback(callback) {
    this.onStatusChange = callback;
  }

  updateStatus(msg) {
    if (this.onStatusChange) this.onStatusChange(msg);
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateStatus('جاري التفعيل...');

    const isAccelAvailable = await Accelerometer.isAvailableAsync();
    const isProxAvailable = await Proximity.isAvailableAsync();

    if (!isAccelAvailable && !isProxAvailable) {
      this.updateStatus('الحساسات غير متوفرة على هذا الجهاز');
      this.isRunning = false;
      return;
    }

    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL);

    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.handleAccelerometer(data);
    });

    if (isProxAvailable) {
      this.proximitySubscription = Proximity.addListener((data) => {
        this.handleProximity(data);
      });
    }

    this.appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        this.updateStatus('التطبيق يعمل في الخلفية');
      } else if (state === 'active') {
        this.updateStatus('المراقبة نشطة');
      }
    });

    this.updateStatus('المراقبة نشطة ✓');
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    if (this.proximitySubscription) {
      this.proximitySubscription.remove();
      this.proximitySubscription = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.isSpeaking) {
      Speech.stop();
      this.isSpeaking = false;
    }

    this.updateStatus('المتوقفة المراقبة');
  }

  handleAccelerometer(data) {
    if (!this.isRunning) return;

    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    const isMoving = Math.abs(magnitude - 9.81) > MOVEMENT_THRESHOLD;

    if (isMoving) {
      this.triggerAlert();
    }
  }

  handleProximity(data) {
    if (!this.isRunning) return;

    const isNear = data.distance < PROXIMITY_THRESHOLD && data.distance >= 0;
    if (isNear) {
      this.triggerAlert();
    }
  }

  triggerAlert() {
    const now = Date.now();
    if (now - this.lastAlertTime < MOVEMENT_COOLDOWN) return;
    if (this.isSpeaking) return;

    this.lastAlertTime = now;
    this.speakRandomMessage();
  }

  async speakRandomMessage() {
    this.isSpeaking = true;
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    this.updateStatus(`⛔ ${msg}`);

    try {
      await Speech.speak(msg, {
        language: 'ar',
        rate: 0.85,
        pitch: 1.1,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch {
      this.isSpeaking = false;
    }
  }

  isActive() {
    return this.isRunning;
  }
}

export default new Detector();
