// offers.js - Enhanced Offers Data for Real-World Promotional Banners

// Current date for comparison
const currentDate = new Date();

// Helper function to check if offer is valid
const isOfferValid = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return currentDate >= start && currentDate <= end;
};

// ============================================
// DAILY SPECIAL OFFERS
// ============================================

export const dailySpecials = [
  {
    id: 'daily-1',
    title: '🌅 Morning Breakfast Bonanza',
    description: 'Start your day right! Get 25% OFF on our signature breakfast platter with eggs, toast & fresh juice',
    discount: 25,
    emoji: '🍳',
    icon: '🌅',
    type: 'daily',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: true,
    items: ['2 Eggs (Any Style)', 'Crispy Toast', 'Golden Fries', 'Coffee & Fresh Juice'],
    minOrder: 150,
    maxDiscount: 50,
    code: 'BREAKFAST25',
    badge: '🔥 HOT DEAL',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
  },
  {
    id: 'daily-2',
    title: '🍛 Royal Lunch Thali',
    description: 'Authentic lunch combo with rice, curry, rotis, dessert & unlimited refills',
    discount: 20,
    emoji: '🥘',
    icon: '🍛',
    type: 'daily',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    items: ['Rice (2 varieties)', 'Dal & Curry', 'Roti (4 pcs)', 'Pickle & Salad', 'Sweet Dish', 'Buttermilk'],
    minOrder: 200,
    maxDiscount: 80,
    code: 'LUNCH20',
    badge: '⭐ Best Seller',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
  },
  {
    id: 'daily-3',
    title: '🍟 Evening Snacks Festival',
    description: '4 PM - 7 PM ONLY! 50% EXTRA on all snacks + Free Tea/Coffee',
    discount: 50,
    emoji: '🧁',
    icon: '🍟',
    type: 'daily',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: true,
    items: ['Samosa (2 pcs)', 'Pakora Mix', 'Bread Pakora', 'Tea/Coffee Free'],
    minOrder: 100,
    maxDiscount: 75,
    code: 'SNACKS50',
    badge: '⏰ Limited Time',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
  },
  {
    id: 'daily-4',
    title: '☕ Coffee Lovers Special',
    description: 'Buy 2 Get 1 FREE on all signature coffees - Valid all day!',
    discount: 33,
    emoji: '☕',
    icon: '🥤',
    type: 'daily',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    items: ['Espresso', 'Cappuccino', 'Latte', 'Mocha'],
    minOrder: 0,
    maxDiscount: 100,
    code: 'COFFEE3',
    badge: '🆕 NEW',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)'
  }
];

// ============================================
// WEEKLY OFFERS
// ============================================

export const weeklyOffers = [
  {
    id: 'weekly-1',
    title: '🎉 Weekend Family Feast',
    description: 'SAT-SUN ONLY! Bring the family & save ₹300 flat on orders above ₹1000',
    discount: 30,
    emoji: '👨‍👩‍👧‍👦',
    icon: '🎊',
    type: 'weekly',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: true,
    days: ['Saturday', 'Sunday'],
    items: ['4 Main Course Dishes', '2 Breads (Roti/Naan)', '1 Premium Dessert', '4 Soft Drinks'],
    minOrder: 1000,
    maxDiscount: 300,
    code: 'FAMILY30',
    badge: '🎊 WEEKEND SPECIAL',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)'
  },
  {
    id: 'weekly-2',
    title: '💫 Mid-Week Magic',
    description: 'Monday to Wednesday - Flat 15% OFF on entire menu + Free dessert!',
    discount: 15,
    emoji: '✨',
    icon: '💫',
    type: 'weekly',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    days: ['Monday', 'Tuesday', 'Wednesday'],
    items: ['Complete Menu', 'Free Dessert on orders above ₹300'],
    minOrder: 100,
    maxDiscount: 100,
    code: 'MIDWEEK15',
    badge: '💎 VALUE',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
  },
  {
    id: 'weekly-3',
    title: '🍕 Pizza Friday Blowout',
    description: 'EVERY FRIDAY - Buy 1 Large Pizza & Get 1 FREE! Best pizzas in town!',
    discount: 50,
    emoji: '🍕',
    icon: '🎉',
    type: 'weekly',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: true,
    days: ['Friday'],
    items: ['All Large Pizzas (10+ varieties)', 'Extra Cheese Available'],
    minOrder: 399,
    maxDiscount: 399,
    code: 'PIZZA50',
    badge: '🔥 HOT FRIDAY',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #FF5722 100%)'
  },
  {
    id: 'weekly-4',
    title: '🥗 Healthy Thursday',
    description: 'Every Thursday - 25% OFF on all healthy salads & fitness meals',
    discount: 25,
    emoji: '🥗',
    icon: '🥬',
    type: 'weekly',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    days: ['Thursday'],
    items: ['Green Salads', 'Grilled Chicken', 'Quinoa Bowls', 'Smoothie Bowls'],
    minOrder: 200,
    maxDiscount: 100,
    code: 'HEALTHY25',
    badge: '🥬 Fresh',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)'
  }
];

// ============================================
// DISCOUNT BANNERS (General Promotions)
// ============================================

