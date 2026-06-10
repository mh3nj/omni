import { useEffect, useState } from 'react';

interface HbA1cEstimatorProps {
  glucoseReadings: Array<{ value: number; timestamp: Date }>;
}

export default function HbA1cEstimator({
  glucoseReadings,
}: HbA1cEstimatorProps) {
  const [estimatedA1c, setEstimatedA1c] = useState<number | null>(null);
  const [averageGlucose, setAverageGlucose] = useState<number | null>(null);
  const [trend, setTrend] = useState<'improving' | 'worsening' | 'stable'>(
    'stable',
  );
  const [readingsCount, setReadingsCount] = useState(0);

  useEffect(() => {
    calculateEstimatedA1c();
  }, [glucoseReadings]);

  const calculateEstimatedA1c = () => {
    // Get last 90 days of readings
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentReadings = glucoseReadings.filter(
      (r) => new Date(r.timestamp) >= ninetyDaysAgo,
    );

    if (recentReadings.length === 0) {
      setEstimatedA1c(null);
      setAverageGlucose(null);
      setReadingsCount(0);
      return;
    }

    // Calculate average glucose
    const sum = recentReadings.reduce((acc, r) => acc + r.value, 0);
    const avg = sum / recentReadings.length;
    setAverageGlucose(Math.round(avg));
    setReadingsCount(recentReadings.length);

    // Convert to estimated HbA1c using formula: HbA1c = (eAG + 46.7) / 28.7
    const estimated = (avg + 46.7) / 28.7;
    setEstimatedA1c(Math.round(estimated * 10) / 10);

    // Calculate trend (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const last30Days = recentReadings.filter(
      (r) => new Date(r.timestamp) >= thirtyDaysAgo,
    );
    const previous30Days = recentReadings.filter(
      (r) =>
        new Date(r.timestamp) >= sixtyDaysAgo &&
        new Date(r.timestamp) < thirtyDaysAgo,
    );

    if (last30Days.length > 0 && previous30Days.length > 0) {
      const lastAvg =
        last30Days.reduce((a, r) => a + r.value, 0) / last30Days.length;
      const prevAvg =
        previous30Days.reduce((a, r) => a + r.value, 0) / previous30Days.length;

      if (lastAvg < prevAvg - 5) setTrend('improving');
      else if (lastAvg > prevAvg + 5) setTrend('worsening');
      else setTrend('stable');
    }
  };

  // const getA1cColor = (value: number) => {
  //   if (value < 7) return 'text-green-600 dark:text-green-400';
  //   if (value < 8) return 'text-yellow-600 dark:text-yellow-400';
  //   return 'text-red-600 dark:text-red-400';
  // };

  const getA1cStatus = (value: number) => {
    if (value < 7) return 'Excellent - Target Range';
    if (value < 8) return 'Good - Needs Improvement';
    return 'High - Consult Doctor';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return '📈 Improving';
      case 'worsening':
        return '📉 Worsening';
      default:
        return '➡️ Stable';
    }
  };

  if (!estimatedA1c) {
    return (
      <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center'>
        <i className='fas fa-chart-line text-3xl text-gray-400 mb-2'></i>
        <p className='text-gray-500'>Not enough data to calculate HbA1c</p>
        <p className='text-xs text-gray-400 mt-1'>
          Need at least 1 glucose reading
        </p>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <p className='text-sm opacity-90'>Estimated HbA1c (Last 90 days)</p>
          <div className='text-4xl font-bold mt-1'>{estimatedA1c}%</div>
          <p
            className={`text-sm mt-1 ${estimatedA1c < 7 ? 'text-green-200' : estimatedA1c < 8 ? 'text-yellow-200' : 'text-red-200'}`}
          >
            {getA1cStatus(estimatedA1c)}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-sm opacity-90'>Average Glucose</p>
          <div className='text-2xl font-bold mt-1'>{averageGlucose} mg/dL</div>
          <p className='text-xs opacity-75 mt-1'>{getTrendIcon()}</p>
        </div>
      </div>

      <div className='mt-4 pt-4 border-t border-white/20'>
        <div className='flex justify-between text-sm'>
          <div>
            <p className='opacity-75'>Based on</p>
            <p className='font-semibold'>{readingsCount} readings</p>
          </div>
          <div>
            <p className='opacity-75'>Target</p>
            <p className='font-semibold'>&lt; 7.0%</p>
          </div>
          <div>
            <p className='opacity-75'>Your Status</p>
            <p className='font-semibold'>
              {estimatedA1c < 7
                ? '✅ On Target'
                : estimatedA1c < 8
                  ? '⚠️ Above Target'
                  : '🔴 High Risk'}
            </p>
          </div>
        </div>
      </div>

      <div className='mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden'>
        <div
          className='h-full bg-white rounded-full transition-all duration-500'
          style={{ width: `${Math.min((estimatedA1c / 14) * 100, 100)}%` }}
        />
      </div>
      <div className='flex justify-between text-xs opacity-75 mt-1'>
        <span>0%</span>
        <span>Target 7%</span>
        <span>14%</span>
      </div>
    </div>
  );
}
