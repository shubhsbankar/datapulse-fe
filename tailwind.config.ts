/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  plugins: [],
  theme: {
      extend: {
          colors: {
              // Main theme colors
              'primary-light': '#ffffff',  // White background
              'primary-medium-light': '#f8f9fa',  // Google's light gray background
              'primary-medium-dark': '#202124',  // Google's dark gray
              'primary-dark': '#1a73e8',  // Google Blue
              'primary-dark-b': '#174ea6',  // Darker blue for hover states
              
              // Utility colors
              'dark-gray': 'rgba(60, 64, 67, 0.15)',  // Google's shadow color
              'light-gray': '#e8eaed',  // Border color light
              'primary-charcoal': 'rgba(60, 64, 67, 0.08)',  // Subtle hover state
              'primary-charcoal-hover': 'rgba(60, 64, 67, 0.12)',
              
              // Accent colors
              'secondary-color': '#1a73e8',  // Google Blue
              'illustration-color': '#4285f4',  // Google Product Blue
              
              // Status colors
              'green-flagged-job': '#34a853',  // Google Green
              'red-flagged-job': '#ea4335',    // Google Red
              'yellow-flagged-job': '#fbbc04',  // Google Yellow
              
              // Borders
              'b-light': '#dadce0',  // Google's border color
              'b-dark': '#3c4043',   // Dark border
              
              // Feedback states
              'warning-dark': '#f29900',        // Warning orange
              'error-light': '#ea4335',         // Error red
              'error-dark': '#d93025',          // Dark error red
              'success-dark-transparent': 'rgba(52, 168, 83, 0.1)'  // Success green transparent
          },
          boxShadow: {
              dropdown: '-5px 10px 20px hsla(175, 74%, 70%, 0.5)'
          }
      }
  },
  screens: {
      sm: '640px', // Apply to screens wider than 640px (mobile first)
      md: '768px',
      lg: '1024px',
      xl: '1280px'
  }
}
