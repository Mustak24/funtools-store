export default function UUIDGenerator() {
  const idSet = new Set<string>();

  function generate(): string {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (idSet.has(id)) {
      return generate();
    }

    idSet.add(id);
    return id;
  }

  return generate;
};