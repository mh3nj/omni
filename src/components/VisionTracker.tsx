import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface VisionEntry {
  id: string;
  date: string;
  leftSphere: number;
  leftCylinder: number;
  leftAxis: number;
  rightSphere: number;
  rightCylinder: number;
  rightAxis: number;
  visualAcuityLeft?: string;
  visualAcuityRight?: string;
  intraocularPressureLeft?: number;
  intraocularPressureRight?: number;
  symptoms?: string[];
  notes?: string;
}

interface EyeExamEntry {
  id: string;
  date: string;
  doctorName: string;
  clinic: string;
  dilatedExam: boolean;
  retinopathyDetected: boolean;
  retinopathyStage?: 'none' | 'mild' | 'moderate' | 'severe' | 'proliferative';
  macularEdema: boolean;
  treatmentGiven?: string;
  nextExamDate: string;
  notes?: string;
}

interface VisionTrackerProps {
  onBack: () => void;
}

const getSymptomsList = (t: (key: string) => string) => [
  t('vision.blurred_vision'),
  t('vision.floaters'),
  t('vision.double_vision'),
  t('vision.eye_pain'),
  t('vision.redness'),
  t('vision.light_sensitivity'),
  t('vision.night_blindness'),
  t('vision.vision_loss'),
];

export default function VisionTracker({ onBack }: VisionTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [prescriptions, setPrescriptions] = useState<VisionEntry[]>([]);
  const [eyeExams, setEyeExams] = useState<EyeExamEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<'prescriptions' | 'exams'>(
    'prescriptions',
  );
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [leftSphere, setLeftSphere] = useState('');
  const [leftCylinder, setLeftCylinder] = useState('');
  const [leftAxis, setLeftAxis] = useState('');
  const [rightSphere, setRightSphere] = useState('');
  const [rightCylinder, setRightCylinder] = useState('');
  const [rightAxis, setRightAxis] = useState('');
  const [visualAcuityLeft, setVisualAcuityLeft] = useState('');
  const [visualAcuityRight, setVisualAcuityRight] = useState('');
  const [intraocularPressureLeft, setIntraocularPressureLeft] = useState('');
  const [intraocularPressureRight, setIntraocularPressureRight] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [examDate, setExamDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [dilatedExam, setDilatedExam] = useState(false);
  const [retinopathyDetected, setRetinopathyDetected] = useState(false);
  const [retinopathyStage, setRetinopathyStage] = useState<
    'none' | 'mild' | 'moderate' | 'severe' | 'proliferative'
  >('none');
  const [macularEdema, setMacularEdema] = useState(false);
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [nextExamDate, setNextExamDate] = useState('');
  const [examNotes, setExamNotes] = useState('');

  useEffect(() => {
    const savedPrescriptions = localStorage.getItem(
      'omni_vision_prescriptions',
    );
    const savedExams = localStorage.getItem('omni_vision_exams');
    if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
    if (savedExams) setEyeExams(JSON.parse(savedExams));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'omni_vision_prescriptions',
      JSON.stringify(prescriptions),
    );
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('omni_vision_exams', JSON.stringify(eyeExams));
  }, [eyeExams]);

  const savePrescription = () => {
    const entry: VisionEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      leftSphere: parseFloat(leftSphere) || 0,
      leftCylinder: parseFloat(leftCylinder) || 0,
      leftAxis: parseInt(leftAxis) || 0,
      rightSphere: parseFloat(rightSphere) || 0,
      rightCylinder: parseFloat(rightCylinder) || 0,
      rightAxis: parseInt(rightAxis) || 0,
      visualAcuityLeft: visualAcuityLeft || undefined,
      visualAcuityRight: visualAcuityRight || undefined,
      intraocularPressureLeft: intraocularPressureLeft
        ? parseInt(intraocularPressureLeft)
        : undefined,
      intraocularPressureRight: intraocularPressureRight
        ? parseInt(intraocularPressureRight)
        : undefined,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
      notes: notes || undefined,
    };
    setPrescriptions([entry, ...prescriptions]);
    resetPrescriptionForm();
  };

  const saveExam = () => {
    const exam: EyeExamEntry = {
      id: Date.now().toString(),
      date: examDate,
      doctorName,
      clinic,
      dilatedExam,
      retinopathyDetected,
      retinopathyStage: retinopathyDetected ? retinopathyStage : 'none',
      macularEdema,
      treatmentGiven: treatmentGiven || undefined,
      nextExamDate,
      notes: examNotes || undefined,
    };
    setEyeExams([exam, ...eyeExams]);
    resetExamForm();
  };

  const deletePrescription = (id: string) =>
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  const deleteExam = (id: string) =>
    setEyeExams(eyeExams.filter((e) => e.id !== id));

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const resetPrescriptionForm = () => {
    setShowPrescriptionForm(false);
    setLeftSphere('');
    setLeftCylinder('');
    setLeftAxis('');
    setRightSphere('');
    setRightCylinder('');
    setRightAxis('');
    setVisualAcuityLeft('');
    setVisualAcuityRight('');
    setIntraocularPressureLeft('');
    setIntraocularPressureRight('');
    setSelectedSymptoms([]);
    setNotes('');
  };

  const resetExamForm = () => {
    setShowExamForm(false);
    setExamDate('');
    setDoctorName('');
    setClinic('');
    setDilatedExam(false);
    setRetinopathyDetected(false);
    setRetinopathyStage('none');
    setMacularEdema(false);
    setTreatmentGiven('');
    setNextExamDate('');
    setExamNotes('');
  };

  const latest = prescriptions[0];
  const lastExam = eyeExams[0];

  const getRetinopathyRisk = () => {
    if (!lastExam || !lastExam.retinopathyDetected)
      return { text: t('vision.no_retinopathy'), color: 'text-green-600' };
    if (lastExam.retinopathyStage === 'mild')
      return { text: t('vision.mild_npdr'), color: 'text-yellow-600' };
    if (lastExam.retinopathyStage === 'moderate')
      return { text: t('vision.moderate_npdr'), color: 'text-orange-600' };
    if (lastExam.retinopathyStage === 'severe')
      return { text: t('vision.severe_npdr'), color: 'text-red-600' };
    return { text: t('vision.proliferative'), color: 'text-red-700' };
  };

  const symptomsList = getSymptomsList(t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-all'
        >
          <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
        </button>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setShowPrescriptionForm(true)}
            className='px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-glasses text-xs'></i>{' '}
            {t('vision.add_prescription')}
          </button>
          <button
            onClick={() => setShowExamForm(true)}
            className='px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-stethoscope text-xs'></i>{' '}
            {t('vision.add_exam')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('vision.latest_rx')}
          </div>
          <div className='text-sm font-medium mt-1'>
            {latest ? `${latest.rightSphere}/${latest.leftSphere}` : '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('vision.last_exam')}
          </div>
          <div className='text-sm font-medium mt-1'>
            {lastExam ? lastExam.date : t('vision.no_exams')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('vision.retinopathy')}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${getRetinopathyRisk().color}`}
          >
            {getRetinopathyRisk().text}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('vision.next_exam')}
          </div>
          <div className='text-sm font-medium mt-1'>
            {lastExam?.nextExamDate || t('vision.schedule')}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
            selectedTab === 'prescriptions'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-glasses'></i> {t('vision.prescription_history')}
        </button>
        <button
          onClick={() => setSelectedTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
            selectedTab === 'exams'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-file-medical'></i> {t('vision.exam_records')}
        </button>
      </div>

      {selectedTab === 'prescriptions' ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'>
            <h3 className='font-medium'>
              {t('vision.prescription_history')} ({prescriptions.length})
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.right_eye')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.left_eye')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.visual_acuity')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                {prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-8 text-center text-gray-500'
                    >
                      <i className='fas fa-glasses text-4xl mb-2 opacity-50'></i>
                      <p>{t('vision.no_prescriptions')}</p>
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((p) => (
                    <tr key={p.id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-3 text-sm'>{p.date}</td>
                      <td className='px-6 py-3 text-sm'>
                        Sph:{p.rightSphere} Cyl:{p.rightCylinder}
                      </td>
                      <td className='px-6 py-3 text-sm'>
                        Sph:{p.leftSphere} Cyl:{p.leftCylinder}
                      </td>
                      <td className='px-6 py-3 text-sm'>
                        {p.visualAcuityRight}/{p.visualAcuityLeft}
                      </td>
                      <td className='px-6 py-3'>
                        <button
                          onClick={() => deletePrescription(p.id)}
                          className='text-red-500 hover:text-red-700'
                        >
                          <i className='fas fa-trash-alt'></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'>
            <h3 className='font-medium'>
              {t('vision.exam_records')} ({eyeExams.length})
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.doctor')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.dilated_exam')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('vision.retinopathy')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                {eyeExams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-8 text-center text-gray-500'
                    >
                      <i className='fas fa-stethoscope text-4xl mb-2 opacity-50'></i>
                      <p>{t('vision.no_exams')}</p>
                    </td>
                  </tr>
                ) : (
                  eyeExams.map((e) => (
                    <tr key={e.id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-3 text-sm'>{e.date}</td>
                      <td className='px-6 py-3 text-sm'>{e.doctorName}</td>
                      <td className='px-6 py-3'>{e.dilatedExam ? '✓' : '✗'}</td>
                      <td className='px-6 py-3'>
                        <span
                          className={
                            e.retinopathyDetected
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {e.retinopathyDetected
                            ? e.retinopathyStage === 'mild'
                              ? t('vision.mild_npdr')
                              : e.retinopathyStage === 'moderate'
                                ? t('vision.moderate_npdr')
                                : e.retinopathyStage === 'severe'
                                  ? t('vision.severe_npdr')
                                  : t('vision.proliferative')
                            : t('vision.none')}
                        </span>
                      </td>
                      <td className='px-6 py-3'>
                        <button
                          onClick={() => deleteExam(e.id)}
                          className='text-red-500 hover:text-red-700'
                        >
                          <i className='fas fa-trash-alt'></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('vision.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('vision.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {showPrescriptionForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={resetPrescriptionForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('vision.add_prescription')}
              </h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div className='grid grid-cols-3 gap-2'>
                  <div className='col-span-3 text-xs'>
                    {t('vision.right_eye')}
                  </div>
                  <input
                    placeholder={t('vision.sphere')}
                    value={rightSphere}
                    onChange={(e) => setRightSphere(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    placeholder={t('vision.cylinder')}
                    value={rightCylinder}
                    onChange={(e) => setRightCylinder(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    placeholder={t('vision.axis')}
                    value={rightAxis}
                    onChange={(e) => setRightAxis(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='col-span-3 text-xs'>
                    {t('vision.left_eye')}
                  </div>
                  <input
                    placeholder={t('vision.sphere')}
                    value={leftSphere}
                    onChange={(e) => setLeftSphere(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    placeholder={t('vision.cylinder')}
                    value={leftCylinder}
                    onChange={(e) => setLeftCylinder(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    placeholder={t('vision.axis')}
                    value={leftAxis}
                    onChange={(e) => setLeftAxis(e.target.value)}
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    placeholder={`${t('vision.visual_acuity')} OD`}
                    value={visualAcuityRight}
                    onChange={(e) => setVisualAcuityRight(e.target.value)}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    placeholder={`${t('vision.visual_acuity')} OS`}
                    value={visualAcuityLeft}
                    onChange={(e) => setVisualAcuityLeft(e.target.value)}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    {symptomsList.map((s) => (
                      <button
                        key={s}
                        type='button'
                        onClick={() => toggleSymptom(s)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedSymptoms.includes(s)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder={t('common.notes')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetPrescriptionForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={savePrescription}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eye Exam Modal */}
      <AnimatePresence>
        {showExamForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetExamForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('vision.add_exam')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='text'
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder={t('vision.doctor')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='text'
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder={t('vision.clinic')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('vision.dilated_exam')}</span>
                  <input
                    type='checkbox'
                    checked={dilatedExam}
                    onChange={(e) => setDilatedExam(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('vision.retinopathy')}</span>
                  <input
                    type='checkbox'
                    checked={retinopathyDetected}
                    onChange={(e) => setRetinopathyDetected(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                {retinopathyDetected && (
                  <select
                    value={retinopathyStage}
                    onChange={(e) => setRetinopathyStage(e.target.value as any)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  >
                    <option value='mild'>{t('vision.mild_npdr')}</option>
                    <option value='moderate'>
                      {t('vision.moderate_npdr')}
                    </option>
                    <option value='severe'>{t('vision.severe_npdr')}</option>
                    <option value='proliferative'>
                      {t('vision.proliferative')}
                    </option>
                  </select>
                )}
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('vision.macular_edema')}</span>
                  <input
                    type='checkbox'
                    checked={macularEdema}
                    onChange={(e) => setMacularEdema(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <input
                  type='text'
                  value={treatmentGiven}
                  onChange={(e) => setTreatmentGiven(e.target.value)}
                  placeholder={t('vision.treatment')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='date'
                  value={nextExamDate}
                  onChange={(e) => setNextExamDate(e.target.value)}
                  placeholder={t('vision.next_exam')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <textarea
                  placeholder={t('common.notes')}
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetExamForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveExam}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
