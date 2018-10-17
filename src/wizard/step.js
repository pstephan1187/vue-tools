import { Form } from '../form/form.js'

let Step

const installStep = function (Vue, options) {
  Step = Vue.extend({
    props: {
      form: {
        type: Form,
        required: true
      }
    },
    computed: {
      label () {
        return this.form.label
      },
      isFirst () {
        return this.$wizard.steps[0] === this
      },
      valid () {
        return this.form.$valid
      },
      isActive () {
        return this.$wizard.currentStep === this
      },
      isLast () {
        return this.$wizard.steps[this.$wizard.steps.length - 1] === this
      }
    }
  })

  Step.prototype.$wizard = null

  Step.create = function (options) {
    return new Step({
      propsData: options
    })
  }
}

export {
  installStep,
  Step
}
