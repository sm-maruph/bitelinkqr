import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyView, setHistoryView] = useState('grid');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billOpen, setBillOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [template, setTemplate] = useState(requestedTemplate && templates[requestedTemplate] ? requestedTemplate : "editorial");
  const [theme, setTheme] = useState("coral");
  const [compactCanvas, setCompactCanvas] = useState(false);
  const [liveContent, setLiveContent] = useState(null);
  const [publicLoading, setPublicLoading] = useState(isLiveCustomerRoute);
  const [publicError, setPublicError] = useState('');
  const canvasRef = useRef(null);
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
    name: liveContent.restaurant.name,
    tagline: liveContent.restaurant.tagline || fallbackContent.tagline,
    description: liveContent.restaurant.description || fallbackContent.description,
    phone: liveContent.restaurant.phone || liveContent.restaurant.outlet_phone || fallbackContent.phone,
    email: liveContent.restaurant.email || fallbackContent.email,
    address: [liveContent.restaurant.address_line, liveContent.restaurant.city].filter(Boolean).join(", ") || fallbackContent.address,
    chefName: liveContent.restaurant.chef_name || fallbackContent.chefName,
    offerTitle: liveContent.offers[0]?.name || fallbackContent.offerTitle,
    offerDescription: liveContent.offers[0]?.description || fallbackContent.offerDescription,
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
          const normalized = result.items.map(item => ({ id:item.id, orderNumber:item.order_number, tableId:tableNumber, status:item.status==='completed'?'SERVED':String(item.status).toUpperCase(), subtotal:Number(item.subtotal), discount:Number(item.discount_total), total:Number(item.grand_total), placed:new Date(item.placed_at).toLocaleString(), itemDetails:item.items.map(line=>({id:line.id,name:line.name,price:Number(line.price),quantity:Number(line.quantity)})) }));
          setOrderHistory(normalized);
          setSelectedOrder(current => current ? normalized.find(item=>item.id===current.id) || current : current);
        }
      } catch { /* The tracker keeps its last known status during a transient outage. */ }
      finally { refreshing = false; if(active)setHistoryLoading(false); }
    };
    refreshOrders();
    const timer = window.setInterval(refreshOrders, 3000);
    window.addEventListener('focus', refreshOrders);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refreshOrders); };
  }, [isLiveCustomerRoute, context.restaurantId, context.outlet, tableNumber]);
  const filteredItems = category === "All dishes" ? state.menu
    : category === "Popular now" ? state.menu.filter(item=>item.popularNow)
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
      setCart({});
      setDrawerOpen(false);
      setHistoryOpen(true);
    } catch {
      setOrderError('Could not place the order. Please check the table QR and try again.');
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
          logoUrl={liveContent?.restaurant?.logo_url}
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
          content={restaurantContent}
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
          logoUrl={liveContent?.restaurant?.logo_url}
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
          cartCount={cartCount}
          onMenu={scrollToMenu}
          onOrder={() => setHistoryOpen(true)}
          onBill={() => setBillOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
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
              order={order}
              tableNumber={tableNumber}
              payment={[...state.payments].reverse().find((payment) => payment.orderId === order?.id)}
              onPay={actions.submitPayment}
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
