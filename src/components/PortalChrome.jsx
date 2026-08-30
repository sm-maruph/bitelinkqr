import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Settings,
  Store,
  Utensils,
} from "lucide-react";
import { navGroups, roles } from "../data/mockData";

export function Button({ children, className = "", ...props }) {
  return (
    <button className={`ui-button ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ContextBar({ context, setContext, onRoleChange }) {
  const restaurants = context.restaurants || [];
  const selectedRestaurant = restaurants.find(
    (r) => r.slug === context.restaurantId,
  );
  const selectedRole = roles.find((r) => r.id === context.roleId);
  const select = (key) => (event) =>
    setContext((current) => ({ ...current, [key]: event.target.value }));
  const selectRestaurant = (event) => {
    const restaurant = restaurants.find((r) => r.slug === event.target.value),
      outlet = restaurant?.outlets?.[0];
    setContext((current) => ({
      ...current,
      restaurantId: restaurant.slug,
      restaurantUuid: restaurant.id,
      restaurantName: restaurant.name,
      outlet: outlet?.name || "",
      outletId: outlet?.id || "",
    }));
  };
  return (
    <div className="context-bar">
      <div className="context-intro">
        <Activity size={16} />
        <span>
          <b>Live workspace</b>
          <small>Restaurant operations synced securely</small>
        </span>
      </div>
      <label>
        Role
        <select
          value={context.roleId}
          onChange={onRoleChange || select("roleId")}
        >
          {roles.map((role) => (
            <option value={role.id} key={role.id}>
              {role.label}
            </option>
          ))}
        </select>
      </label>
      {selectedRole?.portal !== "customer" &&
        selectedRole?.portal !== "super" && (
          <>
            <label>
              Restaurant
              <select value={context.restaurantId} onChange={selectRestaurant}>
                {restaurants.map((r) => (
                  <option value={r.slug} key={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Outlet
              <select value={context.outlet} onChange={select("outlet")}>
                {selectedRestaurant?.outlet_list?.map((o) => (
                  <option value={o.name} key={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      <span className="context-status">
        {selectedRole?.label}{" "}
        {selectedRole?.portal === "super"
          ? "• Platform wide"
          : selectedRole?.portal === "customer"
            ? "• Table 12"
            : `• ${selectedRestaurant?.name || "Loading"}`}
      </span>
    </div>
  );
}

export function AdminSidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  context,
  setContext,
  onLogout,
}) {
  const role = context.roleId;
  const baseAllowed =
    role === "kitchen"
      ? ["Overview", "Live orders"]
      : role === "order"
        ? ["Overview", "Live orders", "Tables"]
        : role === "outlet"
          ? [
              "Overview",
              "Live orders",
              "Tables",
              "Menu & offers",
              "Payments",
              "Team",
              "QR codes",
            ]
          : [
              "Overview",
              "Live orders",
              "Tables",
              "Menu & offers",
              "Payments",
              "Team",
              "Analytics",
              "QR codes",
            ];
  const pagePermissions = {
    Overview: [],
    "Live orders": ["orders.read"],
    Tables: ["tables.read", "tables.write"],
    "Menu & offers": ["menu.read", "menu.write"],
    Payments: ["payments.read", "payments.verify"],
    Team: ["staff.manage"],
    Analytics: ["analytics.read"],
    "QR codes": ["tables.read", "tables.write"],
  };
  const permissions = context.permissions || [];
  const allowed = permissions.length
    ? baseAllowed.filter(
        (page) =>
          !pagePermissions[page].length ||
          pagePermissions[page].some((permission) =>
            permissions.includes(permission),
          ),
      )
    : baseAllowed;
  const mobileLinks = navGroups.flatMap((group) => group.links).filter(([name]) => allowed.includes(name));
  return (
    <>
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="side-top">
        <a className="brand" href="#overview">
          <span className="brand-mark">
            <Utensils size={17} />
          </span>
          <span>
            Bite<span>Link</span>
          </span>
        </a>
        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle navigation"
        >
          <PanelLeft size={17} />
        </button>
      </div>
      {!collapsed && (
        <div className="restaurant-switch">
          <span className="restaurant-avatar">
            {(context.restaurantName || context.restaurantId)
              .charAt(0)
              .toUpperCase()}
          </span>
          <span>
            <b>{context.restaurantName || context.restaurantId}</b>
            <small>{context.outlet} outlet</small>
          </span>
          <ChevronDown size={15} />
        </div>
      )}
      <nav className="portal-nav">
        {navGroups.map((group) => {
          const links = group.links.filter(([name]) => allowed.includes(name));
          return links.length ? (
            <div className="nav-group" key={group.label}>
              {!collapsed && <small>{group.label}</small>}
              {links.map(([name, Icon]) => (
                <button
                  key={name}
                  className={activePage === name ? "active" : ""}
                  onClick={() => setActivePage(name)}
                  title={name}
                >
                  <Icon size={17} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          ) : null;
        })}
      </nav>
      <div className="side-bottom">
        {allowed.includes("Team") && (
          <button className={activePage === "Settings" ? "active" : ""} onClick={() => setActivePage("Settings")} title="Settings">
            <Settings size={17} /> <span>Settings</span>
          </button>
        )}
        <button className={activePage === "Help" ? "active" : ""} onClick={() => setActivePage("Help")} title="Help center">
          <HelpCircle size={17} /> <span>Help center</span>
        </button>
        <button className="logout-button" onClick={onLogout} title="Log out">
          <LogOut size={17} /> <span>Log out</span>
        </button>
        <div className="user-chip" title={`${context.userDisplayName || "Signed-in user"} · ${roles.find((item) => item.id === role)?.label || "User"}`}>
          <span className="user-avatar">DB</span>
          <span className="user-details">
            <b>{context.userDisplayName || "Signed-in user"}</b>
            <small>{roles.find((item) => item.id === role)?.label}</small>
          </span>
          <MoreHorizontal size={17} />
        </div>
      </div>
      <button
        className="portal-switch"
        onClick={() =>
          setContext((current) => ({
            ...current,
            roleId: current.roleId === "customer" ? "owner" : "customer",
          }))
        }
      >
        <Store size={17} />
        <span>
          {role === "customer" ? "Open admin portal" : "Preview customer view"}
        </span>
        <ArrowRight size={15} />
      </button>
    </aside>
    <nav className="mobile-primary-nav" aria-label="Mobile workspace navigation">
      {mobileLinks.map(([name, Icon]) => <button className={activePage === name ? "active" : ""} onClick={() => setActivePage(name)} key={name}><Icon size={18}/><span>{name}</span></button>)}
      {allowed.includes("Team") && <button className={`mobile-utility-start ${activePage === "Settings" ? "active" : ""}`} onClick={() => setActivePage("Settings")}><Settings size={18}/><span>Settings</span></button>}
      <button className={`${!allowed.includes("Team") ? "mobile-utility-start " : ""}${activePage === "Help" ? "active" : ""}`} onClick={() => setActivePage("Help")}><HelpCircle size={18}/><span>Help</span></button>
      <button className="logout-button" onClick={onLogout}><LogOut size={18}/><span>Log out</span></button>
    </nav>
    </>
  );
}

export function Header({ title, eyebrow, action, onAction }) {
  return (
    <header className="content-header">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} />
          <i />
        </button>
        {action && (
          <Button className="primary" onClick={onAction}>
            <Plus size={16} /> {action}
          </Button>
        )}
      </div>
    </header>
  );
}
export function StatCard({
  label,
  value,
  meta,
  trend,
  icon: Icon,
  tone = "green",
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <span className={trend?.startsWith("+") ? "trend up" : "trend"}>
        {trend} <small>{meta}</small>
      </span>
    </div>
  );
}
