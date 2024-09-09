import { json } from '@remix-run/node';
import { CollectionsModel } from '../models/collection';

export const loader = async ({ request }) => {
  try {
    const bundles = await CollectionsModel.find({});
    return json(bundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return json({ error: 'Failed to fetch bundles.' }, { status: 500 });
  }
};
