import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ReceiptText,
  X,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import useMockStore from "../../hooks/useMockStore";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerHero from "../../components/customer/CustomerHero";
import CategoryTabs from "../../components/customer/CategoryTabs";
import FoodCard from "../../components/customer/FoodCard";
import FoodDetailModal from "../../components/customer/FoodDetailModal";
import CartDrawer from "../../components/customer/CartDrawer";
import OrderTracker from "../../components/customer/OrderTracker";
import BillAndPayment from "../../components/customer/BillAndPayment";
import CustomerRequests from "../../components/customer/CustomerRequests";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import CustomerOrderHistory from "../../components/customer/CustomerOrderHistory";
import StandardTemplateFooter from "../../components/customer/StandardTemplateFooter";
import { getRestaurantContent } from "../../data/restaurantContent";
import { restaurantService } from "../../services/restaurantService";
import { futuristicTemplateCatalog } from "../../data/templateCatalog";

const _legacyFuturisticTemplates = {
  "future-neon": "Neon Nova",
  "future-hologram": "Hologram Feast",
  "future-paper": "Paper & Salt",
  "future-cyber": "Cyber Bento",
  "future-aurora": "Aurora Kitchen",
  "future-quantum": "Quantum Plate",
  "future-solar": "Solar Flare",
  "future-lunar": "Lunar Lounge",
  "future-bio": "Bio Lumina",
  "future-chrome": "Chrome Café",
  "future-void": "Void Supper",
  "future-prism": "Prism Pantry",
  "future-synth": "Synthwave Diner",
  "future-crystal": "Crystal Table",
  "future-plasma": "Plasma Grill",
  "future-zen": "Neo Zen",
  "future-circuit": "Circuit Kitchen",
  "future-cosmos": "Cosmos Eatery",
  "future-flux": "Flux Bistro",
  "future-oasis": "Digital Oasis",
};
const futuristicTemplates=Object.fromEntries(futuristicTemplateCatalog.map(template=>[template.key,template.name]));
const templates = {
  editorial: "Editorial",
  garden: "Garden table",
  midnight: "Bistro night",
  express: "Hot delivery",
  worldplate: "World plate",
  ember: "Ember table",
  sage: "Sage kitchen",
  ...futuristicTemplates,
};
const themes = {
  coral: { label: "Terracotta", color: "#e97656" },
  olive: { label: "Olive", color: "#597b62" },
  saffron: { label: "Saffron", color: "#bb853f" },
};
const itemsPerPage = 6;

