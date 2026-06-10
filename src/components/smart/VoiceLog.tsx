import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface VoiceCommand {
  id: string;
  timestamp: string;
  spokenText: string;
  interpretedAction: string;
  success: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceLog() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('omni_voice_commands');
    if (saved) setCommands(JSON.parse(saved));

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = i18n.language === 'fa' ? 'fa-IR' : 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        setTranscript(t('voice.error'));
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language]);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    } else {
      alert(t('voice.not_supported'));
    }
  };

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    let action = '';
    let success = false;

    // Glucose logging
    const glucoseMatch = lowerText.match(
      /(?:glucose|sugar|blood sugar)[\s]*([0-9]+)/i,
    );
    if (glucoseMatch) {
      const value = glucoseMatch[1];
      const glucoseData = JSON.parse(
        localStorage.getItem('omni_glucose') || '[]',
      );
      glucoseData.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        value: parseInt(value),
        type: 'random',
        notes: `Voice: "${text}"`,
      });
      localStorage.setItem('omni_glucose', JSON.stringify(glucoseData));
      action = `${t('voice.logged_glucose')} ${value} mg/dL`;
      success = true;
    }

    // Water logging
    const waterMatch = lowerText.match(/(?:water|glass|drink)[\s]*([0-9]+)/i);
    if (waterMatch) {
      const amount = parseInt(waterMatch[1]) * 250;
      const waterData = JSON.parse(localStorage.getItem('omni_water') || '[]');
      waterData.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount,
        timestamp: new Date().toLocaleTimeString(),
      });
      localStorage.setItem('omni_water', JSON.stringify(waterData));
      action = `${t('voice.logged_water')} ${waterMatch[1]} ${t('voice.glasses')}`;
      success = true;
    }

    // Blood pressure logging
    const bpMatch = lowerText.match(
      /(?:blood pressure|bp)[\s]*([0-9]+)[\s]*over[\s]*([0-9]+)/i,
    );
    if (bpMatch) {
      const systolic = bpMatch[1];
      const diastolic = bpMatch[2];
      const bpData = JSON.parse(localStorage.getItem('omni_bp') || '[]');
      bpData.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: 0,
        notes: `Voice: "${text}"`,
      });
      localStorage.setItem('omni_bp', JSON.stringify(bpData));
      action = `${t('voice.logged_bp')} ${systolic}/${diastolic} mmHg`;
      success = true;
    }

    // Activity logging
    const walkMatch = lowerText.match(
      /(?:walked|walking)[\s]*([0-9]+)[\s]*(?:minutes|min)/i,
    );
    if (walkMatch) {
      const duration = walkMatch[1];
      const activityData = JSON.parse(
        localStorage.getItem('omni_activity') || '[]',
      );
      activityData.unshift({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'walking',
        duration: parseInt(duration),
        intensity: 'medium',
        notes: `Voice: "${text}"`,
      });
      localStorage.setItem('omni_activity', JSON.stringify(activityData));
      action = `${t('voice.logged_walk')} ${duration} ${t('voice.minutes')}`;
      success = true;
    }

    if (!success) {
      action = t('voice.not_recognized');
    }

    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      spokenText: text,
      interpretedAction: action,
      success,
    };

    setCommands([newCommand, ...commands]);
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-microphone mr-2 text-primary-500'></i>{' '}
          {t('voice.title')}
        </h2>
      </div>

      {/* Voice Input Card */}
      <div className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center'>
        <div className='mb-6'>
          <div
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 animate-pulse-glow'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <i
              className={`fas fa-microphone text-5xl transition-all ${isListening ? 'text-white animate-pulse' : 'text-gray-500'}`}
            ></i>
          </div>
        </div>

        <button
          onClick={startListening}
          disabled={isListening}
          className={`px-8 py-3 rounded-full text-white font-medium transition-all flex items-center gap-2 mx-auto ${
            isListening
              ? 'bg-red-500 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
        >
          <i
            className={`${isListening ? 'fas fa-spinner fa-pulse' : 'fas fa-microphone'}`}
          ></i>
          {isListening ? t('voice.listening') : t('voice.tap_to_speak')}
        </button>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'
          >
            <p className='text-gray-700 dark:text-gray-300 italic'>
              <i className='fas fa-quote-left mr-2 text-gray-400'></i>
              {transcript}
            </p>
          </motion.div>
        )}
      </div>

      {/* Example Commands */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
          <i className='fas fa-lightbulb text-yellow-500'></i>
          {t('voice.try_saying')}
        </h3>
        <div className='flex flex-wrap gap-2'>
          <span className='px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2'>
            <i className='fas fa-tachometer-alt text-primary-500'></i>{' '}
            {t('voice.examples.glucose')}
          </span>
          <span className='px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2'>
            <i className='fas fa-tint text-blue-500'></i>{' '}
            {t('voice.examples.water')}
          </span>
          <span className='px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2'>
            <i className='fas fa-heartbeat text-red-500'></i>{' '}
            {t('voice.examples.bp')}
          </span>
          <span className='px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2'>
            <i className='fas fa-walking text-green-500'></i>{' '}
            {t('voice.examples.walk')}
          </span>
        </div>
      </div>

      {/* Command History */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2'>
            <i className='fas fa-history text-primary-500'></i>
            {t('voice.history')}
            <span className='text-xs text-gray-400 font-normal ml-2'>
              ({commands.length})
            </span>
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto'>
          {commands.length === 0 ? (
            <div className='px-6 py-12 text-center text-gray-500'>
              <i className='fas fa-microphone-alt text-5xl mb-3 opacity-30'></i>
              <p>{t('voice.no_commands')}</p>
              <p className='text-xs mt-2 text-gray-400'>
                {t('voice.tap_to_speak')}
              </p>
            </div>
          ) : (
            commands.map((cmd) => (
              <motion.div
                key={cmd.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
              >
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5'>
                    {cmd.success ? (
                      <i className='fas fa-check-circle text-green-500 text-lg'></i>
                    ) : (
                      <i className='fas fa-times-circle text-red-500 text-lg'></i>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-xs text-gray-400 flex items-center gap-1'>
                        <i className='far fa-clock'></i> {cmd.timestamp}
                      </span>
                    </div>
                    <p className='text-gray-800 dark:text-gray-200 font-medium'>
                      <i className='fas fa-quote-left mr-1 text-gray-400 text-xs'></i>
                      {cmd.spokenText}
                    </p>
                    <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                      <i className='fas fa-arrow-right text-gray-400'></i>
                      {cmd.interpretedAction}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
        <div className='flex gap-3'>
          <i className='fas fa-microphone text-blue-500 text-lg mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200'>
              <i className='fas fa-info-circle mr-1'></i>{' '}
              {t('voice.guide_title')}
            </h4>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
              {t('voice.guide_text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
