/**
 * Utility function to help debug API responses
 */
export async function handleApiResponse(response: Response, errorPrefix: string): Promise<any> {
  if (!response.ok) {
    let errorMessage = `${errorPrefix}: ${response.status} ${response.statusText}`

    try {
      // Try to parse the error response as JSON
      const errorData = await response.json()
      console.error(`API Error Response:`, errorData)

      // Add more details if available
      if (errorData.message) {
        errorMessage += ` - ${errorData.message}`
      }
    } catch (e) {
      // If it's not JSON, try to get the text
      try {
        const errorText = await response.text()
        console.error(`API Error Text:`, errorText)
        if (errorText) {
          errorMessage += ` - ${errorText}`
        }
      } catch (textError) {
        // If we can't get the text either, just log the status
        console.error(`API Error (could not parse response):`, response.status, response.statusText)
      }
    }

    throw new Error(errorMessage)
  }

  return response.json()
}
