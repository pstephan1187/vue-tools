import vue from 'rollup-plugin-vue'
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/main.js',
  output: {
    format: 'esm',
    file: 'dist/vue-tools.esm.js'
  },
  external: [ 'vue' ],
  plugins: [
    vue(),
    terser()
  ]
}
