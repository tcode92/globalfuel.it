export function getFormDataFromEvent<T>(e: React.FormEvent<HTMLFormElement>) {
  let obj: { [k: string]: string | object } = {};
  const f = e.target as HTMLFormElement;
  const inputTargets = Array.from(f.querySelectorAll("[name]"));
  for (const i of inputTargets) {
    let n = i.getAttribute("name");
    if (n) {
      if (
        i instanceof HTMLInputElement ||
        i instanceof HTMLTextAreaElement ||
        i instanceof HTMLSelectElement
      ) {
        if (n.includes(".")) {
          buildRecursiveDotObj(obj, n, i.value);
        } else {
          obj[n] = i.value;
        }
      }
    }
  }
  return obj as T;
}

type customObject = { [k: string | number | symbol]: any };
function buildRecursiveDotObj(obj: customObject, keys: string, value: any) {
  const parts = keys.split(".");
  if (parts.length === 1) {
    obj[parts[0]] = value;
    return;
  }
  const mainKey = parts[0];
  let result: customObject = {};
  let curr = result;
  for (let i = 1; i < parts.length; i++) {
    const k = parts[i];
    if (i === parts.length - 1) {
      curr[k] = value;
    } else {
      curr[k] = {};
      curr = curr[k];
    }
  }
  obj[mainKey] = obj[mainKey] ? Object.assign(obj[mainKey], result) : result;
  return;
}
