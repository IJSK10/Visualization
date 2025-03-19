"use client"
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  text: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange,text }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
  <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} className="sr-only peer" />
  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
  <span className="ms-3 text-sm font-semibold text-gray-900">{text}</span>
</label>
  );
};

export default ToggleSwitch;