import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800'
    >
      <div className='h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600' />
      <div className='p-5'>
        <div className='flex items-start justify-between mb-3'>
          <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl skeleton' />
          <div className='w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full skeleton' />
        </div>
        <div className='space-y-2'>
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 skeleton' />
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full skeleton' />
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 skeleton mt-3' />
        </div>
      </div>
    </motion.div>
  );
}
