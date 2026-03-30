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
  List,
  Avatar,
  Empty,
  Tooltip,
  Modal
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
  ExclamationCircleOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/createCategory.css";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

function CreateCategory() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [existingCategories, setExistingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchExistingCategories();
  }, []);

  // FIXED: Store full category objects with _id
  const fetchExistingCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Store full category objects
      setExistingCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
      setExistingCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      message.error({
        content: "Please fix the errors in the form",
        icon: <InfoCircleOutlined />,
        duration: 3
      });
      return;
    }

    setCreating(true);
    
    try {
      const url = editingCategory 
        ? `${API_BASE_URL}/api/categories/${editingCategory._id}`  // Use _id for edit
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
        message.success({
          content: editingCategory 
            ? `Category "${values.categoryName}" updated successfully!`
            : `Category "${values.categoryName}" created successfully!`,
          icon: <CheckCircleOutlined />,
          duration: 3
        });
        form.resetFields();
        setFormErrors({});
        setEditingCategory(null);
        fetchExistingCategories(); // Refresh the list
      } else {
        const error = await response.json();
        message.error(error.message || error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Network error. Please check your connection.");
    } finally {
      setCreating(false);
    }
  };

  // FIXED: Delete using _id instead of name
  const handleDeleteCategory = (category) => {
    confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${category.displayName || category.name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Use category._id for deletion
          const response = await fetch(`${API_BASE_URL}/api/categories/${category._id}`, {
            method: "DELETE"
          });
          
          if (response.ok) {
            message.success(`Category "${category.displayName || category.name}" deleted successfully`);
            fetchExistingCategories();
          } else {
            const error = await response.json();
            message.error(error.message || error.error || "Failed to delete category");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error("Network error. Please try again.");
        }
      }
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({ categoryName: category.name });
    message.info(`Editing category: ${category.displayName || category.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.resetFields();
    setFormErrors({});
    message.info("Edit cancelled");
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      burgers: "🍔",
      pizza: "🍕",
      pasta: "🍝",
      soups: "🥣",
      salad: "🥗",
      desserts: "🍰",
      beverages: "🥤",
      starters: "🍢",
      maincourse: "🍛",
      chinese: "🥡",
      indian: "🍛",
      italian: "🍝",
      mexican: "🌮",
      japanese: "🍣",
      thai: "🍜",
      breakfast: "🍳",
      lunch: "🥪",
      dinner: "🍽️",
      seafood: "🦞",
      steak: "🥩",
      vegan: "🌱",
      vegetarian: "🥬"
    };
    return icons[categoryName?.toLowerCase()] || "📁";
  };

  return (
    <div className="category-form-container">
      <div className="category-form-content">
        <Breadcrumb className="category-form-breadcrumb">
          <Breadcrumb.Item>
            <a onClick={() => navigate("/admin")}>Dashboard</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Manage Categories</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              className="category-form-card" 
              title={
                <Space>
                  {editingCategory ? <EditOutlined /> : <PlusOutlined />}
                  <span className="category-form-icon">
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </span>
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
                      Category Name
                      <Tooltip title="Use lowercase, singular form for better organization">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
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
                >
                  <Input
                    placeholder="e.g., burgers, starters, desserts"
                    size="large"
                    prefix={<FolderOutlined />}
                    suffix={
                      form.getFieldValue("categoryName") && (
                        <Tag color="orange" className="category-form-chars-tag">
                          {form.getFieldValue("categoryName").length} chars
                        </Tag>
                      )
                    }
                    maxLength={30}
                    showCount={false}
                  />
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: '100%' }} direction="vertical" size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={creating}
                      icon={editingCategory ? <EditOutlined /> : <PlusOutlined />}
                      block
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
                        block
                        className="category-form-cancel-btn"
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </Space>
                </Form.Item>

                <Divider className="category-form-divider" />

                <div className="category-form-tips">
                  <Text type="secondary">
                    <FolderOpenOutlined /> Tips for good category names:
                  </Text>
                  <ul>
                    <li>Use singular form (e.g., "burger" not "burgers")</li>
                    <li>Keep it short and descriptive (2-30 characters)</li>
                    <li>Avoid special characters and spaces</li>
                    <li>Use lowercase letters only</li>
                    <li>Examples: pizza, burger, pasta, salad</li>
                  </ul>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              className="category-form-list-card"
              title={
                <Space>
                  <DatabaseOutlined className="category-form-icon" />
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
                  <div style={{ marginTop: '16px', color: '#c9a87c' }}>Loading categories...</div>
                </div>
              ) : existingCategories.length > 0 ? (
                <List
                  dataSource={existingCategories}
                  className="category-form-list"
                  renderItem={(category, index) => (
                    <List.Item
                      className="category-form-list-item"
                      actions={[
                        <Tooltip title="Edit category">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            className="category-form-edit-btn"
                            onClick={() => handleEditCategory(category)}
                          >
                            Edit
                          </Button>
                        </Tooltip>,
                        <Tooltip title="Delete category">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            className="category-form-delete-btn"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar className="category-form-avatar">
                            {getCategoryIcon(category.name)}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <span className="category-form-category-name">
                              {category.displayName || category.name}
                            </span>
                            <Tag color="orange" className="category-form-index-tag">
                              #{index + 1}
                            </Tag>
                          </Space>
                        }
                        description={
                          <span className="category-form-category-desc">
                            ID: {category._id} • Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
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

        {/* Statistics Row */}
        {existingCategories.length > 0 && (
          <Row gutter={[24, 24]} className="category-form-stats-row">
            <Col xs={24} md={8}>
              <div className="category-form-stat-card">
                <div className="category-form-stat-icon">
                  <FolderOpenOutlined />
                </div>
                <div className="category-form-stat-value">{existingCategories.length}</div>
                <div className="category-form-stat-label">Total Categories</div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="category-form-stat-card">
                <div className="category-form-stat-icon">🍽️</div>
                <div className="category-form-stat-value">
                  {existingCategories[0] ? existingCategories[0].displayName || existingCategories[0].name : "N/A"}
                </div>
                <div className="category-form-stat-label">Latest Category</div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="category-form-stat-card">
                <div className="category-form-stat-icon">
                  <PlusOutlined />
                </div>
                <div className="category-form-stat-value">{existingCategories.length}</div>
                <div className="category-form-stat-label">Active Categories</div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

export default CreateCategory;