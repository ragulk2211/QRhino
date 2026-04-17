import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Divider,
  Typography,
  Spin,
  Image,
  Radio,
  Switch,
  Space,
  Tooltip,
  Alert,
  Tag,
  Skeleton
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
  DollarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TagOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/editmenu.css";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function EditMenuItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
    fetchMenuItem();
  }, [id]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        const categoryNames = Array.isArray(data) 
          ? data.map(cat => typeof cat === 'string' ? cat : cat.name || cat.displayName)
          : [];
        setCategories(categoryNames.filter(Boolean));
      } else {
        const res2 = await fetch(`${API_BASE_URL}/api/menu`);
        const data = await res2.json();
        const unique = [...new Set(data.map(item => item.category))].filter(Boolean);
        setCategories(unique);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(["pizza", "burger", "pasta", "salad", "desserts"]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const fetchMenuItem = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      let imageUrl = "";
      if (data.image) {
        if (data.image.startsWith("http")) {
          imageUrl = data.image;
        } else if (data.image.startsWith("/uploads/")) {
          imageUrl = `${API_BASE_URL}${data.image}`;
        } else {
          imageUrl = `${API_BASE_URL}/uploads/${data.image}`;
        }
      }

      setImagePreview(imageUrl);
      setCurrentImage(data.image);

      form.setFieldsValue({
        restaurantId: data.restaurantId || "",
        name: data.name || "",
        description: data.description || data.desc || "",
        price: data.price || 0,
        discount: data.discount || 0,
        kcal: data.kcal || 0,
        time: data.time || 0,
        category: data.category || "",
        foodType: data.foodType || "veg",
        isSpicy: data.isSpicy || false,
        isRecommended: data.isRecommended || false
      });

    } catch (error) {
      console.error("Error fetching menu item:", error);
      message.error("Failed to load menu item");
      navigate("/admin");
    } finally {
      setPageLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file!');
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
      setUploading(false);
      message.success("Image loaded successfully!");
    };
    reader.onerror = () => {
      message.error("Failed to read image");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    
    return false;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCurrentImage("");
    message.info("Image removed");
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!price || !discount) return price;
    return price - (price * discount / 100);
  };

  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    return `₹ ${value.toLocaleString('en-IN')}`;
  };

  const onFinish = async (values) => {
    if (!values.name?.trim()) {
      message.error("Please enter item name");
      return;
    }
    if (!values.price || values.price <= 0) {
      message.error("Please enter a valid price");
      return;
    }
    if (!values.category) {
      message.error("Please select a category");
      return;
    }
    if (!values.restaurantId) {
      message.error("Please select a restaurant");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", values.name.trim());
      formData.append("description", values.description?.trim() || "");
      formData.append("price", Number(values.price));
      formData.append("discount", Number(values.discount) || 0);
      formData.append("kcal", Number(values.kcal) || 0);
      formData.append("time", Number(values.time) || 0);
      formData.append("category", values.category);
      formData.append("foodType", values.foodType);
      formData.append("restaurantId", values.restaurantId);
      formData.append("isSpicy", values.isSpicy || false);
      formData.append("isRecommended", values.isRecommended || false);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        message.success({
          content: "Menu item updated successfully! 🎉",
          icon: <CheckCircleOutlined />,
          duration: 3
        });
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        message.error(data.error || data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      message.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(currentImage);
    message.info("Form reset");
  };

  const watchPrice = Form.useWatch('price', form);
  const watchDiscount = Form.useWatch('discount', form);
  const finalPrice = calculateDiscountedPrice(watchPrice, watchDiscount);

  if (pageLoading) {
    return (
      <div className="edit-menu-container">
        <div className="edit-menu-content">
          <Card className="edit-menu-loading-card">
            <Skeleton active avatar paragraph={{ rows: 6 }} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-menu-container">
      <div className="edit-menu-content">
        <Card className="edit-menu-card">
          <div className="edit-menu-header">
            <Button
              className="edit-menu-back-btn"
              onClick={() => navigate("/admin")}
              icon={<ArrowLeftOutlined />}
            >
              Back to Dashboard
            </Button>
            <Title level={2} className="edit-menu-title">✏️ Edit Menu Item</Title>
            <Paragraph className="edit-menu-subtitle">
              Update your dish details and make it even more delicious
            </Paragraph>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
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
                  rules={[{ required: true, message: "Please select a restaurant" }]}
                  className="edit-menu-form-item"
                >
                  <Select 
                    placeholder="🏪 Select restaurant"
                    size="large"
                    loading={restaurantsLoading}
                    showSearch
                    optionFilterProp="children"
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
                  rules={[
                    { required: true, message: "Please enter item name" },
                    { min: 2, message: "Minimum 2 characters" },
                    { max: 50, message: "Maximum 50 characters" }
                  ]}
                  className="edit-menu-form-item"
                >
                  <Input 
                    placeholder="e.g., Margherita Pizza, Chicken Burger"
                    size="large"
                    showCount
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter description" },
                { min: 10, message: "Minimum 10 characters" },
                { max: 500, message: "Maximum 500 characters" }
              ]}
              className="edit-menu-form-item"
            >
              <TextArea 
                placeholder="Describe your dish - ingredients, taste, serving suggestions..."
                rows={4}
                showCount
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
            </Form.Item>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="price"
                  label={
                    <Space>
                      <DollarOutlined /> Price (₹)
                      <Tooltip title="Original price of the item">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Please enter price" },
                    { type: 'number', min: 1, message: "Price must be at least ₹1" }
                  ]}
                  className="edit-menu-form-item"
                >
                  <InputNumber
                    placeholder="Enter price"
                    min={1}
                    step={10}
                    precision={2}
                    size="large"
                    style={{ width: "100%" }}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="discount"
                  label={
                    <Space>
                      <TagOutlined /> Discount (%)
                      <Tooltip title="Enter discount percentage (0-100)">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
                      </Tooltip>
                    </Space>
                  }
                  className="edit-menu-form-item"
                >
                  <InputNumber
                    placeholder="0%"
                    min={0}
                    max={100}
                    step={5}
                    size="large"
                    style={{ width: "100%" }}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <div className="price-preview-card">
                  <Text type="secondary">Final Price:</Text>
                  <div className="final-price">
                    {finalPrice && finalPrice > 0 ? formatPrice(finalPrice) : formatPrice(watchPrice)}
                  </div>
                  {watchDiscount > 0 && (
                    <Tag color="green" className="discount-tag">
                      🔥 {watchDiscount}% OFF
                    </Tag>
                  )}
                </div>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="kcal"
                  label={
                    <Space>
                      <FireOutlined /> Calories
                      <Tooltip title="Calorie count per serving">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
                      </Tooltip>
                    </Space>
                  }
                  className="edit-menu-form-item"
                >
                  <InputNumber
                    placeholder="Enter calories"
                    min={0}
                    step={50}
                    size="large"
                    style={{ width: "100%" }}
                    formatter={value => `${value} kcal`}
                    parser={value => value.replace(' kcal', '')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="time"
                  label={
                    <Space>
                      <ClockCircleOutlined /> Prep Time
                      <Tooltip title="Preparation time in minutes">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
                      </Tooltip>
                    </Space>
                  }
                  className="edit-menu-form-item"
                >
                  <InputNumber
                    placeholder="Enter minutes"
                    min={0}
                    step={5}
                    size="large"
                    style={{ width: "100%" }}
                    formatter={value => `${value} min`}
                    parser={value => value.replace(' min', '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category" }]}
                  className="edit-menu-form-item"
                >
                  <Select 
                    placeholder="📂 Select category"
                    size="large"
                    loading={categoriesLoading}
                    showSearch
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
                  className="edit-menu-form-item"
                >
                  <Radio.Group size="large">
                    <Radio value="veg">
                      🌱 Vegetarian
                    </Radio>
                    <Radio value="non-veg">
                      🍖 Non-Vegetarian
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  name="isSpicy" 
                  label="Spicy Level" 
                  valuePropName="checked"
                  className="edit-menu-form-item"
                >
                  <Switch 
                    checkedChildren="🌶️ Spicy" 
                    unCheckedChildren="Not Spicy"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item 
                  name="isRecommended" 
                  label="Recommendation" 
                  valuePropName="checked"
                  className="edit-menu-form-item"
                >
                  <Switch 
                    checkedChildren="⭐ Recommended" 
                    unCheckedChildren="Not Recommended"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Item Image"
              tooltip="Upload a high-quality image (JPEG, PNG, WEBP, max 5MB)"
              className="edit-menu-form-item"
            >
              <div className="edit-menu-image-section">
                {imagePreview ? (
                  <div className="edit-menu-image-preview">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={180}
                      height={180}
                      style={{ objectFit: "cover", borderRadius: 12 }}
                      preview={{ mask: "Click to preview" }}
                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E"
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <Upload.Dragger
                    beforeUpload={handleImageUpload}
                    showUploadList={false}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    disabled={uploading}
                    className="edit-menu-upload-dragger"
                  >
                    <p className="ant-upload-drag-icon">
                      {uploading ? <Spin /> : <UploadOutlined />}
                    </p>
                    <p className="ant-upload-text">
                      {uploading ? "Uploading..." : "Click or drag image here"}
                    </p>
                    <p className="ant-upload-hint">
                      Support: JPG, PNG, WEBP (Max 5MB)
                    </p>
                  </Upload.Dragger>
                )}
              </div>
            </Form.Item>

            <Divider />

            <div className="edit-menu-actions">
              <Space size="middle" wrap>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isLoading}
                  icon={<SaveOutlined />}
                  className="edit-menu-submit-btn"
                >
                  {isLoading ? "Updating..." : "Update Menu Item"}
                </Button>
                
                <Button
                  onClick={onReset}
                  size="large"
                  disabled={isLoading}
                >
                  Reset
                </Button>
                
                <Button
                  onClick={() => navigate("/admin")}
                  size="large"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Space>
            </div>

            {/* FIXED: Changed Alert component - removed 'message' prop, using 'title' instead */}
            <Alert
              title="💡 Pro Tips"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Set attractive discounts to boost sales</li>
                  <li>Use high-quality images for better engagement</li>
                  <li>Mark popular items as "Recommended"</li>
                  <li>Update prices and discounts regularly</li>
                </ul>
              }
              type="info"
              showIcon
              className="edit-menu-tips-alert"
            />
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default EditMenuItem;