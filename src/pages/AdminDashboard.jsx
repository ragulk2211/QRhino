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
  Empty,
  Avatar,
  Badge,
  Progress
} from "antd";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  FolderOutlined,
  MenuOutlined,
  QrcodeOutlined,
  GiftOutlined,
  PlusOutlined,
  EyeOutlined,
  BulbOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/AdminDashboard.css";

const { Title, Text } = Typography;

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    restaurants: 0,
    categories: 0,
    menuItems: 0,
    qrCodes: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentTime(new Date().toLocaleTimeString());
    fetchDashboardStats();
    fetchRecentActivities();
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const restaurantsRes = await fetch(`${API_BASE_URL}/api/restaurants`);
      const restaurants = await restaurantsRes.json();
      
      const menuRes = await fetch(`${API_BASE_URL}/api/menu`);
      const menuItems = await menuRes.json();
      
      const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean).length;

      setStats({
        restaurants: restaurants.length || 0,
        categories: categories || 0,
        menuItems: menuItems.length || 0,
        qrCodes: restaurants.length || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities = [
        { id: 1, action: "New restaurant added", time: "2 minutes ago", type: "success", icon: <ShopOutlined /> },
        { id: 2, action: "Menu item updated", time: "15 minutes ago", type: "info", icon: <MenuOutlined /> },
        { id: 3, action: "QR code generated", time: "1 hour ago", type: "warning", icon: <QrcodeOutlined /> },
        { id: 4, action: "Category created", time: "3 hours ago", type: "success", icon: <FolderOutlined /> },
        { id: 5, action: "Coupon created: SAVE20", time: "5 hours ago", type: "info", icon: <GiftOutlined /> }
      ];
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const actions = [
    { 
      label: "Create Restaurant", 
      path: "/admin/create-restaurant", 
      desc: "Add a new restaurant to the system",
      icon: <ShopOutlined />,
      color: "#ff9f4a"
    },
    { 
      label: "Create Category",   
      path: "/admin/create-category",   
      desc: "Add a new menu category",
      icon: <FolderOutlined />,
      color: "#ffb347"
    },
    { 
      label: "Add Food Menu",     
      path: "/add-item",                 
      desc: "Add a new food item with image",
      icon: <MenuOutlined />,
      color: "#ffc08a"
    },
    { 
      label: "Generate QR Code",  
      path: "/admin/qr-generator",       
      desc: "Generate QR code for a menu page",
      icon: <QrcodeOutlined />,
      color: "#ff9f4a"
    },
    { 
      label: "Manage Coupons",    
      path: "/admin/coupons",           
      desc: "Create and manage discount coupons",
      icon: <GiftOutlined />,
      color: "#ffb347"
    },
  ];

  const tips = [
    { icon: "📸", text: "Add high-quality images to your menu items for better engagement" },
    { icon: "🏷️", text: "Organize items with proper categories for easy navigation" },
    { icon: "📊", text: "Generate QR codes for each restaurant to track performance" },
    { icon: "🎯", text: "Regularly update menu items to keep customers engaged" }
  ];

  const getProgressPercentage = () => {
    const total = stats.restaurants + stats.categories + stats.menuItems;
    const max = 100;
    return Math.min(Math.round((total / max) * 100), 100);
  };

  const StatCard = ({ title, value, icon, trend, loading }) => (
    <Card className="admin-dash-stat-card" hoverable>
      <div className="admin-dash-stat-icon">{icon}</div>
      <Statistic
        title={title}
        value={loading ? "..." : value}
        styles={{ content: { color: '#ff9f4a', fontWeight: 700 } }}
        className="admin-dash-statistic"
      />
      {trend && !loading && (
        <div className="admin-dash-stat-trend">
          <Tag color="orange" className="admin-dash-trend-tag">{trend}</Tag>
        </div>
      )}
      {loading && <Skeleton.Input active size="small" className="admin-dash-stat-skeleton" />}
    </Card>
  );

  // Modern Breadcrumb items API
  const breadcrumbItems = [
    {
      title: (
        <span>
          <DashboardOutlined /> Dashboard
        </span>
      ),
    },
    {
      title: "Admin Panel",
    },
  ];

  // Modern Timeline items - Using CORRECT API with 'content' not 'children'
  const timelineItems = tips.map((tip, index) => ({
    key: index,
    icon: (
      <div className="admin-dash-timeline-dot">
        {tip.icon}
      </div>
    ),
    color: "orange",
    content: (  // ✅ Using 'content' instead of 'children'
      <Text className="admin-dash-tip-text">
        {tip.text}
      </Text>
    )
  }));

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-content">
        <Breadcrumb className="admin-dash-breadcrumb" items={breadcrumbItems} />

        {/* Header Section */}
        <div className="admin-dash-header">
          <div className="admin-dash-header-left">
            <Avatar size={64} icon={<RocketOutlined />} className="admin-dash-header-avatar" />
            <div className="admin-dash-header-info">
              <Title level={2} className="admin-dash-title">
                {greeting}, Admin! 👋
              </Title>
              <Space>
                <Text type="secondary" className="admin-dash-subtitle">
                  Welcome to your QRhino Admin Dashboard
                </Text>
                <Tag icon={<CalendarOutlined />} color="orange" className="admin-dash-time-tag">
                  {currentTime}
                </Tag>
              </Space>
            </div>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            className="admin-dash-back-btn"
          >
            Back to Home
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="admin-dash-stats-section">
          <div className="admin-dash-section-header">
            <Title level={3} className="admin-dash-section-title">
              <StarOutlined /> Overview Dashboard
            </Title>
            <Text type="secondary">Real-time statistics of your platform</Text>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Restaurants"
                value={stats.restaurants}
                icon={<ShopOutlined />}
                trend="+2 this week"
                loading={isLoading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Categories"
                value={stats.categories}
                icon={<FolderOutlined />}
                trend="+5 new"
                loading={isLoading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Menu Items"
                value={stats.menuItems}
                icon={<MenuOutlined />}
                trend="+12 added"
                loading={isLoading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="QR Codes"
                value={stats.qrCodes}
                icon={<QrcodeOutlined />}
                trend="Active"
                loading={isLoading}
              />
            </Col>
          </Row>
        </div>

        {/* Quick Actions Section */}
        <div className="admin-dash-actions-section">
          <div className="admin-dash-section-header">
            <Title level={3} className="admin-dash-section-title">
              <ThunderboltOutlined /> Quick Actions
            </Title>
            <Text type="secondary">Manage your restaurant content</Text>
          </div>
          <Row gutter={[24, 24]}>
            {actions.map((action, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  className="admin-dash-action-card"
                  hoverable
                  onClick={() => navigate(action.path)}
                >
                  <div className="admin-dash-action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <div className="admin-dash-action-content">
                    <Title level={4} className="admin-dash-action-title">
                      {action.label}
                    </Title>
                    <Text type="secondary" className="admin-dash-action-desc">
                      {action.desc}
                    </Text>
                    <div className="admin-dash-action-link">
                      <span>Get started</span>
                      <PlusOutlined />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Row gutter={[24, 24]}>
          {/* Recent Activity Section */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  <span>Recent Activity</span>
                  <Badge count={recentActivities.length} className="admin-dash-badge" />
                </Space>
              }
              className="admin-dash-activity-card"
              extra={
                <Button type="link" onClick={() => navigate("/admin/activities")}>
                  View All
                </Button>
              }
            >
              {recentActivities.length === 0 ? (
                <Empty description="No recent activities" />
              ) : (
                <div className="admin-dash-activity-list">
                  {recentActivities.map((item) => (
                    <div key={item.id} className="admin-dash-activity-item">
                      <div className="admin-dash-activity-item-content">
                        <Avatar
                          icon={item.icon}
                          className={`admin-dash-activity-avatar ${item.type}`}
                        />
                        <div className="admin-dash-activity-details">
                          <Space>
                            <Text strong className="admin-dash-activity-action">
                              {item.action}
                            </Text>
                            <Tag color="orange" className="admin-dash-activity-tag">
                              {item.type}
                            </Tag>
                          </Space>
                          <Text type="secondary" className="admin-dash-activity-time">
                            {item.time}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Quick Tips Section - Using custom timeline to avoid deprecated warnings */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <BulbOutlined />
                  <span>Quick Tips</span>
                </Space>
              }
              className="admin-dash-tips-card"
            >
              <div className="admin-dash-custom-timeline">
                {tips.map((tip, index) => (
                  <div key={index} className="admin-dash-custom-timeline-item">
                    <div className="admin-dash-custom-timeline-dot">
                      {tip.icon}
                    </div>
                    <div className="admin-dash-custom-timeline-content">
                      <Text className="admin-dash-tip-text">
                        {tip.text}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Progress Section */}
        <div className="admin-dash-progress-section">
          <Card className="admin-dash-progress-card">
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={8}>
                <div className="admin-dash-progress-left">
                  <div className="admin-dash-progress-icon">
                    <TrophyOutlined />
                  </div>
                  <Title level={4} className="admin-dash-progress-title">
                    Platform Progress
                  </Title>
                  <Text type="secondary">Track your achievements</Text>
                </div>
              </Col>
              <Col xs={24} md={16}>
                <div className="admin-dash-progress-stats">
                  <div className="admin-dash-progress-item">
                    <div className="admin-dash-progress-label">Completion Rate</div>
                    <Progress
                      percent={getProgressPercentage()}
                      strokeColor="#ff9f4a"
                      railColor="#ffe0c4"
                      className="admin-dash-progress-bar"
                    />
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <div className="admin-dash-milestone">
                        <div className="admin-dash-milestone-value">
                          {stats.restaurants}
                        </div>
                        <div className="admin-dash-milestone-label">Restaurants</div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="admin-dash-milestone">
                        <div className="admin-dash-milestone-value">
                          {stats.categories}
                        </div>
                        <div className="admin-dash-milestone-label">Categories</div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="admin-dash-milestone">
                        <div className="admin-dash-milestone-value">
                          {stats.menuItems}
                        </div>
                        <div className="admin-dash-milestone-label">Menu Items</div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="admin-dash-milestone">
                        <div className="admin-dash-milestone-value">
                          {Math.round(stats.restaurants * 10)}
                        </div>
                        <div className="admin-dash-milestone-label">QR Scans</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Loading Alert */}
        {isLoading && (
          <Alert
            title="Loading Dashboard Data"
            description="Please wait while we fetch the latest information"
            type="info"
            showIcon
            className="admin-dash-loading-alert"
          />
        )}

        {/* Welcome Alert */}
        {!isLoading && (
          <Alert
            title="🎉 Welcome to Your Admin Dashboard"
            description="Manage restaurants, menu items, QR codes, and coupons all from one place. Get started by creating your first restaurant!"
            type="success"
            showIcon
            className="admin-dash-welcome-alert"
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;