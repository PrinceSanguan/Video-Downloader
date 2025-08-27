/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            animation: {
                aurora: 'aurora 60s linear infinite',
            },
            keyframes: {
                aurora: {
                    from: {
                        backgroundPosition: '50% 50%, 50% 50%',
                    },
                    to: {
                        backgroundPosition: '350% 50%, 350% 50%',
                    },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
