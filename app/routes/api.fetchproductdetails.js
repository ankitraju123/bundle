// src/routes/api/fetchproductdetails.js
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  try {
    // Check if the request is of type POST and contains JSON body
    if (request.method !== 'POST') {
      return { status: 405, message: 'Method not allowed' }; // Only POST method is allowed
    }

    const requestBody = await request.json();

    const { productIds } = requestBody;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return { status: 400, message: 'No product IDs provided' };
    }

    // Fetch product details from Shopify admin GraphQL
    const { admin } = await authenticate.admin(); // Authenticate with Shopify admin API

    const queries = productIds.map((id, index) => `
      product${index}: product(id: "${id}") {
        title
        description
        onlineStoreUrl
        images(first: 1) {
          edges {
            node {
              src
            }
          }
        }
      }
    `);

    const query = `
      query {
        ${queries.join('\n')}
      }
    `;

    // Execute the Shopify admin GraphQL query
    const response = await admin.graphql(query);

    // Collect product details
    const fetchedProductDetails = productIds.map((_, index) => response.data[`product${index}`]);

    console.log("fetchedProductDetails", fetchedProductDetails);

    return { status: 200, data: fetchedProductDetails };
  } catch (error) {
    console.error('Server error:', error);
    return { status: 500, message: 'Server error', error };
  }
};
