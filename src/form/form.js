import { Field } from './field.js'

let Form

const installForm = function (Vue, options) {
  Form = Vue.extend({
    props: {
      label: {
        type: String,
        default: '',
      },
      schema: {
        type: Array,
        required: true
      }
    },
    data: () => ({
      fields: []
    }),
    computed: {
      $fields () {
        let fields = {}

        for (var field of this.fields) {
          fields[field.id] = field
        }

        return fields
      },

      // Returns true if all fields pass validation
      $valid: function () {
        for (var key of Object.keys(this.fields)) {
          if (!this.fields[key].valid) {
            return false
          }
        }

        return true
      },

      // Returns true if any fields fail validation
      $invalid: function () {
        return !this.$valid
      },

      // Returns all errors returned by all fields. Available
      // via `all` or each field's errors by the field's ID
      $errors: function () {
        let errors = {
          all: []
        }

        for (var key of Object.keys(this.fields)) {
          let field = this.fields[key]

          errors.all = errors.all.concat(field.errors.all)
          errors[field.id] = field.errors.all
        }

        return errors
      },

      // Returns key/value pairs for fields and their values
      $values: function () {
        return Object.keys(this.fields).reduce((obj, fieldId) => {
          obj[fieldId] = this.fields[fieldId].value

          return obj
        }, {})
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

        return this.fields[fieldId].hasErrors
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
    created () {
      this.fields = this.schema.map(field => {
        if (field instanceof Field) {
          return field
        }

        return Field.create(field)
      }).map(field => {
        field.$form = this

        return field
      })
    }
  })

  Form.create = function (options) {
    return new Form({
      propsData: options
    })
  }
}

export {
  installForm,
  Form
}
