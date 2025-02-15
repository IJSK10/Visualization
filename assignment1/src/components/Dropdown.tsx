import React from "react";

interface DropdownProps {
    options: string[];
    selectedValue: string;
    onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onChange }) => {
    return (
        <select value={selectedValue} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select Columns</option>
            {
                options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))
            }
        </select>
    )
};