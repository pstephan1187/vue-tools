import { Form, installForm } from './form/form.js'
import { Field, installField } from './form/field.js'
import { Wizard, installWizard } from './wizard/wizard.js'
import { Step, installStep } from './wizard/step.js'
import focusDirective from './directives/focus.js'

const VueTools = {
  install: function (Vue, options) {
    this.form.install(Vue, options)
    this.wizard.install(Vue, options)
    this.focus.install(Vue, options)
  },

  form: {
    install: function (Vue, options) {
      installForm(Vue, options)
      installField(Vue, options)
    }
  },

  wizard: {
    install: function (Vue, options) {
      installWizard(Vue, options)
      installStep(Vue, options)
    }
  },

  focus: {
    install (Vue, options) {
      Vue.directive('focus', focusDirective)
    }
  }
}

export {
  Form,
  Field,
  Wizard,
  Step
}

export default VueTools
