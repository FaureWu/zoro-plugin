export const noop = () => {}

export const isArray = arr => arr instanceof Array

export const isObject = obj =>
  obj !== null && typeof obj === 'object' && !isArray(obj)

export const isBoolean = bool => typeof bool === 'boolean'

export const isFunction = func => typeof func === 'function'

export const isString = str => typeof str === 'string'

export const assert = (validate, message) => {
  if (
    (isBoolean(validate) && !validate) ||
    (isFunction(validate) && !validate())
  ) {
    throw new Error(message)
  }
}

export const splitType = (type, divider = '/') => {
  const types = type.split(divider)
  assert(
    types.length > 1,
    `the model action type is not include the namespace, the type is ${type}`,
  )

  return {
    namespace: types.slice(0, types.length - 1).join(divider),
    type: types.slice(-1),
  }
}
