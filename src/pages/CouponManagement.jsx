import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  message,
  Typography,
  Breadcrumb,
  Modal,
  Tag,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Divider,
  Alert,
  Spin,
  Empty,
  App as AntApp
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  TagOutlined,
  DollarOutlined,
  PercentageOutlined,
  GiftOutlined,
  WarningOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/couponManagement.css";

const { Title, Text, Paragraph } = Typography;

function CouponManagement() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalDiscount: 0,
    totalUsage: 0
  });

  // Use message from App context to avoid static method warning
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`);
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
        calculateStats(data.coupons);
        messageApi.success(`Loaded ${data.coupons.length} coupons`);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      messageApi.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (couponsData) => {
    const activeCoupons = couponsData.filter(c => c.isActive);
    const totalDiscount = couponsData.reduce((sum, c) => sum + (c.discountPercent || 0), 0);
    const totalUsage = couponsData.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    
    setStats({
      total: couponsData.length,
      active: activeCoupons.length,
      totalDiscount: totalDiscount,
      totalUsage: totalUsage
    });
  };

  const handleCreateOrUpdate = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        code: values.code.toUpperCase(),
        description: values.description,
        discountPercent: Number(values.discountPercent),
        minOrderAmount: Number(values.minOrderAmount),
        maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : null,
        isActive: values.isActive !== undefined ? values.isActive : true,
        maxUsage: values.maxUsage ? Number(values.maxUsage) : null
      };

      let url = `${API_BASE_URL}/api/coupons`;
      let method = "POST";
      
      if (editingCoupon) {
        url = `${API_BASE_URL}/api/coupons/${editingCoupon._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        messageApi.success(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!");
        setShowForm(false);
        setEditingCoupon(null);
        form.resetFields();
        fetchCoupons();
      } else {
        messageApi.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      messageApi.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        messageApi.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        messageApi.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      messageApi.error("Network error. Please try again.");
    }
  };

  const handleSeed = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/seed`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        messageApi.success("Default coupons seeded successfully!");
        fetchCoupons();
      } else {
        messageApi.error("Failed to seed coupons");
      }
    } catch (error) {
      console.error("Error seeding coupons:", error);
      messageApi.error("Network error. Please try again.");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      code: coupon.code,
      description: coupon.description,
      discountPercent: coupon.discountPercent,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      isActive: coupon.isActive,
      maxUsage: coupon.maxUsage
    });
    setShowForm(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    messageApi.success(`Coupon code "${code}" copied to clipboard!`);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => (
        <Space>
          <Tag color="orange" className="coupon-code-tag">
            <strong>{text}</strong>
          </Tag>
          <Tooltip title="Copy code">
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleCopyCode(text)}
              className="coupon-copy-btn"
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text className="coupon-description">{text || "-"}</Text>,
    },
    {
      title: "Discount",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (value) => (
        <Tag color="orange" className="coupon-discount-tag">
          <PercentageOutlined /> {value}% OFF
        </Tag>
      ),
    },
    {
      title: "Min Order",
      dataIndex: "minOrderAmount",
      key: "minOrderAmount",
      render: (value) => (
        <Text className="coupon-min-order">
          <DollarOutlined /> ₹{value || 0}
        </Text>
      ),
    },
    {
      title: "Max Discount",
      dataIndex: "maxDiscountAmount",
      key: "maxDiscountAmount",
      render: (value) => (
        <Text className="coupon-max-discount">
          {value ? `₹${value}` : "No limit"}
        </Text>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => (
        <Text className="coupon-usage">
          {record.usageCount || 0}{record.maxUsage ? `/${record.maxUsage}` : "/∞"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "error"}
          className="coupon-status-tag"
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit coupon">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="coupon-edit-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Coupon"
            description={`Are you sure you want to delete "${record.code}"?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete coupon">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="coupon-delete-btn"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Modern Breadcrumb items API
  const breadcrumbItems = [
    {
      title: (
        <a onClick={() => navigate("/admin")} style={{ cursor: 'pointer' }}>
          Dashboard
        </a>
      ),
    },
    {
      title: "Coupon Management",
    },
  ];

  return (
    <AntApp>
      {contextHolder}
      <div className="coupon-container">
        <div className="coupon-content">
          <Breadcrumb className="coupon-breadcrumb" items={breadcrumbItems} />

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} className="coupon-stats-row">
            <Col xs={24} sm={12} lg={6}>
              <div className="coupon-stat-card">
                <div className="coupon-stat-icon">
                  <GiftOutlined />
                </div>
                <div className="coupon-stat-value">{stats.total}</div>
                <div className="coupon-stat-label">Total Coupons</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="coupon-stat-card">
                <div className="coupon-stat-icon active">
                  <CheckCircleOutlined />
                </div>
                <div className="coupon-stat-value">{stats.active}</div>
                <div className="coupon-stat-label">Active Coupons</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="coupon-stat-card">
                <div className="coupon-stat-icon">
                  <PercentageOutlined />
                </div>
                <div className="coupon-stat-value">{stats.totalDiscount}%</div>
                <div className="coupon-stat-label">Total Discount</div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="coupon-stat-card">
                <div className="coupon-stat-icon">
                  <TagOutlined />
                </div>
                <div className="coupon-stat-value">{stats.totalUsage}</div>
                <div className="coupon-stat-label">Total Usage</div>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="coupon-actions">
            <Space size="middle" wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCoupon(null);
                  form.resetFields();
                  setShowForm(!showForm);
                }}
                className="coupon-create-btn"
              >
                {showForm ? "Cancel" : "Create New Coupon"}
              </Button>
              <Button
                icon={<DatabaseOutlined />}
                onClick={handleSeed}
                className="coupon-seed-btn"
              >
                Seed Default Coupons
              </Button>
            </Space>
          </div>

          {/* Create/Edit Form Modal - Fixed destroyOnClose to destroyOnHidden */}
          <Modal
            title={
              <Space>
                {editingCoupon ? <EditOutlined /> : <PlusOutlined />}
                <span>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</span>
              </Space>
            }
            open={showForm}
            onCancel={() => {
              setShowForm(false);
              setEditingCoupon(null);
              form.resetFields();
            }}
            footer={null}
            width={600}
            className="coupon-form-modal"
            destroyOnHidden
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateOrUpdate}
              initialValues={{
                discountPercent: 10,
                minOrderAmount: 0,
                isActive: true
              }}
            >
              <Form.Item
                name="code"
                label="Coupon Code"
                rules={[
                  { required: true, message: "Please enter coupon code" },
                  { min: 3, message: "Code must be at least 3 characters" },
                  { max: 20, message: "Code must be less than 20 characters" },
                  { pattern: /^[A-Z0-9]+$/, message: "Use uppercase letters and numbers only" }
                ]}
                tooltip="Use uppercase letters and numbers only"
                className="coupon-form-item"
              >
                <Input
                  placeholder="e.g., SAVE20"
                  size="large"
                  prefix={<TagOutlined />}
                  maxLength={20}
                  showCount
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    form.setFieldsValue({ code: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                className="coupon-form-item"
              >
                <Input.TextArea
                  placeholder="Describe what this coupon offers"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="discountPercent"
                    label="Discount (%)"
                    rules={[
                      { required: true, message: "Please enter discount percentage" },
                      { type: 'number', min: 1, max: 100, message: "Discount must be between 1 and 100" }
                    ]}
                    className="coupon-form-item"
                  >
                    <InputNumber
                      placeholder="10"
                      min={1}
                      max={100}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<PercentageOutlined />}
                      suffix="%"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="minOrderAmount"
                    label="Minimum Order Amount (₹)"
                    rules={[
                      { type: 'number', min: 0, message: "Amount must be 0 or greater" }
                    ]}
                    className="coupon-form-item"
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<DollarOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="maxDiscountAmount"
                    label="Maximum Discount Amount (₹)"
                    tooltip="Leave empty for no limit"
                    className="coupon-form-item"
                  >
                    <InputNumber
                      placeholder="No limit"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<DollarOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="maxUsage"
                    label="Maximum Usage"
                    tooltip="Leave empty for unlimited"
                    className="coupon-form-item"
                  >
                    <InputNumber
                      placeholder="Unlimited"
                      min={1}
                      size="large"
                      style={{ width: "100%" }}
                      suffix="times"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                className="coupon-form-item"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>

              <Form.Item>
                <Space size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submitting}
                    icon={editingCoupon ? <EditOutlined /> : <PlusOutlined />}
                    className="coupon-submit-btn"
                  >
                    {submitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCoupon(null);
                      form.resetFields();
                    }}
                    size="large"
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Coupons Table */}
          <Card className="coupon-table-card" title="Coupons List">
            {loading ? (
              <div className="coupon-loading">
                <Spin size="large" />
              </div>
            ) : coupons.length === 0 ? (
              <Empty
                description="No coupons found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="coupon-empty"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCoupon(null);
                    form.resetFields();
                    setShowForm(true);
                  }}
                >
                  Create First Coupon
                </Button>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={coupons}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `Total ${total} coupons`,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
                className="coupon-table"
              />
            )}
          </Card>

          {/* Tips Section - Fixed Alert with title prop */}
          <Alert
            title="💡 Pro Tips"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Use unique, memorable coupon codes like "SAVE20", "WELCOME10", etc.</li>
                <li>Set minimum order amounts to prevent abuse of discounts</li>
                <li>Maximum discount helps control the total discount amount per order</li>
                <li>Track usage counts to measure coupon performance</li>
                <li>Deactivate expired coupons instead of deleting them</li>
              </ul>
            }
            type="info"
            showIcon
            className="coupon-tips-alert"
          />
        </div>
      </div>
    </AntApp>
  );
}

export default CouponManagement;