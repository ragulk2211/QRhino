import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Breadcrumb,
  Statistic,
  Tag,
  Skeleton,
  Alert,
  Table,
  Switch,
  Modal,
  Form,
  Input,
  Select,
  message,
  Dropdown,
  Menu
} from "antd";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  SettingOutlined,
  BarChartOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CrownOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/SuperAdminDashboard.css";

const { Title, Text } = Typography;
const { Search } = Input;

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    adminCount: 0,
    kitchenCount: 0,
    userCount: 0
  });
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateAdminModalVisible, setIsCreateAdminModalVisible] = useState(false);
  const [form] = Form.useForm();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Fetch restaurants
      const restaurantsRes = await fetch(`${API_BASE_URL}/api/admin/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const restaurantsData = await restaurantsRes.json();
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.restaurants);
      }

      // Fetch orders
      const ordersRes = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRestaurantStatus = async (restaurantId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/restaurants/${restaurantId}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        message.success(data.message);
        fetchData();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error("Failed to toggle status");
    }
  };

  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            message.success("User deleted successfully");
            fetchData();
          } else {
            message.error(data.message);
          }
        } catch (error) {
          message.error("Failed to delete user");
        }
      }
    });
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    Modal.confirm({
      title: "Delete Restaurant",
      content: "Are you sure you want to delete this restaurant? This action cannot be undone.",
      onOk: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/restaurants/${restaurantId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            message.success("Restaurant deleted successfully");
            fetchData();
          } else {
            message.error(data.message);
          }
        } catch (error) {
          message.error("Failed to delete restaurant");
        }
      }
    });
  };

  const handleCreateAdmin = async (values) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (data.success) {
        message.success("Admin created successfully");
        setIsCreateAdminModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error("Failed to create admin");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin":
        return "purple";
      case "admin":
        return "blue";
      case "kitchen":
        return "orange";
      default:
        return "default";
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>
    },
    {
      title: "Restaurant",
      dataIndex: "restaurantId",
      key: "restaurantId",
      render: (restaurantId) => restaurantId ? restaurantId.name : <Text type="secondary">-</Text>
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteUser(record._id)}
        />
      )
    }
  ];

  const restaurantColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location"
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleRestaurantStatus(record._id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRestaurant(record._id)}
        />
      )
    }
  ];

  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Text copyable>{id.slice(-8)}</Text>
    },
    {
      title: "Restaurant",
      dataIndex: "restaurantId",
      key: "restaurantId",
      render: (restaurant) => restaurant?.name || "-"
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text strong>₹{amount}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getOrderStatusColor(status)}>{status.toUpperCase()}</Tag>
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  const StatCard = ({ title, value, icon, color, loading }) => (
    <Card className="super-admin-stat-card" hoverable>
      <div className="super-admin-stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <Statistic
        title={title}
        value={loading ? "..." : value}
        className="super-admin-statistic"
      />
    </Card>
  );

  const tabItems = [
    { key: "dashboard", label: "Dashboard", icon: <BarChartOutlined /> },
    { key: "users", label: "Users", icon: <TeamOutlined /> },
    { key: "restaurants", label: "Restaurants", icon: <ShopOutlined /> },
    { key: "orders", label: "Orders", icon: <ShoppingCartOutlined /> }
  ];

  const breadcrumbItems = [
    {
      title: (
        <span>
          <CrownOutlined /> Super Admin
        </span>
      )
    },
    {
      title: activeTab === "dashboard" ? "Dashboard" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    }
  ];

  return (
    <div className="super-admin-container">
      <div className="super-admin-content">
        <Breadcrumb className="super-admin-breadcrumb" items={breadcrumbItems} />

        {/* Header */}
        <div className="super-admin-header">
          <div className="super-admin-header-left">
            <div className="super-admin-header-icon">
              <CrownOutlined />
            </div>
            <div className="super-admin-header-info">
              <Title level={2} className="super-admin-title">
                Super Admin Panel 👑
              </Title>
              <Text type="secondary">
                Manage all restaurants, users, and system settings
              </Text>
            </div>
          </div>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateAdminModalVisible(true)}
            >
              Create Admin
            </Button>
          </Space>
        </div>

        {/* Tab Navigation */}
        <div className="super-admin-tabs">
          {tabItems.map((item) => (
            <div
              key={item.key}
              className={`super-admin-tab ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="super-admin-dashboard">
            {/* Stats Grid */}
            <div className="super-admin-stats-section">
              <Title level={3} className="super-admin-section-title">
                <BarChartOutlined /> System Overview
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<UserOutlined />}
                    color="#1890ff"
                    loading={isLoading}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Restaurants"
                    value={stats.totalRestaurants}
                    icon={<ShopOutlined />}
                    color="#52c41a"
                    loading={isLoading}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={<ShoppingCartOutlined />}
                    color="#faad14"
                    loading={isLoading}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={<ClockCircleOutlined />}
                    color="#fa8c16"
                    loading={isLoading}
                  />
                </Col>
              </Row>
            </div>

            {/* User Breakdown */}
            <div className="super-admin-breakdown-section">
              <Title level={3} className="super-admin-section-title">
                <TeamOutlined /> User Breakdown
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={8}>
                  <Card className="super-admin-breakdown-card">
                    <Statistic
                      title="Super Admins"
                      value={1}
                      prefix={<CrownOutlined style={{ color: "#722ed1" }} />}
                    />
                  </Card>
                </Col>
                <Col xs={8}>
                  <Card className="super-admin-breakdown-card">
                    <Statistic
                      title="Admins"
                      value={stats.adminCount}
                      prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                    />
                  </Card>
                </Col>
                <Col xs={8}>
                  <Card className="super-admin-breakdown-card">
                    <Statistic
                      title="Kitchen Staff"
                      value={stats.kitchenCount}
                      prefix={<SettingOutlined style={{ color: "#fa8c16" }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Recent Orders */}
            <div className="super-admin-recent-section">
              <Title level={3} className="super-admin-section-title">
                <ShoppingCartOutlined /> Recent Orders
              </Title>
              <Card>
                <Table
                  columns={orderColumns}
                  dataSource={orders.slice(0, 5)}
                  rowKey="_id"
                  pagination={false}
                  loading={isLoading}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="super-admin-users">
            <Title level={3} className="super-admin-section-title">
              <TeamOutlined /> All Users
            </Title>
            <Card>
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === "restaurants" && (
          <div className="super-admin-restaurants">
            <Title level={3} className="super-admin-section-title">
              <ShopOutlined /> All Restaurants
            </Title>
            <Card>
              <Table
                columns={restaurantColumns}
                dataSource={restaurants}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="super-admin-orders">
            <Title level={3} className="super-admin-section-title">
              <ShoppingCartOutlined /> All Orders
            </Title>
            <Card>
              <Table
                columns={orderColumns}
                dataSource={orders}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      <Modal
        title="Create Admin User"
        open={isCreateAdminModalVisible}
        onCancel={() => {
          setIsCreateAdminModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAdmin}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter admin name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" }
            ]}
          >
            <Input placeholder="Enter admin email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Admin
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;