import React from 'react';

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  step?: string;
  max?: number;
  isDecimal?: boolean;
  required?: boolean;
  name: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'number',
  step,
  max = 9999999,
  isDecimal = false,
  required = true,
  name
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (type === 'number') {
      if (newValue === '') {
        onChange('');
        return;
      }

      if (!isDecimal && newValue.includes('.')) {
        return;
      }

      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue <= max) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value === 0 ? '' : value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        step={step || (isDecimal ? '0.01' : '1')}
        max={max}
        required={required}
        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
    </div>
  );
};

export default InputField;