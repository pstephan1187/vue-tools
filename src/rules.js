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
}

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

    let min = args[0] * 1
    let max = args[1] * 1

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

    let otherField = field.form.fields[args[0]]

    return field.value === otherField.value ? result(true) : result(false, `The ${field.getErrorLabel()} and ${otherField.getErrorLabel()} must be identical.`)
  }
}

export default rules