export default function CustomerPortalPage({ setRole, context, embedded = false }) {
  const tableNumber = context.tableNumber || "12";
  const isLiveCustomerRoute = !embedded && window.location.pathname.split('/').filter(Boolean)[2] === 'table';
  const canPreviewTemplates = embedded || context.roleId === "super";
  const requestedTemplate = canPreviewTemplates ? new URLSearchParams(window.location.search).get("previewTemplate") : null;
  useEffect(() => {
    if (!embedded) return undefined;
    document.body.classList.add("embedded-customer-preview");
    return () => document.body.classList.remove("embedded-customer-preview");
  }, [embedded]);
  const [category, setCategoryState] = useState("All dishes");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [cart, setCart] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);
  const [statusNotice, setStatusNotice] = useState(null);
  const orderStatusesRef = useRef(new Map());
  const historyReadyRef = useRef(false);
  const paymentStatusRef = useRef('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyView, setHistoryView] = useState('grid');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billOpen, setBillOpen] = useState(false);
  const [livePayment, setLivePayment] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [template, setTemplate] = useState(requestedTemplate && templates[requestedTemplate] ? requestedTemplate : "editorial");
  const [theme, setTheme] = useState("coral");
  const [compactCanvas, setCompactCanvas] = useState(false);
  const [liveContent, setLiveContent] = useState(null);
  const [publicLoading, setPublicLoading] = useState(isLiveCustomerRoute);
  const [publicError, setPublicError] = useState('');
  const canvasRef = useRef(null);
  useEffect(() => {
    if(!statusNotice)return undefined;
    const timer=window.setTimeout(()=>setStatusNotice(null),6000);
    return ()=>window.clearTimeout(timer);
  },[statusNotice]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const updateCanvasSize = () => setCompactCanvas(canvas.getBoundingClientRect().width <= 820);
    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  const { state, actions } = useMockStore();
  useEffect(() => {
    let active = true;
    if (isLiveCustomerRoute) { setPublicLoading(true); setPublicError(''); }
    const outletSlug = context.outlet.toLowerCase().trim().replaceAll(/\s+/g, "-");
    restaurantService.getPublicSite(context.restaurantId, outletSlug)
      .then((payload) => {
        if (!active) return;
        actions.hydratePublicMenu(payload.menu);
        setLiveContent(payload);
        if (!requestedTemplate && payload.restaurant.template_key) setTemplate(payload.restaurant.template_key);
        if (payload.restaurant.theme_key && themes[payload.restaurant.theme_key]) setTheme(payload.restaurant.theme_key);
        setPublicLoading(false);
      })
      .catch(() => { if (active && isLiveCustomerRoute) { setPublicError('This restaurant menu is currently unavailable.'); setPublicLoading(false); } });
    return () => { active = false; };
  }, [context.restaurantId, context.outlet, actions, requestedTemplate, isLiveCustomerRoute]);
  const fallbackContent = getRestaurantContent(context.restaurantId, context.outlet);
  const restaurantContent = liveContent ? {
    ...fallbackContent,
    hasActiveOffers: liveContent.offers.length > 0,
    name: liveContent.restaurant.name,
    tagline: liveContent.restaurant.tagline || fallbackContent.tagline,
    description: liveContent.restaurant.description || fallbackContent.description,
    phone: liveContent.restaurant.phone || liveContent.restaurant.outlet_phone || fallbackContent.phone,
    email: liveContent.restaurant.email || fallbackContent.email,
    address: [liveContent.restaurant.address_line, liveContent.restaurant.city].filter(Boolean).join(", ") || fallbackContent.address,
    chefName: liveContent.restaurant.chef_name || fallbackContent.chefName,
    offerTitle: liveContent.offers[0]?.name || fallbackContent.offerTitle,
    offerDescription: liveContent.offers[0]?.description || fallbackContent.offerDescription,
    designSettings: liveContent.restaurant.design_settings || {},
  } : fallbackContent;
  const categories = ["All dishes", "Popular now", "Offers", "Combo offers", ...new Set(state.menu.map((item) => item.category).filter(Boolean))];
  const comboItems=(liveContent?.comboOffers||[]).map(offer=>({id:`combo-${offer.id}`,comboOffer:true,name:offer.name,description:offer.description,price:Number(offer.comboPrice),regularPrice:Number(offer.regularPrice),savings:Number(offer.savings),image:offer.items[0]?.image_url,tag:'Combo offer',availability:'AVAILABLE',comboItems:offer.items.map(raw=>state.menu.find(item=>item.id===raw.id)).filter(Boolean)}));
  const order = [...state.orders]
    .reverse()
    .find(
      (item) =>
        item.restaurantId === context.restaurantId &&
        item.outletId === context.outlet &&
        item.tableId === tableNumber,
    );
  useEffect(() => {
    if (!isLiveCustomerRoute) return undefined;
    let active = true;
    let refreshing = false;
    const outletSlug = context.outlet.toLowerCase().trim().replaceAll(/\s+/g, "-");
    const refreshOrders = async () => {
      if (refreshing || document.visibilityState !== 'visible') return;
      refreshing = true;
      if (active && !orderHistory.length) setHistoryLoading(true);
      try {
        const result = await restaurantService.getOrders(context.restaurantId, outletSlug, tableNumber);
        if (active) {
          const normalized = result.items.map(item => ({ id:item.id, orderNumber:item.order_number, tableId:tableNumber, status:item.status==='completed'?'SERVED':String(item.status).toUpperCase(), estimatedReadyAt:item.estimated_ready_at||null, subtotal:Number(item.subtotal), discount:Number(item.discount_total), total:Number(item.grand_total), placed:new Date(item.placed_at).toLocaleString(), itemDetails:item.items.map(line=>({id:line.id,name:line.name,price:Number(line.price),quantity:Number(line.quantity)})) }));
          if(historyReadyRef.current){const changed=normalized.filter(item=>orderStatusesRef.current.has(item.id)&&orderStatusesRef.current.get(item.id)!==item.status);if(changed.length){const item=changed[0];setStatusNotice({id:item.id,orderNumber:item.orderNumber,status:item.status,message:{CONFIRMED:'Your order has been confirmed.',PREPARING:'The kitchen has started preparing your order.',READY:'Your order is ready to serve.',SERVING:'Your order is on the way to your table.',SERVED:'Your order has been served. Your bill is ready.',REJECTED:'The restaurant could not accept this order.',CANCELLED:'This order has been cancelled.'}[item.status]||`Order status changed to ${item.status.toLowerCase()}.`});if(item.status==='SERVED')setBillOpen(true)}}else historyReadyRef.current=true;
          orderStatusesRef.current=new Map(normalized.map(item=>[item.id,item.status]));
          setOrderHistory(normalized);
          setSelectedOrder(current => current ? normalized.find(item=>item.id===current.id) || current : current);
        }
      } catch { /* The tracker keeps its last known status during a transient outage. */ }
      finally { refreshing = false; if(active)setHistoryLoading(false); }
    };
    refreshOrders();
    const unsubscribe=restaurantService.subscribe(context.restaurantId,outletSlug,tableNumber,event=>{refreshOrders();window.dispatchEvent(new CustomEvent('bitelink:guest-realtime',{detail:event}))});
    const timer = window.setInterval(refreshOrders, 30000);
    window.addEventListener('focus', refreshOrders);
    return () => { active = false; unsubscribe(); window.clearInterval(timer); window.removeEventListener('focus', refreshOrders); };
  }, [isLiveCustomerRoute, context.restaurantId, context.outlet, tableNumber]);
  const filteredItems = category === "All dishes" ? state.menu
    : category === "Popular now" ? (state.menu.some(item=>item.popularNow) ? state.menu.filter(item=>item.popularNow) : [{id:'popular-empty',emptyOffer:true,emptyKind:'popular',emptyLabel:'Popular now',emptyTitle:'No popular dishes yet.',emptyDescription:'Popular dishes will appear here as guests start ordering. Explore the full menu in the meantime.',onViewMenu:()=>{setCategoryState('All dishes');setCurrentPage(1)}}])
    : category === "Offers" ? (state.menu.some(item=>item.onOffer) ? state.menu.filter(item=>item.onOffer) : [{id:'offers-empty',name:state.menu[0]?.name||'Menu',image:state.menu[0]?.image,emptyOffer:true,onViewMenu:()=>{setCategoryState('All dishes');setCurrentPage(1)}}])
    : category === "Combo offers" ? (comboItems.length?comboItems:[{id:'combos-empty',emptyOffer:true,emptyTitle:'No combo offers are available right now.',onViewMenu:()=>{setCategoryState('All dishes');setCurrentPage(1)}}])
    : state.menu.filter((item) => item.category === category);
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const setCategory = (nextCategory) => {
    setCategoryState(nextCategory);
    setCurrentPage(1);
  };
  const changePage = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), pageCount));
    document.querySelector("#menu, #future-menu, #bistro-menus, #express-menu, #worldplate-menu, #ember-menu, #sage-menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollToMenu = () =>
    document
      .getElementById(
        template.startsWith("future-")
          ? "future-menu"
          : template === "midnight"
          ? "bistro-menus"
          : template === "express"
            ? "express-menu"
            : template === "worldplate"
              ? "worldplate-menu"
              : template === "ember"
                ? "ember-menu"
              : template === "sage"
                ? "sage-menu"
            : "menu",
      )
      ?.scrollIntoView({ behavior: "smooth" });
  const viewOffers = () => {
    setCategory("Offers");
    window.requestAnimationFrame(scrollToMenu);
  };
  const items = {
    map: (renderItem) => (
      <>
        {visibleItems.map(renderItem)}
        {pageCount > 1 && (
          <nav className="menu-pagination" aria-label="Menu pages">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous menu page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page) => (
                <button
                  className={currentPage === page ? "active" : ""}
                  onClick={() => changePage(page)}
                  aria-label={`Go to menu page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  key={page}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="Next menu page"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </>
    ),
  };
  const cartCount = Object.values(cart).reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const activeOrderCount=orderHistory.filter(item=>!['SERVED','COMPLETED','REJECTED','CANCELLED'].includes(item.status)).length;
  const billOrder=orderHistory.find(item=>['SERVED','COMPLETED'].includes(item.status))||((order&&['SERVED','COMPLETED'].includes(order.status))?order:null);
  useEffect(()=>{
    if(!isLiveCustomerRoute||!billOrder?.id)return undefined;
    let active=true,refreshing=false;
    const outletSlug=context.outlet.toLowerCase().trim().replaceAll(/\s+/g,'-');
    const refresh=async()=>{if(refreshing)return;refreshing=true;try{const result=await restaurantService.getOrderPayment(context.restaurantId,outletSlug,tableNumber,billOrder.id);if(active){const nextStatus=String(result.payment?.status||'').toLowerCase();if(nextStatus==='verified'&&paymentStatusRef.current!=='verified')setBillOpen(true);paymentStatusRef.current=nextStatus;setLivePayment(result.payment)}}catch{/* Keep the last payment state during a transient outage. */}finally{refreshing=false}};
    const realtime=()=>refresh();window.addEventListener('bitelink:guest-realtime',realtime);refresh();const timer=window.setInterval(refresh,30000);return()=>{active=false;window.clearInterval(timer);window.removeEventListener('bitelink:guest-realtime',realtime)};
  },[isLiveCustomerRoute,billOrder?.id,context.restaurantId,context.outlet,tableNumber]);
  const submitPayment=async(payload)=>{
    if(paymentSubmitting||!billOrder)return;setPaymentSubmitting(true);setPaymentError('');
    try{if(isLiveCustomerRoute){const outletSlug=context.outlet.toLowerCase().trim().replaceAll(/\s+/g,'-');const created=await restaurantService.submitOrderPayment(context.restaurantId,outletSlug,tableNumber,billOrder.id,payload);setLivePayment(created)}else{actions.submitPayment({orderId:billOrder.id,amount:billOrder.total, ...payload,status:'SUBMITTED'});setLivePayment({order_id:billOrder.id,...payload,status:'submitted'})}}
    catch(error){setPaymentError(error?.payload?.error==='valid_table_qr_required'?`Payment access requires the QR code displayed at Table ${tableNumber}. Please scan that QR with this device and reopen your bill.`:error?.payload?.error==='order_not_served'?'The restaurant must mark this order served before payment.':'We could not submit your payment. Please try again.')}
    finally{setPaymentSubmitting(false)}
  };
  const addToCart = (item, quantity = 1) => {
    if (item.availability === "SOLD_OUT") return;
    if(item.comboOffer){setCart(current=>{const next={...current};item.comboItems.forEach(entry=>{next[entry.id]={...entry,quantity:(next[entry.id]?.quantity||0)+quantity}});return next});setSelectedItem(null);setDrawerOpen(true);return}
    setCart((current) => ({
      ...current,
      [item.id]: {
        ...item,
        quantity: (current[item.id]?.quantity || 0) + quantity,
      },
    }));
    setSelectedItem(null);
  };
  const changeQuantity = (id, change) =>
    setCart((current) => {
      const next = (current[id]?.quantity || 0) + change;
      if (next <= 0)
        return Object.fromEntries(
          Object.entries(current).filter(([itemId]) => itemId !== id),
        );
      return { ...current, [id]: { ...current[id], quantity: next } };
    });
  const placeOrder = async (summary) => {
    if (orderSubmitting) return;
    setOrderSubmitting(true);
    setOrderError('');
    const orderDraft = {
      restaurantId: context.restaurantId,
      outletId: context.outlet,
      tableId: tableNumber,
      itemDetails: Object.values(cart).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      items: Object.values(cart)
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", "),
      ...summary,
    };
    try {
      const outletSlug = context.outlet.toLowerCase().trim().replaceAll(/\s+/g, "-");
      const created = await restaurantService.placeOrder(context.restaurantId, outletSlug, tableNumber, {
        items: orderDraft.itemDetails.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
      });
      actions.placeOrder({ ...orderDraft, id: created.id, orderNumber: created.order_number });
      const placedOrder={id:created.id,orderNumber:created.order_number,tableId:tableNumber,status:String(created.status||'pending').toUpperCase(),estimatedReadyAt:created.estimated_ready_at||null,subtotal:Number(created.subtotal),discount:Number(created.discount_total),total:Number(created.grand_total),placed:'Just now',itemDetails:(created.items||orderDraft.itemDetails).map(item=>({id:item.menuItemId||item.id,name:item.name,price:Number(item.price),quantity:Number(item.quantity)}))};
      orderStatusesRef.current.set(placedOrder.id,placedOrder.status);historyReadyRef.current=true;setOrderHistory(current=>[placedOrder,...current.filter(item=>item.id!==placedOrder.id)]);
      setCart({});
      setDrawerOpen(false);
      setHistoryOpen(true);
    } catch (requestError) {
      setOrderError(requestError?.payload?.error==='valid_table_qr_required'
        ? `Ordering is available only after scanning the QR code displayed at Table ${tableNumber}. Please scan that QR with this device, then return to your cart—your selected items will remain here.`
        : requestError?.payload?.error==='table_not_found'
        ? `Table ${tableNumber} is not registered for this outlet. Scan a valid table QR or ask the restaurant team for help.`
        : requestError?.payload?.error==='customer_session_required'
          ? 'Your ordering session could not be created. Refresh the QR page and try again.'
          : requestError?.payload?.error==='menu_item_unavailable'
            ? 'One of these dishes is no longer available. Return to the menu and update your cart.'
            : 'Could not place the order. Please try again.');
    } finally { setOrderSubmitting(false); }
  };
  if (publicLoading) return <div className="customer-live-loader" role="status" aria-label="Loading restaurant experience"><div className="live-loader-phone"><header><i/><span/><b/></header><section className="live-loader-hero"><i/><i/><i/></section><section className="live-loader-copy"><i/><i/><i/></section><section className="live-loader-menu"><i/><i/></section><nav><i/><i/><i/><i/><i/></nav></div><span className="sr-only">Loading the restaurant's selected template</span></div>;
  if (publicError) return <main className="customer-public-error"><div><span>TABLE {tableNumber}</span><h1>Menu unavailable</h1><p>{publicError}</p><button onClick={()=>window.location.reload()}>Try again</button></div></main>;
  return (
    <div
      className={`customer-page customer-template-${template} ${template.startsWith("future-") ? "customer-template-future" : ""}`}
      style={{ "--customer-accent": themes[theme].color }}
    >
      {!embedded && canPreviewTemplates && <div className="customer-preview-controls">
        <span>
          <SlidersHorizontal size={14} /> Preview
        </span>
        <label>
          Template
          <select
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
          >
            {Object.entries(templates).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <Palette size={14} /> Theme
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {Object.entries(themes).map(([value, item]) => (
              <option value={value} key={value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>}
      <div ref={canvasRef} className={`customer-canvas ${compactCanvas ? "customer-canvas-compact" : ""}`}>
        <CustomerHeader
          restaurantName={restaurantContent.name}
          logoUrl={embedded ? "/default-restaurant-logo.svg" : liveContent?.restaurant?.logo_url}
          cartCount={cartCount}
          setRole={setRole}
          onCart={() => setDrawerOpen(true)}
          onMenu={scrollToMenu}
          tableNumber={tableNumber}
          outlet={context.outlet}
          showAdmin={canPreviewTemplates}
        />
        <CustomerHero
          template={template}
          restaurantName={restaurantContent.name}
          content={{...restaurantContent,onOffers:viewOffers}}
          outlet={context.outlet}
          menuItems={visibleItems}
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={changePage}
          onSelect={(next) => {
            setSelectedItem(next);
            setDetailQuantity(1);
          }}
          onAdd={addToCart}
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          onMenu={scrollToMenu}
          onCart={() => setDrawerOpen(true)}
          cartCount={cartCount}
          logoUrl={embedded ? "/default-restaurant-logo.svg" : liveContent?.restaurant?.logo_url}
        />
        <main className="customer-content">
          <section className="customer-menu" id="menu">
            <div className="customer-heading">
              <div>
                <span className="section-kicker">The menu</span>
                <h2>
                  Good things,
                  <br />
                  <em>coming right up.</em>
                </h2>
              </div>
            </div>
            <CategoryTabs
              categories={categories}
              activeCategory={category}
              onChange={setCategory}
            />
            <div className="customer-grid">
              {items.map((item) => (
                <FoodCard
                  item={item}
                  key={item.id}
                  onSelect={(next) => {
                    setSelectedItem(next);
                    setDetailQuantity(1);
                  }}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>
          <div className="customer-order-placeholder" aria-hidden="true" />
          <div className="customer-bill-placeholder" aria-hidden="true" />
          <div className="customer-help-placeholder" aria-hidden="true" />
        </main>
        {(template === "editorial" || template === "garden") && <StandardTemplateFooter template={template} restaurantName={restaurantContent.name} outlet={context.outlet} content={restaurantContent} onMenu={scrollToMenu} />}
        <CustomerBottomNav
          activeOrderCount={activeOrderCount}
          onMenu={scrollToMenu}
          onOrder={() => setHistoryOpen(true)}
          onBill={() => setBillOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
        {statusNotice&&<button className={`customer-status-toast status-${statusNotice.status.toLowerCase()}`} role="status" aria-live="polite" onClick={()=>{const order=orderHistory.find(item=>item.id===statusNotice.id);if(order){setSelectedOrder(order);setOrderOpen(true)}setStatusNotice(null)}}><span><ShoppingBag size={17}/></span><div><small>ORDER #{statusNotice.orderNumber} · {statusNotice.status}</small><b>{statusNotice.message}</b><em>Tap to view order</em></div><X size={15}/></button>}
        {billOrder&&String(livePayment?.status||'').toLowerCase()!=='verified'&&<button className="customer-bill-fab" onClick={()=>setBillOpen(true)} aria-label="Your bill is ready"><ReceiptText size={19}/><span>Bill</span><i/><i/><i/></button>}
        <button className="customer-cart-fab" onClick={()=>setDrawerOpen(true)} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={19}/><span>Cart</span>{cartCount>0&&<b>{cartCount}</b>}</button>
      </div>
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          quantity={detailQuantity}
          onQuantity={setDetailQuantity}
          onAdd={addToCart}
          onClose={() => setSelectedItem(null)}
        />
      )}
      {drawerOpen && (
        <CartDrawer
          cart={cart}
          tableNumber={tableNumber}
          onChange={changeQuantity}
          onClose={() => setDrawerOpen(false)}
          onAddMore={() => { setDrawerOpen(false); window.setTimeout(scrollToMenu, 0); }}
          onPlaceOrder={placeOrder}
          submitting={orderSubmitting}
          error={orderError}
        />
      )}
      {historyOpen && <CustomerOrderHistory orders={orderHistory} view={historyView} onView={setHistoryView} loading={historyLoading} onClose={()=>setHistoryOpen(false)} onSelect={(next)=>{setSelectedOrder(next);setOrderOpen(true)}}/>}
      {orderOpen && selectedOrder && (
        <div className="customer-modal-backdrop" onClick={() => setOrderOpen(false)}>
          <div className="bill-modal order-modal" onClick={(event) => event.stopPropagation()}>
            <button className="bill-modal-close" onClick={() => setOrderOpen(false)} aria-label="Close order">
              <X size={17} />
            </button>
            <OrderTracker
              order={{...selectedOrder,id:`#${selectedOrder.orderNumber}`}}
              onOrderMore={() => {
                setOrderOpen(false);
                scrollToMenu();
              }}
            />
          </div>
        </div>
      )}
      {billOpen && (
        <div className="customer-modal-backdrop" onClick={() => setBillOpen(false)}>
          <div className="bill-modal" onClick={(event) => event.stopPropagation()}>
            <button className="bill-modal-close" onClick={() => setBillOpen(false)} aria-label="Close bill">
              <X size={17} />
            </button>
            <BillAndPayment
              order={billOrder}
              tableNumber={tableNumber}
              restaurantName={restaurantContent.name}
              restaurantAddress={restaurantContent.address}
              logoUrl={embedded ? "/default-restaurant-logo.svg" : liveContent?.restaurant?.logo_url}
              payment={livePayment||[...state.payments].reverse().find((payment) => payment.orderId === billOrder?.id)}
              onPay={submitPayment}
              submitting={paymentSubmitting}
              error={paymentError}
            />
          </div>
        </div>
      )}
      {helpOpen && (
        <div className="customer-modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div className="help-modal" onClick={(event) => event.stopPropagation()}>
            <button className="bill-modal-close" onClick={() => setHelpOpen(false)} aria-label="Close help">
              <X size={17} />
            </button>
            <CustomerRequests
              requests={state.requests}
              onRequest={(type) => actions.addRequest({ table: tableNumber, type })}
              onResolve={actions.resolveRequest}
            />
          </div>
        </div>
      )}
    </div>
  );
}
