const result = function (options, supportive) {
  if (typeof options === 'object') {
    return {
      passed: options.passed || false,
      message: options.message || null,
      required: options.required || false
    }
  } else if (options === true) {
    return {
      passed: true,
      message: null,
      required: supportive || false
    }
  } else if (options === false) {
    return {
      passed: false,
      message: supportive,
      required: false
    }
  }
};

const rules = {
  alpha (field) {
    if (!field.value) {
      return result(true)
    }

    return /^[a-d]$/i.test(field.value) ? result(true) : result(false, `${field.getErrorLabel()} must only be letters.`)
  },
  between (field, args) {
    if (!field.value) {
      return result(true)
    }

    let min = args[0] * 1;
    let max = args[1] * 1;

    return min <= field.value * 1 && field.value * 1 <= max ? result(true) : result(false, `${field.getErrorLabel()} must be between ${min} and ${max}`)
  },
  email (field) {
    if (!field.value) {
      return result(true)
    }

    return /^.+@.+\..+$/.test(field.value) ? result(true) : result(false, `${field.getErrorLabel()} must be a valid email address.`)
  },
  integer (field) {
    if (!field.value) {
      return result(true)
    }

    return /^\d+$/.test(field.value) ? result(true) : result(false, `${field.getErrorLabel()} must be an integer.`)
  },
  required (field) {
    return (field.value !== '' && field.value !== null && field.value !== undefined) ? result(true, true) : result({ passed: false, message: `${field.getErrorLabel()} is a required field.`, required: true })
  },
  requiredIf (field, args) {
    let requiredFieldId = args[0];

    // The other field is falsy, not required
    if (!field.$form.$fields[requiredFieldId].value) {
      return result(true)
    }

    // The other field is truthy and this field has a value
    if (rules.required(field) === true) {
      return result(true, true)
    }

    // This field has no value and the other field requires one
    return result({ passed: false, message: `${field.getErrorLabel()} is required.`, required: true })
  },
  sameAs (field, args) {
    if (!field.value) {
      return result(true)
    }

    let otherField = field.form.fields[args[0]];

    return field.value === otherField.value ? result(true) : result(false, `The ${field.getErrorLabel()} and ${otherField.getErrorLabel()} must be identical.`)
  }
};

let Field;

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
        let errorList = this.errorList.slice(0);

        let errors = {
          all: errorList.map(e => e.message),
          first: errorList.length > 0 ? errorList[0].message : null
        };

        return errors
      },

      // Returns true if there are any validation errors
      hasErrors () {
        return this.errorList.length > 0
      },

      validationResults () {
        let results = [];

        for (var rule of this.rules) {
          var func;
          var args;

          if (typeof rule === 'string') {
            // if the rule has any arguments, parse them
            if (rule.indexOf(':') !== -1) {
              var [rule, args] = rule.split(':');
              args = args.split(',');
            }

            func = rules[rule];
          } else if (typeof rule === 'function') {
            func = rule;
          }

          let result = func(this, args);

          results.push({
            rule: rule,
            passed: result.passed,
            message: result.message,
            required: result.required,
          });
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
        this.errorList = [];
      },

      // Runs all given validation rules against the field and stores
      // error messages. Useful for checking validity AND showing
      // errors
      validate () {
        this.clearErrors();

        let errors = this.validationResults.slice(0).filter(result => !result.passed);

        if (errors.length > 0) {
          this.errorList = errors.map(result => ({ rule: result.rule, message: result.message }));
        }
      }
    },
    watch: {
      value () {
        this.dirty = true;
      }
    }
  });

  Field.prototype.$form = null;

  Field.create = function (options) {
    return new Field({
      propsData: options
    })
  };
};

let Form;

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
        let fields = {};

        for (var field of this.fields) {
          fields[field.id] = field;
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
        };

        for (var key of Object.keys(this.fields)) {
          let field = this.fields[key];

          errors.all = errors.all.concat(field.errors.all);
          errors[field.id] = field.errors.all;
        }

        return errors
      },

      // Returns key/value pairs for fields and their values
      $values: function () {
        return Object.keys(this.fields).reduce((obj, fieldId) => {
          obj[fieldId] = this.fields[fieldId].value;

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
          this.fields[fieldID].validate();
        }
      },
      // Run every dirty field against it's validation rules
      validateAllDirty () {
        for (let fieldID of Object.keys(this.fields)) {
          let field = this.fields[fieldID];

          if (field.dirty) {
            field.validate();
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
        field.$form = this;

        return field
      });
    }
  });

  Form.create = function (options) {
    return new Form({
      propsData: options
    })
  };
};

let Step;

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
  });

  Step.prototype.$wizard = null;

  Step.create = function (options) {
    return new Step({
      propsData: options
    })
  };
};

let Wizard;

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
          this.currentStepIndex = 0;
        }
      },
      next () {
        if (++this.currentStepIndex >= this.steps.length) {
          this.currentStepIndex = this.steps.length - 1;

          this.onComplete();
        }
      },
      convertSchema () {
        this.steps = this.schema.map(step => {
          if (step instanceof Step) {
            return step
          }

          return Step.create({ form: step })
        }).map(step => {
          step.$wizard = this;

          return step
        });
      }
    },
    created () {
      this.convertSchema();

      this.$watch('schema', this.convertSchema);
    }
  });

  Wizard.create = function (options) {
    return new Wizard({
      propsData: options
    })
  };
};

const VueTools = {
  install: function (Vue, options) {
    this.form.install(Vue, options);
    this.wizard.install(Vue, options);
  },

  form: {
    install: function (Vue, options) {
      installForm(Vue, options);
      installField(Vue, options);
    }
  },

  wizard: {
    install: function (Vue, options) {
      installWizard(Vue, options);
      installStep(Vue, options);
    }
  }
};

export default VueTools;
export { Form, Field, Wizard, Step };
