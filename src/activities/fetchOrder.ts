import axios from 'axios';
export * from './transform';
import { bulkOperationRunQuery, bulkOperation} from '../Queries/queries';


const host = 'vtldeveloper.myshopify.com';
const version = '2024-04';
const url = `https://${host}/admin/api/${version}`;
const accessToken = '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';
const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json'
};

export async function getOrdersByGraphQLStep1(updateTime: string): Promise<any> {
  const query = bulkOperationRunQuery(updateTime);
  const data = JSON.stringify({
      query: query,
      variables: {}
  });
  const response = await axios.post(`${url}/graphql.json`, data, { headers: headers });
  return response.data;
}

export async function getOrdersByGraphQLStep2(bulkOperationId: string): Promise<any> {
  const query = bulkOperation(bulkOperationId);
  const data = JSON.stringify({
      query: query,
      variables: {}
  });
  let response: any;
  try {
      response = await axios.post(`${url}/graphql.json`, data, { headers: headers });
      if (response?.data?.data?.node?.status !== 'COMPLETED') {
          throw new Error('Step 2 result is not completed yet, retrying...');
      }
  } catch (error) {
      throw error;
  }
  return response.data;
}

export async function getOrdersByGraphQLStep3(url: string): Promise<any> {
  const response = await axios.get(url);
  return response.data;
}
