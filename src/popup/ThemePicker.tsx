import { cn } from "../lib/utils";
import { DEFAULT_THEME_ID, THEMES } from "../shared/themes";

interface ThemePickerProps {
  value: string;
  disabled: boolean;
  onChange: (themeId: string) => void;
}

export function ThemePicker({ value, disabled, onChange }: ThemePickerProps) {
  const options = [
    { id: DEFAULT_THEME_ID, label: "Mặc định", colors: null },
    ...THEMES.map((theme) => ({
      id: theme.id,
      label: theme.label,
      colors: [theme.in.frame, theme.out.frame] as const,
    })),
  ];

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Khung chat</p>
      <div className="flex gap-1.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md border p-1.5 transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-40",
              value === option.id
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted",
            )}
          >
            <span
              className="h-5 w-5 rounded-full border border-black/10"
              style={
                option.colors
                  ? {
                      background: `linear-gradient(135deg, ${option.colors[0]} 50%, ${option.colors[1]} 50%)`,
                    }
                  : {
                      background:
                        "repeating-linear-gradient(135deg, #d4d4d8 0 3px, #f4f4f5 3px 6px)",
                    }
              }
            />
            <span className="text-[10px] leading-tight text-muted-foreground">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
