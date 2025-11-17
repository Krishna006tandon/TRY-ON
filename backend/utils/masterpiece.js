import axios from 'axios';

const MASTERPIECE_API_URL = process.env.MASTERPIECE_X_API_URL;
const MASTERPIECE_API_KEY = process.env.MASTERPIECE_X_API_KEY;
const MASTERPIECE_APP_ID = process.env.MASTERPIECE_X_APP_ID; // Optional App ID
const POLL_INTERVAL = parseInt(process.env.MASTERPIECE_POLL_INTERVAL_MS) || 5000;
const MAX_POLL_ATTEMPTS = parseInt(process.env.MASTERPIECE_MAX_POLL_ATTEMPTS) || 240;
const REQUEST_TIMEOUT = parseInt(process.env.MASTERPIECE_REQUEST_TIMEOUT_MS) || 30000;

// Validate configuration
const validateConfig = () => {
  if (!MASTERPIECE_API_URL) {
    throw new Error('MASTERPIECE_X_API_URL is not set in environment variables');
  }
  if (!MASTERPIECE_API_KEY) {
    throw new Error('MASTERPIECE_X_API_KEY is not set in environment variables');
  }
  if (!process.env.ENABLE_3D_GENERATION || process.env.ENABLE_3D_GENERATION !== 'true') {
    throw new Error('3D generation is disabled (ENABLE_3D_GENERATION is not set to "true")');
  }
};

