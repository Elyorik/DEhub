export async function mockAI(message: string) {
  await new Promise((r) => setTimeout(r, 600));
  return `🧪 Test (DEV)\n\nDu hast geschrieben:\n"${message}"`;
}
