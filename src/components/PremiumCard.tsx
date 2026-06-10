import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumCardProps {
  iconClass: string;
  title: string;
  subtitle: string;
  status: 'green' | 'yellow' | 'red';
  lastValue: string | React.ReactNode; // ← Change this line
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  onClick: () => void;
  accentColor?: string;
}

export default function PremiumCard({
  iconClass,
  title,
  subtitle,
  status,
  lastValue,
  trend = 'stable',
  trendValue,
  onClick,
  accentColor = 'from-primary-500 to-secondary-500',
}: PremiumCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    green: {
      border: 'from-green-500/20 to-emerald-500/20',
      glow: 'shadow-green-500/20',
      badge: 'bg-green-500',
      progress: 85,
    },
    yellow: {
      border: 'from-yellow-500/20 to-amber-500/20',
      glow: 'shadow-yellow-500/20',
      badge: 'bg-yellow-500',
      progress: 50,
    },
    red: {
      border: 'from-red-500/20 to-rose-500/20',
      glow: 'shadow-red-500/20',
      badge: 'bg-red-500',
      progress: 25,
    },
  };

  const getBadgeText = () => {
    switch (status) {
      case 'green':
        return t('premium_card.status_good');
      case 'yellow':
        return t('premium_card.status_caution');
      case 'red':
        return t('premium_card.status_critical');
      default:
        return t('premium_card.status_good');
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'up':
        return t('premium_card.trend_increased');
      case 'down':
        return t('premium_card.trend_decreased');
      case 'stable':
        return t('premium_card.trend_stable');
      default:
        return t('premium_card.trend_stable');
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'fas fa-arrow-up';
      case 'down':
        return 'fas fa-arrow-down';
      case 'stable':
        return 'fas fa-minus';
      default:
        return 'fas fa-minus';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className='relative cursor-pointer group'
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${config.border} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${config.glow}`}
      />

      <div className='relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 group-hover:shadow-2xl'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.05 : 0 }}
          className={`absolute inset-0 bg-gradient-to-r ${accentColor} pointer-events-none transition-opacity duration-300`}
        />

        <div className={`h-1 w-full bg-gradient-to-r ${accentColor}`} />

        <div className='p-5'>
          <div className='flex items-start justify-between mb-3'>
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className='text-4xl text-gray-700 dark:text-gray-300'
            >
              <i className={iconClass}></i>
            </motion.div>
            <div className='flex items-center gap-2'>
              {trendValue && (
                <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full'>
                  <i
                    className={`${getTrendIcon()} text-xs ${getTrendColor()}`}
                  ></i>
                  <span className={`text-xs font-medium ${getTrendColor()}`}>
                    {trendValue}
                  </span>
                </div>
              )}
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                className={`${config.badge} px-2 py-0.5 rounded-full text-white text-xs font-medium shadow-sm`}
              >
                {getBadgeText()}
              </motion.div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1'>
              {title}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
              {subtitle}
            </p>

            <div className='flex items-baseline justify-between'>
              <div>
                <motion.span
                  animate={{ scale: isHovered ? 1.02 : 1 }}
                  className='text-2xl font-bold text-gray-900 dark:text-white'
                >
                  {lastValue}
                </motion.span>
                {trendValue && (
                  <span className='text-xs text-gray-500 ml-2'>
                    {getTrendLabel()} {trendValue}
                  </span>
                )}
              </div>
              <motion.div
                animate={{ x: isHovered ? 5 : 0 }}
                className='text-gray-400 group-hover:text-primary-500 transition-colors'
              >
                <i className='fas fa-chevron-right text-sm'></i>
              </motion.div>
            </div>
          </div>
        </div>

        <div className='px-5 pb-4'>
          <div className='h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${config.progress}%` }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${accentColor}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
