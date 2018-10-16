import rules from '../rules.js'

let Field

const installField = function (Vue, options) {
  Field = Vue.extend({
    props: {
      // The key by which you programatically reference this field
      id: {
        type: String,
        required: true
      },

      // The text label the user sees
      label: {
        type: String,
        default: ''
      },

      // The text label the user sees in error messages
      errorLabel: {
        type: String,
        default: function () {
          return this.label
        }
      },

      // The value of the field
      value: {
        type: [String, Array, Object, Number, Boolean],
        default: null
      },

      // Any validation rules this field should pass
      rules: {
        type: Array,
        default: () => ([])
      },

      // Any additional data the developer want to pass with the field
      // Can be used for things like classes or selection options, etc
      userData: {
        type: [String, Array, Object, Number, Boolean],
        default: null
      }
    },
    data: () => ({
      // Any validation failures
      errorList: [],

      // Has the value been changed?
      dirty: false,
    }),
    computed: {
      // Has the field passed all validation rules, but does not store
      // any error messages. Useful for checking validity without
      // displaying errors
      valid () {
        return this.validationResults.filter(r => !r.passed).length === 0
      },

      // Returns true if validation rules indicate so
      // TODO: add logic for `requiredIf` rule
      required () {
        for (var result of this.validationResults) {
          if (result.required) {
            return true
          }
        }

        return false
      },

      // Returns an object contain all error messages along with just
      // the first one
      errors () {
        let errorList = this.errorList.slice(0)

        let errors = {
          all: errorList.map(e => e.message),
          first: errorList.length > 0 ? errorList[0].message : null
        }

        return errors
      },

      // Returns true if there are any validation errors
      hasErrors () {
        return this.errorList.length > 0
      },

      validationResults () {
        let results = []

        for (var rule of this.rules) {
          var func
          var args

          if (typeof rule === 'string') {
            // if the rule has any arguments, parse them
            if (rule.indexOf(':') !== -1) {
              var [rule, args] = rule.split(':')
              args = args.split(',')
            }

            func = rules[rule]
          } else if (typeof rule === 'function') {
            func = rule
          }

          let result = func(this, args)

          results.push({
            rule: rule,
            passed: result.passed,
            message: result.message,
            required: result.required,
          })
        }

        return results
      }
    },
    methods: {
      getErrorLabel () {
        return this.errorLabel || this.label
      },

      // Remove all error messages. Essentially makes the field 'valid'
      clearErrors () {
        this.errorList = []
      },

      // Runs all given validation rules against the field and stores
      // error messages. Useful for checking validity AND showing
      // errors
      validate () {
        this.clearErrors()

        let errors = this.validationResults.slice(0).filter(result => !result.passed)

        if (errors.length > 0) {
          this.errorList = errors.map(result => ({ rule: result.rule, message: result.message }))
        }
      }
    },
    watch: {
      value () {
        this.dirty = true
      }
    }
  })

  Field.prototype.$form = null

  Field.create = function (options) {
    return new Field({
      propsData: options
    })
  }
}



export {
  installField,
  Field
}
