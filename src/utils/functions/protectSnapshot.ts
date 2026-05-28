export default function protectSnapshot(data: any) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  return new Proxy(data, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      return protectSnapshot(value);
    },
    set(_, prop) {
      console.warn(`Mutation blocked: Direct write to store sector property "${String(prop)}" is forbidden.`);
      return false; 
    },
    deleteProperty(_, prop) {
      console.warn(`Mutation blocked: Cannot delete property "${String(prop)}".`);
      return false;
    }
  });
}
