export async function parseUpload(request: Request): Promise<{ file: File; filename: string } | null> {
  const formData = await request.formData();
  const file = formData.get('file');
  const filename = formData.get('filename');

  if (!(file instanceof File) || typeof filename !== 'string') return null;

  return { file, filename };
}