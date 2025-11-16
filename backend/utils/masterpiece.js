import axios from 'axios';

const MASTERPIECE_API_URL = process.env.MASTERPIECE_X_API_URL;
const MASTERPIECE_API_KEY = process.env.MASTERPIECE_X_API_KEY;
const POLL_INTERVAL = parseInt(process.env.MASTERPIECE_POLL_INTERVAL_MS) || 5000;
const MAX_POLL_ATTEMPTS = parseInt(process.env.MASTERPIECE_MAX_POLL_ATTEMPTS) || 240;
const REQUEST_TIMEOUT = parseInt(process.env.MASTERPIECE_REQUEST_TIMEOUT_MS) || 30000;

export const generate3DModel = async (imageUrl, productId) => {
  if (!process.env.ENABLE_3D_GENERATION || process.env.ENABLE_3D_GENERATION !== 'true') {
    throw new Error('3D generation is disabled');
  }

  try {
    // Step 1: Create generation request
    const createResponse = await axios.post(
      `${MASTERPIECE_API_URL}/generations`,
      {
        prompt: `Generate a 3D model from this product image: ${imageUrl}`,
        image_url: imageUrl,
        model: '3d-model',
        parameters: {
          quality: 'high',
          format: 'glb'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MASTERPIECE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    const generationId = createResponse.data.id || createResponse.data.generation_id;
    
    if (!generationId) {
      throw new Error('Failed to get generation ID from Masterpiece X API');
    }

    // Step 2: Poll for completion
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
      try {
        const statusResponse = await axios.get(
          `${MASTERPIECE_API_URL}/generations/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${MASTERPIECE_API_KEY}`
            },
            timeout: REQUEST_TIMEOUT
          }
        );

        const status = statusResponse.data.status || statusResponse.data.state;
        
        if (status === 'completed' || status === 'success') {
          const modelUrl = statusResponse.data.output?.url || 
                          statusResponse.data.result?.url || 
                          statusResponse.data.model_url;
          
          return {
            generationId,
            status: 'completed',
            modelUrl,
            metadata: statusResponse.data
          };
        }
        
        if (status === 'failed' || status === 'error') {
          throw new Error(statusResponse.data.error || '3D model generation failed');
        }

        attempts++;
      } catch (pollError) {
        if (pollError.response?.status === 404) {
          // Generation not found, might still be processing
          attempts++;
          continue;
        }
        throw pollError;
      }
    }

    throw new Error('3D model generation timeout - exceeded maximum poll attempts');
  } catch (error) {
    console.error('Masterpiece X API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to generate 3D model');
  }
};

export const checkGenerationStatus = async (generationId) => {
  try {
    const response = await axios.get(
      `${MASTERPIECE_API_URL}/generations/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${MASTERPIECE_API_KEY}`
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    return {
      status: response.data.status || response.data.state,
      modelUrl: response.data.output?.url || response.data.result?.url || response.data.model_url,
      metadata: response.data
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to check generation status');
  }
};

