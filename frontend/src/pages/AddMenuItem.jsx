import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Breadcrumb,
  Switch,
  Spin,
  Image,
  Tag,
  Alert,
  Tooltip,
  ConfigProvider,
  Modal
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
  EyeOutlined,
  EditOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/addMenuItem.css"

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function AddMenuItem() {
  const navigate = useNavigate();
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    kcal: "",
    time: "",
    category: "",
    foodType: "veg",
    restaurantId: "",
    isSpicy: false,
    isRecommended: false
  });

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
      if (Array.isArray(data) && data.length > 0) {
        message.success(`Loaded ${data.length} restaurants`);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error({
        content: "Failed to fetch restaurants. Please check your connection.",
        duration: 5
      });
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      } else {
        setCategories(["burgers", "pizza", "pasta", "soups", "salad", "desserts", "beverages"]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(["burgers", "pizza", "pasta", "soups", "salad", "desserts", "beverages"]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageUpload = useCallback((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file (JPEG, PNG, WEBP)!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    setUploading(true);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setPreviewImage(e.target.result);
      setUploading(false);
      message.success("Image uploaded successfully!");
    };
    reader.onerror = () => {
      message.error("Failed to read image file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    
    return false;
  }, []);

  const handleRemoveImage = useCallback(() => {
    Modal.confirm({
      title: 'Remove Image',
      content: 'Are you sure you want to remove this image?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        setImageFile(null);
        setImagePreview("");
        setPreviewImage("");
        message.info("Image removed");
      }
    });
  }, []);

  // Text validation helpers
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

  // Number validation helper
  const validateNumber = (value, fieldName, min = 0, max = Infinity) => {
    if (value === undefined || value === null || value === "") {
      return `${fieldName} is required`;
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
    
    const priceError = validateNumber(values.price, "Price", 0.01);
    if (priceError) errors.price = priceError;
    
    if (values.discount && values.discount !== "") {
      const discountError = validateNumber(values.discount, "Discount", 0, 100);
      if (discountError) errors.discount = discountError;
    }
    
    if (values.kcal && values.kcal !== "") {
      const kcalError = validateNumber(values.kcal, "Calories", 0);
      if (kcalError) errors.kcal = kcalError;
    }
    
    if (values.time && values.time !== "") {
      const timeError = validateNumber(values.time, "Prep time", 0);
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
      message.error({
        content: "Please fix the errors in the form",
        icon: <WarningOutlined />,
        duration: 3
      });
      const firstError = document.querySelector('.menu-item-form-item-has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!imageFile) {
      message.warning("Please upload an image");
      return;
    }

    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", values.name.trim());
      formDataToSend.append("description", values.description.trim());
      formDataToSend.append("price", parseFloat(values.price));
      formDataToSend.append("discount", parseInt(values.discount) || 0);
      formDataToSend.append("kcal", parseInt(values.kcal) || 0);
      formDataToSend.append("time", parseInt(values.time) || 0);
      formDataToSend.append("category", values.category);
      formDataToSend.append("foodType", values.foodType);
      formDataToSend.append("restaurantId", values.restaurantId);
      formDataToSend.append("image", imageFile);
      formDataToSend.append("isSpicy", values.isSpicy || false);
      formDataToSend.append("isVegetarian", values.foodType === "veg");
      formDataToSend.append("isRecommended", values.isRecommended || false);

      const res = await fetch(`${API_BASE_URL}/api/menu`, {
        method: "POST",
        body: formDataToSend
      });
      
      if (res.ok) {
        message.success({
          content: "Menu item added successfully!",
          icon: <CheckCircleOutlined />,
          duration: 3
        });
        form.resetFields();
        handleRemoveImage();
        setFormErrors({});
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "0",
          kcal: "",
          time: "",
          category: "",
          foodType: "veg",
          restaurantId: "",
          isSpicy: false,
          isRecommended: false
        });
        
        setTimeout(() => {
          navigate("/admin", { state: { success: true, message: "Menu item created successfully!" } });
        }, 2000);
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Failed to add menu item");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      message.error("Network error. Please check your connection and try again.");
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
          discount: "0",
          kcal: "",
          time: "",
          category: "",
          foodType: "veg",
          restaurantId: "",
          isSpicy: false,
          isRecommended: false
        });
        message.info("Form has been reset");
      }
    });
  };

  const handleInputChange = (changedValues, allValues) => {
    setFormData(allValues);
    setFormErrors({});
  };

  const handlePreview = () => {
    if (imagePreview) {
      setPreviewVisible(true);
    }
  };

  const priceFormatter = (value) => {
    if (!value && value !== 0) return '';
    return `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const priceParser = (value) => {
    return value ? value.replace(/₹\s?|(,*)/g, '') : '';
  };

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find(r => r._id === id);
    return restaurant ? restaurant.name : '';
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ff8c42',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <div className="menu-item-container">
        <div className="menu-item-content">
          <Breadcrumb className="menu-item-breadcrumb">
            <Breadcrumb.Item>
              <a onClick={() => navigate("/admin")}>Dashboard</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Add Menu Item</Breadcrumb.Item>
          </Breadcrumb>

          <Card className="menu-item-card">
            <div className="menu-item-header">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate("/admin")}
                className="menu-item-back-btn"
              >
                Back to Dashboard
              </Button>
              <Title level={2} className="menu-item-title">
                Add New Menu Item
              </Title>
              <Paragraph className="menu-item-subtitle">
                Create a culinary masterpiece for your restaurant
              </Paragraph>
            </div>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={handleInputChange}
              initialValues={{
                discount: 0,
                kcal: 0,
                time: 0,
                foodType: "veg",
                isSpicy: false,
                isRecommended: false
              }}
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="restaurantId"
                    label="Restaurant"
                    validateStatus={formErrors.restaurantId ? "error" : ""}
                    help={formErrors.restaurantId}
                    rules={[{ required: true, message: "Please select a restaurant" }]}
                    className="menu-item-form-item"
                  >
                    <Select 
                      placeholder="Select a restaurant"
                      size="large"
                      suffixIcon={<ShopOutlined />}
                      showSearch
                      loading={restaurantsLoading}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={restaurantsLoading ? <Spin size="small" /> : "No restaurants found"}
                    >
                      {restaurants.map(restaurant => (
                        <Option key={restaurant._id} value={restaurant._id}>
                          {restaurant.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="name"
                    label="Item Name"
                    validateStatus={formErrors.name ? "error" : ""}
                    help={formErrors.name}
                    rules={[
                      { required: true, message: "Please enter item name" },
                      { min: 2, message: "Item name must be at least 2 characters" },
                      { max: 50, message: "Item name must be less than 50 characters" }
                    ]}
                    className="menu-item-form-item"
                  >
                    <Input 
                      placeholder="e.g., Margherita Pizza" 
                      size="large"
                      maxLength={50}
                      showCount
                      onPressEnter={(e) => {
                        e.preventDefault();
                      }}
                      prefix={<EditOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description"
                validateStatus={formErrors.description ? "error" : ""}
                help={formErrors.description}
                rules={[
                  { required: true, message: "Please enter description" },
                  { min: 10, message: "Description must be at least 10 characters" },
                  { max: 500, message: "Description must be less than 500 characters" }
                ]}
                className="menu-item-form-item"
              >
                <TextArea 
                  placeholder="Describe your dish in detail. Include ingredients, preparation style, and serving suggestions..." 
                  rows={4}
                  showCount
                  maxLength={500}
                  style={{ resize: 'vertical' }}
                />
              </Form.Item>

              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label={
                      <Space>
                        Price (₹)
                        <Tooltip title="Enter the price of the item (numbers only)">
                          <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                        </Tooltip>
                      </Space>
                    }
                    validateStatus={formErrors.price ? "error" : ""}
                    help={formErrors.price}
                    rules={[
                      { required: true, message: "Please enter price" },
                      { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid price (e.g., 99.99)" }
                    ]}
                    className="menu-item-form-item"
                  >
                    <InputNumber
                      placeholder="0.00"
                      min={0}
                      step={10}
                      precision={2}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<DollarOutlined />}
                      formatter={priceFormatter}
                      parser={priceParser}
                      controls={true}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                        if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9') && e.key !== '.') {
                          e.preventDefault();
                        }
                        if (e.key === '.' && e.target.value.includes('.')) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="discount"
                    label={
                      <Space>
                        Discount (%)
                        <Tooltip title="Enter discount percentage (0-100)">
                          <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                        </Tooltip>
                      </Space>
                    }
                    validateStatus={formErrors.discount ? "error" : ""}
                    help={formErrors.discount}
                    className="menu-item-form-item"
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      max={100}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<TagOutlined />}
                      suffix="%"
                      formatter={value => value ? `${value}%` : '0%'}
                      parser={value => value ? value.replace('%', '') : '0'}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                        if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="kcal"
                    label={
                      <Space>
                        Calories (kcal)
                        <Tooltip title="Enter the calorie count (numbers only)">
                          <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                        </Tooltip>
                      </Space>
                    }
                    validateStatus={formErrors.kcal ? "error" : ""}
                    help={formErrors.kcal}
                    className="menu-item-form-item"
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<FireOutlined />}
                      formatter={value => value ? `${value} kcal` : '0 kcal'}
                      parser={value => value ? value.replace(' kcal', '') : '0'}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                        if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="time"
                    label={
                      <Space>
                        Prep Time (minutes)
                        <Tooltip title="Enter preparation time in minutes (numbers only)">
                          <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                        </Tooltip>
                      </Space>
                    }
                    validateStatus={formErrors.time ? "error" : ""}
                    help={formErrors.time}
                    className="menu-item-form-item"
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<ClockCircleOutlined />}
                      formatter={value => value ? `${value} min` : '0 min'}
                      parser={value => value ? value.replace(' min', '') : '0'}
                      onKeyDown={(e) => {
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                        if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
                          e.preventDefault();
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
                    label="Category"
                    validateStatus={formErrors.category ? "error" : ""}
                    help={formErrors.category}
                    rules={[{ required: true, message: "Please select category" }]}
                    className="menu-item-form-item"
                  >
                    <Select 
                      placeholder="Select category" 
                      size="large"
                      showSearch
                      loading={categoriesLoading}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {categories.map(cat => (
                        <Option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="foodType"
                    label="Food Type"
                    rules={[{ required: true, message: "Please select food type" }]}
                    className="menu-item-form-item"
                  >
                    <Select size="large">
                      <Option value="veg">
                        <Space>
                          <span>🌱</span>
                          <span>Vegetarian</span>
                        </Space>
                      </Option>
                      <Option value="non-veg">
                        <Space>
                          <span>🍖</span>
                          <span>Non-Vegetarian</span>
                        </Space>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="isSpicy" label="Spicy" valuePropName="checked" className="menu-item-form-item">
                    <Switch 
                      checkedChildren="🌶️ Spicy" 
                      unCheckedChildren="Not Spicy"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="isRecommended" label="Recommendation" valuePropName="checked" className="menu-item-form-item">
                    <Switch 
                      checkedChildren="⭐ Recommended" 
                      unCheckedChildren="Not Recommended"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Item Image"
                required
                validateStatus={formErrors.image ? "error" : ""}
                help={formErrors.image}
                tooltip="Upload a high-quality image of the dish (JPEG, PNG, WEBP up to 5MB)"
                className="menu-item-form-item"
              >
                <div className="menu-item-upload-area">
                  {!imagePreview ? (
                    <Upload.Dragger
                      beforeUpload={handleImageUpload}
                      showUploadList={false}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      disabled={uploading}
                    >
                      <p className="ant-upload-drag-icon">
                        {uploading ? <LoadingOutlined spin /> : <PictureOutlined />}
                      </p>
                      <p className="ant-upload-text">
                        {uploading ? "Processing image..." : "Click or drag file to upload"}
                      </p>
                      <p className="ant-upload-hint">
                        Support for JPG, PNG, WEBP. Max size 5MB. Recommended size: 800x600px
                      </p>
                    </Upload.Dragger>
                  ) : (
                    <div className="menu-item-image-preview">
                      <div className="menu-item-image-preview-container">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={200}
                          height={200}
                          style={{ objectFit: "cover", borderRadius: 12, cursor: "pointer" }}
                          preview={{
                            visible: previewVisible,
                            onVisibleChange: setPreviewVisible,
                            src: imagePreview
                          }}
                          onClick={handlePreview}
                        />
                        <div className="menu-item-image-actions">
                          <Tooltip title="Preview">
                            <Button
                              icon={<EyeOutlined />}
                              onClick={handlePreview}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Remove">
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={handleRemoveImage}
                              size="small"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>

              <Divider />

              <Form.Item>
                <Space size="middle" wrap>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                    icon={<SaveOutlined />}
                    className="menu-item-submit-btn"
                  >
                    {isLoading ? "Adding Menu Item..." : "Add Menu Item"}
                  </Button>
                  <Button
                    onClick={onReset}
                    size="large"
                    icon={<ClearOutlined />}
                    disabled={isLoading}
                    className="menu-item-reset-btn"
                  >
                    Reset Form
                  </Button>
                </Space>
              </Form.Item>

              {formData.name && (
                <Alert
                  message="📝 Form Summary"
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Row gutter={[8, 8]}>
                        <Col span={12}><Text strong>Item Name:</Text> {formData.name}</Col>
                        <Col span={12}><Text strong>Restaurant:</Text> {getRestaurantName(formData.restaurantId)}</Col>
                        <Col span={12}><Text strong>Price:</Text> ₹{formData.price}</Col>
                        <Col span={12}><Text strong>Category:</Text> {formData.category}</Col>
                      </Row>
                    </div>
                  }
                  type="info"
                  showIcon
                  className="menu-item-summary-alert"
                />
              )}

              {(!restaurants.length && !restaurantsLoading) && (
                <Alert
                  message="⚠️ Connection Issue"
                  description={
                    <div>
                      <p>Unable to connect to the server. Please check:</p>
                      <ul style={{ margin: '8px 0 0 20px' }}>
                        <li>Your internet connection</li>
                        <li>Backend server is running on {API_BASE_URL}</li>
                        <li>API endpoint is accessible</li>
                      </ul>
                      <Button 
                        size="small" 
                        onClick={() => {
                          fetchRestaurants();
                          fetchCategories();
                        }}
                        style={{ marginTop: 12 }}
                        type="primary"
                      >
                        Retry Connection
                      </Button>
                    </div>
                  }
                  type="error"
                  showIcon
                  icon={<WarningOutlined />}
                  className="menu-item-connection-alert"
                />
              )}

              <Alert
                message="💡 Pro Tips"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Use high-quality, well-lit images for better presentation</li>
                    <li>Include key ingredients in the description for dietary information</li>
                    <li>Set competitive prices based on local market rates</li>
                    <li>Add discount offers to attract more customers</li>
                    <li>Mark items as "Recommended" to highlight customer favorites</li>
                    <li>All number fields (Price, Discount, Calories, Time) accept only numeric values</li>
                    <li>Item name and description support text with special characters</li>
                  </ul>
                }
                type="info"
                showIcon
                className="menu-item-tips-alert"
              />
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default AddMenuItem;