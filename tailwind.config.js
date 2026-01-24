/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,svelte,js,ts}", 
      './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('daisyui'),
      require('flowbite/plugin')   
    ],
    // Опционально: можно настроить темы daisyUI
    daisyui: {
      themes: ["light", "dark"], // или другие доступные темы
    },
};
  