import {
  TextField,
  Button,
  DropZone,
  Thumbnail,
  Text,
  FormLayout,
  Page,
  LegacyCard,
  IndexTable,
  useIndexResourceState,
  ButtonGroup,
  Badge,
  BlockStack,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { NoteIcon } from "@shopify/polaris-icons";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import "../components/Bundle.css";
// import BundleTable from "../components/BundleTable.jsx";
import { useNavigate, useParams } from "@remix-run/react";

const animatedComponents = makeAnimated();

// export const loader = () => {}
// export const action = () => {}

function Bundle() {
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [editBundle, setEditBundle] = useState("");
  const [productTitles, setProductTitles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [productStatus, setProductStatus] = useState([]); // State to store product statuses
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState("");
  const [selectedBunches, setSelectedBunches] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [imageError, setImageError] = useState("");
  const [bunchesError, setBunchesError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [productIds, setProductIds] = useState([]); // State to store product IDs
  const [editingIndex, setEditingIndex] = useState(null); // Index of the product being edited
  const { collectionId } = useParams();
  const [productDetails, setProductDetails] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleBunchesChange = (selectedOptions) => {
    setSelectedBunches(selectedOptions || []);
  };

  const generateOptions = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  const fetchGraphQLData = async (productIds) => {
    const url =
      "https://greenchoice-flowers-subscriptions.myshopify.com/admin/api/2024-07/graphql.json";
    const accessToken = "shpua_56ce58d3b33a5c20bdb9979a75543557";

    const queries = productIds.map(
      (id, index) => `
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
    `,
    );

    const query = `
      query {
        ${queries.join("\n")}
      }
    `;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const fetchedProductDetails = productIds.map(
        (_, index) => result.data[`product${index}`],
      );
      setProductDetails(fetchedProductDetails);
    } catch (error) {
      console.error("Error fetching product details:", error);
      // setError("Failed to fetch product details");
    }
  };

  const resourcePicker = async (singleSelection = false) => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: !singleSelection,
        filter: {
          variants: false
        }
      });
      console.log(selected);

      const productTitles = selected.selection.map((product) => product.title);
      const productImages = selected.selection.map(
        (product) => product.images[0]?.originalSrc || "",
      );
      const productStatuses = selected.selection.map(
        (product) => product.status,
      ); // Get the status

      setProductTitles([...productTitles]);
      setProductImages([...productImages]);
      setProductStatus([...productStatuses]); // Set the status

      const ids = selected.selection.map((product) => product.id);
      setProductIds([...productIds, ...ids]);

      // fetchGraphQLData(ids);

      setCurrentPage(1); // Reset to the first page after new products are added
      return selected.selection; // Return the selected product(s)
    } catch (error) {
      console.error("Error picking resources:", error);
      setGeneralError("Failed to pick resources.");
      return null;
    }
  };

  const colourOptions = generateOptions();

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFiles((files) => [...files, ...acceptedFiles]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string representation of the image
      };
      reader.readAsDataURL(acceptedFiles[0]);
    },
    [],
  );

  useEffect(() => {
    console.log("COLLECTION_ID", collectionId)
    if (collectionId) {
      console.log("running");
      const fetchBundle = async () => {
        try {
          const response = await fetch(`/api/bundles/${collectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const [bundle] = await response.json(); // Assuming it returns an array of bundles
          console.log("BUNDLE_FETCHED_SINGLE", bundle);

          if (bundle) {
            setTitle(bundle.title);
            // Set other state variables if needed
            setHandle(bundle.handle);
            setProductImages(bundle.images || []); // Example: Set images if available
            setSelectedBunches(
              bundle.bunches.map((bunch) => ({ value: bunch, label: bunch })),
            ); // Example: Set bunches
            fetchGraphQLData(bundle.productIds || []);
          } else {
            console.error("Bundle not found");
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchBundle();
    }
    return () => console.log("BUNDLE_UNMOUNTED");
  }, [collectionId]);

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFiles = files.length > 0 && (
    <div className="image-container" style={{ padding: "0" }}>
      {files.map((file, index) => (
        <div key={index}>
          <img
            src={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
            height={300}
            width={500}
            alt="Logo"
          />
          <div>
            <Text>{file.name}</Text>
            <Text variant="bodySm">{file.size} bytes</Text>
          </div>
        </div>
      ))}
    </div>
  );

  const handleTitleChange = useCallback((newValue) => setTitle(newValue), []);

  const handleHandleChange = useCallback((newValue) => setHandle(newValue), []);

  const handleSubmit = async () => {
    let valid = true;

    if (!title.trim()) {
      setTitleError("Title is required.");
      valid = false;
    } else {
      setTitleError("");
    }

    if (!image) {
      setImageError("An image is required.");
      valid = false;
    } else {
      setImageError("");
    }

    if (selectedBunches.length === 0) {
      setBunchesError("At least one bunch must be selected.");
      valid = false;
    } else {
      setBunchesError("");
    }

    if (!valid) {
      return;
    }

    if (editingIndex !== null) {
      // Update existing product data
      const updatedTitles = [...productTitles];
      const updatedImages = [...productImages];
      const updatedStatuses = [...productStatus]; // Update statuses

      updatedTitles[editingIndex] = title;
      updatedImages[editingIndex] = image;
      updatedStatuses[editingIndex] = productStatus[editingIndex]; // Ensure status remains the same

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);
      setProductStatus(updatedStatuses);
      setEditingIndex(null);
    } else {
      // Add new product data
      try {
        const response = await fetch("/api/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            image,
            bunches: selectedBunches.map((option) => option.value),
            products: productIds,
            handle,
          }),
        });

        if (response.ok) {
          console.log("Product saved successfully!");

          setTitle("");
          setFiles([]);
          setImage("");
          setHandle("");
          setSelectedBunches([]);
          setProductIds([]);
          setGeneralError("");
        } else {
          console.error("Failed to save product");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  const handleEdit = async (index) => {
    console.log("Edit product:", index);
    setEditingIndex(index);

    console.log("Edit product:", index);
    const selectedProduct = await resourcePicker(true); // Open resource picker with single selection

    if (selectedProduct && selectedProduct.length > 0) {
      const updatedTitles = [...productTitles];
      const updatedImages = [...productImages];

      updatedTitles[index] = selectedProduct[0].title;
      updatedImages[index] = selectedProduct[0].images[0]?.originalSrc || "";

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);
    }

    // // Set form fields with the selected product data for editing
    // setTitle(productTitles[index]);
    // setHandle(handle); // Assuming handle is not stored in arrays; it may need to be adjusted
    // setImage(productImages[index]);
    // setProductStatus(productStatus[index]);

    // // Optionally pre-select the bunches
    // const selectedBunchesForEdit = []; // Fetch bunches related to this product if needed
    // setSelectedBunches(selectedBunchesForEdit);
  };

  const handleDelete = (index) => {
    const updatedTitles = [...productTitles];
    const updatedImages = [...productImages];
    const updatedStatuses = [...productStatus]; // Update statuses
    updatedTitles.splice(index, 1);
    updatedImages.splice(index, 1);
    updatedStatuses.splice(index, 1); // Remove status

    setProductTitles(updatedTitles);
    setProductImages(updatedImages);
    setProductStatus(updatedStatuses);
  };

  // Pagination functions
  const totalPages = Math.ceil(productTitles.length / itemsPerPage);

  const paginatedProductTitles = productTitles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const paginatedProductImages = productImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const paginatedProductStatuses = productStatus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // IndexTable setup
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(productIds);

  const rows = paginatedProductTitles.map((title, index) => (
    <IndexTable.Row
      id={index.toString()}
      key={index}
      selected={selectedResources.includes(index.toString())}
      position={index}
    >
      <IndexTable.Cell>{index + 1}</IndexTable.Cell>
      <IndexTable.Cell>
        <Thumbnail source={paginatedProductImages[index]} alt={title} />
      </IndexTable.Cell>
      <IndexTable.Cell>{title}</IndexTable.Cell>
      <IndexTable.Cell>{paginatedProductStatuses[index]}</IndexTable.Cell>
      <IndexTable.Cell>
        <Button onClick={() => handleEdit(index)}>Edit</Button>
        <Button onClick={() => handleDelete(index)}>Delete</Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <>
      <Page
        backAction={{ content: 'Collections', url: '/app/collections' }}
        title="Create a Collection for Boxes"
        compactTitle
        primaryAction={{ content: 'Save', onAction: handleSubmit }}
      >
        <LegacyCard title="Add below details" sectioned>
          <BlockStack gap="500">
            <TextField
              label="Title"
              value={title}
              onChange={handleTitleChange}
              error={titleError}
            />

            <TextField
              label="Handle"
              value={handle}
              onChange={handleHandleChange}
            />

            <div>
              <Text>Upload Image for Collection</Text>
              <DropZone onDrop={handleDropZoneDrop} accept="image/*" type="image">
                {uploadedFiles}
                {fileUpload}
              </DropZone>
              {imageError && <Text color="red">{imageError}</Text>}
            </div>

            <div>
              <Text>Select Number of Bunches</Text>
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                options={colourOptions}
                value={selectedBunches}
                onChange={handleBunchesChange}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: bunchesError ? "red" : base.borderColor,
                  }),
                }}
              />
            </div>
            <div>
              <Button onClick={() => resourcePicker(false)}>Choose Products for this Collection</Button>
            </div>
            <IndexTable
              resourceName={resourceName}
              itemCount={productTitles.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "ID" },
                { title: "Image" },
                { title: "Title" },
                { title: "Status" },
                { title: "Actions" },
              ]}
              bulkActions={[]}
              pagination={{
                hasNext: true,
                hasPrevious: true,
                onNext: () => handleNextPage,
                onPrevious: () => handlePreviousPage
              }}
            >
              {rows}
            </IndexTable>
          </BlockStack>
        </LegacyCard>

        {/* <Page>
          <FormLayout>
            {generalError && (
              <LegacyCard sectioned title="Error">
                <Text color="red">{generalError}</Text>
              </LegacyCard>
            )}

            <Button onClick={() => resourcePicker(false)}>Pick Resource</Button>




            {bunchesError && <Text color="red">{bunchesError}</Text>}
            <ButtonGroup>
              <Button onClick={handleSubmit} variant="primary">
                Save Bundle
              </Button>
              <Button onClick={() => navigate("/app")}>Back</Button>
            </ButtonGroup>
          </FormLayout>

          <LegacyCard>
            <IndexTable
              resourceName={resourceName}
              itemCount={productTitles.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "ID" },
                { title: "Image" },
                { title: "Title" },
                { title: "Status" },
                { title: "Actions" },
              ]}
              bulkActions={[]}
            >
              {rows}
            </IndexTable>
            <div className="pagination">
              <Button
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
              >{`<`}</Button>
              <Text variant="bodyMd">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >{`>`}</Button>
            </div>
          </LegacyCard>
        </Page> */}
      </Page>
    </>
  )

}

export default Bundle;
