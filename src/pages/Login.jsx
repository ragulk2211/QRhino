import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Input, Button, Typography, message } from "antd"
import { loginUser } from "../services/authService"

const { Title } = Typography

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)

      const data = await loginUser(email, password)

      if (!data.success) {
        message.error(data.message)
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      localStorage.setItem("restaurantId", data.restaurantId || "")

      message.success("Login successful")

      if (data.role === "superadmin") {
        navigate("/admin-dashboard")
      }

      else if (data.role === "admin") {
        navigate("/restaurant-dashboard")
      }

      else if (data.role === "kitchen") {
        navigate("/kitchen")
      }

      else {
        navigate("/home")
      }

    } catch {
      message.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#fff9f0"
    }}>
      <Card style={{ width: 380, borderRadius: 20 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Login
        </Title>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Card>
    </div>
  )
}

export default Login

