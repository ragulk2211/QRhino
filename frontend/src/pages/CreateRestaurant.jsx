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
  Spin,
  Tag
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
  StarOutlined,
  FireOutlined,
  RocketOutlined,
  SafetyOutlined,
  EnterOutlined,
  PictureOutlined,
  PlusOutlined,
  SwapOutlined,
  LoadingOutlined
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
  const [uploading, setUploading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleImageUpload = (file) => {
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
      setUploading(false);
      messageApi.success("Image uploaded successfully!");
    };
    reader.onerror = () => {
      messageApi.error("Failed to read image file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    
    return false;
  };

  const handleChangeImage = () => {
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
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    messageApi.info("Image removed");
  };

  // Validate current step before proceeding
  const validateCurrentStep = async () => {
    try {
      let fieldsToValidate = [];
      
      if (currentStep === 0) {
        fieldsToValidate = ['name', 'cuisine', 'description'];
      } else if (currentStep === 1) {
        fieldsToValidate = [
          'location.address', 
          'location.city', 
          'location.state', 
          'location.pincode', 
          'phone', 
          'email'
        ];
      }
      
      await form.validateFields(fieldsToValidate);
      return true;
    } catch (error) {
      messageApi.error("Please fill all required fields before proceeding");
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values) => {
    if (!imageFile && !imagePreview) {
      messageApi.error("Please upload a restaurant image");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name?.trim() || "");
      formData.append("location", JSON.stringify({
        address: values.location?.address || "",
        city: values.location?.city || "",
        state: values.location?.state || "",
        pincode: values.location?.pincode || "",
        landmark: values.location?.landmark || ""
      }));
      formData.append("phone", values.phone || "");
      formData.append("email", values.email || "");
      formData.append("description", values.description?.trim() || "");
      formData.append("cuisine", Array.isArray(values.cuisine) ? values.cuisine.join(",") : "");
      formData.append("priceRange", values.priceRange || 0);
      formData.append("deliveryTime", values.deliveryTime || 0);
      formData.append("isOpen", values.isOpen ?? true);
      formData.append("rating", values.rating || 4.5);
      formData.append("timings", values.timings || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/restaurants`, {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        messageApi.success({
          content: "Restaurant created successfully!",
          duration: 3
        });
        form.resetFields();
        handleRemoveImage();
        setCurrentStep(0);
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        messageApi.error(errorData.message || "Failed to create restaurant");
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      messageApi.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    handleRemoveImage();
    setCurrentStep(0);
    messageApi.info("Form has been reset");
  };

  const steps = [
    {
      title: "Basic Info",
    },
    {
      title: "Location Details",
    },
    {
      title: "Additional Info",
    }
  ];

  const breadcrumbItems = [
    {
      title: (
        <a onClick={() => navigate("/admin")} style={{ cursor: 'pointer' }}>
          Dashboard
        </a>
      ),
    },
    {
      title: "Create Restaurant",
    },
  ];

  const uploadButton = (
    <div className="upload-button-content">
      {uploading ? <LoadingOutlined className="upload-icon" /> : <PlusOutlined className="upload-icon" />}
      <div className="upload-text">Upload</div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="restaurant-form-container">
        <div className="restaurant-form-content">
          <Breadcrumb className="restaurant-form-breadcrumb" items={breadcrumbItems} />

          <Card 
            className="restaurant-form-card" 
            variant="outlined"
            title={
              <div className="restaurant-form-card-header">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate("/admin")}
                  className="restaurant-form-back-btn-top"
                  type="default"
                >
                  Back
                </Button>
                <div className="restaurant-form-card-title-wrapper">
                  <RocketOutlined style={{ color: '#ea580c', fontSize: 20 }} />
                  <span className="restaurant-form-card-title">Create New Restaurant</span>
                </div>
              </div>
            }
          >
            <Steps 
              current={currentStep} 
              items={steps}
              className="restaurant-form-steps"
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              preserve={true}
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
                <div className="restaurant-form-step-content">
                  <Row gutter={[24, 16]}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="name"
                        label={
                          <span>
                            <ShopOutlined /> Restaurant Name
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter restaurant name" },
                          { min: 2, message: "Restaurant name must be at least 2 characters" },
                          { max: 50, message: "Restaurant name must be less than 50 characters" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input 
                          placeholder="e.g., Pizza Palace" 
                          size="large"
                          maxLength={50}
                          showCount
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="cuisine"
                        label={
                          <span>
                            <FireOutlined /> Cuisine Type
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please select at least one cuisine type" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Select
                          mode="multiple"
                          size="large"
                          placeholder="Select cuisine types"
                          allowClear
                          showSearch
                          maxTagCount="responsive"
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
                    label={
                      <span>
                        <InfoCircleOutlined /> Description
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter description" },
                      { min: 10, message: "Description must be at least 10 characters" },
                      { max: 500, message: "Description must be less than 500 characters" }
                    ]}
                    className="restaurant-form-item"
                    required
                  >
                    <TextArea 
                      placeholder="Describe your restaurant, its ambiance, specialities, and what makes it unique..." 
                      rows={4}
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        <PictureOutlined /> Restaurant Image
                      </span>
                    }
                    required
                    className="restaurant-form-item"
                  >
                    <div className="restaurant-form-upload-wrapper">
                      <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={handleImageUpload}
                        accept="image/*"
                        maxCount={1}
                        className="restaurant-form-upload"
                      >
                        {imagePreview ? (
                          <div className="restaurant-form-image-preview">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover', borderRadius: 6 }}
                              preview={{
                                mask: 'Preview'
                              }}
                            />
                            <div className="restaurant-form-image-overlay">
                              <Tooltip title="Change Image">
                                <Button
                                  icon={<SwapOutlined />}
                                  size="small"
                                  className="restaurant-form-change-image-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeImage();
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Remove Image">
                                <Button
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  danger
                                  className="restaurant-form-image-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage();
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                      <Text type="secondary" className="upload-hint">
                        <PictureOutlined /> Click to upload or drag & drop (JPG, PNG, WEBP, max 5MB)
                      </Text>
                    </div>
                  </Form.Item>
                </div>
              )}

              {currentStep === 1 && (
                <div className="restaurant-form-step-content">
                  <Row gutter={[24, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        name={["location", "address"]}
                        label={
                          <span>
                            <EnvironmentOutlined /> Street Address
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter street address" },
                          { min: 5, message: "Address must be at least 5 characters" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input 
                          placeholder="Street address" 
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={["location", "city"]}
                        label="City"
                        rules={[
                          { required: true, message: "Please enter city" },
                          { min: 2, message: "City name must be at least 2 characters" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input placeholder="City" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={["location", "state"]}
                        label="State"
                        rules={[
                          { required: true, message: "Please enter state" },
                          { min: 2, message: "State name must be at least 2 characters" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input placeholder="State" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={["location", "pincode"]}
                        label="Pincode"
                        rules={[
                          { required: true, message: "Please enter pincode" },
                          { pattern: /^\d{6}$/, message: "Pincode must be exactly 6 digits" }
                        ]}
                        className="restaurant-form-item"
                        required
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
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name={["location", "landmark"]}
                        label="Landmark"
                        className="restaurant-form-item"
                      >
                        <Input placeholder="Nearby landmark (Optional)" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label={
                          <span>
                            <PhoneOutlined /> Phone Number
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter phone number" },
                          { pattern: /^\d{10}$/, message: "Phone number must be exactly 10 digits" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input 
                          placeholder="9876543210" 
                          size="large"
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
                        label={
                          <span>
                            <MailOutlined /> Email Address
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter email address" },
                          { type: "email", message: "Please enter a valid email address" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <Input 
                          placeholder="restaurant@example.com" 
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {currentStep === 2 && (
                <div className="restaurant-form-step-content">
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="priceRange"
                        label={
                          <span>
                            <DollarOutlined /> Price for Two (₹)
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter price range" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <InputNumber
                          placeholder="500"
                          size="large"
                          style={{ width: "100%" }}
                          prefix="₹"
                          min={1}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/,/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="deliveryTime"
                        label={
                          <span>
                            <ClockCircleOutlined /> Delivery Time (mins)
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please enter delivery time" }
                        ]}
                        className="restaurant-form-item"
                        required
                      >
                        <InputNumber
                          placeholder="30"
                          size="large"
                          style={{ width: "100%" }}
                          min={1}
                          suffix="mins"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="rating"
                        label={
                          <span>
                            <StarOutlined /> Rating
                          </span>
                        }
                        rules={[
                          { required: true, message: "Please select rating" }
                        ]}
                        className="restaurant-form-item"
                        required
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
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="timings"
                    label="Operating Hours"
                    className="restaurant-form-item"
                    extra="e.g., 10:00 AM - 10:00 PM"
                  >
                    <Input 
                      placeholder="10:00 AM - 10:00 PM" 
                      size="large"
                    />
                  </Form.Item>
                </div>
              )}

              <Divider className="restaurant-form-divider" orientation="horizontal" />

              <Form.Item>
                <div className="restaurant-form-buttons">
                  {currentStep > 0 && (
                    <Button
                      onClick={handlePrevious}
                      size="large"
                      className="restaurant-form-prev-btn"
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep < 2 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      size="large"
                      className="restaurant-form-next-btn"
                    >
                      Next Step
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={isLoading}
                      className="restaurant-form-submit-btn"
                    >
                      Create Restaurant
                    </Button>
                  )}
                  <Button
                    size="large"
                    icon={<ClearOutlined />}
                    onClick={onReset}
                    className="restaurant-form-reset-btn"
                  >
                    Reset Form
                  </Button>
                </div>
              </Form.Item>

              <Alert
                title="Quick Tips"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li><CheckCircleOutlined style={{ color: '#22c55e' }} /> All fields marked with * are required</li>
                    <li><PictureOutlined /> Upload a clear image of the restaurant (max 5MB)</li>
                    <li><PhoneOutlined /> Provide accurate contact information for customers</li>
                    <li><DollarOutlined /> Set appropriate price range and delivery time</li>
                    <li><EnterOutlined /> Press Enter to move to next field</li>
                  </ul>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="restaurant-form-tips-alert"
              />
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}

export default CreateRestaurant;