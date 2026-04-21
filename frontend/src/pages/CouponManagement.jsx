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
  Statistic,
  Grid,
  Flex,
  Badge,
  Progress,
  Avatar,
  theme
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
  WalletOutlined,
  RocketOutlined,
  BulbOutlined,
  SafetyOutlined,
  ControlOutlined,
  LineChartOutlined,
  CalendarOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  CrownOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/couponManagement.css";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

function CouponManagement() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
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
    messageApi.success(`Coupon code "${code}" copied!`);
  };

  const handleGoBack = () => {
    navigate("/admin");
  };

  // Pro Tips Data
  const proTips = [
    {
      icon: <StarOutlined />,
      title: "Use Unique Codes",
      description: "Create memorable coupon codes like 'SAVE20', 'WELCOME10'",
      color: "#ff9f4a"
    },
    {
      icon: <SafetyOutlined />,
      title: "Set Minimum Order",
      description: "Prevent discount abuse by setting minimum order requirements",
      color: "#52c41a"
    },
    {
      icon: <ControlOutlined />,
      title: "Max Discount Control",
      description: "Set maximum discount limits to control total discount",
      color: "#faad14"
    },
    {
      icon: <LineChartOutlined />,
      title: "Track Performance",
      description: "Monitor usage counts to measure coupon performance",
      color: "#1890ff"
    },
    {
      icon: <CalendarOutlined />,
      title: "Manage Expired Coupons",
      description: "Deactivate expired coupons instead of deleting them",
      color: "#722ed1"
    }
  ];

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      fixed: screens.xs ? false : 'left',
      width: 130,
      render: (text) => (
        <Space size={4} wrap>
          <Tag color="orange" className="coupon-code-tag">
            <TagOutlined /> <strong>{text}</strong>
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
      width: 200,
      ellipsis: true,
      render: (text) => <Text className="coupon-description">{text || "-"}</Text>,
    },
    {
      title: "Discount",
      dataIndex: "discountPercent",
      key: "discountPercent",
      width: 100,
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
      width: 110,
      render: (value) => (
        <Text className="coupon-min-order">
          ₹{value || 0}
        </Text>
      ),
    },
    {
      title: "Max Discount",
      dataIndex: "maxDiscountAmount",
      key: "maxDiscountAmount",
      width: 120,
      render: (value) => (
        <Text className="coupon-max-discount">
          {value ? `₹${value}` : "No limit"}
        </Text>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      width: 100,
      render: (_, record) => (
        <Text className="coupon-usage">
          <TrophyOutlined /> {record.usageCount || 0}{record.maxUsage ? `/${record.maxUsage}` : ""}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
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
      fixed: screens.xs ? false : 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small" wrap>
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
            description={`Delete "${record.code}"?`}
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

  return (
    <>
      {contextHolder}
      <div className="coupon-container">
        <div className="coupon-content">
          {/* Header with Back Button and Title */}
          <div className="coupon-header-wrapper">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              className="coupon-back-btn"
              type="primary"
            >
              Back
            </Button>
            <div className="coupon-title-wrapper">
              <RocketOutlined className="coupon-title-icon" />
              <span className="coupon-title">Coupon Management</span>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="coupon-stats-row">
            <Col xs={12} sm={12} md={6}>
              <Card className="coupon-stat-card" variant="borderless">
                <Statistic
                  title={<span><GiftOutlined /> Total Coupons</span>}
                  value={stats.total}
                  styles={{ content: { color: '#ff9f4a', fontSize: screens.xs ? 20 : 28 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card className="coupon-stat-card" variant="borderless">
                <Statistic
                  title={<span><CheckCircleOutlined /> Active Coupons</span>}
                  value={stats.active}
                  styles={{ content: { color: '#52c41a', fontSize: screens.xs ? 20 : 28 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card className="coupon-stat-card" variant="borderless">
                <Statistic
                  title={<span><PercentageOutlined /> Total Discount</span>}
                  value={stats.totalDiscount}
                  suffix="%"
                  styles={{ content: { color: '#ff9f4a', fontSize: screens.xs ? 20 : 28 } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card className="coupon-stat-card" variant="borderless">
                <Statistic
                  title={<span><WalletOutlined /> Total Usage</span>}
                  value={stats.totalUsage}
                  styles={{ content: { color: '#ff9f4a', fontSize: screens.xs ? 20 : 28 } }}
                />
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="coupon-actions">
            <Flex gap="middle" wrap="wrap">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCoupon(null);
                  form.resetFields();
                  setShowForm(!showForm);
                }}
                className="coupon-create-btn"
                size={screens.xs ? "middle" : "large"}
              >
                {showForm ? "Cancel" : "Create Coupon"}
              </Button>
              <Button
                icon={<DatabaseOutlined />}
                onClick={handleSeed}
                className="coupon-seed-btn"
                size={screens.xs ? "middle" : "large"}
              >
                Seed Coupons
              </Button>
            </Flex>
          </div>

          {/* Create/Edit Form Modal */}
          <Modal
            title={
              <Flex align="center" gap="small">
                {editingCoupon ? <EditOutlined /> : <PlusOutlined />}
                <span>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</span>
              </Flex>
            }
            open={showForm}
            onCancel={() => {
              setShowForm(false);
              setEditingCoupon(null);
              form.resetFields();
            }}
            footer={null}
            width={550}
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
                label={<span><TagOutlined /> Coupon Code</span>}
                rules={[
                  { required: true, message: "Please enter coupon code" },
                  { min: 3, message: "Code must be at least 3 characters" },
                  { max: 20, message: "Code must be less than 20 characters" },
                  { pattern: /^[A-Z0-9]+$/, message: "Use uppercase letters and numbers only" }
                ]}
                tooltip={{ title: "Use uppercase letters and numbers only", icon: <TagOutlined /> }}
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
                label={<span><EditOutlined /> Description</span>}
              >
                <Input.TextArea
                  placeholder="Describe what this coupon offers"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="discountPercent"
                    label={<span><PercentageOutlined /> Discount (%)</span>}
                    rules={[
                      { required: true, message: "Please enter discount percentage" },
                      { type: 'number', min: 1, max: 100, message: "Discount must be between 1 and 100" }
                    ]}
                  >
                    <InputNumber
                      placeholder="10"
                      min={1}
                      max={100}
                      size="large"
                      style={{ width: "100%" }}
                      prefix={<PercentageOutlined />}
                      formatter={(value) => `${value}%`}
                      parser={(value) => value?.replace('%', '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="minOrderAmount"
                    label={<span>Minimum Order (₹)</span>}
                    rules={[
                      { type: 'number', min: 0, message: "Amount must be 0 or greater" }
                    ]}
                  >
                    <InputNumber
                      placeholder="0"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix="₹"
                      formatter={(value) => `₹${value}`}
                      parser={(value) => value?.replace('₹', '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="maxDiscountAmount"
                    label={<span><ControlOutlined /> Max Discount (₹)</span>}
                    tooltip="Leave empty for no limit"
                  >
                    <InputNumber
                      placeholder="No limit"
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                      prefix="₹"
                      formatter={(value) => value ? `₹${value}` : ''}
                      parser={(value) => value?.replace('₹', '')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="maxUsage"
                    label={<span><TrophyOutlined /> Max Usage</span>}
                    tooltip="Leave empty for unlimited"
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
                label={<span><CheckCircleOutlined /> Status</span>}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>

              <Form.Item>
                <Flex gap="middle" wrap="wrap">
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
                </Flex>
              </Form.Item>
            </Form>
          </Modal>

          {/* Coupons Table */}
          <Card 
            className="coupon-table-card" 
            title={
              <Flex align="center" gap="small">
                <GiftOutlined style={{ color: '#ff9f4a' }} />
                <span>All Coupons</span>
              </Flex>
            }
            variant="borderless"
          >
            {loading ? (
              <div className="coupon-loading">
                <Spin size="large" description="Loading coupons..." />
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
                  pageSize: screens.xs ? 5 : 10,
                  showTotal: (total) => `Total ${total} coupons`,
                  showSizeChanger: !screens.xs,
                  showQuickJumper: !screens.xs,
                  responsive: true
                }}
                className="coupon-table"
                scroll={{ x: 700 }}
                size={screens.xs ? "small" : "middle"}
              />
            )}
          </Card>

          {/* Tips Section */}
          <Card className="coupon-tips-card" variant="borderless">
            <div className="coupon-tips-header">
              <BulbOutlined className="coupon-tips-icon" />
              <span className="coupon-tips-title">Pro Tips for Coupon Management</span>
            </div>
            <Divider className="coupon-tips-divider" />
            <Row gutter={[16, 16]}>
              {proTips.map((tip, index) => (
                <Col xs={24} sm={12} md={8} lg={24/5} key={index}>
                  <div className="coupon-tip-item">
                    <div className="coupon-tip-icon" style={{ color: tip.color }}>
                      {tip.icon}
                    </div>
                    <div className="coupon-tip-content">
                      <div className="coupon-tip-title" style={{ color: tip.color }}>
                        {tip.title}
                      </div>
                      <div className="coupon-tip-description">
                        {tip.description}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </div>
    </>
  );
}

export default CouponManagement;