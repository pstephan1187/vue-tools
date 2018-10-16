import { Step } from './step.js'

let Wizard

const installWizard = function (Vue, options) {
  Wizard = Vue.extend({
    props: {
      schema: {
        type: Array,
        required: true
      },
      onComplete: {
        type: Function,
        default: () => {}
      }
    },
    data: () => ({
      steps: [],
      currentStepIndex: 0
    }),
    computed: {
      currentStep () {
        if (this.steps[this.currentStepIndex] === undefined) {
          return null
        }

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

          this.onComplete()
        }
      },
      convertSchema () {
        this.steps = this.schema.map(step => {
          if (step instanceof Step) {
            return step
          }

          return Step.create({ form: step })
        }).map(step => {
          step.$wizard = this

          return step
        })
      }
    },
    created () {
      this.convertSchema()

      this.$watch('schema', this.convertSchema)
    }
  })

  Wizard.create = function (options) {
    return new Wizard({
      propsData: options
    })
  }
}

export {
  installWizard,
  Wizard
}
