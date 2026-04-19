import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Globe,
  Instagram,
  Mail,
  Phone,
  CreditCard,
  Wallet,
  Truck,
  FileText,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StickerItem, StickerShape, ProductType, PRODUCT_LABELS, PRODUCT_LABELS_EN, SHAPE_LABELS, SHAPE_LABELS_EN, calculatePrice, Order, OrderStatus } from './types.ts';
import { supabase } from './supabase';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

// Helper to upload to ImgBB
const uploadToImgBB = async (file: File): Promise<string> => {
  if (!IMGBB_API_KEY) {
    console.warn("ImgBB API Key is missing. Falling back to placeholder.");
    return URL.createObjectURL(file);
  }
  
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (result.success) {
    return result.data.url;
  } else {
    throw new Error(result.error?.message || "ImgBB upload failed");
  }
};

type Language = 'ar' | 'en';
type PaymentMethod = 'vodafone' | 'cod';

const translations = {
  ar: {
    title: 'stick_it',
    subtitle: 'If you love it .... stick ittt',
    description: '',
    gallery: 'المعرض',
    pricing: 'الأسعار',
    trackOrder: 'تتبع الطلب',
    cart: 'السلة',
    uploadTitle: 'ارفع صورتك هنا',
    uploadHint: 'PNG, JPG حتى 10 ميجابايت',
    stickerSettings: 'المواصفات المختارة',
    size: 'المقاس (العرض × الطول)',
    shape: 'الشكل المختار',
    productType: 'نوع المنتج',
    quantity: 'الكمية',
    price: 'السعر',
    summary: 'إجمالي الحساب',
    checkout: 'استكمال الطلب',
    reviewOrder: 'مراجعة الطلب',
    orderSuccess: 'شكراً لاختياركم If you love it .... stick ittt',
    orderSuccessDesc: 'تم استلام طلبكم بنجاح. سنصلكم خلال وقت وجيز لتأكيد تفاصيل الطباعة والتوصيل.',
    backToStore: 'العودة للمتجر',
    totalItems: 'إجمالي المنتجات',
    shipping: 'قيمة الشحن',
    totalToPay: 'الصافي للدفع',
    confirmedOrder: 'تأكيد الطلب وشراء الآن',
    fullname: 'الاسم بالكامل',
    phone: 'رقم الهاتف',
    address: 'عنوان التوصيل بالتفصيل',
    footerDesc: 'نحن نهتم بأدق التفاصيل لتحويل صوركم وذكرياتكم إلى ستيكرات وبوسترات فاخرة تضفي جمالاً على مقتنياتكم.',
    quality: 'جودة فاخرة',
    precision: 'طباعة دقيقة',
    delivery: 'توصيل سريع',
    dieCut: 'قص فني',
    waiting: 'بانتظار لمستك الفنية',
    uploadFirst: 'ارفع أول صورة لتصميم الاستيكر الخاص بك',
    currency: 'ج.م',
    inspiration: 'احصل على إلهام من بنترست',
    readyMade: 'تصميمات جاهزة',
    addToCart: 'أضف للسلة',
    contactUs: 'تواصل معنا',
    followUs: 'تابعنا',
    paymentMethod: 'طريقة الدفع',
    uploadVodafoneReceipt: 'ارفع وثيقة التحويل (صورة الشاشة)',
    codFeeHint: '+10 جنيه رسوم دفع عند الاستلام',
    governorate: 'المحافظة',
    selectGovernorate: 'اختر المحافظة',
    width: 'العرض (سم)',
    height: 'الطول (سم)',
    customSize: 'مقاس مخصص (مثلاً: A4)',
    categories: {
      aesthetic: 'جماليات (Aesthetic)',
      anime: 'أنمي',
      nature: 'طبيعة',
      vintage: 'فينتج (Vintage)',
      minimal: 'بسيط (Minimal)'
    },
    payments: {
      vodafone: 'فودافون كاش',
      cod: 'دفع عند الاستلام'
    }
  },
  en: {
    title: 'stick_it',
    subtitle: 'If you love it .... stick ittt',
    description: '',
    gallery: 'Gallery',
    pricing: 'Pricing',
    trackOrder: 'Track Order',
    cart: 'Cart',
    uploadTitle: 'Upload your photo here',
    uploadHint: 'PNG, JPG up to 10MB',
    stickerSettings: 'Selection Details',
    size: 'Size (Width x Height)',
    shape: 'Sticker Shape',
    productType: 'Product Type',
    quantity: 'Quantity',
    price: 'Price',
    summary: 'Total Summary',
    checkout: 'Checkout',
    reviewOrder: 'Review Order',
    orderSuccess: 'Thank you for choosing If you love it .... stick ittt',
    orderSuccessDesc: 'Order received successfully. We will reach out shortly to confirm printing details and delivery.',
    backToStore: 'Back to Store',
    totalItems: 'Total Items',
    shipping: 'Shipping',
    totalToPay: 'Net Amount',
    confirmedOrder: 'Confirm & Order Now',
    fullname: 'Full Name',
    phone: 'Phone Number',
    address: 'Full Delivery Address',
    footerDesc: 'We care about the smallest details to transform your photos and memories into premium stickers and posters.',
    quality: 'Premium Quality',
    precision: 'Precise Printing',
    delivery: 'Fast Delivery',
    dieCut: 'Die Cut',
    waiting: 'Waiting for your art',
    uploadFirst: 'Upload your first image to start designing',
    currency: 'EGP',
    inspiration: 'Get Inspiration from Pinterest',
    readyMade: 'Ready-made Designs',
    addToCart: 'Add to Cart',
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    paymentMethod: 'Payment Method',
    uploadVodafoneReceipt: 'Upload Transfer Receipt (Screenshot)',
    codFeeHint: '+10 EGP Cash on Delivery fee',
    governorate: 'Governorate',
    selectGovernorate: 'Select Governorate',
    width: 'Width (cm)',
    height: 'Height (cm)',
    customSize: 'Custom Size (e.g., A4)',
    categories: {
      aesthetic: 'Aesthetic',
      anime: 'Anime',
      nature: 'Nature',
      vintage: 'Vintage',
      minimal: 'Minimal'
    },
    payments: {
      vodafone: 'Vodafone Cash',
      cod: 'Cash on Delivery'
    }
  }
};

