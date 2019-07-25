import * as Z from '@opcjs/zoro';

export function assert(
  validate: boolean | Z.AssertValidate,
  message: string,
): void {
  if (
    (typeof validate === 'boolean' && !validate) ||
    (typeof validate === 'function' && !validate())
  ) {
    throw new Error(message);
  }
}

export function parseModelActionType(
  actionType: string,
  divider: string,
): Z.ModelType {
  const parts: string[] = actionType.split(divider);
  assert(parts.length >= 2, `invalid model action type, [${actionType}]`);

  return {
    namespace: parts.slice(0, parts.length - 1).join(divider),
    type: parts[parts.length - 1],
  };
}
