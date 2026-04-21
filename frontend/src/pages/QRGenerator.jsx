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
  Select,
  Empty,
  Tag,
  Alert,
  Modal,
  Tooltip,
  QRCode,
  Tabs,
  Progress,
  Flex
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
  FileImageOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  RocketOutlined
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
  const [messageApi, contextHolder] = message.useMessage();

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
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      messageApi.error("Failed to fetch restaurants");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedRestaurant) {
      messageApi.warning("Please select a restaurant");
      return;
    }

    setIsLoading(true);
    try {
      const menuUrl = `${window.location.origin}/menu?restaurantId=${selectedRestaurant}`;
      setQrCodeUrl(menuUrl);
      messageApi.success("QR Code generated successfully!");
    } catch (error) {
      console.error("Error generating QR:", error);
      messageApi.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const canvas = document.querySelector('.qr-gen-code canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-${selectedRestaurant}.png`;
        link.href = canvas.toDataURL();
        link.click();
        messageApi.success("Download started!");
      }
    }
  };

  const copyToClipboard = () => {
    const menuUrl = `${window.location.origin}/menu?restaurantId=${selectedRestaurant}`;
    navigator.clipboard.writeText(menuUrl);
    messageApi.success("Menu URL copied to clipboard!");
  };

  const generateAllQRCodes = async () => {
    if (restaurants.length === 0) {
      messageApi.warning("No restaurants found");
      return;
    }

    setGeneratingAll(true);
    const baseUrl = window.location.origin;
    const qrData = restaurants.map((restaurant) => {
      const url = `${baseUrl}/menu?restaurantId=${restaurant._id}`;
      return {
        id: restaurant._id,
        name: restaurant.name,
        location: restaurant.location?.address?.city || restaurant.location || "Location not set",
        cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : (restaurant.cuisine || "Multi-cuisine"),
        url: url,
      };
    });
    setAllQRCodes(qrData);
    setGeneratingAll(false);
    messageApi.success(`${qrData.length} QR codes generated!`);
  };

  const downloadSingleQR = (qr) => {
    const canvas = document.querySelector(`.qr-gen-bulk-code-${qr.id} canvas`);
    if (canvas) {
      const link = document.createElement("a");
      link.download = `${qr.name.replace(/\s+/g, '-')}-menu-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
      messageApi.success(`Downloaded ${qr.name} QR code`);
    }
  };

  const downloadAllQRCodes = () => {
    allQRCodes.forEach((qr, index) => {
      setTimeout(() => {
        const canvas = document.querySelector(`.qr-gen-bulk-code-${qr.id} canvas`);
        if (canvas) {
          const link = document.createElement("a");
          link.download = `${qr.name.replace(/\s+/g, '-')}-menu-qr.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      }, index * 500);
    });
    messageApi.success(`Downloading ${allQRCodes.length} QR codes...`);
  };

  const shareQR = async (qr) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${qr.name} Menu QR Code`,
          text: `Scan to view ${qr.name} menu`,
          url: qr.url
        });
        messageApi.success("Shared successfully!");
      } catch (error) {
        messageApi.error("Failed to share");
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
            .qr-container { margin: 20px auto; display: flex; justify-content: center; }
            h1 { color: #b87a4a; }
            p { color: #c9a87c; }
          </style>
        </head>
        <body>
          <h1>${qr.name}</h1>
          <div class="qr-container" id="qr-container"></div>
          <p>Scan to view menu</p>
          <p>${qr.url}</p>
          <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
          <script>
            new QRCode(document.getElementById("qr-container"), {
              text: "${qr.url}",
              width: 300,
              height: 300
            });
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const selectedRestaurantData = restaurants.find(r => r._id === selectedRestaurant);

  const handleGoBack = () => {
    navigate("/admin");
  };

  const tabItems = [
    {
      key: "single",
      label: (
        <span className="qr-gen-tab-label">
          <QrcodeOutlined className="qr-gen-tab-icon" /> 
          <span className="qr-gen-tab-text">Single QR</span>
        </span>
      ),
      children: (
        <div className="qr-gen-single-container">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card 
                className="qr-gen-form-card" 
                title={
                  <Space className="qr-gen-card-title-space">
                    <QrcodeOutlined className="qr-gen-card-icon" />
                    <span>Generate QR Code</span>
                  </Space>
                }
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    label={
                      <Space className="qr-gen-form-label">
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
                          <Space className="qr-gen-option-space">
                            <ShopOutlined />
                            <span className="qr-gen-option-name">{restaurant.name}</span>
                            <Tag color="orange" className="qr-gen-location-tag">
                              <EnvironmentOutlined /> {restaurant.location?.address?.city || restaurant.location || "Location"}
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
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong className="qr-gen-info-label">Selected Restaurant:</Text>
                      <Text className="qr-gen-restaurant-name">{selectedRestaurantData.name}</Text>
                      <Text type="secondary" className="qr-gen-restaurant-location">
                        <EnvironmentOutlined /> {selectedRestaurantData.location?.address?.city || "Location not set"}
                      </Text>
                      {selectedRestaurantData.cuisine && Array.isArray(selectedRestaurantData.cuisine) && selectedRestaurantData.cuisine.length > 0 && (
                        <div className="qr-gen-cuisine-tags">
                          {selectedRestaurantData.cuisine.slice(0, 3).map((c, i) => (
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
                    <Space className="qr-gen-card-title-space">
                      <CheckCircleOutlined className="qr-gen-success-icon" />
                      <span>Your QR Code</span>
                    </Space>
                  }
                >
                  <div className="qr-gen-display">
                    <div className="qr-gen-image-wrapper">
                      <QRCode
                        value={qrCodeUrl}
                        size={250}
                        bordered={false}
                        errorLevel="H"
                        className="qr-gen-code"
                      />
                    </div>
                    
                    <div className="qr-gen-actions">
                      <Flex gap="middle" wrap="wrap" justify="center">
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
                            onClick={() => printQR({ name: selectedRestaurantData?.name || "Restaurant", url: qrCodeUrl })}
                            size="large"
                            className="qr-gen-action-btn"
                          >
                            Print
                          </Button>
                        </Tooltip>
                        
                        <Tooltip title="Share">
                          <Button
                            icon={<ShareAltOutlined />}
                            onClick={() => shareQR({ name: selectedRestaurantData?.name || "Restaurant", url: qrCodeUrl })}
                            size="large"
                            className="qr-gen-action-btn"
                          >
                            Share
                          </Button>
                        </Tooltip>
                      </Flex>
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
                        icon={<InfoCircleOutlined />}
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
        </div>
      )
    },
    {
      key: "bulk",
      label: (
        <span className="qr-gen-tab-label">
          <FileImageOutlined className="qr-gen-tab-icon" /> 
          <span className="qr-gen-tab-text">Bulk QR Codes</span>
        </span>
      ),
      children: (
        <Card className="qr-gen-bulk-card">
          <div className="qr-gen-bulk-header">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div className="qr-gen-bulk-stats">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        <GlobalOutlined />
                      </div>
                      <div className="qr-gen-stat-value-small">{restaurants.length}</div>
                      <div className="qr-gen-stat-label-small">Total Restaurants</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        <QrcodeOutlined />
                      </div>
                      <div className="qr-gen-stat-value-small">{allQRCodes.length}</div>
                      <div className="qr-gen-stat-label-small">Generated QR Codes</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="qr-gen-stat-card-small">
                      <div className="qr-gen-stat-icon-small">
                        {allQRCodes.length === restaurants.length && restaurants.length > 0 ? <CheckCircleOutlined /> : <ThunderboltOutlined />}
                      </div>
                      <div className="qr-gen-stat-value-small">
                        {restaurants.length > 0 ? Math.round((allQRCodes.length / restaurants.length) * 100) : 0}%
                      </div>
                      <div className="qr-gen-stat-label-small">Progress</div>
                    </div>
                  </Col>
                </Row>
                <Progress
                  percent={restaurants.length > 0 ? (allQRCodes.length / restaurants.length) * 100 : 0}
                  status={allQRCodes.length === restaurants.length && restaurants.length > 0 ? "success" : "active"}
                  strokeColor="#ff9f4a"
                  className="qr-gen-progress"
                />
              </div>

              <Flex gap="middle" wrap="wrap">
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
              </Flex>
            </Space>
          </div>

          {allQRCodes.length > 0 && (
            <>
              <Divider className="qr-gen-divider" />
              <div className="qr-gen-bulk-grid">
                <Row gutter={[16, 16]}>
                  {allQRCodes.map((qr) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={qr.id}>
                      <Card
                        hoverable
                        className="qr-gen-bulk-item"
                        cover={
                          <div className="qr-gen-bulk-cover">
                            <QRCode
                              value={qr.url}
                              size={180}
                              bordered={false}
                              errorLevel="H"
                              className={`qr-gen-bulk-code qr-gen-bulk-code-${qr.id}`}
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
                                <EnvironmentOutlined /> {qr.location}
                              </Text>
                              <br />
                              <Tag color="orange" className="qr-gen-bulk-cuisine-tag">
                                {qr.cuisine}
                              </Tag>
                            </>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
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
        <span className="qr-gen-tab-label">
          <ShareAltOutlined className="qr-gen-tab-icon" /> 
          <span className="qr-gen-tab-text">Share Options</span>
        </span>
      ),
      children: (
        <Card className="qr-gen-share-card">
          <Title level={4} className="qr-gen-share-title">Share QR Codes with Customers</Title>
          <Paragraph className="qr-gen-share-subtitle">
            Easily share your restaurant QR codes through various channels
          </Paragraph>
          
          <Row gutter={[16, 16]} className="qr-gen-share-grid">
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon whatsapp">
                  <WhatsAppOutlined style={{ fontSize: 32 }} />
                </div>
                <Button
                  block
                  icon={<WhatsAppOutlined />}
                  onClick={() => messageApi.info("WhatsApp sharing coming soon")}
                  className="qr-gen-share-btn whatsapp-btn"
                >
                  Share on WhatsApp
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon email">
                  <MailOutlined style={{ fontSize: 32 }} />
                </div>
                <Button
                  block
                  icon={<MailOutlined />}
                  onClick={() => messageApi.info("Email sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share via Email
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon facebook">
                  <FacebookOutlined style={{ fontSize: 32 }} />
                </div>
                <Button
                  block
                  icon={<FacebookOutlined />}
                  onClick={() => messageApi.info("Facebook sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share on Facebook
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" className="qr-gen-share-method-card">
                <div className="qr-gen-share-method-icon twitter">
                  <TwitterOutlined style={{ fontSize: 32 }} />
                </div>
                <Button
                  block
                  icon={<TwitterOutlined />}
                  onClick={() => messageApi.info("Twitter sharing coming soon")}
                  className="qr-gen-share-btn"
                >
                  Share on Twitter
                </Button>
              </Card>
            </Col>
          </Row>

          <Alert
            message="Pro Tip"
            description="You can also download QR codes and print them for physical display at your restaurant"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="qr-gen-tip-alert"
          />
        </Card>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <div className="qr-gen-container">
        <div className="qr-gen-content">
          {/* Header with Back Button and Title */}
          <div className="qr-gen-header-wrapper">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              className="qr-gen-back-btn"
              type="primary"
            >
              Back
            </Button>
            <div className="qr-gen-title-wrapper">
              <RocketOutlined className="qr-gen-title-icon" />
              <span className="qr-gen-title">QR Code Generator</span>
            </div>
          </div>

          <Card 
            className="qr-gen-main-card"
            variant="outlined"
            bodyStyle={{ padding: 0 }}
          >
            {/* Tabs with horizontal scroll on mobile */}
            <div className="qr-gen-tabs-container">
              <div className="qr-gen-tabs-scroll">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`qr-gen-tab-scroll-btn ${activeTab === tab.key ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="qr-gen-tab-content">
                {tabItems.find(tab => tab.key === activeTab)?.children}
              </div>
            </div>
          </Card>

          {/* Preview Modal */}
          <Modal
            open={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
            width={450}
            centered
            title={`${selectedQR?.name || "Restaurant"} QR Code`}
            className="qr-gen-preview-modal"
          >
            {selectedQR && (
              <div className="qr-gen-preview-content">
                <div className="qr-gen-preview-qr">
                  <QRCode
                    value={selectedQR.url}
                    size={280}
                    bordered={true}
                    errorLevel="H"
                  />
                </div>
                <div className="qr-gen-preview-actions">
                  <Flex gap="middle" wrap="wrap" justify="center">
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
                  </Flex>
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
    </>
  );
}

export default QRGenerator;