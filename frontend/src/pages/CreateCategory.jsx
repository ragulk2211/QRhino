import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
  Typography,
  Breadcrumb,
  Tag,
  Alert,
  Spin,
  Avatar,
  Empty,
  Tooltip,
  Modal,
  Flex
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  EnterOutlined,
  HomeOutlined,
  TagOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FireOutlined,
  IdcardOutlined,
  CalendarOutlined,
  NumberOutlined,
  AppstoreOutlined,
  CoffeeOutlined,
  HeartOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/createCategory.css";

const { Title, Text, Paragraph } = Typography;

function CreateCategory() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [existingCategories, setExistingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Use message API from App context
  const [messageApi, contextHolder] = message.useMessage();

  const fetchExistingCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExistingCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      messageApi.error("Failed to fetch categories");
      setExistingCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingCategories();
  }, []);

  const validateForm = (values) => {
    const errors = {};
    
    if (!values.categoryName || values.categoryName.trim().length === 0) {
      errors.categoryName = "Please enter a category name";
    } else if (values.categoryName.trim().length < 2) {
      errors.categoryName = "Category name must be at least 2 characters";
    } else if (values.categoryName.trim().length > 30) {
      errors.categoryName = "Category name must be less than 30 characters";
    } else if (!/^[a-z]+$/.test(values.categoryName.trim())) {
      errors.categoryName = "Use lowercase letters only";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onFinish = async (values) => {
    if (!validateForm(values)) {
      messageApi.error({
        content: "Please fix the errors in the form",
        duration: 3
      });
      return;
    }

    setCreating(true);
    
    try {
      const url = editingCategory 
        ? `${API_BASE_URL}/api/categories/${editingCategory._id}`
        : `${API_BASE_URL}/api/categories`;
      
      const method = editingCategory ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.categoryName.trim().toLowerCase()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        messageApi.success({
          content: editingCategory 
            ? `Category "${values.categoryName}" updated successfully!`
            : `Category "${values.categoryName}" created successfully!`,
          duration: 3
        });
        form.resetFields();
        setFormErrors({});
        setEditingCategory(null);
        fetchExistingCategories();
      } else {
        const error = await response.json();
        messageApi.error(error.message || error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      messageApi.error("Network error. Please check your connection.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = (category) => {
    Modal.confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${category.displayName || category.name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/categories/${category._id}`, {
            method: "DELETE"
          });
          
          if (response.ok) {
            messageApi.success(`Category "${category.displayName || category.name}" deleted successfully`);
            fetchExistingCategories();
          } else {
            const error = await response.json();
            messageApi.error(error.message || error.error || "Failed to delete category");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          messageApi.error("Network error. Please try again.");
        }
      }
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({ categoryName: category.name });
    messageApi.info(`Editing category: ${category.displayName || category.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.resetFields();
    setFormErrors({});
    messageApi.info("Edit cancelled");
  };

  const handleGoBack = () => {
    navigate("/admin");
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("burger")) return <AppstoreOutlined />;
    if (name.includes("pizza")) return <AppstoreOutlined />;
    if (name.includes("pasta") || name.includes("italian")) return <FolderOpenOutlined />;
    if (name.includes("soup")) return <FolderOpenOutlined />;
    if (name.includes("salad")) return <HeartOutlined />;
    if (name.includes("dessert") || name.includes("sweet")) return <StarOutlined />;
    if (name.includes("beverage") || name.includes("drink") || name.includes("coffee")) return <CoffeeOutlined />;
    if (name.includes("starter") || name.includes("appetizer")) return <FireOutlined />;
    if (name.includes("main") || name.includes("course")) return <DatabaseOutlined />;
    if (name.includes("chinese")) return <FolderOutlined />;
    if (name.includes("indian")) return <FolderOutlined />;
    if (name.includes("breakfast")) return <ClockCircleOutlined />;
    if (name.includes("seafood")) return <FolderOpenOutlined />;
    if (name.includes("vegan") || name.includes("veg")) return <SafetyOutlined />;
    return <FolderOutlined />;
  };

  const breadcrumbItems = [
    {
      title: (
        <a onClick={() => navigate("/admin")} style={{ cursor: 'pointer' }}>
          <HomeOutlined /> Dashboard
        </a>
      ),
    },
    {
      title: "Manage Categories",
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="category-form-container">
        <div className="category-form-content">
          <Breadcrumb items={breadcrumbItems} className="category-form-breadcrumb" />

          <Card 
            className="category-form-main-card"
            variant="outlined"
            title={
              <div className="category-form-card-header">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handleGoBack}
                  className="category-form-back-btn-top"
                  type="default"
                >
                  Back
                </Button>
                <div className="category-form-card-title-wrapper">
                  <RocketOutlined style={{ color: '#ea580c', fontSize: 20 }} />
                  <span className="category-form-card-title">Manage Categories</span>
                </div>
                <div className="category-form-card-extra-desktop">
                  <Tag icon={<SafetyOutlined />} color="orange">
                    Required fields marked with *
                  </Tag>
                </div>
              </div>
            }
          >
            <div className="category-form-card-extra-mobile">
              <Tag icon={<SafetyOutlined />} color="orange">
                Required fields marked with *
              </Tag>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  className="category-form-card" 
                  variant="borderless"
                  title={
                    <Space>
                      {editingCategory ? <EditOutlined /> : <PlusOutlined />}
                      <span>{editingCategory ? "Edit Category" : "Create New Category"}</span>
                    </Space>
                  }
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onValuesChange={() => setFormErrors({})}
                  >
                    <Form.Item
                      name="categoryName"
                      label={
                        <Space>
                          <TagOutlined /> Category Name
                          <Tooltip title="Use lowercase, singular form for better organization">
                            <InfoCircleOutlined style={{ color: '#ea580c' }} />
                          </Tooltip>
                        </Space>
                      }
                      validateStatus={formErrors.categoryName ? "error" : ""}
                      help={formErrors.categoryName}
                      rules={[
                        { required: true, message: "Please enter category name" },
                        { min: 2, message: "Category name must be at least 2 characters" },
                        { max: 30, message: "Category name must be less than 30 characters" },
                        { pattern: /^[a-z]+$/, message: "Use lowercase letters only" }
                      ]}
                      className="category-form-item"
                      required
                    >
                      <Input
                        placeholder="e.g., burgers, starters, desserts"
                        size="large"
                        prefix={<FolderOutlined />}
                        maxLength={30}
                        showCount
                      />
                    </Form.Item>

                    <Form.Item>
                      <Flex gap="middle" wrap="wrap">
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          loading={creating}
                          icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}
                          className="category-form-submit-btn"
                        >
                          {creating 
                            ? (editingCategory ? "Updating..." : "Creating...") 
                            : (editingCategory ? "Update Category" : "Create Category")}
                        </Button>
                        
                        {editingCategory && (
                          <Button
                            size="large"
                            onClick={handleCancelEdit}
                            className="category-form-cancel-btn"
                          >
                            Cancel Edit
                          </Button>
                        )}
                      </Flex>
                    </Form.Item>

                    <Divider className="category-form-divider" orientation="horizontal" />

                    <Alert
                      title={<><FolderOpenOutlined /> Tips for good category names:</>}
                      description={
                        <div className="category-form-tips-content">
                          <ul>
                            <li><CheckCircleOutlined style={{ color: '#22c55e' }} /> Use singular form (e.g., "burger" not "burgers")</li>
                            <li><InfoCircleOutlined /> Keep it short and descriptive (2-30 characters)</li>
                            <li><SafetyOutlined /> Avoid special characters and spaces</li>
                            <li><EnterOutlined /> Use lowercase letters only</li>
                            <li><StarOutlined /> Examples: pizza, burger, pasta, salad</li>
                          </ul>
                        </div>
                      }
                      type="info"
                      showIcon
                      icon={<InfoCircleOutlined />}
                      className="category-form-tips-alert"
                    />
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  className="category-form-list-card"
                  variant="borderless"
                  title={
                    <Space wrap>
                      <DatabaseOutlined />
                      <span>Existing Categories</span>
                      <Tag color="orange" className="category-form-count-tag">
                        {existingCategories.length} total
                      </Tag>
                    </Space>
                  }
                >
                  {isLoading ? (
                    <div className="category-form-loading">
                      <Spin size="large" />
                      <Text type="secondary">Loading categories...</Text>
                    </div>
                  ) : existingCategories.length > 0 ? (
                    <div className="category-form-list">
                      {existingCategories.map((category, index) => (
                        <div 
                          key={category._id || index}
                          className="category-form-list-item"
                        >
                          <div className="category-form-list-item-content">
                            <Avatar 
                              className="category-form-avatar" 
                              icon={getCategoryIcon(category.name)}
                            />
                            <div className="category-form-list-item-info">
                              <div className="category-form-list-item-header">
                                <span className="category-form-category-name">
                                  {category.displayName || category.name}
                                </span>
                                <Tag color="orange" className="category-form-index-tag">
                                  <NumberOutlined /> #{index + 1}
                                </Tag>
                              </div>
                              <div className="category-form-category-desc">
                                <span className="category-form-desc-item">
                                  <IdcardOutlined /> ID: {category._id?.slice(-8)}
                                </span>
                                <span className="category-form-desc-item">
                                  <CalendarOutlined /> Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="category-form-list-item-actions">
                            <Tooltip title="Edit category">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                className="category-form-edit-btn"
                                onClick={() => handleEditCategory(category)}
                              />
                            </Tooltip>
                            <Tooltip title="Delete category">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                className="category-form-delete-btn"
                                onClick={() => handleDeleteCategory(category)}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      description="No categories yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className="category-form-empty"
                    >
                      <Button 
                        type="primary" 
                        onClick={() => form.focus()}
                        className="category-form-empty-btn"
                      >
                        Create First Category
                      </Button>
                    </Empty>
                  )}
                </Card>
              </Col>
            </Row>

            {existingCategories.length > 0 && (
              <Row gutter={[16, 16]} className="category-form-stats-row">
                <Col xs={24} sm={8}>
                  <div className="category-form-stat-card">
                    <div className="category-form-stat-icon"><DatabaseOutlined /></div>
                    <div className="category-form-stat-value">{existingCategories.length}</div>
                    <div className="category-form-stat-label">Total Categories</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="category-form-stat-card">
                    <div className="category-form-stat-icon"><StarOutlined /></div>
                    <div className="category-form-stat-value">
                      {existingCategories.length > 0 ? 
                        (existingCategories[existingCategories.length - 1].displayName || 
                         existingCategories[existingCategories.length - 1].name) : "N/A"}
                    </div>
                    <div className="category-form-stat-label">Latest Category</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="category-form-stat-card">
                    <div className="category-form-stat-icon"><ThunderboltOutlined /></div>
                    <div className="category-form-stat-value">{existingCategories.length}</div>
                    <div className="category-form-stat-label">Active Categories</div>
                  </div>
                </Col>
              </Row>
            )}

            <Alert
              title="Quick Tips"
              description={
                <div className="category-form-quick-tips">
                  <ul>
                    <li><CheckCircleOutlined style={{ color: '#22c55e' }} /> All fields marked with * are required</li>
                    <li><InfoCircleOutlined /> Category names should be lowercase and singular</li>
                    <li><EditOutlined /> You can edit or delete categories at any time</li>
                    <li><EnterOutlined /> Press Enter to submit the form</li>
                  </ul>
                </div>
              }
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="category-form-main-alert"
            />
          </Card>
        </div>
      </div>
    </>
  );
}

export default CreateCategory;