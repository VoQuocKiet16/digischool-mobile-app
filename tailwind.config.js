/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary: "#151312",
        light: {
          100: "#D6C7FF",
          200: "#A8B5DB",
          300: "#9CA4AB",
        },
        dark: {
          100: "#221F3D",
          200: "#0F0D23",
        },
        accent: "#AB8BFF",
      },
    },
  },
  plugins: [],
};
// This Tailwind CSS configuration file sets up custom colors and extends the default theme.
// It includes a preset for NativeWind, which is useful for React Native projects.
// The content paths specify where Tailwind should look for class names to generate styles.
// The custom colors include primary, secondary, light, dark, and accent shades.
// This setup allows for a consistent design system across the application with a focus on dark and light themes.
// The colors are defined in a way that they can be easily referenced in the application components.
// The configuration is tailored for a React Native environment, ensuring compatibility with NativeWind's styling approach.
// The use of `extend` allows for adding new colors without overriding the default Tailwind colors.
// The `plugins` array is currently empty, but can be used to add additional Tailwind CSS plugins in the future.
// This configuration is ready to be used in a React Native project with NativeWind for styling.
// The file is structured to be easily readable and maintainable, following best practices for Tailwind CSS configurations.
// The Tailwind CSS setup is optimized for performance by specifying the content paths, 