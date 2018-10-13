import vue from 'rollup-plugin-vue'

export default {
  input: 'src/main.js',
  output: {
    format: 'esm',
    file: 'dist/vue-tools.esm.js'
  },
  external: [ 'vue' ],
  plugins: [
    vue()
  ]
}
