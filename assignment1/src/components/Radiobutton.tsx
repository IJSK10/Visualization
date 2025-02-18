import React from "react";

interface RadioButtonGroupProps {
  columns: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonGroupProps> = ({ columns, selectedValue, onChange}) => {
  
  return (
    <div className="flex flex-col space-y-2">
      {columns.map((column) => (
        <label key={column} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="radio-group"
            value={column}
            checked={selectedValue === column}
            onChange={(e) => onChange(e.target.value)}
            className="hidden"
          />
          <div
            className={`w-5 h-5 flex justify-center items-center border-2 border-gray-500 rounded-full ${
              selectedValue === column ? "bg-blue-500 border-blue-500" : "bg-white"
            }`}
          >
            {selectedValue === column && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
          </div>
          <span className="text-gray-700">{column}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioButton;
