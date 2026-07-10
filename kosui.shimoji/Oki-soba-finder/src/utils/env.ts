export function required(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable not set: ${name}`);
  }
  return value;
}
