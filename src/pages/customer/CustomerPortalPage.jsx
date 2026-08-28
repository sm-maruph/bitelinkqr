import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
  const requestedTemplate = new URLSearchParams(window.location.search).get("previewTemplate");
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
  const [billOpen, setBillOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [template, setTemplate] = useState(requestedTemplate && templates[requestedTemplate] ? requestedTemplate : "editorial");
  const [theme, setTheme] = useState("coral");
  const [compactCanvas, setCompactCanvas] = useState(false);
  const [liveContent, setLiveContent] = useState(null);
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
    const outletSlug = context.outlet.toLowerCase().trim().replaceAll(/\s+/g, "-");
    restaurantService.getPublicSite(context.restaurantId, outletSlug)
      .then((payload) => {
        if (!active) return;
        actions.hydratePublicMenu(payload.menu);
        setLiveContent(payload);
        if (!requestedTemplate && payload.restaurant.template_key) setTemplate(payload.restaurant.template_key);
        if (payload.restaurant.theme_key && themes[payload.restaurant.theme_key]) setTheme(payload.restaurant.theme_key);
      })
      .catch(() => { /* The visual demo remains available until the API is configured. */ });
    return () => { active = false; };
  }, [context.restaurantId, context.outlet, actions, requestedTemplate]);
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
  const categories = ["All dishes", ...new Set(state.menu.map((item) => item.category).filter(Boolean))];
  const order = [...state.orders]
    .reverse()
    .find(
      (item) =>
        item.restaurantId === context.restaurantId &&
        item.outletId === context.outlet &&
        item.tableId === "12",
    );
  const filteredItems =
    category === "All dishes"
      ? state.menu
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
  const placeOrder = (summary) => {
    actions.placeOrder({
      restaurantId: context.restaurantId,
      outletId: context.outlet,
      tableId: "12",
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
    });
    setCart({});
    setDrawerOpen(false);
    setOrderOpen(true);
  };
  return (
    <div
      className={`customer-page customer-template-${template} ${template.startsWith("future-") ? "customer-template-future" : ""}`}
      style={{ "--customer-accent": themes[theme].color }}
    >
      {!embedded && <div className="customer-preview-controls">
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
          cartCount={cartCount}
          setRole={setRole}
          onCart={() => setDrawerOpen(true)}
        />
        <CustomerHero
          template={template}
          restaurantName={
            context.restaurantId === "kacchi" ? "Kacchi Vai" : "The Terrace"
          }
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
          onOrder={() => {
            if (order) setOrderOpen(true);
            else setDrawerOpen(true);
          }}
          onBill={() => setBillOpen(true)}
          onHelp={() => setHelpOpen(true)}
        />
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
          onChange={changeQuantity}
          onClose={() => setDrawerOpen(false)}
          onPlaceOrder={placeOrder}
        />
      )}
      {orderOpen && order && (
        <div className="customer-modal-backdrop" onClick={() => setOrderOpen(false)}>
          <div className="bill-modal order-modal" onClick={(event) => event.stopPropagation()}>
            <button className="bill-modal-close" onClick={() => setOrderOpen(false)} aria-label="Close order">
              <X size={17} />
            </button>
            <OrderTracker
              order={order}
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
              onRequest={(type) => actions.addRequest({ table: "12", type })}
              onResolve={actions.resolveRequest}
            />
          </div>
        </div>
      )}
    </div>
  );
}