// Helper function to get headers with optional App ID
const getHeaders = () => {
  const headers = {
    'Authorization': `Bearer ${MASTERPIECE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Add App ID header if provided
  if (MASTERPIECE_APP_ID) {
    headers['X-App-Id'] = MASTERPIECE_APP_ID;
  }
  
  return headers;
};

export const generate3DModel = async (imageUrl, productId) => {
  // Validate configuration first
  validateConfig();

  if (!imageUrl) {
    throw new Error('Image URL is required for 3D model generation');
  }

  console.log(`[3D Generation] Starting 3D model generation for product ${productId}`);
  console.log(`[3D Generation] Image URL: ${imageUrl}`);
  console.log(`[3D Generation] API URL: ${MASTERPIECE_API_URL}`);

  try {
    // Step 1: Create generation request
    // Correct endpoint: /v2/functions/imageto3d
    const endpoint = `${MASTERPIECE_API_URL}/functions/imageto3d`;
    
    // Request payload according to Masterpiece X API documentation
    const requestPayload = {
      imageUrl: imageUrl,
      textureSize: 1024, // Default texture size (can be 256, 512, 1024, 2048)
      seed: 1 // Default seed
    };

    console.log(`[3D Generation] Sending request to: ${endpoint}`);
    console.log(`[3D Generation] Request payload:`, JSON.stringify(requestPayload, null, 2));

    const createResponse = await axios.post(
      endpoint,
      requestPayload,
      {
        headers: getHeaders(),
        timeout: REQUEST_TIMEOUT
      }
    );

    console.log(`[3D Generation] Create response status: ${createResponse.status}`);
    console.log(`[3D Generation] Create response data:`, JSON.stringify(createResponse.data, null, 2));

    // Extract requestId from response (according to API docs)
    const requestId = createResponse.data?.requestId || 
                     createResponse.data?.request_id ||
                     createResponse.data?.id ||
                     createResponse.data?.data?.requestId;
    
    if (!requestId) {
      console.error('[3D Generation] Response structure:', JSON.stringify(createResponse.data, null, 2));
      throw new Error(`Failed to get requestId from Masterpiece X API. Response: ${JSON.stringify(createResponse.data)}`);
    }

    console.log(`[3D Generation] Request ID received: ${requestId}`);

    // Step 2: Wait a moment for the request to be registered, then find the correct status endpoint
    // The status endpoint might not be immediately available after creation
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    // Find the correct status endpoint (try once, then cache it)
    const baseUrl = MASTERPIECE_API_URL.endsWith('/v2') 
      ? MASTERPIECE_API_URL.replace('/v2', '') 
      : MASTERPIECE_API_URL.replace(/\/v2\/?$/, '');
    
    const statusEndpoints = [
      `${baseUrl}/v2/status/${requestId}`,                    // Most likely - separate status endpoint
      `${MASTERPIECE_API_URL}/status/${requestId}`,          // With /v2 in base URL
      `${baseUrl}/v2/functions/imageto3d/status/${requestId}`, // Status sub-endpoint
      `${MASTERPIECE_API_URL}/functions/imageto3d/${requestId}`, // Original attempt
      `${baseUrl}/v2/requests/${requestId}`,                 // Alternative pattern
      `${MASTERPIECE_API_URL}/requests/${requestId}`         // Alternative with /v2
    ];

    // Find working status endpoint
    let workingStatusUrl = null;
    for (const url of statusEndpoints) {
      try {
        console.log(`[3D Generation] Testing status endpoint: ${url}`);
        const testResponse = await axios.get(
          url,
          {
            headers: getHeaders(),
            timeout: REQUEST_TIMEOUT,
            validateStatus: (status) => status < 500
          }
        );
        
        if (testResponse.status < 300) {
          workingStatusUrl = url.replace(`/${requestId}`, '/{requestId}'); // Store pattern
          console.log(`[3D Generation] Found working status endpoint: ${url}`);
          break;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          continue; // Try next endpoint
        }
        // For other 4xx errors, continue trying
        if (err.response?.status < 500) {
          continue;
        }
        // For 5xx errors, log but continue
        console.warn(`[3D Generation] Error testing endpoint ${url}: ${err.message}`);
        continue;
      }
    }

    if (!workingStatusUrl) {
      throw new Error('Could not find valid status endpoint. Tried all possible endpoints.');
    }

    // Step 3: Poll for completion using the working endpoint
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      
      try {
        console.log(`[3D Generation] Polling attempt ${attempts + 1}/${MAX_POLL_ATTEMPTS} for request ${requestId}`);
        
        // Use the working endpoint pattern, replacing {requestId} with actual ID
        const statusUrl = workingStatusUrl.replace('{requestId}', requestId);
        
        const statusResponse = await axios.get(
          statusUrl,
          {
            headers: getHeaders(),
            timeout: REQUEST_TIMEOUT
          }
        );

        const responseData = statusResponse.data;
        const status = responseData?.status || 
                      responseData?.state || 
                      responseData?.data?.status;
        
        console.log(`[3D Generation] Current status: ${status}`);
        console.log(`[3D Generation] Status response:`, JSON.stringify(responseData, null, 2));
        
        if (status === 'complete' || status === 'completed' || status === 'success' || status === 'done' || status === 'finished') {
          // Masterpiece X API returns outputs in outputs.glb, outputs.fbx, etc.
          // Prefer GLB format for 3D models
          const modelUrl = responseData?.outputs?.glb ||
                          responseData?.outputs?.fbx ||
                          responseData?.outputs?.usdz ||
                          responseData?.output?.glb ||
                          responseData?.output?.url || 
                          responseData?.output?.modelUrl ||
                          responseData?.output?.model_url ||
                          responseData?.result?.url || 
                          responseData?.result?.modelUrl ||
                          responseData?.result?.model_url ||
                          responseData?.modelUrl ||
                          responseData?.model_url ||
                          responseData?.url ||
                          responseData?.data?.url ||
                          responseData?.data?.output?.url ||
                          responseData?.data?.outputs?.glb ||
                          responseData?.data?.modelUrl;
          
          if (!modelUrl) {
            console.error('[3D Generation] Status is complete but no model URL found');
            console.error('[3D Generation] Full response:', JSON.stringify(responseData, null, 2));
            throw new Error('3D model generation completed but no model URL was returned');
          }

          console.log(`[3D Generation] Success! Model URL: ${modelUrl}`);
          
          return {
            generationId: requestId,
            status: 'completed',
            modelUrl,
            metadata: responseData
          };
        }
        
        if (status === 'failed' || status === 'error' || status === 'failure') {
          const errorMsg = responseData?.error || 
                          responseData?.message || 
                          responseData?.error_message ||
                          responseData?.errorMessage ||
                          '3D model generation failed';
          console.error(`[3D Generation] Generation failed: ${errorMsg}`);
          throw new Error(errorMsg);
        }

        // If status is 'pending', 'processing', 'in_progress', 'queued', continue polling
        if (status === 'pending' || status === 'processing' || status === 'in_progress' || status === 'queued' || status === 'running') {
          attempts++;
          continue;
        }

        // Unknown status - log warning but continue polling (might be a new status we haven't seen)
        if (status) {
          console.warn(`[3D Generation] Unknown status: ${status}, continuing to poll...`);
        } else {
          console.warn(`[3D Generation] No status found in response, continuing to poll...`);
        }
        attempts++;
      } catch (pollError) {
        if (pollError.response?.status === 404) {
          // Generation not found, might still be processing
          console.log(`[3D Generation] Generation not found (404), continuing to poll...`);
          attempts++;
          continue;
        }
        
        // Log the error but don't fail immediately
        console.error(`[3D Generation] Poll error (attempt ${attempts + 1}):`, {
          message: pollError.message,
          status: pollError.response?.status,
          data: pollError.response?.data
        });
        
        // If it's a 5xx error, continue polling
        if (pollError.response?.status >= 500) {
          attempts++;
          continue;
        }
        
        throw pollError;
      }
    }

    throw new Error(`3D model generation timeout - exceeded maximum poll attempts (${MAX_POLL_ATTEMPTS})`);
  } catch (error) {
    console.error('[3D Generation] Masterpiece X API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });
    
    // Provide more detailed error message
    let errorMessage = 'Failed to generate 3D model';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `API Error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from Masterpiece X API. Please check your network connection and API URL.';
    } else {
      // Error in request setup
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const checkGenerationStatus = async (generationId) => {
  validateConfig();
  
  if (!generationId) {
    throw new Error('Generation ID is required');
  }

  try {
    console.log(`[3D Generation] Checking status for generation: ${generationId}`);
    
    // Try different status endpoint patterns
    const baseUrl = MASTERPIECE_API_URL.endsWith('/v2') 
      ? MASTERPIECE_API_URL.replace('/v2', '') 
      : MASTERPIECE_API_URL.replace(/\/v2\/?$/, '');
    
    const statusEndpoints = [
      `${baseUrl}/v2/status/${generationId}`,
      `${MASTERPIECE_API_URL}/status/${generationId}`,
      `${baseUrl}/v2/functions/imageto3d/status/${generationId}`,
      `${MASTERPIECE_API_URL}/functions/imageto3d/${generationId}`,
      `${baseUrl}/v2/requests/${generationId}`,
      `${MASTERPIECE_API_URL}/requests/${generationId}`
    ];

    let response;
    for (const url of statusEndpoints) {
      try {
        response = await axios.get(
          url,
          {
            headers: getHeaders(),
            timeout: REQUEST_TIMEOUT,
            validateStatus: (status) => status < 500
          }
        );
        if (response.status < 300) {
          break;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          continue;
        }
        if (err.response?.status < 500) {
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw new Error('Could not find valid status endpoint for generation ID');
    }

    const responseData = response.data;
    const status = responseData?.status || 
                  responseData?.state || 
                  responseData?.data?.status;
    
    const modelUrl = responseData?.output?.url || 
                    responseData?.output?.modelUrl ||
                    responseData?.output?.model_url ||
                    responseData?.result?.url || 
                    responseData?.result?.modelUrl ||
                    responseData?.result?.model_url ||
                    responseData?.modelUrl ||
                    responseData?.model_url ||
                    responseData?.url ||
                    responseData?.data?.url ||
                    responseData?.data?.output?.url ||
                    responseData?.data?.modelUrl;

    return {
      status: status || 'unknown',
      modelUrl: modelUrl || null,
      metadata: responseData
    };
  } catch (error) {
    console.error('[3D Generation] Status check error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to check generation status';
    
    throw new Error(errorMessage);
  }
};

