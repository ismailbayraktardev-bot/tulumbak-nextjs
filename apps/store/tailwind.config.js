/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  			center: true,
  			padding: '1rem', // Mobile-first: smaller padding on mobile
  			screens: {
  				'2xl': '1400px'
  			}
  		},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			tulumbak: {
  				amber: '#FCA311',
  				beige: '#FFF9F3',
  				slate: '#1E293B',
  				gray: '#E5E7EB',
  				muted: '#F1F5F9'
  			},
  			// Stitch Design System Colors
  			stitch: {
  				primary: '#ec7813',
  				'background-light': '#f8f7f6',
  				'background-dark': '#221810',
  				'text-primary': '#1b140d',
  				'text-secondary': '#9a704c',
  				'border-color': '#e7dacf'
  			},
  			// Product Page Design System Colors
  			product: {
  				primary: '#800020',
  				secondary: '#fdf8f4',
  				accent: '#c9a16b',
  				'warm-button': '#A97431',
  				'background-light': '#fdf8f4',
  				'background-dark': '#221810',
  				'text-light': '#1f1f1f',
  				'text-dark': '#fdf8f4',
  				'subtext-light': '#6b6b6b',
  				'subtext-dark': '#a1a1a1'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			DEFAULT: '0.25rem', // 4px
  			lg: '0.5rem',      // 8px
  			xl: '0.75rem',     // 12px
  			full: '9999px',    // Tam yuvarlak
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			display: ['Manrope', 'sans-serif'], // Stitch font
  			sans: [
  				'Lato',
  				'sans-serif'
  			],
  			serif: [
  				'Merriweather',
  				'serif'
  			],
  			mono: [
  				'Geist Mono',
  				'monospace'
  			],
  			// Product Page Fonts
  			'product-display': ['Playfair Display', 'serif'],
  			'product-body': ['Manrope', 'sans-serif']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		aspectRatio: {
  			hero: '16/9',
  			product: '3/2',
  			category: '4/3'
  		},
  		// Mobile-first touch targets
  		minTouchTarget: '44px',
  		// Mobile spacing
  		spacing: {
  			'18': '4.5rem', // Mobile touch-friendly spacing
  			'88': '22rem',  // Mobile card heights
  		},
  		boxShadow: {
  			card: '0 6px 20px rgba(0,0,0,.05)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
