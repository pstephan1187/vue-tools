const rules = {
  alpha (field) {
    if (!field.value) {
      return true
    }

    return /^[a-d]$/i.test(field.value) ? true : `${field.errorLabel} must only be letters.`
  },
  email (field) {
    if (!field.value) {
      return true
    }

    return /^.+@.+\..+$/.test(field.value) ? true : `${field.errorLabel} must be a valid email address.`
  },
  integer (field) {
    if (!field.value) {
      return true
    }

    return /^\d+$/.test(field.value) ? true : `${field.errorLabel} must be an integer.`
  },
  required (field) {
    return (field.value !== '' && field.value !== null && field.value !== undefined) ? true : `${field.errorLabel} is a required field.`
  },
  requiredIf (field, args) {
    let requiredFieldId = args[0];

    if (!field.form.fields[requiredFieldId].value) {
      return true
    }

    if (rules.required(field) === true) {
      return true
    }

    return `${field.errorLabel} is required.`
  },
  sameAs (field, args) {
    if (!field.value) {
      return true
    }

    let otherField = field.form.fields[args[0]]

    return field.value === otherField.value ? true : `The ${field.errorLabel} and ${otherField.errorLabel} must be identical.`
  }
}

export default rules
