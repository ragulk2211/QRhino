import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  message,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Typography,
  Spin,
  Image,
  Alert,
  Tooltip,
  ConfigProvider,
  Modal,
  Flex
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined,
  PictureOutlined,
  FireOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TagOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  EditOutlined,
  PlusOutlined,
  HomeOutlined,
  MenuOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  PercentageOutlined,
  StarOutlined,
  RocketOutlined,
  EnterOutlined,
  HeartOutlined,
  CoffeeOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/addMenuItem.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function AddMenuItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    kcal: "",
    time: "",
    category: "",
    foodType: "veg",
    restaurantId: ""
  });

  const [messageApi, contextHolder] = message.useMessage();
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);
  const discountRef = useRef(null);
  const kcalRef = useRef(null);
  const timeRef = useRef(null);
  const categoryRef = useRef(null);
  const foodTypeRef = useRef(null);

  // Get the previous page from location state
  const fromPage = location.state?.from || "/admin";

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Smart back navigation function
  const handleGoBack = () => {
    if (fromPage === "/menu") {
      navigate("/menu/main");
    } else {
      navigate("/admin");
    }
  };

  const handleImageUpload = useCallback((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      messageApi.error('Please upload an image file (JPEG, PNG, WEBP)!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      messageApi.error('Image must be smaller than 5MB!');
      return false;
    }

    setUploading(true);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setPreviewImage(e.target.result);
      setUploading(false);
      messageApi.success("Image uploaded successfully!");
    };
    reader.onerror = () => {
      messageApi.error("Failed to read image file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    
    return false;
  }, [messageApi]);

  const handleChangeImage = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    fileInput.click();
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    Modal.confirm({
      title: 'Remove Image',
      content: 'Are you sure you want to remove this image?',
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: () => {
        setImageFile(null);
        setImagePreview("");
        setPreviewImage("");
        messageApi.info("Image removed");
      }
    });
  }, [messageApi]);

  const validateText = (value, fieldName, minLength = 2, maxLength = 50) => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    if (value.trim().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    if (value.trim().length > maxLength) {
      return `${fieldName} must be less than ${maxLength} characters`;
    }
    return null;
  };

  const validateNumber = (value, fieldName, min = 0, max = Infinity, required = false) => {
    if (value === undefined || value === null || value === "") {
      if (required) {
        return `${fieldName} is required`;
      }
      return null;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (numValue > max) {
      return `${fieldName} must be less than ${max}`;
    }
    return null;
  };

  const validateForm = useCallback((values) => {
    const errors = {};
    
    if (!values.restaurantId) {
      errors.restaurantId = "Please select a restaurant";
    }
    
    const nameError = validateText(values.name, "Item name", 2, 50);
    if (nameError) errors.name = nameError;
    
    const descError = validateText(values.description, "Description", 10, 500);
    if (descError) errors.description = descError;
    
    const priceError = validateNumber(values.price, "Price", 0.01, 999999, true);
    if (priceError) errors.price = priceError;
    
    if (values.discount && values.discount !== "" && values.discount !== 0) {
      const discountError = validateNumber(values.discount, "Discount", 0, 100, false);
      if (discountError) errors.discount = discountError;
    }
    
    if (values.kcal && values.kcal !== "" && values.kcal !== 0) {
      const kcalError = validateNumber(values.kcal, "Calories", 0, 1500, false);
      if (kcalError) errors.kcal = kcalError;
    }
    
    if (values.time && values.time !== "" && values.time !== 0) {
      const timeError = validateNumber(values.time, "Prep time", 0, 60, false);
      if (timeError) errors.time = timeError;
    }
    
    if (!values.category) {
      errors.category = "Please select a category";
    }
    
    if (!imageFile && !imagePreview) {
      errors.image = "Please upload an image";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [imageFile, imagePreview]);

  const onFinish = async (values) => {
    if (!validateForm(values)) {
      messageApi.error({
        content: "Please fix the errors in the form",
        duration: 3
      });
      const firstError = document.querySelector('.ant-form-item-has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!imageFile) {
      messageApi.warning("Please upload an image");
      return;
    }

    setIsLoading(true);
    
    try {
      const selectedCategory = categories.find(cat => cat._id === values.category);
      const formDataToSend = new FormData();
      formDataToSend.append("name", values.name.trim());
      formDataToSend.append("description", values.description.trim());
      formDataToSend.append("price", parseFloat(values.price));
      formDataToSend.append("discount", parseInt(values.discount) || 0);
      formDataToSend.append("kcal", parseInt(values.kcal) || 0);
      formDataToSend.append("time", parseInt(values.time) || 0);
      formDataToSend.append("category", selectedCategory ? selectedCategory.name : "");
      formDataToSend.append("categoryId", values.category);
      formDataToSend.append("foodType", values.foodType);
      formDataToSend.append("restaurantId", values.restaurantId);
      formDataToSend.append("image", imageFile);
      formDataToSend.append("isVegetarian", values.foodType === "veg");

      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: "POST",
        body: formDataToSend
      });
      
      if (res.ok) {
        messageApi.success({
          content: "Menu item added successfully!",
          duration: 3
        });
        form.resetFields();
        handleRemoveImage();
        setFormErrors({});
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "",
          kcal: "",
          time: "",
          category: "",
          foodType: "veg",
          restaurantId: ""
        });
        
        setTimeout(() => {
          handleGoBack();
        }, 2000);
      } else {
        const errorData = await res.json();
        messageApi.error(errorData.message || "Failed to add menu item");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      messageApi.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    Modal.confirm({
      title: 'Reset Form',
      content: 'Are you sure you want to reset the form? All entered data will be lost.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        form.resetFields();
        handleRemoveImage();
        setFormErrors({});
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "",
          kcal: "",
          time: "",
          category: "",
          foodType: "veg",
          restaurantId: ""
        });
        messageApi.info("Form has been reset");
      }
    });
  };

  const handleInputChange = (changedValues, allValues) => {
    setFormData(allValues);
    Object.keys(changedValues).forEach(key => {
      if (formErrors[key]) {
        setFormErrors(prev => ({ ...prev, [key]: undefined }));
      }
    });
  };

  // Handle Enter key to move to next field
  const handleKeyPress = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        const inputElement = nextFieldRef.current;
        if (inputElement.focus) {
          inputElement.focus();
        } else if (inputElement.input) {
          inputElement.input.focus();
        }
      }
    }
  };

  // Handle number input to prevent letters
  const handleNumberKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
      e.preventDefault();
    }
  };

  // Handle paste to prevent letters in number fields
  const handleNumberPaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedText)) {
      e.preventDefault();
      messageApi.warning("Only numbers are allowed");
    }
  };

  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      {uploading ? <LoadingOutlined style={{ fontSize: 24 }} /> : <PlusOutlined style={{ fontSize: 24 }} />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#ea580c',
            colorSuccess: '#22c55e',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <div className="add-menu-item-container">
          <div className="add-menu-item-content">
            <Card 
              className="add-menu-item-card" 
              variant="outlined"
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleGoBack}
                    className="add-menu-item-back-btn-top"
                    type="default"
                  >
                    Back
                  </Button>
                  <div className="add-menu-item-card-title-wrapper">
                    <RocketOutlined style={{ color: '#ea580c', fontSize: 20 }} />
                    <span className="add-menu-item-card-title">Create New Menu Item</span>
                  </div>
                  <div style={{ width: 70 }}></div>
                </div>
              }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleInputChange}
                initialValues={{
                  discount: 0,
                  kcal: 0,
                  time: 0,
                  foodType: "veg"
                }}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name="restaurantId"
                      label={
                        <span>
                          <HomeOutlined /> Restaurant <Text type="danger">*</Text>
                        </span>
                      }
                      validateStatus={formErrors.restaurantId ? "error" : ""}
                      help={formErrors.restaurantId}
                      rules={[{ required: true, message: "Please select a restaurant" }]}
                      className="add-menu-item-form-item"
                    >
                      <Select 
                        placeholder="Select a restaurant"
                        size="large"
                        showSearch
                        loading={restaurantsLoading}
                        suffixIcon={<ShopOutlined />}
                        filterOption={(input, option) =>
                          option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        notFoundContent={restaurantsLoading ? <Spin size="small" /> : "No restaurants found"}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            descriptionRef.current?.focus();
                          }
                        }}
                      >
                        {restaurants.map(restaurant => (
                          <Option key={restaurant._id} value={restaurant._id}>
                            <Space>
                              <EnvironmentOutlined />
                              {restaurant.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name="name"
                      label={
                        <span>
                          <EditOutlined /> Item Name <Text type="danger">*</Text>
                        </span>
                      }
                      validateStatus={formErrors.name ? "error" : ""}
                      help={formErrors.name}
                      rules={[
                        { required: true, message: "Please enter item name" },
                        { min: 2, message: "Item name must be at least 2 characters" },
                        { max: 50, message: "Item name must be less than 50 characters" }
                      ]}
                      className="add-menu-item-form-item"
                    >
                      <Input 
                        placeholder="e.g., Margherita Pizza" 
                        size="large"
                        maxLength={50}
                        showCount
                        prefix={<StarOutlined style={{ color: '#ea580c' }} />}
                        ref={descriptionRef}
                        onKeyPress={(e) => handleKeyPress(e, priceRef)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label={
                    <span>
                      <MenuOutlined /> Description <Text type="danger">*</Text>
                    </span>
                  }
                  validateStatus={formErrors.description ? "error" : ""}
                  help={formErrors.description}
                  rules={[
                    { required: true, message: "Please enter description" },
                    { min: 10, message: "Description must be at least 10 characters" },
                    { max: 500, message: "Description must be less than 500 characters" }
                  ]}
                  className="add-menu-item-form-item"
                >
                  <TextArea 
                    placeholder="Describe your dish in detail. Include ingredients, preparation style, and serving suggestions..." 
                    rows={4}
                    showCount
                    maxLength={500}
                    style={{ resize: 'vertical' }}
                    ref={priceRef}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        discountRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>

                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="price"
                      label={
                        <span>
                          <DollarOutlined /> Price (₹) <Text type="danger">*</Text>
                        </span>
                      }
                      validateStatus={formErrors.price ? "error" : ""}
                      help={formErrors.price}
                      rules={[
                        { required: true, message: "Please enter price" }
                      ]}
                      className="add-menu-item-form-item"
                    >
                      <InputNumber
                        placeholder="Enter price"
                        min={0.01}
                        step={10}
                        precision={2}
                        size="large"
                        style={{ width: "100%" }}
                        prefix="₹"
                        controls={true}
                        onKeyDown={handleNumberKeyDown}
                        onPaste={handleNumberPaste}
                        ref={discountRef}
                        onKeyPress={(e) => handleKeyPress(e, kcalRef)}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="discount"
                      label={
                        <span>
                          <PercentageOutlined /> Discount (%)
                        </span>
                      }
                      validateStatus={formErrors.discount ? "error" : ""}
                      help={formErrors.discount}
                      className="add-menu-item-form-item"
                      extra="Enter discount percentage between 0-100"
                    >
                      <InputNumber
                        placeholder="Enter discount"
                        min={0}
                        max={100}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="%"
                        onKeyDown={handleNumberKeyDown}
                        onPaste={handleNumberPaste}
                        ref={kcalRef}
                        onKeyPress={(e) => handleKeyPress(e, timeRef)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="kcal"
                      label={
                        <span>
                          <FireOutlined /> Calories (kcal)
                        </span>
                      }
                      validateStatus={formErrors.kcal ? "error" : ""}
                      help={formErrors.kcal}
                      className="add-menu-item-form-item"
                      extra="Maximum 1500 calories"
                    >
                      <InputNumber
                        placeholder="Enter calories"
                        min={0}
                        max={1500}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="kcal"
                        onKeyDown={handleNumberKeyDown}
                        onPaste={handleNumberPaste}
                        ref={timeRef}
                        onKeyPress={(e) => handleKeyPress(e, categoryRef)}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="time"
                      label={
                        <span>
                          <ClockCircleOutlined /> Prep Time (minutes)
                        </span>
                      }
                      validateStatus={formErrors.time ? "error" : ""}
                      help={formErrors.time}
                      className="add-menu-item-form-item"
                      extra="Maximum 60 minutes"
                    >
                      <InputNumber
                        placeholder="Enter prep time"
                        min={0}
                        max={60}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="min"
                        onKeyDown={handleNumberKeyDown}
                        onPaste={handleNumberPaste}
                        ref={categoryRef}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            foodTypeRef.current?.focus();
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="category"
                      label={
                        <span>
                          <MenuOutlined /> Category <Text type="danger">*</Text>
                        </span>
                      }
                      validateStatus={formErrors.category ? "error" : ""}
                      help={formErrors.category}
                      rules={[{ required: true, message: "Please select a category" }]}
                      className="add-menu-item-form-item"
                    >
                      <Select 
                        placeholder="Select a category"
                        size="large"
                        showSearch
                        loading={categoriesLoading}
                        suffixIcon={<MenuOutlined />}
                        filterOption={(input, option) =>
                          option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        notFoundContent={categoriesLoading ? <Spin size="small" /> : "No categories found"}
                        ref={foodTypeRef}
                      >
                        {categories.map(cat => (
                          <Option key={cat._id} value={cat._id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="foodType"
                      label={
                        <span>
                          <TagOutlined /> Food Type <Text type="danger">*</Text>
                        </span>
                      }
                      rules={[{ required: true, message: "Please select food type" }]}
                      className="add-menu-item-form-item"
                    >
                      <Select size="large" placeholder="Select food type" suffixIcon={<TagOutlined />}>
                        <Option value="veg">
                          <Space>
                            <HeartOutlined style={{ color: '#22c55e' }} />
                            <span>Vegetarian</span>
                          </Space>
                        </Option>
                        <Option value="non-veg">
                          <Space>
                            <CoffeeOutlined style={{ color: '#ea580c' }} />
                            <span>Non-Vegetarian</span>
                          </Space>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span>
                      <PictureOutlined /> Item Image <Text type="danger">*</Text>
                    </span>
                  }
                  validateStatus={formErrors.image ? "error" : ""}
                  help={formErrors.image}
                  className="add-menu-item-form-item"
                >
                  <div className="add-menu-item-upload-wrapper">
                    <Upload
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={handleImageUpload}
                      accept="image/*"
                      maxCount={1}
                      className="add-menu-item-upload"
                    >
                      {imagePreview ? (
                        <div className="add-menu-item-image-preview">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={120}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 6 }}
                            preview={{
                              open: previewOpen,
                              onOpenChange: (open) => setPreviewOpen(open),
                              src: previewImage,
                            }}
                          />
                          <div className="add-menu-item-image-overlay">
                            <Button
                              icon={<SwapOutlined />}
                              size="small"
                              className="add-menu-item-change-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeImage();
                              }}
                            >
                              Change
                            </Button>
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              className="add-menu-item-image-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                      <PictureOutlined /> Click to upload or drag & drop (JPG, PNG, WEBP, max 5MB)
                    </Text>
                  </div>
                </Form.Item>

                <Divider className="add-menu-item-divider" orientation="horizontal" />

                <Form.Item>
                  <Flex gap="middle" wrap="wrap">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={isLoading}
                      className="add-menu-item-submit-btn"
                    >
                      Add Menu Item
                    </Button>
                    <Button
                      size="large"
                      icon={<ClearOutlined />}
                      onClick={onReset}
                      className="add-menu-item-reset-btn"
                    >
                      Reset Form
                    </Button>
                  </Flex>
                </Form.Item>

                <Alert
                  title="Quick Tips"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li><CheckCircleOutlined style={{ color: '#22c55e' }} /> All fields marked with * are required</li>
                      <li><PercentageOutlined /> Discount should be between 0-100%</li>
                      <li><ClockCircleOutlined /> Prep time maximum is 60 minutes</li>
                      <li><FireOutlined /> Calories maximum is 1500 kcal</li>
                      <li><DollarOutlined /> Price cannot be zero or negative (in ₹)</li>
                      <li><PictureOutlined /> Upload a clear image of the dish (max 5MB)</li>
                      <li><EnterOutlined /> Press Enter to move to next field</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  className="add-menu-item-tip-alert"
                />
              </Form>
            </Card>
          </div>
        </div>
      </ConfigProvider>
    </>
  );
}

export default AddMenuItem;