import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
  Typography,
  Breadcrumb,
  Select,
  Spin,
  Empty,
  Image,
  Tag,
  Alert,
  Modal,
  Avatar,
  Tooltip,
  QRCode,
  Input,
  Tabs,
  Badge,
  Progress,
  Statistic
} from "antd";
import {
  ArrowLeftOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  MailOutlined,
  WhatsAppOutlined,
  FacebookOutlined,
  TwitterOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  FileImageOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import API_BASE_URL from "../config";
import "../styles/qrGenerator.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function QRGenerator() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [allQRCodes, setAllQRCodes] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRestaurants(data);
      if (data.length > 0) {
        message.success(`Loaded ${data.length} restaurants`);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error("Failed to fetch restaurants");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedRestaurant) {
      message.warning("Please select a restaurant");
      return;
    }

    setIsLoading(true);
    try {
      const restaurant = restaurants.find(r => r._id === selectedRestaurant);
      const menuUrl = `${window.location.origin}/menu?restaurant=${selectedRestaurant}`;
      const encodedUrl = encodeURIComponent(menuUrl);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
      
      setQrCodeUrl(qrUrl);
      message.success("QR Code generated successfully!");
    } catch (error) {
      console.error("Error generating QR:", error);
      message.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-${selectedRestaurant}.png`;
      link.click();
      message.success("Download started!");
    }
  };

  const copyToClipboard = () => {
    if (qrCodeUrl) {
      navigator.clipboard.writeText(qrCodeUrl);
      message.success("QR code URL copied to clipboard!");
    }
  };

  const generateAllQRCodes = async () => {
    if (restaurants.length === 0) {
      message.warning("No restaurants found");
      return;
    }

    setGeneratingAll(true);
    const baseUrl = window.location.origin;
    const qrData = await Promise.all(
      restaurants.map(async (restaurant) => {
        const url = `${baseUrl}/menu?restaurantId=${restaurant._id}`;
        const encoded = encodeURIComponent(url);
        return {
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location?.address?.city || restaurant.location || "Location not set",
          cuisine: restaurant.cuisine || "Multi-cuisine",
          url: url,
          qrSrc: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`
        };
      })
    );
    setAllQRCodes(qrData);
    setGeneratingAll(false);
    message.success(`${qrData.length} QR codes generated!`);
  };

  const downloadSingleQR = (qr) => {
    const link = document.createElement("a");
    link.href = qr.qrSrc;
    link.download = `${qr.name.replace(/\s+/g, '-')}-menu-qr.png`;
    link.click();
    message.success(`Downloaded ${qr.name} QR code`);
  };

  const downloadAllQRCodes = () => {
    allQRCodes.forEach((qr, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = qr.qrSrc;
        link.download = `${qr.name.replace(/\s+/g, '-')}-menu-qr.png`;
        link.click();
      }, index * 500);
    });
    message.success(`Downloading ${allQRCodes.length} QR codes...`);
  };

  const shareQR = async (qr) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${qr.name} Menu QR Code`,
          text: `Scan to view ${qr.name} menu`,
          url: qr.url
        });
        message.success("Shared successfully!");
      } catch (error) {
        message.error("Failed to share");
      }
    } else {
      copyToClipboard();
    }
  };

  const printQR = (qr) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${qr.name} QR Code</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; padding: 40px; }
            img { width: 300px; height: 300px; margin: 20px auto; }
            h1 { color: #b87a4a; }
            p { color: #c9a87c; }
          </style>
        </head>
        <body>
          <h1>${qr.name}</h1>
          <img src="${qr.qrSrc}" />
          <p>Scan to view menu</p>
          <p>${qr.url}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const selectedRestaurantData = restaurants.find(r => r._id === selectedRestaurant);

  // Create breadcrumb items for the new API
  const breadcrumbItems = [
    {
      title: <a onClick={() => navigate("/admin")}>Dashboard</a>,
      key: "dashboard"
    },
    {
      title: "QR Generator",
      key: "qr-generator"
    }
  ];

  // Create tab items for the new API
  const tabItems = [
    {
      key: "single",
      label: (
        <span>
          <QrcodeOutlined className="qr-gen-tab-icon" /> Single QR
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card 
              className="qr-gen-form-card" 
              title={
                <Space>
                  <QrcodeOutlined className="qr-gen-card-icon" />
                  <span>Generate QR Code</span>
                </Space>
              }
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  label={
                    <Space>
                      Select Restaurant
                      <Tooltip title="Choose the restaurant to generate QR code for">
                        <InfoCircleOutlined style={{ color: '#ff9f4a' }} />
                      </Tooltip>
                    </Space>
                  }
                  required
                  className="qr-gen-form-item"
                >
                  <Select
                    size="large"
                    placeholder="Choose a restaurant"
                    loading={isLoading && restaurants.length === 0}
                    onChange={(value) => setSelectedRestaurant(value)}
                    showSearch
                    className="qr-gen-select"
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {restaurants.map(restaurant => (
                      <Option key={restaurant._id} value={restaurant._id}>
                        <Space>
                          <span>{restaurant.name}</span>
                          <Tag color="orange" className="qr-gen-location-tag">
                            {restaurant.location?.address?.city || restaurant.location || "Location"}
                          </Tag>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={generateQRCode}
                  loading={isLoading}
                  icon={<QrcodeOutlined />}
                  disabled={!selectedRestaurant}
                  className="qr-gen-generate-btn"
                >
                  Generate QR Code
                </Button>
              </Form>

              {selectedRestaurantData && (
                <div className="qr-gen-restaurant-info">
                  <Divider className="qr-gen-divider" />
                  <Space direction="vertical" size="small">
                    <Text strong className="qr-gen-info-label">Selected Restaurant:</Text>
                    <Text className="qr-gen-restaurant-name">{selectedRestaurantData.name}</Text>
                    <Text type="secondary" className="qr-gen-restaurant-location">
                      <GlobalOutlined /> {selectedRestaurantData.location?.address?.city || "Location not set"}
                    </Text>
                    {selectedRestaurantData.cuisine && (
                      <div className="qr-gen-cuisine-tags">
                        {selectedRestaurantData.cuisine.map((c, i) => (
                          <Tag key={i} color="orange" className="qr-gen-cuisine-tag">{c}</Tag>
                        ))}
                      </div>
                    )}
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            {qrCodeUrl ? (
              <Card 
                className="qr-gen-result-card" 
                title={
                  <Space>
                    <CheckCircleOutlined className="qr-gen-success-icon" />
                    <span>Your QR Code</span>
                  </Space>
                }
              >
                <div className="qr-gen-display">
                  <div className="qr-gen-image-wrapper">
                    <QRCode
                      value={`${window.location.origin}/menu?restaurant=${selectedRestaurant}`}
                      size={250}
                      icon={selectedRestaurantData?.image || "https://via.placeholder.com/50"}
                      iconSize={40}
                      bordered={false}
                      errorLevel="H"
                      className="qr-gen-code"
                    />
                  </div>
                  
                  <div className="qr-gen-actions">
                    <Space wrap size="middle">
                      <Tooltip title="Download QR Code">
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadQR}
                          size="large"
                          className="qr-gen-action-btn"
                        >
                          Download
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Copy URL">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={copyToClipboard}
                          size="large"
                          className="qr-gen-action-btn"
                        >
                          Copy URL
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Print">
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => printQR({ name: selectedRestaurantData?.name, url: qrCodeUrl, qrSrc: qrCodeUrl })}
                          size="large"
                          className="qr-gen-action-btn"
                        >
                          Print
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Share">
                        <Button
                          icon={<ShareAltOutlined />}
                          onClick={() => shareQR({ name: selectedRestaurantData?.name, url: qrCodeUrl })}
                          size="large"
                          className="qr-gen-action-btn"
                        >
                          Share
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>

                  <div className="qr-gen-info">
                    <Alert
                      message="How to use"
                      description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          <li>Display this QR code at your restaurant counter</li>
                          <li>Print and place on tables for easy access</li>
                          <li>Share digitally with customers via WhatsApp or Email</li>
                          <li>Customers can scan with phone camera to view menu</li>
                        </ul>
                      }
                      type="info"
                      showIcon
                      className="qr-gen-info-alert"
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="qr-gen-empty-card">
                <Empty
                  description="No QR code generated yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="qr-gen-empty"
                >
                  <Button 
                    type="primary" 
                    onClick={generateQRCode} 
                    disabled={!selectedRestaurant}
                    className="qr-gen-empty-btn"
                  >
                    Generate QR Code
                  </Button>
                </Empty>
              </Card>
            )}
          </Col>
        </Row>
      )
    },
    {
      key: "bulk",
      label: (
        <span>
          <FileImageOutlined className="qr-gen-tab-icon" /> Bulk QR Codes
        </span>
      ),
      children: (
        <Card className="qr-gen-bulk-card">
          <div className="qr-gen-bulk-header">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div className="qr-gen-bulk-stats">
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        <GlobalOutlined />
                      </div>
                      <div className="qr-gen-stat-value-small">{restaurants.length}</div>
                      <div className="qr-gen-stat-label-small">Total Restaurants</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        <QrcodeOutlined />
                      </div>
                      <div className="qr-gen-stat-value-small">{allQRCodes.length}</div>
                      <div className="qr-gen-stat-label-small">Generated QR Codes</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        {allQRCodes.length === restaurants.length ? <CheckCircleOutlined /> : <LoadingOutlined />}
                      </div>
                      <div className="qr-gen-stat-value-small">
                        {Math.round((allQRCodes.length / (restaurants.length || 1)) * 100)}%
                      </div>
                      <div className="qr-gen-stat-label-small">Progress</div>
                    </div>
                  </Col>
                </Row>
                <Progress
                  percent={(allQRCodes.length / (restaurants.length || 1)) * 100}
                  status={allQRCodes.length === restaurants.length ? "success" : "active"}
                  strokeColor="#ff9f4a"
                  className="qr-gen-progress"
                />
              </div>

              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<QrcodeOutlined />}
                  onClick={generateAllQRCodes}
                  loading={generatingAll}
                  disabled={restaurants.length === 0}
                  className="qr-gen-bulk-generate-btn"
                >
                  Generate All QR Codes
                </Button>
                {allQRCodes.length > 0 && (
                  <Button
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={downloadAllQRCodes}
                    className="qr-gen-bulk-download-btn"
                  >
                    Download All
                  </Button>
                )}
              </Space>
            </Space>
          </div>

          {allQRCodes.length > 0 && (
            <>
              <Divider className="qr-gen-divider" />
              <div className="qr-gen-bulk-grid">
                <div className="qr-gen-bulk-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {allQRCodes.map((qr) => (
                    <Card
                      key={qr.id}
                      hoverable
                      className="qr-gen-bulk-item"
                      cover={
                        <div className="qr-gen-bulk-cover">
                          <QRCode
                            value={qr.url}
                            size={200}
                            bordered={false}
                            errorLevel="H"
                            className="qr-gen-bulk-code"
                          />
                        </div>
                      }
                      actions={[
                        <Tooltip title="Download" key="download">
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadSingleQR(qr)}
                            className="qr-gen-bulk-action"
                          />
                        </Tooltip>,
                        <Tooltip title="Preview" key="preview">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedQR(qr);
                              setPreviewVisible(true);
                            }}
                            className="qr-gen-bulk-action"
                          />
                        </Tooltip>,
                        <Tooltip title="Share" key="share">
                          <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={() => shareQR(qr)}
                            className="qr-gen-bulk-action"
                          />
                        </Tooltip>,
                        <Tooltip title="Print" key="print">
                          <Button
                            type="text"
                            icon={<PrinterOutlined />}
                            onClick={() => printQR(qr)}
                            className="qr-gen-bulk-action"
                          />
                        </Tooltip>
                      ]}
                    >
                      <Card.Meta
                        title={<span className="qr-gen-bulk-title">{qr.name}</span>}
                        description={
                          <>
                            <Text type="secondary" className="qr-gen-bulk-location">
                              {qr.location}
                            </Text>
                            <br />
                            <Tag color="orange" className="qr-gen-bulk-cuisine-tag">
                              {qr.cuisine}
                            </Tag>
                          </>
                        }
                      />
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {allQRCodes.length === 0 && restaurants.length > 0 && !generatingAll && (
            <Empty
              description="Click 'Generate All QR Codes' to create QR codes for all restaurants"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="qr-gen-bulk-empty"
            />
          )}
        </Card>
      )
    },
    {
      key: "share",
      label: (
        <span>
          <ShareAltOutlined className="qr-gen-tab-icon" /> Share Options
        </span>
      ),
      children: (
        <Card className="qr-gen-share-card">
          <Title level={4} className="qr-gen-share-title">Share QR Codes with Customers</Title>
          <Paragraph className="qr-gen-share-subtitle">
            Easily share your restaurant QR codes through various channels
          </Paragraph>
          
          <Row gutter={[24, 24]} className="qr-gen-share-grid">
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon whatsapp">💬</div>
                <Button
                  block
                  icon={<WhatsAppOutlined />}
                  onClick={() => message.info("WhatsApp sharing coming soon")}
                  className="qr-gen-share-btn whatsapp-btn"
                >
                  Share on WhatsApp
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon email">📧</div>
                <Button
                  block
                  icon={<MailOutlined />}
                  onClick={() => message.info("Email sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share via Email
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon facebook">📘</div>
                <Button
                  block
                  icon={<FacebookOutlined />}
                  onClick={() => message.info("Facebook sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share on Facebook
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon twitter">🐦</div>
                <Button
                  block
                  icon={<TwitterOutlined />}
                  onClick={() => message.info("Twitter sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share on Twitter
                </Button>
              </Card>
            </Col>
          </Row>

          <Alert
            message="💡 Pro Tip"
            description="You can also download QR codes and print them for physical display at your restaurant"
            type="info"
            showIcon
            className="qr-gen-tip-alert"
          />
        </Card>
      )
    }
  ];

  return (
    <div className="qr-gen-container">
      <div className="qr-gen-content">
        {/* Fixed: Using items prop instead of Breadcrumb.Item */}
        <Breadcrumb items={breadcrumbItems} className="qr-gen-breadcrumb" />

        {/* Fixed: Using items prop instead of TabPane */}
        <Tabs 
          defaultActiveKey="single" 
          className="qr-gen-tabs"
          items={tabItems}
          onChange={setActiveTab}
        />

        {/* Preview Modal */}
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={450}
          centered
          title={`${selectedQR?.name} QR Code`}
          className="qr-gen-preview-modal"
        >
          {selectedQR && (
            <div className="qr-gen-preview-content">
              <div className="qr-gen-preview-qr">
                <QRCode
                  value={selectedQR.url}
                  size={300}
                  bordered={true}
                  errorLevel="H"
                />
              </div>
              <div className="qr-gen-preview-actions">
                <Space wrap size="middle">
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => downloadSingleQR(selectedQR)}
                    className="qr-gen-preview-btn"
                  >
                    Download
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => shareQR(selectedQR)}
                    className="qr-gen-preview-btn"
                  >
                    Share
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => printQR(selectedQR)}
                    className="qr-gen-preview-btn"
                  >
                    Print
                  </Button>
                </Space>
              </div>
              <div className="qr-gen-preview-url">
                <Text type="secondary" className="qr-gen-preview-url-text">
                  {selectedQR.url}
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default QRGenerator;