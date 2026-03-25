import React, { useState, useEffect } from 'react';
import '../styles/advertisement.css';
import API_BASE_URL from '../config';
import {
  dailySpecials,
  weeklyOffers,
  discountBanners,
  getActiveDailySpecials,
  getActiveWeeklyOffers,
  getActiveBanners
} from '../data/offers';

/**
 * Advertisement Component
 * A professional advertisement banner with real-world promotional styles
 * 
 * @param {string} type - 'daily', 'weekly', 'banner', 'all' (default: 'all')
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {string} layout - 'horizontal', 'vertical' (default: 'horizontal')
 * @param {string} animation - 'fadeIn', 'slideUp', 'bounceIn', 'rubberBand' (default: 'bounceIn')
 * @param {boolean} showClose - Show close button (default: true)
 * @param {boolean} autoDismiss - Auto dismiss after delay (default: false)
 * @param {number} dismissTime - Auto dismiss time in ms (default: 10000)
 * @param {boolean} showScanner - Add scanner animation effect (default: true)
 * @param {boolean} showConfetti - Add confetti for celebration mode (default: false)
 * @param {function} onClose - Callback when banner is closed
 * @param {function} onOfferClick - Callback when offer is clicked
 * @param {object} customOffer - Custom offer object to display (overrides type)
 */

// Transform backend coupon to offer format
const transformCouponToOffer = (coupon) => ({
  id: coupon._id,
  title: `🎟️ ${coupon.code} - ${coupon.description || `${coupon.discountPercent}% OFF`}`,
  description: coupon.description || `Use code ${coupon.code} to get ${coupon.discountPercent}% off your order!`,
  discount: coupon.discountPercent,
  emoji: '🎟️',
  icon: '🎟️',
  type: 'coupon',
  validFrom: coupon.validFrom,
  validUntil: coupon.validUntil,
  isActive: coupon.isActive,
  isLimitedTime: false,
  minOrder: coupon.minOrderAmount,
  maxDiscount: coupon.maxDiscountAmount,
  code: coupon.code,
  badge: '🎫 COUPON',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
});

