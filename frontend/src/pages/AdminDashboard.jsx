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
  Avatar,
  Divider,
  Tooltip,
  Modal
} from "antd";
import {
  ArrowLeftOutlined,
  ShopOutlined,
  FolderOutlined,
  MenuOutlined,
  QrcodeOutlined,
  GiftOutlined,
  PlusOutlined,
  BulbOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  DashboardOutlined,
  CameraOutlined,
  TagsOutlined,
  BarChartOutlined,
  AimOutlined,
  SmileOutlined,
  CrownOutlined,
  HeartOutlined,
  RiseOutlined,
  UserOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  StarOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/AdminDashboard.css";

const { Title, Text, Paragraph } = Typography;

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    restaurants: 0,
    categories: 0,
    menuItems: 0,
    qrCodes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);

  useEffect(() => {
    setGreeting(getGreeting());
    updateDateTime();
    fetchDashboardStats();
    
    const interval = setInterval(() => {
      updateDateTime();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString());
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  };

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

  const handleNavigate = (path, fromPage) => {
    navigate(path, { state: { from: fromPage } });
  };

  const showTipDetails = (tip) => {
    setSelectedTip(tip);
    setTipModalVisible(true);
  };

  const actions = [
    { 
      label: "Create Restaurant", 
      path: "/admin/create-restaurant", 
      desc: "Add a new restaurant to the system",
      icon: <ShopOutlined />,
      color: "#ff9f4a",
      bgColor: "#fff7ed",
      fromPage: "/admin"
    },
    { 
      label: "Create Category",   
      path: "/admin/create-category",   
      desc: "Add a new menu category",
      icon: <FolderOutlined />,
      color: "#ffb347",
      bgColor: "#fff7ed",
      fromPage: "/admin"
    },
    { 
      label: "Add Food Menu",     
      path: "/add-item",                 
      desc: "Add a new food item with image",
      icon: <MenuOutlined />,
      color: "#ffc08a",
      bgColor: "#fff7ed",
      fromPage: "/admin"
    },
    { 
      label: "Generate QR Code",  
      path: "/admin/qr-generator",       
      desc: "Generate QR code for a menu page",
      icon: <QrcodeOutlined />,
      color: "#ff9f4a",
      bgColor: "#fff7ed",
      fromPage: "/admin"
    },
    { 
      label: "Manage Coupons",    
      path: "/admin/coupons",           
      desc: "Create and manage discount coupons",
      icon: <GiftOutlined />,
      color: "#ffb347",
      bgColor: "#fff7ed",
      fromPage: "/admin"
    },
  ];

  const tips = [
    { 
      icon: <CameraOutlined />, 
      text: "Add high-quality images to your menu items for better engagement", 
      color: "#ff9f4a",
      detailedDesc: "High-quality images can increase customer engagement by up to 80%. Use professional photos with good lighting and composition to make your dishes look appetizing."
    },
    { 
      icon: <TagsOutlined />, 
      text: "Organize items with proper categories for easy navigation", 
      color: "#ffb347",
      detailedDesc: "Proper categorization helps customers find what they're looking for quickly. Group similar items together and use clear, descriptive category names."
    },
    { 
      icon: <BarChartOutlined />, 
      text: "Generate QR codes for each restaurant to track performance", 
      color: "#ffc08a",
      detailedDesc: "QR codes allow you to track restaurant performance, monitor scan statistics, and understand customer behavior patterns."
    },
    { 
      icon: <AimOutlined />, 
      text: "Regularly update menu items to keep customers engaged", 
      color: "#ff9f4a",
      detailedDesc: "Regular menu updates keep your offerings fresh and encourage repeat visits. Consider seasonal specials and limited-time offers."
    }
  ];

  const StatCard = ({ title, value, icon, trend, loading }) => (
    <Card className="admin-dash-stat-card" hoverable>
      <div className="admin-dash-stat-icon-wrapper">
        <div className="admin-dash-stat-icon">{icon}</div>
      </div>
      <Statistic
        title={title}
        value={loading ? "..." : value}
        className="admin-dash-statistic"
      />
      {trend && !loading && (
        <div className="admin-dash-stat-trend">
          <RiseOutlined className="trend-icon" />
          <Tag color="orange" className="admin-dash-trend-tag">{trend}</Tag>
        </div>
      )}
      {loading && <Skeleton.Input active size="small" className="admin-dash-stat-skeleton" />}
    </Card>
  );

  const breadcrumbItems = [
    {
      title: (
        <span className="breadcrumb-home">
          <DashboardOutlined /> Dashboard
        </span>
      ),
    },
    {
      title: "Admin Panel",
    },
  ];

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-bg-pattern"></div>
      <div className="admin-dash-content">
        <Breadcrumb className="admin-dash-breadcrumb" items={breadcrumbItems} />

        {/* Header Section */}
        <div className="admin-dash-header">
          <div className="admin-dash-header-left">
            <div className="admin-dash-avatar-wrapper">
              <Avatar size={72} icon={<RocketOutlined />} className="admin-dash-header-avatar" />
              <div className="avatar-glow"></div>
            </div>
            <div className="admin-dash-header-info">
              <div className="greeting-badge">
                <SmileOutlined className="greeting-icon" />
                <span className="greeting-text">{greeting}</span>
              </div>
              <Title level={2} className="admin-dash-title">
                Admin! <UserOutlined className="title-icon" />
              </Title>
              <div className="header-stats">
                <Space size="middle" wrap>
                  <div className="header-stat-item">
                    <StarOutlined className="header-stat-icon" />
                    <Text className="header-stat-text">Welcome back to your command center</Text>
                  </div>
                  <Divider type="vertical" className="header-divider" />
                  <div className="header-stat-item">
                    <CalendarOutlined className="header-stat-icon" />
                    <Text className="header-stat-text">{currentDate}</Text>
                  </div>
                  <Divider type="vertical" className="header-divider" />
                  <div className="header-stat-item">
                    <ClockCircleOutlined className="header-stat-icon" />
                    <Text className="header-stat-text">{currentTime}</Text>
                  </div>
                </Space>
              </div>
            </div>
          </div>
          <Tooltip title="Return to Home Page">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              className="admin-dash-back-btn"
            >
              Back to Home
            </Button>
          </Tooltip>
        </div>

        {/* Stats Grid */}
        <div className="admin-dash-stats-section">
          <Row gutter={[16, 16]}>
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
            <div className="section-header-left">
              <ThunderboltOutlined className="section-icon" />
              <Title level={3} className="admin-dash-section-title">
                Quick Actions
              </Title>
            </div>
            <Text type="secondary" className="section-subtitle">
              Manage your restaurant content efficiently
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {actions.map((action, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  className="admin-dash-action-card"
                  hoverable
                  onClick={() => handleNavigate(action.path, action.fromPage)}
                >
                  <div className="action-card-icon" style={{ backgroundColor: action.bgColor }}>
                    <div className="action-icon-wrapper" style={{ color: action.color }}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="action-card-content">
                    <Title level={4} className="action-card-title">
                      {action.label}
                    </Title>
                    <Text type="secondary" className="action-card-desc">
                      {action.desc}
                    </Text>
                    <div className="action-card-link">
                      <span>Get started</span>
                      <PlusOutlined className="link-icon" />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Quick Tips Section */}
        <div className="admin-dash-tips-section">
          <div className="admin-dash-section-header">
            <div className="section-header-left">
              <BulbOutlined className="section-icon" />
              <Title level={3} className="admin-dash-section-title">
                Quick Tips
              </Title>
            </div>
            <Text type="secondary" className="section-subtitle">
              Click on any tip to learn more
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {tips.map((tip, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="admin-dash-tip-card" 
                  hoverable
                  onClick={() => showTipDetails(tip)}
                >
                  <div className="tip-card-icon" style={{ color: tip.color }}>
                    {tip.icon}
                  </div>
                  <Text className="tip-card-text">{tip.text}</Text>
                  <div className="tip-card-footer">
                    <SafetyOutlined className="tip-footer-icon" />
                    <span className="tip-footer-text">Click for details</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Welcome Section */}
        <div className="admin-dash-welcome-section">
          <Card className="admin-dash-welcome-card">
            <div className="welcome-card-content">
              <div className="welcome-icon-wrapper">
                <CrownOutlined className="welcome-icon" />
              </div>
              <div className="welcome-text">
                <Title level={4} className="welcome-title">Welcome to Your Admin Dashboard</Title>
                <Paragraph className="welcome-description">
                  Manage restaurants, menu items, QR codes, and coupons all from one place. 
                  Get started by creating your first restaurant!
                </Paragraph>
                <div className="welcome-features">
                  <div className="feature-item">
                    <CheckCircleOutlined className="feature-icon" />
                    <span>Easy restaurant management</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircleOutlined className="feature-icon" />
                    <span>QR code generation</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircleOutlined className="feature-icon" />
                    <span>Coupon management system</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tip Details Modal */}
      <Modal
        title={
          <div className="tip-modal-title">
            <BulbOutlined style={{ color: '#ea580c', marginRight: '8px' }} />
            Pro Tip Details
          </div>
        }
        open={tipModalVisible}
        onCancel={() => setTipModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTipModalVisible(false)} className="tip-modal-close-btn">
            Got it
          </Button>
        ]}
        className="tip-detail-modal"
        width={500}
        centered
      >
        {selectedTip && (
          <div className="tip-modal-content">
            <div className="tip-modal-icon" style={{ color: selectedTip.color }}>
              {selectedTip.icon}
            </div>
            <div className="tip-modal-text">
              <Text strong className="tip-modal-quote">"{selectedTip.text}"</Text>
              <Paragraph className="tip-modal-description">
                {selectedTip.detailedDesc}
              </Paragraph>
              <div className="tip-modal-footer">
                <InfoCircleOutlined className="tip-modal-info-icon" />
                <Text type="secondary" className="tip-modal-hint">
                  Implement this tip to improve your restaurant management
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminDashboard;