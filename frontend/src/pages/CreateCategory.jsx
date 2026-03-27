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
  Statistic,
  Tooltip
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
  CheckCircleOutlined
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
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchExistingCategories();
  }, []);

  const fetchExistingCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const categories = [...new Set(data.map(item => item.category))].filter(Boolean);
      setExistingCategories(categories);
    } catch (error) {
      message.error("Failed to fetch categories");
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
      // API call to create category
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.categoryName.trim().toLowerCase()
        })
      });
      
      if (response.ok) {
        message.success({
          content: `Category "${values.categoryName}" created successfully!`,
          icon: <CheckCircleOutlined />,
          duration: 3
        });
        form.resetFields();
        setFormErrors({});
        fetchExistingCategories();
      } else {
        const error = await response.json();
        message.error(error.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      message.error("Network error. Please check your connection.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      // API call to delete category
      const response = await fetch(`${API_BASE_URL}/api/categories/${category}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        message.success(`Category "${category}" deleted successfully`);
        fetchExistingCategories();
      } else {
        message.error("Failed to delete category");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
    }
  };

  const getCategoryIcon = (category) => {
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
      thai: "🍜"
    };
    return icons[category.toLowerCase()] || "📁";
  };

  return (
    <div className="category-form-container">
      <div className="category-form-content">
        <Breadcrumb className="category-form-breadcrumb">
          <Breadcrumb.Item>
            <a onClick={() => navigate("/admin")}>Dashboard</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Create Category</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              className="category-form-card" 
              title={
                <Space>
                  <PlusOutlined className="category-form-icon" />
                  <span>Create New Category</span>
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
                    { max: 30, message: "Category name must be less than 30 characters" }
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={creating}
                    icon={<PlusOutlined />}
                    block
                    className="category-form-submit-btn"
                  >
                    {creating ? "Creating..." : "Create Category"}
                  </Button>
                </Form.Item>

                <Divider className="category-form-divider" />

                <div className="category-form-tips">
                  <Text type="secondary">
                    <FolderOpenOutlined /> Tips for good category names:
                  </Text>
                  <ul>
                    <li>Use singular form (e.g., "burger" not "burgers")</li>
                    <li>Keep it short and descriptive</li>
                    <li>Avoid special characters</li>
                    <li>Use lowercase letters only</li>
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
                  <Tag color="orange" className="category-form-count-tag">{existingCategories.length} total</Tag>
                </Space>
              }
            >
              {isLoading ? (
                <div className="category-form-loading">
                  <Spin size="large" />
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
                            onClick={() => message.info("Edit feature coming soon")}
                          />
                        </Tooltip>,
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
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar className="category-form-avatar">
                            {getCategoryIcon(category)}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <span className="category-form-category-name">{category}</span>
                            <Tag color="orange" className="category-form-index-tag">{index + 1}</Tag>
                          </Space>
                        }
                        description={
                          <span className="category-form-category-desc">
                            {category.charAt(0).toUpperCase() + category.slice(1)} category
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
                {existingCategories[0] ? existingCategories[0].charAt(0).toUpperCase() + existingCategories[0].slice(1) : "N/A"}
              </div>
              <div className="category-form-stat-label">Most Popular</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="category-form-stat-card">
              <div className="category-form-stat-icon">
                <PlusOutlined />
              </div>
              <div className="category-form-stat-value">{existingCategories.length * 10}%</div>
              <div className="category-form-stat-label">Growth</div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CreateCategory;