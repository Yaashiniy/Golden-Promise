import React from 'react';
import toast from 'react-hot-toast';

export const CustomToast = ({ t }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } flex w-[min(calc(100vw-2rem),24rem)] min-h-24 overflow-hidden bg-white shadow-lg rounded-xl pointer-events-auto`}
      style={{
        boxShadow: '0 20px 45px -10px rgba(78, 18, 24, 0.18)'
      }}
    >
      <svg width={16} height={96} viewBox="0 0 16 96" preserveAspectRatio="none" className="h-auto self-stretch shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M 8 0 
             Q 4 4.8, 8 9.6 
             T 8 19.2 
             Q 4 24, 8 28.8 
             T 8 38.4 
             Q 4 43.2, 8 48 
             T 8 57.6 
             Q 4 62.4, 8 67.2 
             T 8 76.8 
             Q 4 81.6, 8 86.4 
             T 8 96 
             L 0 96 
             L 0 0 
             Z" fill="#C08E3F" stroke="#C08E3F" strokeWidth={2} strokeLinecap="round" />
      </svg>
      <div className="min-w-0 flex-1 px-3 py-4 flex flex-col justify-center">
        <p className="text-xl font-bold text-[#7B1F2A] leading-7 font-playfair italic">
          {t.type === 'error' ? 'Notice !' : 'Success !'}
        </p>
        <p className="mt-0.5 leading-5 whitespace-normal break-words text-zinc-600 text-sm font-inter">
          {t.message}
        </p>
      </div>
      <button 
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss notification"
        className="w-12 shrink-0 cursor-pointer focus:outline-none flex items-center justify-center hover:bg-red-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="#7B1F2A" fill="none" className="w-6 h-6">
          <path d="M6 18L18 6M6 6l12 12" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
