import Field from './field.js'

class Form {
  // The Form and Field objects need a reference to the App's
  // Vue instance, otherwise reactivity fails.
  constructor (VueClass) {
    this.VueClass = VueClass
  }

  create (options) {
    let Vue = this.VueClass

    if (!('fields' in options)) {
      throw new Error('You must include an array of fields when creating a form.')
    }

    let vueOptions = {
      data: {
        // An object of fields where each field is assigned
        // to a key represented by the field's ID
        fields: {}
      },
      computed: {
        // Returns true if all fields pass validation
        '$valid': function () {
          for (var key of Object.keys(this.fields)) {
            if (!this.fields[key].valid) {
              return false
            }
          }

          return true
        },
        // Returns true if any fields fail validation
        '$invalid': function () {
          return !this.$valid
        },
        // Returns all errors returned by all fields. Available
        // via `all` or each field's errors by the field's ID
        '$errors': function () {
          let errors = {
            all: []
          }

          for (var key of Object.keys(this.fields)) {
            let field = this.fields[key]

            errors.all = errors.all.concat(field.errors.all)
            errors[field.id] = field.errors.all
          }

          return errors
        }
      },
      methods: {
        // Get the errors belonging to the given field
        getErrors (fieldId) {
          if (!(fieldId in this.fields)) {
            return [];
          }

          return this.fields[fieldId].errors.all
        },
        // Does the given field have any errors
        hasErrors (fieldId) {
          if (!(fieldId in this.fields)) {
            return false;
          }

          return this.fields[fieldId].hasErrors()
        },
        // Get the first error for the given field
        firstError (fieldId) {
          if (!(fieldId in this.fields)) {
            return null;
          }

          return this.fields[fieldId].errors.first
        },
        // Run every field against it's validation rules
        validateAll () {
          for (let fieldID of Object.keys(this.fields)) {
            this.fields[fieldID].validate()
          }
        },
        // Run every dirty field against it's validation rules
        validateAllDirty () {
          for (let fieldID of Object.keys(this.fields)) {
            let field = this.fields[fieldID]

            if (field.dirty) {
              field.validate()
            }
          }
        }
      },
      watch: {}
    }

    // Assign the fields to the vue object's `fields` key
    // Assign computed getters and setters for each field's value
    // Assign watchers to each field's value to rerun validation on change
    for (let i in options.fields) {
      let field = Field.create(Vue, options.fields[i])

      vueOptions.data.fields[field.id] = field

      vueOptions.computed[field.id] = {
        get () {
          return this.fields[field.id].value
        },
        set (value) {
          this.fields[field.id].value = value
        }
      }

      // vueOptions.watch[`fields.${field.id}.value`] = function () {
      //   this.validateAll()
      // }
    }

    let form = new Vue(vueOptions)

    // Give the fields a reference to the form so the
    // validation methods have access to all fields.
    for (let fieldId of Object.keys(vueOptions.data.fields)) {
      let field = vueOptions.data.fields[fieldId]

      field.form = form
    }

    return form
  }
}

export default Form
