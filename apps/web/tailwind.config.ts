import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Emerald Green Theme anchor
        primary: colors.emerald[500],
        'primary-hover': colors.emerald[400],
        'primary-shadow': 'rgba(16, 185, 129, 0.3)',

        secondary: colors.blue[500],
        'secondary-shadow': 'rgba(59, 130, 246, 0.3)',

        danger: colors.rose[500],
        'danger-shadow': 'rgba(244, 63, 94, 0.3)',

        warning: colors.amber[500],
        'warning-shadow': 'rgba(245, 158, 11, 0.3)',

        // Rich Dark Mode Palette (Zinc)
        background: colors.zinc[950],
        surface: colors.zinc[900],
        border: colors.zinc[800],

        text: colors.zinc[50],
        'text-light': colors.zinc[400],
      },
      borderRadius: {
        full: '9999px',
        xl: '16px',
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
