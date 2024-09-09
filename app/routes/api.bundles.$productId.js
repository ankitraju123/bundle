import { json } from '@remix-run/node';
import { CollectionsModel } from '../models/collection';
// import { ProductsModel } from '../models/product.js';

export const loader = async ({ request, params }) => {
  //  const _params = new URL(request.url)
  const { productId } = params
  const query = productId != 0 ? { _id: productId } : {}
  console.log("PARAMS", params)
  // console.log("QUERY", query)
  try {
    const bundles = await CollectionsModel.find(query);
    console.log("BUNDLES_FROM_BACKEND", bundles)
    return json(bundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return json({ error: 'Failed to fetch bundles.' }, { status: 500 });
  }
};
