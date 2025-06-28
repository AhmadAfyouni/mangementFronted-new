import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { CheckCircle, Palette } from 'lucide-react';

interface ColorPickerProps {
    value?: string;
    onChange: (color: string) => void;
    error?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    error
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<string>(value || '#6D28D9'); // Default to purple
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Predefined modern color palette
    const colorPalette: string[] = [
        // Purple shades
        '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA',
        // Blue shades
        '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA',
        // Green shades
        '#047857', '#059669', '#10B981', '#34D399',
        // Red shades
        '#B91C1C', '#DC2626', '#EF4444', '#F87171',
        // Yellow/Orange shades
        '#B45309', '#D97706', '#F59E0B', '#FBBF24',
        // Teal/Cyan shades
        '#0E7490', '#0891B2', '#06B6D4', '#22D3EE',
        // Pink shades
        '#BE185D', '#DB2777', '#EC4899', '#F472B6',
        // Gray shades
        '#374151', '#4B5563', '#6B7280', '#9CA3AF',
    ];

    // Handle outside clicks to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // When color changes externally
    useEffect(() => {
        if (value && value !== selectedColor) {
            setSelectedColor(value);
        }
    }, [value, selectedColor]);

    // Handle color selection
    const handleColorSelect = (color: string): void => {
        setSelectedColor(color);
        onChange(color);
        setIsOpen(false);
    };

    // Handle manual input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const newColor = e.target.value;
        setSelectedColor(newColor);
        onChange(newColor);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border ${error ? 'border-red-500' : 'border-gray-700'} focus:border-teal-500 focus:ring focus:ring-teal-500/20 transition-colors flex items-center justify-between cursor-pointer`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-6 h-6 rounded-full border border-gray-600 shadow-inner"
                        style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-gray-300">{selectedColor}</span>
                </div>
                <Palette className="w-5 h-5 text-teal-400" />
            </div>

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 p-3 bg-dark border border-gray-700 rounded-lg shadow-lg">
                    <div className="grid grid-cols-8 gap-2">
                        {colorPalette.map((color) => (
                            <div
                                key={color}
                                className="relative flex items-center justify-center"
                            >
                                <div
                                    className="w-8 h-8 rounded-full cursor-pointer border border-gray-700 shadow-sm hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorSelect(color)}
                                />
                                {selectedColor === color && (
                                    <CheckCircle className="absolute w-3 h-3 text-white drop-shadow" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={selectedColor}
                                onChange={handleInputChange}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 text-twhite border border-gray-700 focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default ColorPicker;