import Vue from 'vue'
import rules from '../rules.js'

class Field {
  static create (options) {
    if (!('id' in options)) {
      throw new Error('Form fields must have an id')
    }

    let vueOptions = {
      data: {
        // The key by which you programatically reference this field
        id: options.id,

        // The text label the user sees
        label: options.label || '',

        // The text label the user sees in error messages
        errorLabel: options.errorLabel || options.label || '',

        // The value of the field
        value: 'value' in options ? options.value : null,

        // Any validation rules this field should pass
        rules: options.rules || [],

        // Is the field disabled
        disabled: !!options.disabled || false,

        // Is the field read-only
        readonly: !!options.readonly || false,

        // Any additional data the developer want to pass with the field
        // Can be used for things like classes or selection options, etc
        userData: options.userData || null,

        // Any validation failures
        errorList: [],

        // Has the value been changed?
        dirty: false,

        // A reference back to the form object. Usefull for validating
        // against other fields
        form: null
      },
      computed: {
        // Has the field passed all validation rules, but does not store
        // any error messages. Useful for checking validity without
        // displaying errors
        valid () {
          return this.checkValidationRules().length === 0
        },

        // Returns true if `required` is a validation rule
        required () {
          return this.rules.indexOf('required') !== -1
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
      },
      methods: {
        // Remove all error messages. Essentially makes the field 'valid'
        clearErrors () {
          this.errorList = []
        },

        // Runs validation rules against the field and returns any errors
        checkValidationRules () {
          let errors = []

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

            let message = func(this.$data, args)

            if (message !== true) {
              errors.push({
                rule, message
              })
            }
          }

          return errors
        },

        // Runs all given validation rules against the field and stores
        // error messages. Useful for checking validity AND showing
        // errors
        validate () {
          this.clearErrors()

          let errors = this.checkValidationRules()

          if (errors.length > 0) {
            this.errorList = errors
          }
        }
      },
      watch: {
        value () {
          this.dirty = true
        }
      }
    }

    return new Vue(vueOptions)
  }
}

export default Field
