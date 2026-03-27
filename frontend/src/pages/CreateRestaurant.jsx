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
  const [formErrors, setFormErrors] = useState({});

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

  const validateForm = (values) => {
    const errors = {};
    
    if (!values.name || values.name.trim().length < 2) {
      errors.name = "Restaurant name must be at least 2 characters";
    }
    
    if (!values.description || values.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (!values.cuisine || values.cuisine.length === 0) {
      errors.cuisine = "Please select at least one cuisine type";
    }
    
    if (!values.location?.address) {
      errors.address = "Please enter street address";
    }
    
    if (!values.location?.city) {
      errors.city = "Please enter city";
    }
    
    if (!values.location?.state) {
      errors.state = "Please enter state";
    }
    
    if (!values.location?.pincode) {
      errors.pincode = "Please enter pincode";
    }
    
    if (!values.phone) {
      errors.phone = "Please enter phone number";
    } else if (!/^\d{10}$/.test(values.phone)) {
      errors.phone = "Phone must be 10 digits";
    }
    
    if (!values.email) {
      errors.email = "Please enter email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (!values.priceRange) {
      errors.priceRange = "Please enter price range";
    }
    
    if (!values.deliveryTime) {
      errors.deliveryTime = "Please enter delivery time";
    }
    
    if (!imageFile && !imagePreview) {
      errors.image = "Please upload a restaurant image";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onFinish = async (values) => {
    if (!validateForm(values)) {
      message.error({
        content: "Please fix the errors in the form",
        icon: <WarningOutlined />,
        duration: 3
      });
      const firstError = document.querySelector('.restaurant-form-item-has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        setFormErrors({});
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        const errorData = await res.json();
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
    setFormErrors({});
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
              cuisine: []
            }}
          >
            {currentStep === 0 && (
              <>
                <Row gutter={24}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name="name"
                      label="Restaurant Name"
                      validateStatus={formErrors.name ? "error" : ""}
                      help={formErrors.name}
                      rules={[{ required: true, message: "Please enter restaurant name" }]}
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
                      validateStatus={formErrors.cuisine ? "error" : ""}
                      help={formErrors.cuisine}
                      rules={[{ required: true, message: "Please select cuisine type" }]}
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
                  validateStatus={formErrors.description ? "error" : ""}
                  help={formErrors.description}
                  rules={[{ required: true, message: "Please enter description" }]}
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
                  validateStatus={formErrors.image ? "error" : ""}
                  help={formErrors.image}
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
                      validateStatus={formErrors.address ? "error" : ""}
                      help={formErrors.address}
                      rules={[{ required: true, message: "Please enter address" }]}
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
                      validateStatus={formErrors.city ? "error" : ""}
                      help={formErrors.city}
                      rules={[{ required: true, message: "Please enter city" }]}
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
                      validateStatus={formErrors.state ? "error" : ""}
                      help={formErrors.state}
                      rules={[{ required: true, message: "Please enter state" }]}
                      className="restaurant-form-item"
                    >
                      <Input placeholder="State" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name={["location", "pincode"]}
                      label="Pincode"
                      validateStatus={formErrors.pincode ? "error" : ""}
                      help={formErrors.pincode}
                      rules={[
                        { required: true, message: "Please enter pincode" },
                        { pattern: /^\d{6}$/, message: "Pincode must be 6 digits" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <InputNumber 
                        placeholder="Pincode" 
                        size="large"
                        style={{ width: "100%" }}
                        onKeyDown={(e) => {
                          const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                          if (!allowedKeys.includes(e.key) && !(e.key >= '0' && e.key <= '9')) {
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
                      validateStatus={formErrors.phone ? "error" : ""}
                      help={formErrors.phone}
                      rules={[
                        { required: true, message: "Please enter phone number" },
                        { pattern: /^\d{10}$/, message: "Phone must be 10 digits" }
                      ]}
                      className="restaurant-form-item"
                    >
                      <Input 
                        placeholder="9876543210" 
                        size="large"
                        prefix={<PhoneOutlined />}
                        maxLength={10}
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
                      name="email"
                      label="Email Address"
                      validateStatus={formErrors.email ? "error" : ""}
                      help={formErrors.email}
                      rules={[
                        { required: true, message: "Please enter email" },
                        { type: "email", message: "Please enter valid email" }
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
                      validateStatus={formErrors.priceRange ? "error" : ""}
                      help={formErrors.priceRange}
                      rules={[{ required: true, message: "Please enter price range" }]}
                      className="restaurant-form-item"
                    >
                      <InputNumber
                        placeholder="500"
                        min={0}
                        size="large"
                        style={{ width: "100%" }}
                        prefix={<DollarOutlined />}
                        formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/₹\s?|(,*)/g, '')}
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
                      name="deliveryTime"
                      label={
                        <Space>
                          Delivery Time (minutes)
                          <Tooltip title="Estimated delivery time">
                            <InfoCircleOutlined style={{ color: '#ff8c42' }} />
                          </Tooltip>
                        </Space>
                      }
                      validateStatus={formErrors.deliveryTime ? "error" : ""}
                      help={formErrors.deliveryTime}
                      rules={[{ required: true, message: "Please enter delivery time" }]}
                      className="restaurant-form-item"
                    >
                      <InputNumber
                        placeholder="30"
                        min={0}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="mins"
                        formatter={value => `${value} min`}
                        parser={value => value.replace(' min', '')}
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

                <Row gutter={24}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="rating"
                      label="Rating"
                      rules={[{ required: true, message: "Please enter rating" }]}
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
                  className="restaurant-form-item"
                >
                  <Input placeholder="e.g., 9:00 AM - 11:00 PM" size="large" />
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
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="primary" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="restaurant-form-next-btn"
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