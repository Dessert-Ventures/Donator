export function validateEmail(input?: string) {
  if (
    input &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      input
    )
  ) {
    return true
  }
  return false
}

export function validateAmount(input?: string) {
  if (!input) return false

  const inputAsNumber = parseInt(input)
  if (isNaN(inputAsNumber)) return false

  if (inputAsNumber <= 0) return false

  return true
}