const pinterestCategories = [
  { id: 'aesthetic', query: 'aesthetic stickers', img: 'https://picsum.photos/seed/aesthetic/400/600' },
  { id: 'anime', query: 'anime stickers', img: 'https://picsum.photos/seed/anime/400/600' },
  { id: 'nature', query: 'botanical stickers', img: 'https://picsum.photos/seed/nature/400/600' },
  { id: 'vintage', query: 'vintage scrapbooking stickers', img: 'https://picsum.photos/seed/vintage/400/600' },
  { id: 'minimal', query: 'minimalist stickers', img: 'https://picsum.photos/seed/minimal/400/600' }
];

const EGYPT_GOVERNORATES = [
  { id: 'cairo', ar: 'القاهرة', en: 'Cairo', fee: 35 },
  { id: 'giza', ar: 'الجيزة', en: 'Giza', fee: 35 },
  { id: 'alexandria', ar: 'الإسكندرية', en: 'Alexandria', fee: 45 },
  { id: 'qalyubia', ar: 'القليوبية', en: 'Qalyubia', fee: 45 },
  { id: 'monufia', ar: 'المنوفية', en: 'Monufia', fee: 55 },
  { id: 'dakahlia', ar: 'الدقهلية', en: 'Dakahlia', fee: 55 },
  { id: 'sharqia', ar: 'الشرقية', en: 'Sharqia', fee: 55 },
  { id: 'beheira', ar: 'البحيرة', en: 'Beheira', fee: 55 },
  { id: 'gharbia', ar: 'الغربية', en: 'Gharbia', fee: 55 },
  { id: 'kafr-el-sheikh', ar: 'كفر الشيخ', en: 'Kafr El Sheikh', fee: 55 },
  { id: 'damietta', ar: 'دمياط', en: 'Damietta', fee: 60 },
  { id: 'port-said', ar: 'بورسعيد', en: 'Port Said', fee: 60 },
  { id: 'ismailia', ar: 'الإسماعيلية', en: 'Ismailia', fee: 60 },
  { id: 'suez', ar: 'السويس', en: 'Suez', fee: 60 },
  { id: 'fayoum', ar: 'الفيوم', en: 'Fayoum', fee: 65 },
  { id: 'beni-suef', ar: 'بني سويف', en: 'Beni Suef', fee: 65 },
  { id: 'minya', ar: 'المنيا', en: 'Minya', fee: 75 },
  { id: 'assiut', ar: 'أسيوط', en: 'Assiut', fee: 75 },
  { id: 'sohag', ar: 'سوهاج', en: 'Sohag', fee: 75 },
  { id: 'qena', ar: 'قنا', en: 'Qena', fee: 85 },
  { id: 'luxor', ar: 'الأقصر', en: 'Luxor', fee: 85 },
  { id: 'aswan', ar: 'أسوان', en: 'Aswan', fee: 95 },
  { id: 'red-sea', ar: 'البحر الأحمر', en: 'Red Sea', fee: 95 },
  { id: 'new-valley', ar: 'الوادي الجديد', en: 'New Valley', fee: 110 },
  { id: 'matrouh', ar: 'مطروح', en: 'Matrouh', fee: 110 },
  { id: 'north-sinai', ar: 'شمال سيناء', en: 'North Sinai', fee: 110 },
  { id: 'south-sinai', ar: 'جنوب سيناء', en: 'South Sinai', fee: 110 },
];

