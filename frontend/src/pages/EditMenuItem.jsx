import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  message,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Spin,
  Image,
  Radio,
  Switch
} from "antd";

import {
  ArrowLeftOutlined,
  UploadOutlined
} from "@ant-design/icons";

import API_BASE_URL from "../config";
import "../styles/editmenu.css";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function EditMenuItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
    fetchMenuItem();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE_URL}/api/menu`);
    const data = await res.json();

    const unique = [...new Set(data.map(item => item.category))];
    setCategories(unique);
  };

  const fetchRestaurants = async () => {
    const res = await fetch(`${API_BASE_URL}/api/restaurants`);
    const data = await res.json();
    setRestaurants(Array.isArray(data) ? data : []);
  };

  const fetchMenuItem = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`);

      if (!res.ok) throw new Error();

      const data = await res.json();

      const imageUrl = data.image
        ? data.image.startsWith("/uploads/")
          ? `${API_BASE_URL}${data.image}`
          : `${API_BASE_URL}/uploads/${data.image}`
        : "";

      setImagePreview(imageUrl);

      form.setFieldsValue({
        restaurantId: data.restaurantId || "",
        name: data.name || "",
        description: data.desc || "",
        price: data.price || 0,
        discount: data.discount || 0,
        kcal: data.kcal || 0,
        time: data.time || 0,
        category: data.category || "",
        foodType: data.foodType || "veg",
        isSpicy: data.isSpicy || false,
        isRecommended: data.isRecommended || false
      });

    } catch {
      message.error("Failed to load menu item");
    } finally {
      setPageLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    return false;
  };

  const onFinish = async (values) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", values.name || "");
      formData.append("desc", values.description || "");
      formData.append("price", values.price || 0);
      formData.append("discount", values.discount || 0);
      formData.append("kcal", values.kcal || 0);
      formData.append("time", values.time || 0);
      formData.append("category", values.category || "");
      formData.append("foodType", values.foodType || "veg");
      formData.append("restaurantId", values.restaurantId || "");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        message.success("Menu item updated successfully 🎉");
        navigate("/admin");
      } else {
        message.error(data.error || "Update failed");
      }

    } catch {
      message.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <Spin fullscreen />;
  }

  return (
    <div className="edit-menu-container">
      <div className="edit-menu-content">

        <Card className="edit-menu-card">

          <div className="edit-menu-header">
            <Button
              className="edit-menu-back-btn"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeftOutlined /> Back
            </Button>

            <Title className="edit-menu-title">Edit Menu Item</Title>
            <Paragraph className="edit-menu-subtitle">
              Update your dish beautifully 🍽️
            </Paragraph>
          </div>

          <Divider />

          <Form form={form} layout="vertical" onFinish={onFinish}>

            <Form.Item name="name" label="Item Name" className="edit-menu-form-item">
              <Input size="large" />
            </Form.Item>

            <Form.Item name="description" label="Description" className="edit-menu-form-item">
              <TextArea rows={4} />
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="price" label="Price" className="edit-menu-form-item">
                  <InputNumber style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="discount" label="Discount" className="edit-menu-form-item">
                  <InputNumber style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="kcal" label="Calories" className="edit-menu-form-item">
                  <InputNumber style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="time" label="Prep Time" className="edit-menu-form-item">
                  <InputNumber style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="category" label="Category" className="edit-menu-form-item">
              <Select size="large">
                {categories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="restaurantId" label="Restaurant" className="edit-menu-form-item">
              <Select size="large">
                {restaurants.map(r => (
                  <Option key={r._id} value={r._id}>{r.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="foodType" label="Food Type" className="edit-menu-form-item">
              <Radio.Group>
                <Radio value="veg">🌱 Veg</Radio>
                <Radio value="non-veg">🍖 Non Veg</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="isSpicy" label="Spicy" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="isRecommended" label="Recommended" valuePropName="checked">
              <Switch />
            </Form.Item>

            <div className="edit-menu-image-section">
              <div className="edit-menu-image-label">Current Image</div>

              {imagePreview && (
                <div className="edit-menu-image-preview">
                  <Image src={imagePreview} width={150} height={150} />
                </div>
              )}

              <Upload beforeUpload={handleImageUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />} className="edit-menu-submit-btn">
                  Upload New Image
                </Button>
              </Upload>
            </div>

            <Divider />

            <Button
              htmlType="submit"
              loading={isLoading}
              className="edit-menu-submit-btn"
            >
              Update Menu Item
            </Button>

          </Form>
        </Card>
      </div>
    </div>
  );
}

export default EditMenuItem;