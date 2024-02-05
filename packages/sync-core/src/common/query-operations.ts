export function notEqual(value: any) {
  return {
    type: "notEqual",
    value,
    operator: "!=",
  } as const;
}

export function lessThan(value: any) {
  return {
    type: "lessThan",
    operator: "<",
    value,
  } as const
}

export function greaterThan(value: any) {
  return {
    type: "greaterThan",
    operator: ">",
    value,
  } as const
}

export function lessThanOrEqual(value: any) {
  return {
    type: "lessThanOrEqual",
    operator: "<=",
    value,
  } as const
}

export function greaterThanOrEqual(value: any) {
  return {
    type: "greaterThanOrEqual",
    operator: ">=",
    value,
  } as const
}

// TODO add "OR"
// TODO add "in"