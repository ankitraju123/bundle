import { json } from '@remix-run/node';
import { CollectionsModel } from "../models/collection"

export const action=async({params})=>{

    const { collectionId } = params

    // console.log(collectionId)

    const id= await CollectionsModel.findByIdAndDelete(collectionId)

    return json({message: 'Bundle deleted successfully'})
    



}