/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Crisp Environmental SaaS Palette
        surface: {
          canvas: '#F8FAFC',  // Slate-50 off-white
          card: '#FFFFFF',    // Crisp white
          muted: '#F1F5F9',   // Slate-100 soft background
          subtle: '#E2E8F0',  // Slate-200 border/divider
        },
        brand: {
          forest: '#007A5E',  // Reference image shield & dark green
          emerald: '#00875A', // Reference image "Hub AI" & primary action
          navy: '#0A192F',    // Reference image "Hazard" text
          subtitle: '#5A6B82', // Reference image subtitle text
          mint: '#E6F8F3',    // Reference image pill background
          mintBorder: '#A3E8D5', // Reference image pill border
          mintText: '#006B4E', // Reference image pill text
          teal: '#0D9488',    // Core teal
          tealHover: '#0F766E', // Teal-700
          tealLight: '#F0FDFA', // Teal-50
          tealBorder: '#99F6E4', // Teal-200
          blue: '#0284C7',    // Sky-600
        },
        // Environmental Bioluminescent Teal
        teal: {
          950: '#031917',
          900: '#042F2C',
          850: '#06433E',
          800: '#064E48',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
          200: '#99F6E4',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        // Safety Warning Hazard Amber
        hazard: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          900: '#78350F',
        },
        // Safety Hazard Rose / Critical Block
        danger: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          900: '#881337',
        },
        // Safety Verified Emerald
        safe: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          900: '#064E3B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 6px 16px -2px rgba(15, 23, 42, 0.09), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'teal-glow': '0 4px 14px 0 rgba(13, 148, 136, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        }
      }
    },
  },
  plugins: [],
}
