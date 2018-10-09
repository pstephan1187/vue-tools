import Form from '../form/form.js'

class Step {
  static create (Vue, form) {
    if (!('$valid' in form)) {
      throw new Error('Wizard steps must be Vue Tools Form instances.')
    }

    let vueOptions = {
      data: {
        form: form,
        wizard: null
      },
      computed: {
        label () {
          return this.form.label
        },
        isFirst () {
          return this.wizard.steps[0] === this
        },
        valid () {
          return this.form.$valid
        },
        isActive () {
          return this.wizard.currentStep === this
        },
        isLast () {
          return this.wizard.steps[this.wizard.steps.length - 1] === this
        }
      }
    }

    return new Vue(vueOptions)
  }
}

export default Step
