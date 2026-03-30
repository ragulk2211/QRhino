import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
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
  Select,
  Rate,
  Alert,
  Steps,
  Image,
  Tooltip,
  Spin
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/createRestaurant.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function CreateRestaurant() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleImageUpload = (file) => {
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

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    message.success("Image uploaded successfully!");
    
    return false;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    message.info("Image removed");
  };

  const onFinish = async (values) => {
    // Image validation
    if (!imageFile && !imagePreview) {
      message.error("Please upload a restaurant image");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("location", JSON.stringify(values.location));
      formData.append("phone", values.phone);
      formData.append("email", values.email);
      formData.append("description", values.description.trim());
      formData.append("cuisine", values.cuisine.join(","));
      formData.append("priceRange", values.priceRange);
      formData.append("deliveryTime", values.deliveryTime);
      formData.append("isOpen", values.isOpen);
      formData.append("rating", values.rating);
      formData.append("timings", values.timings || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/restaurants`, {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        message.success({
          content: "Restaurant created successfully!",
          icon: <CheckCircleOutlined />,
          duration: 3
        });
        form.resetFields();
        handleRemoveImage();
        setCurrentStep(0);
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(errorData.message || "Failed to create restaurant");
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      message.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    handleRemoveImage();
    setCurrentStep(0);
    message.info("Form has been reset");
  };

  const steps = [
    {
      title: "Basic Info",
      icon: <ShopOutlined />
    },
    {
      title: "Location Details",
      icon: <EnvironmentOutlined />
    },
    {
      title: "Additional Info",
      icon: <ClockCircleOutlined />
    }
  ];

  return (
    <div className="restaurant-form-container">
      <div className="restaurant-form-content">
        <Breadcrumb className="restaurant-form-breadcrumb">
          <Breadcrumb.Item>
            <a onClick={() => navigate("/admin")}>Dashboard</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Create Restaurant</Breadcrumb.Item>
        </Breadcrumb>

        <Card className="restaurant-form-card">
          <div className="restaurant-form-header">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/admin")}
              className="restaurant-form-back-btn"
            >
              Back to Dashboard
            </Button>
            <Title level={2} className="restaurant-form-title">
              Create New Restaurant
            </Title>
            <Paragraph className="restaurant-form-subtitle">
              Add a new restaurant to your platform
            </Paragraph>
          </div>

          <Divider />

          <Steps 
            current={currentStep} 
            items={steps}
            onChange={setCurrentStep}
            className="restaurant-form-steps"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              isOpen: true,
              rating: 4.5,
              priceRange: 500,
              deliveryTime: 30,
              cuisine: [],
              location: {
                address: "",
                city: "",
                state: "",
                pincode: "",
                landmark: ""
              }
            }}
          >
            {currentStep === 0 && (
              <>
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name="name"
                      label="Restaurant Name"
                      rules={[
                        { required: true, message: "Please enter restaurant name" },
                        { min: 2, message: "Restaurant name must be at least 2 characters" },
                        { max: 50, message: "Restaurant name must be less than 50 characters" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="e.g., Pizza Palace" 
                        size="large"
                        prefix={<ShopOutlined />}
                        maxLength={50}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name="cuisine"
                      label={
                        <Space>
                          Cuisine Type
                          <Tooltip title="Select one or more cuisine types">
                            <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "Please select at least one cuisine type" },
                        { type: 'array', min: 1, message: "Please select at least one cuisine type" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select cuisine types"
                        allowClear
                        showSearch
                      >
                        <Option value="indian">Indian</Option>
                        <Option value="chinese">Chinese</Option>
                        <Option value="italian">Italian</Option>
                        <Option value="mexican">Mexican</Option>
                        <Option value="japanese">Japanese</Option>
                        <Option value="thai">Thai</Option>
                        <Option value="continental">Continental</Option>
                        <Option value="fastfood">Fast Food</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Please enter description" },
                    { min: 10, message: "Description must be at least 10 characters" },
                    { max: 500, message: "Description must be less than 500 characters" }
                  ]}
                  className="restaurant-form-item"
                >
                  <TextArea 
                    placeholder="Describe your restaurant..." 
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item
                  label="Restaurant Image"
                  required
                  tooltip="Upload a high-quality image of the restaurant"
                  className="restaurant-form-item"
                >
                  <div className="restaurant-form-upload-area">
                    {!imagePreview ? (
                      <Upload.Dragger
                        beforeUpload={handleImageUpload}
                        showUploadList={false}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                      >
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload</p>
                        <p className="ant-upload-hint">
                          Support for JPG, PNG, WEBP. Max size 5MB. Recommended size: 1200x800px
                        </p>
                      </Upload.Dragger>
                    ) : (
                      <div className="restaurant-form-image-preview">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={200}
                          style={{ objectFit: "cover", borderRadius: 12 }}
                          preview={{ mask: 'Click to preview' }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleRemoveImage}
                          style={{ marginTop: 12 }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Item>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name={["location", "address"]}
                      label="Street Address"
                      rules={[
                        { required: true, message: "Please enter street address" },
                        { min: 5, message: "Address must be at least 5 characters" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="Street address" 
                        size="large"
                        prefix={<EnvironmentOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name={["location", "city"]}
                      label="City"
                      rules={[
                        { required: true, message: "Please enter city" },
                        { min: 2, message: "City name must be at least 2 characters" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="City" 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name={["location", "state"]}
                      label="State"
                      rules={[
                        { required: true, message: "Please enter state" },
                        { min: 2, message: "State name must be at least 2 characters" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input placeholder="State" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name={["location", "pincode"]}
                      label="Pincode"
                      rules={[
                        { required: true, message: "Please enter pincode" },
                        { pattern: /^\d{6}$/, message: "Pincode must be exactly 6 digits" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="Pincode" 
                        size="large"
                        maxLength={6}
                        onKeyDown={(e) => {
                          const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                          if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name={["location", "landmark"]}
                      label="Landmark (Optional)"
                      className="restaurant-form-item"
                    >
                      <Input placeholder="Nearby landmark" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[
                        { required: true, message: "Please enter phone number" },
                        { pattern: /^\d{10}$/, message: "Phone number must be exactly 10 digits" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="9876543210" 
                        size="large"
                        prefix={<PhoneOutlined />}
                        maxLength={10}
                        onKeyDown={(e) => {
                          const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                          if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: "Please enter email address" },
                        { type: "email", message: "Please enter a valid email address" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="restaurant@example.com" 
                        size="large"
                        prefix={<MailOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="priceRange"
                      label={
                        <Space>
                          Price for Two (₹)
                          <Tooltip title="Average price for two people">
                            <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "Please enter price range" },
                        { type: 'number', min: 1, message: "Price must be at least ₹1" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <InputNumber
                        placeholder="500"
                        min={1}
                        size="large"
                        style={{ width: "100%" }}
                        prefix={<DollarOutlined />}
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="deliveryTime"
                      label={
                        <Space>
                          Delivery Time (minutes)
                          <Tooltip title="Estimated delivery time">
                            <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "Please enter delivery time" },
                        { type: 'number', min: 10, message: "Delivery time must be at least 10 minutes" },
                        { type: 'number', max: 180, message: "Delivery time cannot exceed 180 minutes" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <InputNumber
                        placeholder="30"
                        min={10}
                        max={180}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="mins"
                        formatter={value => `${value} min`}
                        parser={value => value.replace(' min', '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="rating"
                      label="Rating"
                      rules={[
                        { required: true, message: "Please select a rating" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Rate allowHalf defaultValue={4.5} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="isOpen"
                      label="Restaurant Status"
                      valuePropName="checked"
                      className="restaurant-form-item"
                    >
                      <Switch 
                        checkedChildren="Open" 
                        unCheckedChildren="Closed"
                        defaultChecked
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="timings"
                  label="Operating Hours"
                  tooltip="Enter restaurant operating hours"
                  rules={[
                    { pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM)\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM)$/i, message: "Please enter valid time format (e.g., 9:00 AM - 11:00 PM)" }
                  ]}
                  className="restaurant-form-item"
                >
                  <Input 
                    placeholder="e.g., 9:00 AM - 11:00 PM" 
                    size="large"
                  />
                </Form.Item>
              </>
            )}

            <Divider />

            <Form.Item>
              <Space size="middle" wrap>
                {currentStep > 0 && (
                  <Button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="restaurant-form-prev-btn"
                    size="large"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="primary" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="restaurant-form-next-btn"
                    size="large"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                    icon={<SaveOutlined />}
                    className="restaurant-form-submit-btn"
                  >
                    {isLoading ? "Creating..." : "Create Restaurant"}
                  </Button>
                )}
                <Button
                  onClick={onReset}
                  size="large"
                  icon={<ClearOutlined />}
                  className="restaurant-form-reset-btn"
                  disabled={isLoading}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>

            {/* Tips Section */}
            <Alert
              message="💡 Pro Tips"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Add high-quality images that showcase your restaurant's ambiance and food</li>
                  <li>Provide accurate location details for easy navigation</li>
                  <li>Set competitive pricing based on local market rates</li>
                  <li>Include detailed operating hours for customer convenience</li>
                  <li>Add multiple cuisine types to attract diverse customers</li>
                </ul>
              }
              type="info"
              showIcon
              className="restaurant-form-tips-alert"
            />
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default CreateRestaurant;