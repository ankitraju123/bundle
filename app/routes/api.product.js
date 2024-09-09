import { json } from "@remix-run/node";
import { CollectionsModel } from '../models/collection';
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    const payload = await request.json();
    const { title, image, bunches, products, handle } = payload;

    // Create or update the bundle in the database
    const data = await CollectionsModel.findOneAndUpdate(
      { title },
      payload,
      { new: true, upsert: true }
    );


    const page = new admin.rest.resources.Page({ session: session });
    page.title = "title";
    page.body_html = `<h1>${title} Bundle</h1><p>Details about the ${title} bundle.</p>`;
    page.handle = `build-your-box/${title.toLowerCase().replace(/\s+/g, '-')}`; // Create a unique handle based on the bundle title

    await data.save({ update: true });

    return json({
      message: "Bundle saved and page created successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error creating or updating bundle and page:", error);
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
};