const READY_MADE_DESIGNS = [
  { id: 'rd-1', name: 'Kawaii Cat', url: 'https://picsum.photos/seed/catsticker/400/400', type: 'sticker' as ProductType },
  { id: 'rd-2', name: 'Cyberpunk Oni', url: 'https://picsum.photos/seed/onisticker/400/400', type: 'sticker' as ProductType },
  { id: 'rd-3', name: 'Retro Vibes Poster', url: 'https://picsum.photos/seed/poster1/400/600', type: 'poster' as ProductType },
  { id: 'rd-4', name: 'Space Key Set', url: 'https://picsum.photos/seed/kb1/400/400', type: 'keyboard' as ProductType },
];

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeView, setActiveView] = useState<'home' | 'checkout' | 'admin'>('home');
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showReadyMade, setShowReadyMade] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0].id);
  const [vodafoneReceipt, setVodafoneReceipt] = useState<File | null>(null);
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [adminPassword, setAdminPassword] = useState('9423');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [tempNewPassword, setTempNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newStickers: StickerItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      file: file, // Store file for base64 conversion later
      name: file.name,
      type: 'sticker',
      width: 5,
      height: 5,
      shape: 'circle',
      quantity: 10,
      price: calculatePrice('sticker', 5, 5, 10),
    }));

    setStickers(prev => [...prev, ...newStickers]);
  };

  const addReadyMadeSticker = (design: typeof READY_MADE_DESIGNS[0]) => {
    const newSticker: StickerItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: design.url,
      name: design.name,
      type: design.type,
      width: design.type === 'poster' ? 20 : 5,
      height: design.type === 'poster' ? 30 : 5,
      shape: 'circle',
      quantity: 1,
      price: calculatePrice(design.type, design.type === 'poster' ? 20 : 5, design.type === 'poster' ? 30 : 5, 1),
    };
    setStickers(prev => [...prev, newSticker]);
    document.getElementById('sticker-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateSticker = (id: string, updates: Partial<StickerItem>) => {
    setStickers(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        updated.price = calculatePrice(updated.type, updated.width, updated.height, updated.quantity);
        return updated;
      }
      return s;
    }));
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const totalItemsAmount = stickers.reduce((sum, s) => sum + s.price, 0);
  const selectedGov = EGYPT_GOVERNORATES.find(g => g.id === governorate) || EGYPT_GOVERNORATES[0];
  const shippingFee = selectedGov.fee;
  const paymentFee = paymentMethod === 'cod' ? 10 : 0;
  const totalAmount = totalItemsAmount + shippingFee + paymentFee;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    if (activeView !== 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [activeView]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: 'home' | 'checkout' | 'admin') => {
    setActiveView(view);
    if (view !== 'home') {
      window.history.pushState({ view }, view);
    }
  };

  useEffect(() => {
    // Local storage for admin password
    const savedPassword = localStorage.getItem('admin_password') || '9423';
    setAdminPassword(savedPassword);
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform snake_case from DB to camelCase for UI
      const formatted = (data || []).map(o => ({
        id: o.id,
        customerName: o.customer_name,
        phone: o.phone,
        address: o.address,
        governorate: o.governorate,
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method,
        vodafoneReceiptUrl: o.vodafone_receipt_url,
        status: o.status,
        items: o.items,
        createdAt: o.created_at
      })) as Order[];
      
      setOrders(formatted);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    fetchOrders();
    // Realtime subscription
    const channel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      fetchOrders();
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
      fetchOrders();
    } catch (e) {
      console.error("Error deleting order:", e);
    }
  };

  const updateAdminPassword = async () => {
    if (tempNewPassword.length < 4) {
      alert(lang === 'ar' ? 'كلمة المرور يجب أن تكون 4 أرقام على الأقل' : 'Password must be at least 4 digits');
      return;
    }
    localStorage.setItem('admin_password', tempNewPassword);
    setAdminPassword(tempNewPassword);
    setShowPasswordChange(false);
    setDashboardPassword('');
    setIsAuthenticated(false);
    alert(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح. يرجى الدخول مجدداً.' : 'Password updated successfully. Please login again.');
  };

  const handleOrder = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      alert(lang === 'ar' ? 'يرجى ملء جميع البيانات' : 'Please fill all fields');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(lang === 'ar' ? 'جاري بدء الطلب...' : 'Starting order...');
    try {
      const orderId = Math.random().toString(36).substring(2, 9).toUpperCase();
      
      let receiptUrl = '';
      if (vodafoneReceipt) {
        setSyncStatus(lang === 'ar' ? 'جاري رفع إيصال الدفع...' : 'Uploading receipt...');
        receiptUrl = await uploadToImgBB(vodafoneReceipt);
      }

      setSyncStatus(lang === 'ar' ? 'جاري رفع الصور...' : 'Uploading photos...');
      const finalItems = await Promise.all(stickers.map(async (sticker) => {
        if (sticker.file) {
          try {
            const uploadedUrl = await uploadToImgBB(sticker.file);
            const { file, ...rest } = sticker; 
            return { ...rest, url: uploadedUrl };
          } catch (e) {
            console.error("Failed to upload item:", e);
            throw e;
          }
        }
        return sticker;
      }));

      const orderData = {
        id: orderId,
        customer_name: customerName,
        phone: customerPhone,
        address: customerAddress,
        governorate: selectedGov.ar,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        vodafone_receipt_url: receiptUrl,
        items: finalItems,
        status: 'pending' as OrderStatus,
        created_at: new Date().toISOString()
      };

      setSyncStatus(lang === 'ar' ? 'جاري حفظ البيانات...' : 'Saving order data...');
      
      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      setSyncStatus(lang === 'ar' ? 'تم بنجاح!' : 'Success!');
      setIsOrdered(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d8d', '#ffcadb', '#ffffff']
      });
      
      setTimeout(() => {
        setIsOrdered(false);
        setActiveView('home');
        setStickers([]);
        setVodafoneReceipt(null);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setIsSyncing(false);
      }, 5000);
    } catch (e) {
      console.error("Critical order failure:", e);
      alert(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب. تأكد من تفعيل الجداول في Supabase.' : 'Failed to send order. Please ensure tables are created in Supabase.');
      setIsSyncing(false);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`min-h-screen bg-pink-bg text-pink-dark selection:bg-pink-primary selection:text-white ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-pink-border px-4 md:px-8 py-2 md:py-3 flex items-center justify-between shadow-lg shadow-pink-primary/5">
        <div className="flex items-center gap-4 md:gap-10">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => { setShowReadyMade(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-primary to-pink-accent rounded-xl flex items-center justify-center rotate-6 shadow-xl shadow-pink-primary/20 group-hover:rotate-0 transition-all duration-300">
               <Scissors className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-pink-dark">stick_it</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="p-2.5 bg-pink-bg/50 hover:bg-white border border-pink-border rounded-2xl text-pink-primary transition-all flex items-center gap-2 font-black text-xs">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button onClick={() => navigateTo('checkout')} className="relative group bg-pink-primary text-white px-5 md:px-7 py-2.5 rounded-full font-black flex items-center gap-3 transition-all hover:bg-pink-dark hover:scale-105 disabled:opacity-50" disabled={stickers.length === 0}>
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">{t.cart} ({stickers.length})</span>
            {stickers.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{stickers.length}</span>}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Banner Section */}
        {!showReadyMade && (
          <section className="mb-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-pink-border shadow-sm">
                <div className="w-2 h-2 rounded-full bg-pink-primary animate-ping" />
                <span className="text-[10px] font-black uppercase text-pink-dark/60 tracking-widest">{lang === 'ar' ? 'سعر خيالي' : 'Best Pricing'}</span>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-pink-dark leading-[1.1] tracking-tighter">
                {t.subtitle.split(' ').map((word, i) => i >= 5 ? <span key={i} className="text-pink-primary">{word} </span> : word + ' ')}
              </motion.h2>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowReadyMade(true)} className="bg-pink-dark text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-pink-primary transition-all shadow-lg shadow-pink-primary/10">
                  {t.readyMade}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                 <div className="absolute -inset-4 bg-pink-primary/5 blur-3xl rounded-full" />
                 <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
                  className={`relative cursor-pointer border-3 border-dashed rounded-[40px] p-10 md:p-14 transition-all duration-500 bg-white/50 backdrop-blur-sm shadow-xl shadow-pink-primary/5 ${isDragging ? 'border-pink-primary bg-pink-primary/5' : 'border-pink-muted hover:border-pink-primary'}`}
                  onClick={() => fileInputRef.current?.click()}>
                   <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e.target.files)}/>
                   <div className="flex flex-col items-center gap-6">
                     <div className="w-20 h-20 bg-pink-primary rounded-[30%] flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform">
                       <Plus className="w-10 h-10 text-white" />
                     </div>
                     <div className="text-center space-y-2">
                       <div className="text-2xl font-black text-pink-dark">{t.uploadTitle}</div>
                       <p className="text-pink-dark/30 font-bold text-xs">{t.uploadHint}</p>
                     </div>
                   </div>
                 </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Ready Made Designs - View Mode */}
        {showReadyMade && (
          <section className="mb-24 animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-6">
                 <button onClick={() => setShowReadyMade(false)} className="w-10 h-10 bg-pink-bg rounded-xl flex items-center justify-center text-pink-dark hover:bg-pink-primary hover:text-white transition-all">
                    <ChevronLeft className={isRtl ? "rotate-180" : ""} />
                 </button>
                 <h3 className="text-3xl md:text-4xl font-black text-pink-dark">{t.readyMade}</h3>
               </div>
               <div className="h-0.5 flex-1 bg-pink-border ml-6 hidden md:block" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {READY_MADE_DESIGNS.map((design) => (
                 <motion.div key={design.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -8 }} className="bg-white p-5 rounded-[35px] border border-pink-border flex flex-col gap-5 group hover:shadow-2xl transition-all">
                   <div className="aspect-[4/5] bg-pink-bg/40 rounded-2xl overflow-hidden p-3">
                     <img src={design.url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <div className="space-y-1">
                     <div className="text-[9px] font-black uppercase text-pink-primary">{lang === 'ar' ? PRODUCT_LABELS[design.type] : PRODUCT_LABELS_EN[design.type]}</div>
                     <h4 className="text-base font-black text-pink-dark truncate">{design.name}</h4>
                   </div>
                   <button onClick={() => { addReadyMadeSticker(design); setShowReadyMade(false); }} className="w-full bg-pink-dark text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-primary transition-colors flex items-center justify-center gap-2">
                     <Plus className="w-3 h-3" /> {t.addToCart}
                   </button>
                 </motion.div>
               ))}
             </div>
          </section>
        )}

        {/* Workspace */}
        <motion.div id="sticker-list" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24 space-y-12">
          {stickers.length > 0 && (
            <div className="flex items-center gap-6">
              <h3 className="text-3xl md:text-4xl font-black text-pink-dark">{t.summary}</h3>
              <div className="h-0.5 flex-1 bg-pink-border" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {stickers.map((sticker, idx) => (
                <motion.div key={sticker.id} layout initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[50px] border border-pink-border overflow-hidden group flex flex-col hover:shadow-[0_30px_60px_-15px_rgba(255,77,141,0.2)] transition-all h-full"
                >
                  <div className="relative aspect-square bg-pink-bg/20 p-12 flex items-center justify-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 + idx * 0.1 }}
                      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${sticker.shape === 'circle' ? 'rounded-full' : 'rounded-3xl'} ${sticker.shape !== 'die-cut' && 'bg-white shadow-xl ring-8 ring-white group-hover:ring-[12px]'}`}>
                      <img src={sticker.url} className="max-w-[85%] max-h-[85%] object-contain" referrerPolicy="no-referrer" />
                    </motion.div>
                    <button onClick={() => removeSticker(sticker.id)} className="absolute top-8 left-8 p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                  </div>

                  <div className="p-10 flex-1 flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[60%]">
                        <div className="text-[10px] font-black text-pink-primary uppercase tracking-widest mb-1">{lang === 'ar' ? PRODUCT_LABELS[sticker.type] : PRODUCT_LABELS_EN[sticker.type]}</div>
                        <h4 className="text-xl font-black text-pink-dark truncate">{sticker.name}</h4>
                      </div>
                      <div className="text-end">
                        <span className="text-2xl font-black text-pink-primary">{sticker.price}<span className="text-[10px] ml-1">{t.currency}</span></span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Size Controls */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-pink-dark/40 uppercase tracking-widest block">{t.size}</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-pink-dark/60">{t.width}</span>
                            <input type="number" min="5" max="100" value={sticker.width} onChange={(e) => updateSticker(sticker.id, { width: Math.min(100, Math.max(5, parseInt(e.target.value) || 5)) })} 
                              className="w-full bg-pink-bg p-3 rounded-xl border border-pink-border outline-none focus:border-pink-primary font-black text-sm" />
                          </div>
                          <div className="space-y-2">
                             <span className="text-[10px] font-bold text-pink-dark/60">{t.height}</span>
                             <input type="number" min="5" max="100" value={sticker.height} onChange={(e) => updateSticker(sticker.id, { height: Math.min(100, Math.max(5, parseInt(e.target.value) || 5)) })} 
                              className="w-full bg-pink-bg p-3 rounded-xl border border-pink-border outline-none focus:border-pink-primary font-black text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Shape and Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-pink-dark/40 uppercase tracking-widest">{t.shape}</label>
                           <select value={sticker.shape} onChange={(e) => updateSticker(sticker.id, { shape: e.target.value as StickerShape })} className="w-full bg-pink-bg p-3 rounded-xl border border-pink-border font-bold text-xs ring-0 outline-none">
                             <option value="circle">{lang === 'ar' ? SHAPE_LABELS.circle : SHAPE_LABELS_EN.circle}</option>
                             <option value="square">{lang === 'ar' ? SHAPE_LABELS.square : SHAPE_LABELS_EN.square}</option>
                             <option value="die-cut">{lang === 'ar' ? SHAPE_LABELS['die-cut'] : SHAPE_LABELS_EN['die-cut']}</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-pink-dark/40 uppercase tracking-widest">{t.productType}</label>
                           <select value={sticker.type} onChange={(e) => updateSticker(sticker.id, { type: e.target.value as ProductType })} className="w-full bg-pink-bg p-3 rounded-xl border border-pink-border font-bold text-xs outline-none">
                             <option value="sticker">{lang === 'ar' ? PRODUCT_LABELS.sticker : PRODUCT_LABELS_EN.sticker}</option>
                             <option value="poster">{lang === 'ar' ? PRODUCT_LABELS.poster : PRODUCT_LABELS_EN.poster}</option>
                             <option value="keyboard">{lang === 'ar' ? PRODUCT_LABELS.keyboard : PRODUCT_LABELS_EN.keyboard}</option>
                           </select>
                        </div>
                      </div>

                      {/* Custom Size for Posters and Keyboards */}
                      {(sticker.type === 'poster' || sticker.type === 'keyboard') && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-pink-dark/40 uppercase tracking-widest block">{t.customSize}</label>
                          <input 
                            type="text" 
                            placeholder={t.customSize}
                            value={sticker.customSize || ''} 
                            onChange={(e) => updateSticker(sticker.id, { customSize: e.target.value })} 
                            className="w-full bg-pink-bg p-3 rounded-xl border border-pink-border outline-none focus:border-pink-primary font-bold text-xs" 
                          />
                        </div>
                      )}

                      <div className="pt-6 border-t border-pink-border flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-pink-bg p-2 rounded-2xl">
                          <button onClick={() => updateSticker(sticker.id, { quantity: Math.max(1, sticker.quantity - 1) })} className="w-10 h-10 bg-white rounded-xl shadow-sm text-pink-primary font-black">-</button>
                          <span className="font-black text-lg w-8 text-center">{sticker.quantity}</span>
                          <button onClick={() => updateSticker(sticker.id, { quantity: sticker.quantity + 1 })} className="w-10 h-10 bg-white rounded-xl shadow-sm text-pink-primary font-black">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {stickers.length === 0 && (
            <div className="text-center py-40 border-6 border-dashed border-pink-muted rounded-[60px] bg-white/50 backdrop-blur-sm shadow-2xl shadow-pink-primary/5">
              <div className="w-24 h-24 bg-pink-bg rounded-[30%] flex items-center justify-center mx-auto mb-10 animate-pulse">
                <ImageIcon className="w-12 h-12 text-pink-secondary" />
              </div>
              <h3 className="text-4xl font-black text-pink-dark mb-4">{t.waiting}</h3>
              <p className="text-pink-dark/30 font-bold text-lg">{t.uploadFirst}</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Cart Summary (Floating on mobile) */}
      <AnimatePresence>
        {stickers.length > 0 && activeView === 'home' && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-10 left-6 right-6 md:left-auto md:right-10 z-[60]">
             <button onClick={() => navigateTo('checkout')} className="w-full md:w-auto bg-pink-dark text-white px-10 py-6 rounded-full shadow-2xl flex items-center justify-center md:justify-end gap-10 group ring-4 ring-pink-primary/20">
                <div className="text-end hidden sm:block">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.summary}</p>
                   <p className="text-2xl font-black">{totalItemsAmount} {t.currency}</p>
                </div>
                <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-4 text-xl font-black">
                   <span>{t.checkout}</span>
                   {isRtl ? <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" /> : <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                </div>
             </button>
          </motion.div>
        )}
      </AnimatePresence>

     {/* Pinterest Section */}
      <section className="bg-white py-32 px-4 md:px-8 border-t border-pink-border overflow-hidden">
         <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <h3 className="text-4xl md:text-5xl font-black text-pink-dark">{t.inspiration}</h3>
               <div className="h-1 flex-1 bg-pink-bg rounded-full hidden md:block" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
               {pinterestCategories.map((cat, idx) => (
                 <motion.a key={cat.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                   href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(cat.query)}`} target="_blank" rel="noopener noreferrer" 
                   className="group relative h-48 md:h-72 bg-pink-bg/30 rounded-[40px] overflow-hidden flex items-end justify-center border-2 border-transparent hover:border-pink-primary transition-all text-center p-6 shadow-lg shadow-pink-primary/5">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                      <img src={cat.img} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 opacity-40 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-dark/80 via-pink-dark/20 to-transparent group-hover:via-transparent transition-all" />
                    </div>
                    <span className="z-10 text-lg font-black text-white group-hover:text-pink-primary transition-colors drop-shadow-lg group-hover:translate-y-[-10px] duration-300">{(t.categories as any)[cat.id]}</span>
                 </motion.a>
               ))}
            </div>
         </motion.div>
      </section>

      {/* Contact Section */}
      <footer className="bg-pink-dark py-32 px-4 md:px-12 text-white">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
            <div className="space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-primary rounded-2xl flex items-center justify-center rotate-6 shadow-xl"><Scissors className="w-7 h-7" /></div>
                  <h2 className="text-3xl font-black tracking-tighter">stick_it</h2>
               </div>
               <p className="text-white/60 font-bold leading-relaxed text-sm">{t.footerDesc}</p>
            </div>

            <div className="space-y-10">
               <h4 className="text-xl font-black">{t.contactUs}</h4>
               <div className="space-y-6">
                  <a href="tel:+201000000000" className="flex items-center gap-6 group">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-pink-primary transition-all"><Phone className="w-6 h-6" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 mb-1">{t.phone}</p>
                        <p className="font-black text-xl">+20 100 000 0000</p>
                     </div>
                  </a>
                  <a href="mailto:hello@stickitttt.com" className="flex items-center gap-6 group">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-pink-primary transition-all"><Mail className="w-6 h-6" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 mb-1">Email</p>
                        <p className="font-black text-xl">hello@stickitttt.com</p>
                     </div>
                  </a>
               </div>
            </div>

            <div className="space-y-10">
               <h4 className="text-xl font-black">{t.followUs}</h4>
               <div className="flex gap-6">
                  <a href="#" className="w-20 h-20 bg-white/5 rounded-[35%] flex items-center justify-center hover:bg-pink-primary hover:scale-110 transition-all"><Instagram className="w-10 h-10" /></a>
                  <a href="#" className="w-20 h-20 bg-white/5 rounded-[35%] flex items-center justify-center hover:bg-pink-primary hover:scale-110 transition-all"><Globe className="w-10 h-10" /></a>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 text-center space-y-8">
            <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.5em]">If you love it .... stick ittt © 2026 • Premium Sticky Art</p>
            <button 
              onClick={() => navigateTo('admin')}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full text-xs font-black transition-all"
            >
              {isRtl ? 'لوحة التحكم للمسؤول' : 'Admin Dashboard'}
            </button>
         </div>
      </footer>

      {/* Checkout Page View */}
      <AnimatePresence>
        {activeView === 'checkout' && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center">
            {/* Header for View */}
            <div className={`w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-between transition-all ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <button 
                onClick={() => navigateTo('home')} 
                className="flex items-center gap-2 text-pink-dark font-black hover:text-pink-primary"
              >
                {isRtl ? <ChevronRight /> : <ChevronLeft />}
                <span>{isRtl ? 'الرجوع للمتجر' : 'Back to Store'}</span>
              </button>
              <h1 className="text-2xl font-black text-pink-dark">stick_it</h1>
            </div>

            <div className="w-full h-px bg-pink-border" />

            <div className="w-full flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-full">
                {/* Left Side: Receipt & Total */}
                <div className="w-full md:w-[400px] bg-pink-bg p-8 md:p-14 border-b md:border-b-0 md:border-l border-pink-border flex flex-col gap-10">
                   <div className="space-y-6">
                     <h4 className="text-2xl font-black text-pink-dark">{t.reviewOrder}</h4>
                     <div className="space-y-4 max-h-[40vh] md:max-h-none overflow-y-auto pr-2">
                       {stickers.map(s => (
                         <div key={s.id} className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-pink-border/50 shadow-sm">
                           <img src={s.url} className="w-16 h-16 object-contain rounded-xl" />
                           <div className="flex-1 min-w-0">
                             <p className="font-black text-sm truncate text-pink-dark">{s.name}</p>
                             <p className="text-[10px] font-bold text-pink-dark/40">{s.width}x{s.height} سم • {s.quantity} حبة</p>
                           </div>
                           <p className="font-black text-sm text-pink-primary">{s.price} {t.currency}</p>
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="mt-auto space-y-5 pt-8 border-t-2 border-dashed border-pink-border">
                      <div className="flex justify-between text-pink-dark/50 text-xs font-black">
                        <span>{t.totalItems}</span>
                        <span>{totalItemsAmount} {t.currency}</span>
                      </div>
                      <div className="flex justify-between text-pink-dark/50 text-xs font-black">
                        <span>{t.shipping}</span>
                        <span>{shippingFee} {t.currency}</span>
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="flex justify-between text-pink-accent text-xs font-black">
                          <span>{isRtl ? 'رسوم الدفع عند الاستلام' : 'COD Fee'}</span>
                          <span>{paymentFee} {t.currency}</span>
                        </div>
                      )}
                      <div className="pt-6 flex justify-between items-end border-t border-pink-border/30">
                        <span className="font-black text-xl text-pink-dark">{t.totalToPay}</span>
                        <div className="text-end">
                           <p className="text-4xl font-black text-pink-primary tracking-tighter">{totalAmount}</p>
                           <p className="text-[10px] font-black text-pink-primary/40 uppercase tracking-widest">{t.currency}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Side: Form & Payment */}
                <div className="flex-1 p-8 md:p-20 space-y-16">
                  {isOrdered ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-20">
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 bg-pink-primary rounded-[40%] flex items-center justify-center shadow-2xl shadow-pink-primary/20">
                          <CheckCircle2 className="w-16 h-16 text-white" />
                       </motion.div>
                       <div className="space-y-4">
                         <h2 className="text-5xl font-black text-pink-dark leading-tight">{t.orderSuccess}</h2>
                         <p className="text-pink-dark/40 font-bold text-xl max-w-md mx-auto">{t.orderSuccessDesc}</p>
                       </div>
                       <button onClick={() => { setActiveView('home'); setStickers([]); setIsOrdered(false); }} className="w-full max-w-sm bg-pink-dark text-white py-6 rounded-full font-black text-2xl shadow-xl hover:scale-105 transition-all">{t.backToStore}</button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-10">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-pink-primary/10 rounded-2xl flex items-center justify-center text-pink-primary shadow-sm"><Truck className="w-6 h-6" /></div>
                           <h3 className="text-3xl font-black text-pink-dark">1. بيانات التوصيل</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <span className="text-xs font-black text-pink-dark/40 px-3 uppercase tracking-wider">{t.fullname}</span>
                             <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-pink-bg p-5 rounded-3xl outline-none border-2 border-transparent focus:border-pink-primary font-bold text-lg shadow-sm" />
                          </div>
                          <div className="space-y-3">
                             <span className="text-xs font-black text-pink-dark/40 px-3 uppercase tracking-wider">{t.phone}</span>
                             <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-pink-bg p-5 rounded-3xl outline-none border-2 border-transparent focus:border-pink-primary font-bold text-lg shadow-sm" dir="ltr" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                            <span className="text-xs font-black text-pink-dark/40 px-3 uppercase tracking-wider">{t.governorate}</span>
                            <select 
                              value={governorate} 
                              onChange={(e) => setGovernorate(e.target.value)}
                              className="w-full bg-pink-bg p-5 rounded-3xl outline-none border-2 border-transparent focus:border-pink-primary font-bold text-lg shadow-sm appearance-none"
                            >
                              {EGYPT_GOVERNORATES.map(gov => (
                                <option key={gov.id} value={gov.id}>
                                  {lang === 'ar' ? gov.ar : gov.en} (+{gov.fee} {t.currency})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-3">
                           <span className="text-xs font-black text-pink-dark/40 px-3 uppercase tracking-wider">{t.address}</span>
                           <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full bg-pink-bg p-5 rounded-3xl outline-none border-2 border-transparent focus:border-pink-primary font-bold text-lg h-32 resize-none shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-pink-primary/10 rounded-2xl flex items-center justify-center text-pink-primary shadow-sm"><CreditCard className="w-6 h-6" /></div>
                           <h3 className="text-3xl font-black text-pink-dark">2. طريقة الدفع</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          {(['vodafone', 'cod'] as PaymentMethod[]).map(method => (
                            <button key={method} onClick={() => setPaymentMethod(method)} 
                              className={`p-8 rounded-[40px] border-4 transition-all flex items-center gap-8 text-start group ${paymentMethod === method ? 'bg-pink-primary border-pink-primary text-white shadow-2xl shadow-pink-primary/30 scale-[1.02]' : 'bg-pink-bg border-transparent text-pink-dark/60 hover:bg-white hover:border-pink-primary/30'}`}>
                               <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-colors ${paymentMethod === method ? 'bg-white/20' : 'bg-white shadow-md group-hover:bg-pink-primary group-hover:text-white'}`}>
                                  {method === 'vodafone' ? <Wallet className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
                               </div>
                               <div>
                                  <p className="font-black text-xl">{t.payments[method]}</p>
                                  <p className={`text-xs font-bold ${paymentMethod === method ? 'text-white/60' : 'text-pink-dark/30'}`}>
                                    {method === 'vodafone' ? (isRtl ? 'تحويل سريع ودقيق' : 'Fast and secure transfer') : (isRtl ? 'ادفع عند الباب' : 'Pay at your doorstep')}
                                  </p>
                               </div>
                            </button>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          {paymentMethod === 'vodafone' && (
                            <motion.div key="vodafone" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-pink-primary/5 p-10 rounded-[50px] border-4 border-dashed border-pink-primary/20 overflow-hidden shadow-sm">
                               <div className="flex flex-col items-center gap-8 text-center">
                                 <div className="w-20 h-20 bg-white rounded-[25px] flex items-center justify-center shadow-xl transform rotate-3"><Wallet className="w-10 h-10 text-red-500" /></div>
                                 <div className="space-y-3">
                                    <p className="font-bold text-pink-dark/60 text-lg">قم بالتحويل على رقم فودافون كاش التالي:</p>
                                    <p className="text-5xl font-black text-pink-primary tracking-tighter">0100 000 0000</p>
                                 </div>
                                 <div className="w-full h-px bg-pink-primary/10" />
                                 <div className="space-y-6 w-full max-w-md mx-auto">
                                    <p className="text-xs font-black text-pink-dark/40 uppercase tracking-widest">{t.uploadVodafoneReceipt}</p>
                                    <button onClick={() => receiptInputRef.current?.click()} className="group w-full flex items-center justify-center gap-5 bg-white px-10 py-6 rounded-3xl border-3 border-pink-border hover:border-pink-primary transition-all font-black text-lg text-pink-dark shadow-md">
                                       <FileText className="w-6 h-6 text-pink-primary group-hover:scale-110 transition-transform" />
                                       {vodafoneReceipt ? <span className="truncate">{vodafoneReceipt.name}</span> : (isRtl ? 'ارفاق صورة التحويل' : 'Attach Transfer Receipt')}
                                    </button>
                                    <input type="file" ref={receiptInputRef} className="hidden" accept="image/*" onChange={(e) => setVodafoneReceipt(e.target.files?.[0] || null)} />
                                 </div>
                               </div>
                            </motion.div>
                          )}
                          {paymentMethod === 'cod' && (
                            <motion.div key="cod" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-6 text-pink-accent bg-pink-accent/5 p-8 rounded-[40px] border-3 border-pink-accent/10 shadow-sm">
                               <div className="w-14 h-14 bg-pink-accent/20 rounded-2xl flex items-center justify-center"><Truck className="w-7 h-7" /></div>
                               <div className="flex-1">
                                  <p className="font-black text-lg">{t.codFeeHint}</p>
                                  <p className="text-sm font-bold opacity-60">{isRtl ? 'يتم تحصيل الرسوم عند الاستلام من المندوب' : 'Fee collected upon delivery'}</p>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button onClick={handleOrder} disabled={isSyncing} className="w-full bg-pink-primary h-24 text-white rounded-full font-black text-3xl shadow-2xl shadow-pink-primary/40 hover:bg-pink-dark hover:scale-[1.01] transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50">
                         {isSyncing ? (
                           <>
                             <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                             <span className="text-sm font-bold opacity-80 mt-1">{syncStatus}</span>
                           </>
                         ) : (
                           <div className="flex items-center gap-5">
                             <CheckCircle2 className="w-10 h-10" /> {t.confirmedOrder}
                           </div>
                         )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard Full View */}
      <AnimatePresence>
        {activeView === 'admin' && (
          <div className="fixed inset-0 z-[200] bg-pink-dark flex flex-col items-center justify-center overflow-hidden">
            {!isAuthenticated ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-14 rounded-[50px] shadow-2xl w-full max-w-md text-center space-y-10">
                <div className="w-20 h-20 bg-pink-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                  <CreditCard className="w-10 h-10 text-pink-primary" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-pink-dark">{isRtl ? 'دخول المسؤول' : 'Admin Access'}</h3>
                  <p className="text-pink-dark/40 text-sm font-bold">{isRtl ? 'يرجى إدخال كلمة المرور للمتابعة' : 'Please enter password to continue'}</p>
                </div>
                <input 
                  type="password" 
                  autoFocus
                  value={dashboardPassword}
                  onChange={(e) => {
                    setDashboardPassword(e.target.value);
                    if (e.target.value === adminPassword) setIsAuthenticated(true);
                  }}
                  placeholder="****"
                  className="w-full bg-pink-bg p-8 rounded-3xl border-3 border-transparent focus:border-pink-primary outline-none text-center text-4xl font-black tracking-[1em] shadow-inner"
                />
                <div className="pt-4 flex justify-center gap-4">
                  <button onClick={() => { setActiveView('home'); setDashboardPassword(''); }} className="font-black text-pink-dark/40 hover:text-pink-primary transition-all text-xs uppercase tracking-widest">Cancel</button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-white flex flex-col">
                {/* Dashboard Header */}
                <div className="p-8 md:p-12 bg-pink-bg border-b-2 border-pink-border flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="w-14 h-14 bg-pink-primary rounded-[18px] flex items-center justify-center rotate-6 shadow-xl"><Scissors className="w-7 h-7 text-white" /></div>
                    <div>
                      <h2 className="text-4xl font-black text-pink-dark tracking-tighter">stick_it System</h2>
                      <div className="flex items-center gap-4 text-xs font-black text-pink-dark/40 uppercase tracking-widest mt-1">
                        <span>{orders.length} Orders</span>
                        <div className="w-1 h-1 rounded-full bg-pink-border" />
                        <span>Administrator</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setShowPasswordChange(true)} className="px-6 py-4 bg-pink-primary/5 text-pink-primary font-black text-sm rounded-2xl border-2 border-pink-primary/10 hover:bg-pink-primary hover:text-white transition-all">
                      {isRtl ? 'تغيير كود الدخول' : 'Change Code'}
                    </button>
                    <button onClick={() => { setIsAuthenticated(false); setDashboardPassword(''); }} className="px-8 py-4 bg-white text-pink-dark font-black text-sm rounded-2xl border-2 border-pink-border hover:bg-pink-dark hover:text-white transition-all shadow-sm">Logout</button>
                    <button onClick={() => navigateTo('home')} className="w-16 h-16 bg-pink-primary text-white font-black rounded-2xl flex items-center justify-center hover:bg-pink-dark transition-all shadow-lg shadow-pink-primary/20"><X className="w-8 h-8" /></button>
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="flex-1 overflow-auto bg-pink-bg/30 p-4 md:p-14">
                  <div className="max-w-7xl mx-auto space-y-12">
                    {orders.length === 0 ? (
                      <div className="h-[60vh] flex flex-col items-center justify-center text-pink-dark/20 space-y-8">
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-xl flex items-center justify-center animate-pulse"><FileText className="w-16 h-16" /></div>
                        <p className="text-3xl font-black">{isRtl ? 'لا يوجد طلبات حتى الآن' : 'No orders yet'}</p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        {/* Table Style */}
                        <style>{`
                          .admin-grid { display: grid; grid-template-columns: 120px 2fr 1fr 1fr 1fr 1.5fr 100px; gap: 24px; padding: 32px; align-items: center; }
                          .admin-row { background: white; border-radius: 40px; border: 1px solid #ffcadb; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(255,77,141,0.05); transition: transform 0.2s, box-shadow 0.2s; }
                          .admin-row:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(255,77,141,0.1); }
                          .admin-header { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #ff4d8d; text-transform: uppercase; letter-spacing: 0.2em; border-bottom: 2px solid #ff4d8d; margin-bottom: 20px; }
                        `}</style>

                        <div className="admin-grid admin-header">
                          <div>ID</div>
                          <div>Customer Info</div>
                          <div>Items Detail</div>
                          <div>Price</div>
                          <div>Payment</div>
                          <div>Process State</div>
                          <div>Control</div>
                        </div>

                        {orders.map((order) => (
                          <div key={order.id} className="admin-row">
                            <div className="admin-grid">
                              <div className="font-mono text-sm font-black text-pink-primary">#{order.id}</div>
                              <div className="space-y-2">
                                <p className="font-black text-xl text-pink-dark leading-none">{order.customerName}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-pink-bg px-2 py-0.5 rounded-lg text-[10px] font-black text-pink-dark/60">{order.phone}</span>
                                  <span className="bg-pink-bg px-2 py-0.5 rounded-lg text-[10px] font-black text-pink-dark/60">{order.governorate}</span>
                                </div>
                                <p className="text-[10px] font-bold text-pink-dark/40 italic leading-relaxed">{order.address}</p>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {order.items.map((item, i) => (
                                  <div key={i} className="group relative">
                                    <img src={item.url} className="w-14 h-14 rounded-2xl bg-pink-bg object-contain border border-pink-border" />
                                    <button 
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = item.url;
                                        link.download = `order-${order.id}-item-${i}.png`;
                                        link.click();
                                      }}
                                      className="absolute inset-0 bg-pink-dark/80 text-white flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                    >
                                      <Download className="w-5 h-5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="font-black text-xl text-pink-dark tracking-tighter">{order.totalAmount} <span className="text-[10px] text-pink-primary">{t.currency}</span></div>
                              <div className="flex flex-col gap-2">
                                <span className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentMethod === 'vodafone' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                                  {order.paymentMethod === 'vodafone' ? 'Vodafone' : 'COD'}
                                </span>
                                {order.vodafoneReceiptUrl && (
                                  <button 
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = order.vodafoneReceiptUrl!;
                                      link.download = `receipt-${order.id}.png`;
                                      link.click();
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black text-pink-primary hover:underline"
                                  >
                                    <Download className="w-3 h-3" /> Download Receipt
                                  </button>
                                )}
                              </div>
                              <div>
                                <select 
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`w-full p-4 rounded-2xl text-xs font-black border-2 outline-none appearance-none cursor-pointer transition-all ${
                                    order.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                    order.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                    order.status === 'completed' ? 'bg-green-50 border-green-200 text-green-600' :
                                    order.status === 'ready' ? 'bg-purple-50 border-purple-200 text-purple-600' :
                                    'bg-gray-50 border-gray-200 text-gray-600'
                                  }`}
                                >
                                  <option value="pending">{isRtl ? 'قيد الانتظار' : 'Pending'}</option>
                                  <option value="processing">{isRtl ? 'بدأ العمل' : 'Started'}</option>
                                  <option value="completed">{isRtl ? 'خلصت' : 'Finished'}</option>
                                  <option value="ready">{isRtl ? 'جاهز' : 'Ready'}</option>
                                  <option value="delivered">{isRtl ? 'تم الاستلام' : 'Delivered'}</option>
                                </select>
                              </div>
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Delete this order?')) {
                                      deleteOrder(order.id);
                                    }
                                  }}
                                  className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordChange && (
          <div className="fixed inset-0 z-[300] bg-pink-dark/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[50px] shadow-2xl w-full max-w-md text-center space-y-8">
              <div className="w-16 h-16 bg-pink-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Scissors className="w-8 h-8 text-pink-primary" />
              </div>
              <h3 className="text-3xl font-black text-pink-dark">{isRtl ? 'تغيير كود الدخول' : 'Change Access Code'}</h3>
              <input 
                type="text"
                autoFocus
                placeholder={isRtl ? 'الكود الجديد' : 'New code'}
                value={tempNewPassword}
                onChange={(e) => setTempNewPassword(e.target.value)}
                className="w-full bg-pink-bg p-6 rounded-3xl border-2 border-transparent focus:border-pink-primary outline-none text-center text-2xl font-black"
              />
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setShowPasswordChange(false); setTempNewPassword(''); }} className="flex-1 py-4 font-black text-pink-dark/40">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={updateAdminPassword} className="flex-1 bg-pink-primary text-white py-4 rounded-2xl font-black">{isRtl ? 'حفظ' : 'Save'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #fff5f8;
        }
        ::-webkit-scrollbar-thumb {
          background: #ff4d8d;
          border-radius: 10px;
          border: 2px solid #fff5f8;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #e63e7a;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