const Advertisement = ({
  type = 'all',
  size = 'md',
  layout = 'horizontal',
  animation = 'bounceIn',
  showClose = true,
  autoDismiss = false,
  dismissTime = 10000,
  showScanner = true,
  showConfetti = false,
  onClose,
  onOfferClick,
  customOffer,
  useBackend = false // New prop to enable backend fetching
}) => {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch offers from backend API
  useEffect(() => {
    if (useBackend) {
      setLoading(true);
      // Fetch only active coupons
      fetch(`${API_BASE_URL}/api/coupons?active=true`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.coupons) {
            const backendOffers = data.coupons
              .filter(c => c.isActive)
              .map(transformCouponToOffer);
            setOffers(backendOffers);
          }
        })
        .catch(err => console.error('Error fetching coupons:', err))
        .finally(() => setLoading(false));
      return;
    }

    // Fallback to static data
    if (customOffer) {
      setOffers([customOffer]);
      return;
    }

    let activeOffers = [];
    switch (type) {
      case 'daily':
        activeOffers = getActiveDailySpecials();
        break;
      case 'weekly':
        activeOffers = getActiveWeeklyOffers();
        break;
      case 'banner':
        activeOffers = getActiveBanners();
        break;
      case 'all':
      default:
        activeOffers = [
          ...getActiveDailySpecials(),
          ...getActiveWeeklyOffers(),
          ...getActiveBanners()
        ];
        break;
    }
    setOffers(activeOffers);
  }, [type, customOffer, useBackend]);

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && isVisible && offers.length > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissTime, isVisible, offers.length]);

  // Rotate through offers
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  // Countdown timer for limited time offers
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleOfferClick = (offer) => {
    if (onOfferClick) {
      onOfferClick(offer);
    }
  };

  const handleShowModal = () => {
    setIsModal(true);
  };

  const handleModalClose = () => {
    setIsModal(false);
  };

  const getAnimationClass = () => {
    return `ad-animate-${animation}`;
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'ad-banner-sm';
      case 'lg':
        return 'ad-banner-lg';
      default:
        return '';
    }
  };

  const getLayoutClass = () => {
    return `ad-banner-${layout}`;
  };

  const getBannerTypeClass = (offer) => {
    // Check for badge type first
    const badge = offer.badge?.toLowerCase() || '';
    
    if (badge.includes('hot') || badge.includes('🔥')) {
      return 'hot-deal';
    }
    if (badge.includes('sale') || badge.includes('limited')) {
      return 'sale';
    }
    if (badge.includes('free') || badge.includes('delivery')) {
      return 'free-delivery';
    }
    if (badge.includes('new')) {
      return 'new-arrival';
    }
    if (badge.includes('celebration') || badge.includes('special')) {
      return 'celebration';
    }
    
    // Fallback to type-based styling
    switch (offer.type) {
      case 'daily':
        return 'limited-time';
      case 'weekly':
        return 'sale';
      case 'banner':
        return 'custom-gradient';
      default:
        return '';
    }
  };

  const getBadgeClass = (badge) => {
    if (!badge) return '';
    const badgeLower = badge.toLowerCase();
    
    if (badgeLower.includes('hot') || badgeLower.includes('🔥')) {
      return 'ad-badge-hot';
    }
    if (badgeLower.includes('sale') || badgeLower.includes('🏷️')) {
      return 'ad-badge-sale';
    }
    if (badgeLower.includes('limited') || badgeLower.includes('⏰')) {
      return 'ad-badge-limited';
    }
    if (badgeLower.includes('new') || badgeLower.includes('✨')) {
      return 'ad-badge-new';
    }
    if (badgeLower.includes('free') || badgeLower.includes('🎁')) {
      return 'ad-badge-free';
    }
    
    return '';
  };

  // Render confetti effect
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    return (
      <div className="ad-confetti-container">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="ad-confetti" />
        ))}
      </div>
    );
  };

  // Render scanner beam
  const renderScanner = () => {
    if (!showScanner) return null;
    
    return <div className="ad-scanner-beam" />;
  };

  // Render countdown timer
  const renderCountdown = () => {
    const offer = offers[currentIndex];
    if (!offer || !offer.isLimitedTime) return null;
    
    return (
      <div className="ad-countdown">
        <span className="ad-countdown-icon">⏰</span>
        <span className="ad-countdown-time">{countdown}</span>
      </div>
    );
  };

  // Render single banner
  const renderBanner = (offer, index) => {
    if (!offer || !isVisible) return null;

    const bannerClass = [
      'ad-banner',
      getBannerTypeClass(offer),
      getSizeClass(),
      getLayoutClass(),
      getAnimationClass(),
      offer.gradient ? 'custom-gradient' : '',
      showScanner ? 'has-scanner' : '',
      `ad-delay-${(index % 5) + 1}`
    ].filter(Boolean).join(' ');

    return (
      <div
        key={offer.id}
        className={bannerClass}
        style={offer.gradient ? { background: offer.gradient } : {}}
        onClick={() => handleOfferClick(offer)}
      >
        {renderScanner()}
        {renderConfetti()}
        
        {showClose && (
          <button
            className="ad-banner-close"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close advertisement"
          >
            ✕
          </button>
        )}

        {offer.badge && (
          <span className={`ad-banner-badge ${getBadgeClass(offer.badge)}`}>
            {offer.badge}
          </span>
        )}

        <div className="ad-banner-content">
          <div className="ad-banner-left">
            <span className="ad-banner-icon">
              {offer.icon || offer.emoji}
            </span>
            <div className="ad-banner-info">
              <h3 className="ad-banner-title" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>{offer.title}</h3>
              <p className="ad-banner-description" style={{ color: 'rgba(255,255,255,0.95)' }}>{offer.description}</p>
              {offer.isLimitedTime && renderCountdown()}
            </div>
          </div>

          <div className="ad-banner-right">
            {/* Prominent Discount Badge */}
            {offer.discount && typeof offer.discount === 'number' && offer.discount > 0 && (
              <div className="discount-badge" style={{
                background: '#ffffff',
                color: '#FF6B35',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '18px',
                display: 'inline-block',
                marginTop: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {offer.discount}% OFF
              </div>
            )}
            <span className="ad-banner-discount" style={{ color: '#ffffff', textShadow: '0 3px 6px rgba(0,0,0,0.35)' }}>
              {typeof offer.discount === 'number' && offer.discount > 0 ? (
                <>
                  {offer.discount}% <span>OFF</span>
                </>
              ) : (
                <>FREE</>
              )}
            </span>
            {offer.code && (
              <span className="ad-banner-code">{offer.code}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render inline banner (compact version)
  const renderInlineBanner = (offer) => {
    if (!offer) return null;

    return (
      <div
        key={offer.id}
        className="ad-inline-banner"
        style={offer.gradient ? { background: offer.gradient } : {}}
        onClick={handleShowModal}
      >
        <span className="ad-inline-banner-icon">
          {offer.icon || offer.emoji}
        </span>
        <span>{offer.title}</span>
        <span>{offer.discount}% OFF</span>
      </div>
    );
  };

  // Render modal
  const renderModal = () => {
    if (!isModal || !offers[currentIndex]) return null;

    const offer = offers[currentIndex];

    return (
      <div className="ad-overlay" onClick={handleModalClose}>
        <div
          className="ad-modal"
          style={offer.gradient ? { background: offer.gradient } : {}}
          onClick={(e) => e.stopPropagation()}
        >
          {renderConfetti()}
          
          <button
            className="ad-modal-close"
            onClick={handleModalClose}
            aria-label="Close modal"
          >
            ✕
          </button>

          <div className="ad-modal-icon">
            {offer.icon || offer.emoji}
          </div>

          {offer.badge && (
            <span className={`ad-banner-badge ${getBadgeClass(offer.badge)}`}>
              {offer.badge}
            </span>
          )}

          <h2 className="ad-modal-title" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{offer.title}</h2>
          <p className="ad-modal-description" style={{ color: 'rgba(255,255,255,0.95)' }}>{offer.description}</p>

          <div className="ad-modal-discount">
            <span className="ad-modal-discount-value">
              {typeof offer.discount === 'number' && offer.discount > 0 ? (
                <>
                  {offer.discount}% OFF
                </>
              ) : (
                <>FREE</>
              )}
            </span>
          </div>

          <div className="ad-modal-code">{offer.code}</div>

          {offer.minOrder > 0 && (
            <p className="ad-modal-description" style={{ fontSize: '0.85rem', marginTop: '-1rem' }}>
              Min. order: ₹{offer.minOrder}
            </p>
          )}

          {offer.isLimitedTime && (
            <div className="ad-countdown" style={{ marginBottom: '1.5rem' }}>
              <span className="ad-countdown-icon">⏰</span>
              <span className="ad-countdown-time">Ends in {countdown}</span>
            </div>
          )}

          <button
            className="ad-modal-cta"
            onClick={() => {
              handleOfferClick(offer);
              handleModalClose();
            }}
          >
            Apply Offer
          </button>
        </div>
      </div>
    );
  };

  // Render multiple banners in a container
  const renderBannersContainer = () => {
    if (offers.length === 0) return null;

    return (
      <div className="ad-banners-container">
        {offers.map((offer, index) => renderBanner(offer, index))}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="ad-banner custom-gradient" style={{ padding: '20px', textAlign: 'center' }}>
        <span style={{ color: '#fff' }}>Loading offers...</span>
      </div>
    );
  }

  // Render single offer
  if (customOffer || offers.length === 1) {
    return (
      <>
        {renderBanner(offers[0] || customOffer, 0)}
        {renderModal()}
      </>
    );
  }

  // Render multiple offers
  return (
    <>
      {renderBannersContainer()}
      {renderModal()}
    </>
  );
};

/**
 * DailySpecialBanner - Pre-configured component for daily specials
 */
export const DailySpecialBanner = (props) => (
  <Advertisement 
    type="daily" 
    animation="bounceIn"
    showScanner={true}
    showConfetti={false}
    {...props} 
  />
);

/**
 * WeeklyOfferBanner - Pre-configured component for weekly offers
 */
export const WeeklyOfferBanner = (props) => (
  <Advertisement 
    type="weekly" 
    animation="rubberBand"
    showScanner={true}
    {...props} 
  />
);

/**
 * DiscountBanner - Pre-configured component for discount banners
 */
export const DiscountBanner = (props) => (
  <Advertisement 
    type="banner" 
    animation="slideUp"
    showScanner={true}
    {...props} 
  />
);

/**
 * HotDealsBanner - Special banner for hot deals with confetti
 */
export const HotDealsBanner = (props) => (
  <Advertisement 
    type="all"
    animation="rubberBand"
    showScanner={true}
    showConfetti={true}
    {...props} 
  />
);

/**
 * InlineOffer - Compact inline banner for headers/sections
 */
export const InlineOffer = ({ offer, onClick }) => {
  const [isModal, setIsModal] = useState(false);

  if (!offer) return null;

  const getBadgeClass = (badge) => {
    if (!badge) return '';
    const badgeLower = badge.toLowerCase();
    
    if (badgeLower.includes('hot')) return 'ad-badge-hot';
    if (badgeLower.includes('sale')) return 'ad-badge-sale';
    if (badgeLower.includes('limited')) return 'ad-badge-limited';
    if (badgeLower.includes('new')) return 'ad-badge-new';
    if (badgeLower.includes('free')) return 'ad-badge-free';
    
    return '';
  };

  return (
    <>
      <div
        className="ad-inline-banner"
        style={offer.gradient ? { background: offer.gradient } : {}}
        onClick={() => setIsModal(true)}
      >
        <span className="ad-inline-banner-icon">
          {offer.icon || offer.emoji}
        </span>
        <span>{offer.title}</span>
        <span>{offer.discount}% OFF</span>
      </div>

      {isModal && (
        <div className="ad-overlay" onClick={() => setIsModal(false)}>
          <div
            className="ad-modal"
            style={offer.gradient ? { background: offer.gradient } : {}}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ad-modal-close"
              onClick={() => setIsModal(false)}
            >
              ✕
            </button>

            <div className="ad-modal-icon">
              {offer.icon || offer.emoji}
            </div>

            {offer.badge && (
              <span className={`ad-banner-badge ${getBadgeClass(offer.badge)}`}>
                {offer.badge}
              </span>
            )}

            <h2 className="ad-modal-title">{offer.title}</h2>
            <p className="ad-modal-description">{offer.description}</p>

            <div className="ad-modal-discount">
              <span className="ad-modal-discount-value">
                {offer.discount}% OFF
              </span>
            </div>

            <div className="ad-modal-code">{offer.code}</div>

            <button
              className="ad-modal-cta"
              onClick={() => {
                if (onClick) onClick(offer);
                setIsModal(false);
              }}
            >
              Apply Offer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * OffersCarousel - Horizontal scrolling carousel of offers
 */
export const OffersCarousel = ({ type = 'all', onOfferClick, showConfetti = false }) => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    let activeOffers = [];
    switch (type) {
      case 'daily':
        activeOffers = getActiveDailySpecials();
        break;
      case 'weekly':
        activeOffers = getActiveWeeklyOffers();
        break;
      case 'banner':
        activeOffers = getActiveBanners();
        break;
      default:
        activeOffers = [
          ...getActiveDailySpecials(),
          ...getActiveWeeklyOffers(),
          ...getActiveBanners()
        ];
    }
    setOffers(activeOffers);
  }, [type]);

  const getBannerTypeClass = (offer) => {
    const badge = offer.badge?.toLowerCase() || '';
    
    if (badge.includes('hot')) return 'hot-deal';
    if (badge.includes('sale')) return 'sale';
    if (badge.includes('free')) return 'free-delivery';
    if (badge.includes('new')) return 'new-arrival';
    if (badge.includes('special')) return 'celebration';
    
    return '';
  };

  const getBadgeClass = (badge) => {
    if (!badge) return '';
    const badgeLower = badge.toLowerCase();
    
    if (badgeLower.includes('hot')) return 'ad-badge-hot';
    if (badgeLower.includes('sale')) return 'ad-badge-sale';
    if (badgeLower.includes('limited')) return 'ad-badge-limited';
    if (badgeLower.includes('new')) return 'ad-badge-new';
    if (badgeLower.includes('free')) return 'ad-badge-free';
    
    return '';
  };

  if (offers.length === 0) return null;

  return (
    <div className="ad-banners-scroll">
      {offers.map((offer, index) => (
        <div
          key={offer.id}
          className={`ad-banner ${getBannerTypeClass(offer)} ad-animate-bounceIn ad-delay-${(index % 5) + 1}`}
          style={offer.gradient ? { background: offer.gradient } : {}}
          onClick={() => onOfferClick && onOfferClick(offer)}
        >
          {showConfetti && index === 0 && (
            <div className="ad-confetti-container">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="ad-confetti" />
              ))}
            </div>
          )}
          <div className="ad-scanner-beam" />
          
          {offer.badge && (
            <span className={`ad-banner-badge ${getBadgeClass(offer.badge)}`}>
              {offer.badge}
            </span>
          )}
          <div className="ad-banner-content">
            <div className="ad-banner-left">
              <span className="ad-banner-icon">
                {offer.icon || offer.emoji}
              </span>
              <div className="ad-banner-info">
                <h3 className="ad-banner-title">{offer.title}</h3>
                <p className="ad-banner-description">{offer.description}</p>
              </div>
            </div>
            <div className="ad-banner-right">
              <span className="ad-banner-discount">
                {offer.discount}% <span>OFF</span>
              </span>
              <span className="ad-banner-code">{offer.code}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * OffersGrid - Grid layout of offers
 */
export const OffersGrid = ({ type = 'all', onOfferClick, showConfetti = false }) => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    let activeOffers = [];
    switch (type) {
      case 'daily':
        activeOffers = getActiveDailySpecials();
        break;
      case 'weekly':
        activeOffers = getActiveWeeklyOffers();
        break;
      case 'banner':
        activeOffers = getActiveBanners();
        break;
      default:
        activeOffers = [
          ...getActiveDailySpecials(),
          ...getActiveWeeklyOffers(),
          ...getActiveBanners()
        ];
    }
    setOffers(activeOffers);
  }, [type]);

  const getBannerTypeClass = (offer) => {
    const badge = offer.badge?.toLowerCase() || '';
    
    if (badge.includes('hot')) return 'hot-deal';
    if (badge.includes('sale')) return 'sale';
    if (badge.includes('free')) return 'free-delivery';
    if (badge.includes('new')) return 'new-arrival';
    if (badge.includes('special')) return 'celebration';
    
    return '';
  };

  const getBadgeClass = (badge) => {
    if (!badge) return '';
    const badgeLower = badge.toLowerCase();
    
    if (badgeLower.includes('hot')) return 'ad-badge-hot';
    if (badgeLower.includes('sale')) return 'ad-badge-sale';
    if (badgeLower.includes('limited')) return 'ad-badge-limited';
    if (badgeLower.includes('new')) return 'ad-badge-new';
    if (badgeLower.includes('free')) return 'ad-badge-free';
    
    return '';
  };

  if (offers.length === 0) return null;

  return (
    <div className="ad-banners-grid">
      {offers.map((offer, index) => (
        <div
          key={offer.id}
          className={`ad-banner ${getBannerTypeClass(offer)} ad-animate-slideUp ad-delay-${(index % 5) + 1}`}
          style={offer.gradient ? { background: offer.gradient } : {}}
          onClick={() => onOfferClick && onOfferClick(offer)}
        >
          {showConfetti && index === 0 && (
            <div className="ad-confetti-container">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="ad-confetti" />
              ))}
            </div>
          )}
          <div className="ad-scanner-beam" />
          
          {offer.badge && (
            <span className={`ad-banner-badge ${getBadgeClass(offer.badge)}`}>
              {offer.badge}
            </span>
          )}
          <div className="ad-banner-content">
            <div className="ad-banner-left">
              <span className="ad-banner-icon">
                {offer.icon || offer.emoji}
              </span>
              <div className="ad-banner-info">
                <h3 className="ad-banner-title">{offer.title}</h3>
                <p className="ad-banner-description">{offer.description}</p>
              </div>
            </div>
            <div className="ad-banner-right">
              <span className="ad-banner-discount">
                {offer.discount}% <span>OFF</span>
              </span>
              <span className="ad-banner-code">{offer.code}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Advertisement;
