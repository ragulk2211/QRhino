import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Space,
  Divider
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  CrownOutlined,
  ShopOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "./Login.css";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const data = await res.json();

      if (data.success) {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("restaurantId", data.restaurantId || "");
        localStorage.setItem("userName", data.user?.name || "");
        localStorage.setItem("userEmail", data.user?.email || "");

        message.success(`Welcome back, ${data.user?.name}!`);

        // Role-based redirection
        switch (data.role) {
          case "superadmin":
            navigate("/superadmin");
            break;
          case "admin":
            navigate("/admin");
            break;
          case "kitchen":
            navigate("/kitchen");
            break;
          default:
            navigate("/");
        }
      } else {
        message.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-shape shape-1"></div>
        <div className="login-background-shape shape-2"></div>
        <div className="login-background-shape shape-3"></div>
      </div>

      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <CrownOutlined />
            </div>
            <Title level={2} className="login-title">
              QRhino
            </Title>
            <Text type="secondary" className="login-subtitle">
              Sign in to your account
            </Text>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email address"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<LoginOutlined />}
                className="login-button"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">Demo Accounts</Text>
          </Divider>

          <div className="demo-accounts">
            <div className="demo-account">
              <CrownOutlined className="demo-icon superadmin" />
              <div className="demo-info">
                <Text strong>Super Admin</Text>
                <Text type="secondary">super@admin.com / admin123</Text>
              </div>
            </div>
            <div className="demo-account">
              <ShopOutlined className="demo-icon admin" />
              <div className="demo-info">
                <Text strong>Admin</Text>
                <Text type="secondary">admin@restaurant.com / admin123</Text>
              </div>
            </div>
          </div>
        </Card>

        <div className="login-footer">
          <Text type="secondary">
            © 2024 QRhino. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Login;