export const discountBanners = [
  {
    id: 'banner-1',
    title: '🎁 Welcome Offer - New Users',
    description: "First order? You're lucky! Flat Rs.100 OFF + Free delivery on your first order!",
    discount: 100,
    emoji: '🎁',
    icon: '🎉',
    type: 'banner',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 250,
    maxDiscount: 100,
    code: 'WELCOME100',
    badge: '🎁 FIRST ORDER',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
  },
  {
    id: 'banner-2',
    title: '🛵 FREE Delivery - All Orders',
    description: 'No delivery charges! Order from anywhere - we deliver FREE!',
    discount: 100,
    emoji: '🛵',
    icon: '🚚',
    type: 'banner',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 199,
    maxDiscount: 60,
    code: 'FREEDEL',
    badge: '🚚 FREE DELIVERY',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
  },
  {
    id: 'banner-3',
    title: '💰 FLAT 10% - No Minimum!',
    description: 'Use code FLAT10 - Instant 10% OFF on ANY order, no minimum required!',
    discount: 10,
    emoji: '💰',
    icon: '💵',
    type: 'banner',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 0,
    maxDiscount: 200,
    code: 'FLAT10',
    badge: '⚡ No Minimum',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)'
  },
  {
    id: 'banner-4',
    title: '🎂 Birthday Special',
    description: 'Birthday month? Celebrate with 50% OFF + Free cake slice on orders above ₹500!',
    discount: 50,
    emoji: '🎂',
    icon: '🎈',
    type: 'banner',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 500,
    maxDiscount: 250,
    code: 'BDAY50',
    badge: '🎂 Birthday',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)'
  },
  {
    id: 'banner-5',
    title: '🏆 VIP Member Offer',
    description: 'Exclusive 40% OFF for our VIP members! Use code VIP40 at checkout',
    discount: 40,
    emoji: '🏆',
    icon: '👑',
    type: 'banner',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: true,
    minOrder: 500,
    maxDiscount: 300,
    code: 'VIP40',
    badge: '👑 VIP ONLY',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
  },
  {
    id: 'banner-6',
    title: '🍜 Biryani Bonanza',
    description: "Get Rs.75 OFF on all biryani orders! Taste the authentic flavors today",
    discount: 75,
    emoji: '🍜',
    icon: '🥢',
    type: 'banner',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 300,
    maxDiscount: 75,
    code: 'BIRYANI75',
    badge: '🔥 POPULAR',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)'
  },
  {
    id: 'banner-7',
    title: '🍦 Dessert Lovers Paradise',
    description: "20% OFF on all desserts + Free ice cream with orders above Rs.400",
    discount: 20,
    emoji: '🍦',
    icon: '🍨',
    type: 'banner',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 200,
    maxDiscount: 150,
    code: 'SWEET20',
    badge: '🍰 Sweet Deal',
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)'
  },
  {
    id: 'banner-8',
    title: '🎉 3rd Order Special',
    description: 'Completed 2 orders? Your 3rd order gets 30% OFF - Thank you for being with us!',
    discount: 30,
    emoji: '🎉',
    icon: '🥳',
    type: 'banner',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    isActive: true,
    isLimitedTime: false,
    minOrder: 350,
    maxDiscount: 150,
    code: 'THANKYOU30',
    badge: '❤️ Thank You',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get active offers based on current date
export const getActiveDailySpecials = () => {
  return dailySpecials.filter(offer => offer.isActive);
};

export const getActiveWeeklyOffers = () => {
  return weeklyOffers.filter(offer => offer.isActive);
};

export const getActiveBanners = () => {
  return discountBanners.filter(offer => offer.isActive);
};

// Get all active offers
export const getAllActiveOffers = () => {
  return [
    ...getActiveDailySpecials(),
    ...getActiveWeeklyOffers(),
    ...getActiveBanners()
  ];
};

// Get offer by ID
export const getOfferById = (id) => {
  const allOffers = [...dailySpecials, ...weeklyOffers, ...discountBanners];
  return allOffers.find(offer => offer.id === id);
};

// Get offer by promo code
export const getOfferByCode = (code) => {
  const allOffers = [...dailySpecials, ...weeklyOffers, ...discountBanners];
  return allOffers.find(offer => offer.code === code?.toUpperCase());
};

// Get hot deals (offers with 'hot' or '🔥' in badge)
export const getHotDeals = () => {
  const allOffers = getAllActiveOffers();
  return allOffers.filter(offer => 
    offer.badge?.toLowerCase().includes('hot') || 
    offer.badge?.includes('🔥')
  );
};

// Get limited time offers
export const getLimitedTimeOffers = () => {
  const allOffers = getAllActiveOffers();
  return allOffers.filter(offer => offer.isLimitedTime);
};

// Get offers by minimum order amount
export const getOffersByMinOrder = (minOrder) => {
  const allOffers = getAllActiveOffers();
  return allOffers.filter(offer => offer.minOrder <= minOrder);
};

export default {
  dailySpecials,
  weeklyOffers,
  discountBanners,
  getActiveDailySpecials,
  getActiveWeeklyOffers,
  getActiveBanners,
  getAllActiveOffers,
  getOfferById,
  getOfferByCode,
  getHotDeals,
  getLimitedTimeOffers,
  getOffersByMinOrder
};
