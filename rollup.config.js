import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import terser from '@rollup/plugin-terser';
import image from '@rollup/plugin-image';

export default {
    input: 'sidepanel/main.js',
    output: {
        file: 'sidepanel/bundle.js',
        format: 'iife',
        //format: 'cjs',
        name: 'App',
    },
    plugins: [
        svelte(),
        css({ output: 'bundle.css' }),
        resolve({ browser: true }),
        terser(),
        image(),
    ]
};