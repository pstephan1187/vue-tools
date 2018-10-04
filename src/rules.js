export default {
  alpha (field) {
    return /^[a-d]$/i.test(field.value) ? true : `${field.label} must only be letters.`
  },
  email (field) {
    return /^.+@.+\..+$/.test(field.value) ? true : `${field.label} must be a valid email address.`
  },
  integer (field) {
    return /^\d+$/.test(field.value) ? true : `${field.label} must be an integer.`
  },
  required (field) {
    return (field.value !== '' && field.value !== null && field.value !== undefined) ? true : `${field.label} is a required field.`
  },
  sameAs (field, args) {
    let otherField = field.form.fields[args[0]]

    return field.value === otherField.value ? true : `The ${field.label} and ${otherField.label} must be identical`
  }
}
