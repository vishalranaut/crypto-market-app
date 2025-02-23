import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Create an Axios instance with default headers
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiCallProps {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export const apiCall = async ({
  url,
  method,
  data = {},
  params = {},
  headers = {},
}: ApiCallProps): Promise<any> => {
  console.log(`📡 API Call: ${method} ${url}`);

  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      data: Object.keys(data).length ? data : undefined,
      params: Object.keys(params).length ? params : undefined,
      headers: { ...headers },
    };

    const response: AxiosResponse = await api.request(config);

    console.log('✅ API call successful:', response.data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(
        '❌ API call failed:',
        error.response ? error.response.data : 'No response received'
      );
      throw new Error(error.response?.data?.message || 'API request failed');
    } else {
      console.error('❌ Unexpected error:', error.message);
      throw new Error('Unexpected API error');
    }
  }
};
