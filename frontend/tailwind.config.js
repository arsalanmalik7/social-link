/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      
      screens:{
        'sm':{max:'600px'},
        'md':{max:'800px'},
        'lg':{min:'1024px'},
        
      }
    },
  },
  plugins: [],
}

