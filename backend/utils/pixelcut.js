import axios from 'axios';

const PIXELCUT_API_KEY = process.env.PIXELCUT_API_KEY;
const PIXELCUT_API_URL = 'https://api.developer.pixelcut.ai/v1/try-on';

const validateConfig = () => {
  if (!PIXELCUT_API_KEY) {
    throw new Error('PIXELCUT_API_KEY is not set in environment variables');
  }
};

export const generateTryOnImage = async (personImageUrl, garmentImageUrl) => {
  validateConfig();

  try {
    console.log('[Try-On] Starting virtual try-on generation...');
    console.log(`[Try-On] Person Image: ${personImageUrl}`);
    console.log(`[Try-On] Garment Image: ${garmentImageUrl}`);

    const response = await axios.post(
      PIXELCUT_API_URL,
      {
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
      },
      {
        headers: {
          'X-API-KEY': PIXELCUT_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'json', // Expect a JSON response
      }
    );

    if (response.data?.result_url) {
      console.log('[Try-On] Generation successful!');
      return response.data.result_url;
    } else {
      console.error('[Try-On] Generation failed: No image URL in response', response.data);
      throw new Error('Failed to generate try-on image. The API did not return a result.');
    }
  } catch (error) {
    console.error('[Try-On] Pixelcut API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    const errorMessage =
      error.response?.data?.message ||
      'Failed to generate try-on image due to an API error.';
      
    throw new Error(errorMessage);
  }
};
