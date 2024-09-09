import React, { useEffect, useState ,useCallback} from 'react';
import { IndexTable, Card, Page, Button, Thumbnail, Text, Modal, FormLayout, TextField, InlineStack, ButtonGroup,Toast,Frame,TextContainer } from '@shopify/polaris';
import { useNavigate, useParams, } from '@remix-run/react';



export default function CollectionsTable({ productId }) {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateBundle, setShowCreateBundle] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBundle, setEditingBundle] = useState(null);
    const [title, setTitle] = useState('');
    const [bunches, setBunches] = useState('');
    const [image, setImage] = useState('');
    const navigate = useNavigate()

// -----------------Delete Modal---------------------------------

    const [deleteModalactive, setDeleteModalActive] = useState(false);

  
  
    const handleChange = useCallback(() => setDeleteModalActive(!deleteModalactive), [deleteModalactive]);

    // const activator = <Button onClick={handleChange}>Open</Button>;
    // const activator = <Button onClick={handleChange}>Open</Button>;



    const handleCreateBundle = () => setShowCreateBundle(true);





    // -----------------Delete Toast---------------------------------

    const [active, setActive] = useState(false);

    const toggleActive = useCallback(() => setActive((active) => !active), []);
  
    const toastMarkup = active ? (
      <Toast content="Deleted Successfully" onDismiss={toggleActive} />
    ) : null;

    const handleEditBundle = (bundle) => {
        // setEditingBundle(bundle);
        // setTitle(bundle.title);
        // setBunches(bundle.bunches.join(', '));
        // setImage(bundle.image);
        // setShowEditModal(true);
        console.log("INSIDE_BUNDLE_PRODUCT", bundle)
        return navigate(`/app/collection/create/${bundle._id}`)
    };

    const handleDeleteBundle = async (bundleId) => {
      
            try {
                const response = await fetch(`/api/bundles/delete/${bundleId}`, {
                    method: 'DELETE',
            
                });

                if (response.ok) {
                    setBundles(bundles.filter((bundle) => bundle._id !== bundleId));
                } else {
                    const error = await response.json();
                    console.error('Failed to delete bundle:', error.error);
                }

                // const handleChange = useCallback(() => setActive(!active), [active]);
                handleChange()
               

                toggleActive()
            } catch (error) {
                console.error('Failed to delete bundle:', error);
            }
        
    };


    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const response = await fetch(`/api/bundles`);
                const data = await response.json();
                setBundles(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch bundles:', error);
                setLoading(false);
            }
        };

        fetchBundles();
    }, [productId]);

    const resourceName = {
        singular: 'bundle',
        plural: 'bundles',
    };

    const rowMarkup = bundles.map((bundle, index) => (
        <IndexTable.Row
            id={bundle._id}
            key={bundle._id}
            position={index}
        >
            <IndexTable.Cell>
                <Thumbnail source={bundle.image} alt={bundle.title} />
            </IndexTable.Cell>
            <IndexTable.Cell>{bundle.title}</IndexTable.Cell>
            <IndexTable.Cell>{bundle.bunches.join(', ')}</IndexTable.Cell>
            <IndexTable.Cell>{bundle.products.length}</IndexTable.Cell>
            <IndexTable.Cell>{new Date(bundle.createdAt).toLocaleString()}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button onClick={() => handleEditBundle(bundle)}>Edit</Button>
                <Button destructive onClick={() => handleDeleteBundle(bundle._id)}>Delete</Button>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
       
        <Frame>
        <Page title="All Collections">
            <Card>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={bundles.length}
                    loading={loading}
                    headings={[
                        { title: 'Image' },
                        { title: 'Title' },
                        { title: 'Bunches' },
                        { title: 'Products' },
                        { title: 'Created At' },
                        { title: 'Actions' },
                    ]}
                >
                    {rowMarkup}
                </IndexTable>
                <InlineStack align="end">
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => navigate(`/app/collection/create/0`)}
                            accessibilityLabel="Add tracking number"
                        >
                            Create a Collection
                        </Button>
                    </ButtonGroup>
                </InlineStack>
            </Card>
            {toastMarkup}
        </Page>
        </Frame>
        
    
       
    );
}
