import React from 'react';
import toast from 'react-hot-toast';

export const CustomToast = ({ t }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } flex w-3/4 h-24 overflow-hidden bg-white shadow-lg max-w-96 rounded-xl pointer-events-auto`}
      style={{
        boxShadow: '0 20px 45px -10px rgba(78, 18, 24, 0.18)'
      }}
    >
      <svg width={16} height={96} xmlns="http://www.w3.org/2000/svg">
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
      <div className="mx-2.5 overflow-hidden w-full flex flex-col justify-center">
        <p className="mt-1.5 text-xl font-bold text-[#7B1F2A] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap font-playfair italic">
          {t.type === 'error' ? 'Notice !' : 'Success !'}
        </p>
        <p className="overflow-hidden leading-5 break-all text-zinc-500 max-h-10 text-sm font-inter">
          {t.message}
        </p>
      </div>
      <button 
        onClick={() => toast.dismiss(t.id)}
        className="w-16 cursor-pointer focus:outline-none flex items-center justify-center hover:bg-red-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="#7B1F2A" fill="none" className="w-7 h-7">
          <path d="M6 18L18 6M6 6l12 12" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
