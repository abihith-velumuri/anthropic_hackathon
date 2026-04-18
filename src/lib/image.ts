export async function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  const mediaType = file.type || 'image/jpeg'
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
  const base64 = dataUrl.split(',')[1] ?? ''
  return { base64, mediaType }
}
