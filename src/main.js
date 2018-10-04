import Form from './form/form.js'

function init (Vue) {
  if (!('$tools' in Vue.prototype)) {
    Vue.prototype.$tools = {}
  }
}

const VueTools = {
  install (Vue, options) {
    this.form.install(Vue, options)
  },

  /*
   * Usage:
   * data: (vm) => ({
   *  form: vm.$tools.form.create({
   *    // ...
   *  })
   * })
   */
  form: {
    install (Vue, options) {
      init(Vue)
      Vue.prototype.$tools.form = new Form(Vue)
    }
  }
}

export {
  Form
}
export default VueTools
