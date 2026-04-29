import { Sun, Moon, Flame } from 'lucide-react';
import { useTheme, type Theme } from '../../context/ThemeContext';

const themes: { value: Theme; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { value: 'light', label: 'Light', Icon: Sun   },
  { value: 'dark',  label: 'Dark',  Icon: Moon  },
  { value: 'warm',  label: 'Warm',  Icon: Flame },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[#EAEAEA] bg-[#F7F7F7] p-0.5">
      {themes.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-150 ${
            theme === value
              ? 'bg-[#DD6E42] text-white shadow-sm'
              : 'text-[#50757A] hover:bg-[#EAEAEA]'
          }`}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
