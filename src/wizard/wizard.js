import Step from './step.js'

class Wizard {
  constructor (VueClass) {
    this.VueClass = VueClass
  }

  create (options) {
    let Vue = this.VueClass

    if (!('steps' in options)) {
      throw new Error('You must include an array of steps when creating a form.')
    }

    let vueOptions = {
      data: {
        steps: [],
        currentStepIndex: 0
      },
      computed: {
        currentStep () {
          return this.steps[this.currentStepIndex]
        },
        canGoBack () {
          return this.currentStepIndex !== 0
        },
        canGoForward () {
          return this.currentStep.form.$valid
        }
      },
      methods: {
        previous () {
          if (--this.currentStepIndex < 0) {
            this.currentStepIndex = 0
          }
        },
        next () {
          if (++this.currentStepIndex >= this.steps.length) {
            this.currentStepIndex = this.steps.length - 1

            this.complete()
          }
        },
        complete () {
          if (options.completed && typeof options.completed === 'function') {
            options.completed(this.steps)
          }
        }
      }
    }

    for (var form of options.steps) {
      vueOptions.data.steps.push(Step.create(Vue, form))
    }

    let wizard = new Vue(vueOptions)

    for (var step of wizard.steps) {
      step.wizard = wizard
    }

    return wizard
  }
}

export default Wizard
