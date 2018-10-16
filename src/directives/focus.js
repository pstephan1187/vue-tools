export default {
  inserted (el, { value }) {
    if (value === true || value === undefined) {
      el.focus()
    }
  }
}
