/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        mocha: {
          50: '#FFF8F4',  // Blanc cassé crémeux (fond clair)
          100: '#F5E8DD', // Beige très léger (fond secondaire)
          200: '#E6D2C3', // Beige clair (bordures claires)
          300: '#D2B8A4', // Taupe clair (accent doux)
          400: '#B79680', // Caramel clair (accent secondaire)
          500: '#9C7A62', // Caramel moyen (accent tertiaire)
          600: '#7D5F4A', // Chocolat au lait (boutons primaires)
          700: '#604A38', // Chocolat moyen (texte principal mode clair)
          800: '#42332A', // Chocolat noir (texte secondaire mode sombre)
          900: '#2A211D', // Espresso foncé (fond mode sombre)
        }
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '100': '25rem',
        '128': '32rem',
      },
      borderRadius: {
        'bento': 'var(--border-radius-bento)',
        'bento-sm': 'var(--border-radius-bento-sm)',
        'bento-lg': 'var(--border-radius-bento-lg)',
      },
      backgroundImage: {
        'gradient-mocha': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
        'gradient-mocha-accent': 'linear-gradient(135deg, var(--accent-gradient-from) 0%, var(--accent-gradient-to) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'bento': 'var(--shadow-bento)',
        'bento-hover': 'var(--shadow-bento-hover)',
        'bento-active': 'var(--shadow-bento-active)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addBase, theme }) {
      addBase({
        ':root': {
          '--tw-gradient-from': theme('colors.mocha.50'),    // Fond gradient clair (départ)
          '--tw-gradient-to': theme('colors.mocha.100'),     // Fond gradient clair (arrivée)
          '--accent-gradient-from': theme('colors.mocha.300'), // Accent gradient clair (départ)
          '--accent-gradient-to': theme('colors.mocha.400'),   // Accent gradient clair (arrivée)
          '--border-radius-bento': '1.5rem',
          '--border-radius-bento-sm': '1rem',
          '--border-radius-bento-lg': '2rem',
          '--shadow-bento': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
          '--shadow-bento-hover': '0 8px 30px -2px rgba(0, 0, 0, 0.15)',
          '--shadow-bento-active': '0 2px 10px -2px rgba(0, 0, 0, 0.1)',
        },
        '.dark': {
          '--tw-gradient-from': theme('colors.mocha.900'),   // Fond gradient sombre (départ)
          '--tw-gradient-to': theme('colors.mocha.800'),     // Fond gradient sombre (arrivée)
          '--accent-gradient-from': theme('colors.mocha.600'), // Accent gradient sombre (départ)
          '--accent-gradient-to': theme('colors.mocha.700'),   // Accent gradient sombre (arrivée)
        },
      })
    },
  ],
}