import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface ParallaxCardProps {
  iconClass: string;
  title: string;
  subtitle: string;
  status: 'green' | 'yellow' | 'red';
  onClick: () => void;
  lastValue?: string; // e.g., "118 mg/dL"
}

export default function ParallaxCard({
  iconClass,
  title,
  subtitle,
  status,
  onClick,
  lastValue,
}: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineOpacity, setShineOpacity] = useState(0);
  const [cardScale, setCardScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setShineOpacity(0.3);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setShineOpacity(0);
    setCardScale(1);
  };

  const handleMouseEnter = () => {
    setCardScale(1.02);
  };

  // Status border colors (subtle, not rainbow)
  const statusBorder = {
    green: 'ring-1 ring-green-500/50 ring-inset',
    yellow: 'ring-1 ring-amber-500/50 ring-inset',
    red: 'ring-1 ring-red-500/50 ring-inset',
  };

  // Status overlay colors (subtle opacity on the card)
  const statusOverlay = {
    green: 'bg-gradient-to-br from-green-500/5 to-transparent',
    yellow: 'bg-gradient-to-br from-amber-500/8 to-transparent',
    red: 'bg-gradient-to-br from-red-500/10 to-transparent',
  };

  // Status text colors for the value
  const statusTextColor = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      animate={{
        rotateX,
        rotateY,
        scale: cardScale,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className='cursor-pointer'
      style={{ perspective: 1000 }}
    >
      <div
        className={`
          relative rounded-2xl overflow-hidden
          bg-white dark:bg-gray-900
          shadow-md hover:shadow-xl
          transition-all duration-300
          ${statusBorder[status]}
        `}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Status overlay (subtle color tint based on health) */}
        <div
          className={`absolute inset-0 pointer-events-none ${statusOverlay[status]}`}
        />

        {/* Subtle shine effect */}
        <div
          className='absolute inset-0 transition-opacity duration-200 pointer-events-none'
          style={{
            opacity: shineOpacity,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)',
          }}
        />

        {/* Status indicator bar at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            status === 'green'
              ? 'bg-green-500'
              : status === 'yellow'
                ? 'bg-amber-500'
                : 'bg-red-500'
          }`}
        />

        {/* Content */}
        <div className='p-6 relative'>
          {/* Icon */}
          <div className='text-5xl mb-4 text-gray-700 dark:text-gray-300'>
            <i className={`${iconClass}`}></i>
          </div>

          {/* Title */}
          <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1'>
            {title}
          </h3>

          {/* Subtitle */}
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
            {subtitle}
          </p>

          {/* Last value (dynamic from data) */}
          {lastValue && (
            <div className={`text-sm font-medium ${statusTextColor[status]}`}>
              {lastValue}
            </div>
          )}

          {/* Divider */}
          <div
            className={`mt-4 w-8 h-0.5 rounded-full ${
              status === 'green'
                ? 'bg-green-500/40'
                : status === 'yellow'
                  ? 'bg-amber-500/40'
                  : 'bg-red-500/40'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
