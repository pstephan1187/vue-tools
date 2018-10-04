import rules from '../rules.js'

class Field {
  static create (Vue, options) {
    if (!('id' in options)) {
      throw new Error('Form fields must have an id')
    }

    let vueOptions = {
      data: {
        // The key by which you programatically reference this field
        id: options.id,

        // The text label the user sees
        label: options.label || '',

        // The value of the field
        value: options.value || null,

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
        // Has the field passed all validation rules
        valid () {
          return !this.hasErrors()
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
        }
      },
      methods: {
        // Remove all error messages. Essentially makes the field 'valid'
        clearErrors () {
          this.errorList = []
        },

        // Add an error and it's cooresponding message
        addError (rule, message) {
          this.errorList.push({
            rule, message
          })
        },

        // Returns true if there are any validation errors
        hasErrors () {
          return this.errorList.length > 0
        },

        // Runs all given validation rules against the field
        validate () {
          this.clearErrors()

          for (var rule of this.rules) {
            var func
            var args

            if (typeof rule === 'string') {
              if (rule.indexOf(':') !== -1) {
                var [rule, args] = rule.split(':')
                args = args.split(',')
              }

              func = rules[rule]
            } else if (typeof rule === 'function') {
              func = rule
            }

            let passes = func(this.$data, args)

            if (passes !== true) {
              this.addError(rule, passes)
            }
          }
        }
      },
      watch: {
        value () {
          this.dirty = true

          this.validate()
        }
      }
    }

    return new Vue(vueOptions)
  }
}

export default Field
