import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  Grid2X2,
  HelpCircle,
  List,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Header } from "./PortalChrome";

const guides = [
  {
    icon: ShoppingBag,
    category: "Orders",
    title: "Managing incoming orders",
    text: "Track each order from received to completed, update preparation status, and keep service staff in sync.",
    steps: [
      "Open Live orders from the sidebar.",
      "Select an order to review its table, items, and notes.",
      "Move the ticket through the available preparation states.",
    ],
  },
  {
    icon: QrCode,
    category: "QR & tables",
    title: "Creating table QR codes",
    text: "Generate a unique code for each table and download a print-ready version for your outlet.",
    steps: [
      "Open QR codes and select the outlet.",
      "Choose an existing table or create a new one.",
      "Download the code and test it before printing.",
    ],
  },
  {
    icon: Users,
    category: "Team access",
    title: "Inviting and managing staff",
    text: "Create staff accounts and assign access based on each person’s role and outlet.",
    steps: [
      "Open Team and choose New member.",
      "Enter the staff member’s details and select a role.",
      "Share the temporary credentials privately.",
    ],
  },
  {
    icon: CircleDollarSign,
    category: "Billing",
    title: "Plans, trials, and outlets",
    text: "Review your subscription, trial status, outlet allowance, and pending outlet requests.",
    steps: [
      "Open Settings from the sidebar.",
      "Review the subscription and outlet allowance cards.",
      "Use Request outlet when another location is needed.",
    ],
  },
  {
    icon: ShieldCheck,
    category: "Security",
    title: "Account and permission safety",
    text: "Keep restaurant data protected with individual accounts, scoped roles, and secure password practices.",
    steps: [
      "Never share one account across multiple staff members.",
      "Grant only the permissions required for each role.",
      "Remove access promptly when a team member leaves.",
    ],
  },
  {
    icon: BookOpen,
    category: "Menu",
    title: "Updating your menu",
    text: "Organize categories, dishes, pricing, images, and availability from one workspace.",
    steps: [
      "Open Menu & offers.",
      "Choose a category or create a new one.",
      "Publish changes after checking the customer preview.",
    ],
  },
  {
    icon: BookOpen, category: "Dashboard", title: "Reading the overview dashboard", text: "Understand sales, order activity, table occupancy, and operational alerts at a glance.",
    steps: ["Open Overview and confirm the selected restaurant and outlet.", "Review the key metric cards and their comparison periods.", "Use dashboard links to open the underlying orders, tables, or reports."],
  },
  {
    icon: ShoppingBag, category: "Orders", title: "Reviewing order details", text: "Inspect items, quantities, guest notes, table information, and the order total.",
    steps: ["Open Live orders and select the required ticket.", "Check item modifiers and preparation notes before accepting it.", "Confirm the table, payment state, and order total."],
  },
  {
    icon: ShoppingBag, category: "Orders", title: "Updating an order status", text: "Move a ticket through the service workflow without losing visibility across teams.",
    steps: ["Open the order and verify its current state.", "Choose the next valid status such as accepted, cooking, ready, or completed.", "Confirm the update appears for the kitchen and service team."],
  },
  {
    icon: ShoppingBag, category: "Orders", title: "Handling cancelled or delayed orders", text: "Record exceptions clearly and keep staff informed when service cannot follow the normal flow.",
    steps: ["Open the affected ticket and review its timeline.", "Select the appropriate exception action and add a clear reason.", "Notify the relevant staff member and confirm the guest-facing status."],
  },
  {
    icon: QrCode, category: "QR & tables", title: "Creating and editing tables", text: "Maintain the outlet floor list used by ordering, QR codes, and service tracking.",
    steps: ["Open Tables and select the correct outlet.", "Create a table number or edit an existing table record.", "Save and confirm that the table appears in the floor view."],
  },
  {
    icon: QrCode, category: "QR & tables", title: "Managing table availability", text: "Keep available, occupied, and reserved table states accurate for the service team.",
    steps: ["Open Tables and locate the table.", "Change its state to match the current floor situation.", "Return it to available after the table has been cleared."],
  },
  {
    icon: QrCode, category: "QR & tables", title: "Downloading and printing QR codes", text: "Prepare reliable table codes with the correct restaurant, outlet, and table destination.",
    steps: ["Open QR codes and choose a table.", "Preview the encoded destination and download the asset.", "Print at a readable size and test the final placement with a phone."],
  },
  {
    icon: QrCode, category: "QR & tables", title: "Replacing an incorrect QR code", text: "Safely replace a code that opens the wrong outlet, table, or customer page.",
    steps: ["Remove the incorrect printed code from service.", "Generate a fresh code from the correct table record.", "Test in a private browser window before placing it on the table."],
  },
  {
    icon: BookOpen, category: "Menu", title: "Creating menu categories", text: "Group dishes into clear sections that make the customer menu easier to browse.",
    steps: ["Open Menu & offers and choose New category.", "Enter a concise category name and display order.", "Save it, add dishes, and verify its customer-facing position."],
  },
  {
    icon: BookOpen, category: "Menu", title: "Adding and editing dishes", text: "Maintain dish names, descriptions, prices, imagery, and category assignments.",
    steps: ["Open Menu & offers and select Add item or an existing dish.", "Complete the dish information, price, image, and category.", "Save and review it through Preview customer view."],
  },
  {
    icon: BookOpen, category: "Menu", title: "Changing item availability", text: "Temporarily hide unavailable dishes without deleting their menu information.",
    steps: ["Find the dish in Menu & offers.", "Change its availability for the appropriate outlet.", "Confirm that unavailable items no longer accept customer orders."],
  },
  {
    icon: BookOpen, category: "Menu", title: "Publishing offers and promotions", text: "Create time-sensitive offers and verify how they appear in the guest experience.",
    steps: ["Open Menu & offers and choose the offers area.", "Set the offer name, value, eligible items, and active period.", "Save and test the promotion in customer preview."],
  },
  {
    icon: CircleDollarSign, category: "Payments", title: "Reviewing payment records", text: "Find transaction status, amount, order reference, and payment method information.",
    steps: ["Open Payments and use filters to narrow the results.", "Select a transaction to inspect its order and payment details.", "Compare the amount and status with the related order."],
  },
  {
    icon: CircleDollarSign, category: "Payments", title: "Verifying a payment", text: "Confirm a transaction before marking an order as paid or resolving a mismatch.",
    steps: ["Open the pending transaction in Payments.", "Check its reference, amount, method, and associated order.", "Use Verify only after the information matches."],
  },
  {
    icon: CircleDollarSign, category: "Payments", title: "Resolving payment mismatches", text: "Investigate missing, duplicate, or incorrect payment records methodically.",
    steps: ["Record the order and transaction references.", "Compare the expected amount with the recorded payment.", "Do not verify uncertain records; create a support ticket with the references."],
  },
  {
    icon: Users, category: "Team access", title: "Creating a custom role", text: "Build a reusable permission group for staff with specific responsibilities.",
    steps: ["Open Team, then Roles & permissions.", "Name the role and select only the necessary permissions.", "Save the group and assign it to the appropriate staff members."],
  },
  {
    icon: Users, category: "Team access", title: "Assigning roles to multiple staff", text: "Apply one saved role group to several team members in a single workflow.",
    steps: ["Open Roles & permissions and locate role assignment.", "Choose a saved group and select the staff members.", "Apply the role and verify their resulting access."],
  },
  {
    icon: Users, category: "Team access", title: "Removing staff access", text: "Protect restaurant data when a staff member changes role or leaves the organization.",
    steps: ["Open Team and select the staff account.", "Remove or disable its restaurant and outlet assignments.", "Confirm that the account can no longer enter the workspace."],
  },
  {
    icon: ShieldCheck, category: "Analytics", title: "Reading sales analytics", text: "Use revenue trends, comparisons, and top-item rankings to understand performance.",
    steps: ["Open Analytics and confirm the outlet and reporting period.", "Review revenue movement and comparison values.", "Use item and category rankings to identify meaningful changes."],
  },
  {
    icon: ShieldCheck, category: "Analytics", title: "Comparing outlet performance", text: "Compare locations using the same period and metric definitions.",
    steps: ["Open Analytics with restaurant-level access.", "Select a consistent date range for all outlets.", "Compare sales, order volume, and service indicators before acting."],
  },
  {
    icon: CircleDollarSign, category: "Billing", title: "Requesting a new outlet", text: "Submit a location request while respecting the allowance of the current plan.",
    steps: ["Open Settings and review your outlet allowance.", "Choose Request outlet and complete the location details.", "Submit the request and monitor its approval status."],
  },
  {
    icon: BookOpen, category: "Branding", title: "Updating the restaurant logo", text: "Upload the identity shown in the restaurant workspace and customer experience.",
    steps: ["Open Settings and find Restaurant identity.", "Upload a supported PNG, JPG, WebP, or AVIF file.", "Check the logo in both the workspace and customer preview."],
  },
  {
    icon: ShieldCheck, category: "Customer view", title: "Previewing the customer experience", text: "Review the live menu design before sharing QR codes with guests.",
    steps: ["Choose Preview customer view at the bottom of the sidebar.", "Browse categories, dishes, ordering, and table context.", "Return to the admin portal to correct any content issues."],
  },
  {
    icon: ShieldCheck, category: "Security", title: "Changing a temporary password", text: "Complete the required first-login password change for a newly created staff account.",
    steps: ["Sign in using the temporary credentials provided by an administrator.", "Enter a unique password that meets the displayed requirements.", "Store it securely and never share it with another user."],
  },
  {
    icon: HelpCircle, category: "Troubleshooting", title: "Reporting a platform issue", text: "Give support enough context to investigate and resolve a problem efficiently.",
    steps: ["Record the page, restaurant, outlet, and approximate time of the issue.", "Capture the exact error and a screenshot without exposing passwords.", "Create a support ticket and include the steps that caused the problem."],
  },
];

const faqs = [
  [
    "Why is a menu item not visible to guests?",
    "Check that the item and its category are active, the item is assigned to the correct outlet, and your latest changes have been saved.",
  ],
  [
    "Can each outlet have different staff?",
    "Yes. Outlet-scoped roles can limit a staff member to one location, while restaurant-level roles can work across permitted outlets.",
  ],
  [
    "What should I do if a QR code opens the wrong table?",
    "Regenerate the code from the correct outlet and table record, replace the printed code, and test it using a private browser window.",
  ],
  [
    "How do I contact the platform team?",
    "Use the contact button on this page to email support@bitelink.app. Include your restaurant name, outlet, and a short description of the issue.",
  ],
];
const categories = ["All", ...new Set(guides.map((guide) => guide.category))];
const platformPhone = "+8801700000000";

export default function HelpCenterPage({ context, setActivePage }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("grid");
  const [openGuide, setOpenGuide] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMode, setSupportMode] = useState(null);
  const [supportSent, setSupportSent] = useState(false);
  const submitSupport = (event) => { event.preventDefault(); setSupportSent(true); };
  const filtered = useMemo(
    () =>
      guides.filter((guide) =>
        (category === "All" || guide.category === category) &&
        `${guide.category} ${guide.title} ${guide.text} ${guide.steps.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, category],
  );
  return (
    <div className="help-center">
      <Header eyebrow="Support / Knowledge base" title="Help center" />
      <section className="help-hero">
        <div>
          <span>
            <HelpCircle size={15} /> BiteLink support
          </span>
          <h2>How can we help your team?</h2>
          <p>
            Find clear answers for daily restaurant operations, account setup,
            and platform access.
          </p>
        </div>
        <div className="help-search-area">
        <label className="help-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders, QR codes, staff, billing…"
            aria-label="Search help guides"
          />
          {query && <button onClick={() => setQuery("")}>Clear</button>}
        </label>
        <nav className="help-section-nav" aria-label="Help center sections"><a href="#help-guides"><BookOpen size={14}/> Guides <b>{guides.length}</b></a><a href="#help-faq"><HelpCircle size={14}/> FAQ <b>{faqs.length}</b></a></nav>
        </div>
        <div className="help-context">
          <i />
          <span>
            <small>Current workspace</small>
            <b>
              {context.restaurantName || "Your restaurant"} · {context.outlet}
            </b>
          </span>
          <em>Online</em>
        </div>
      </section>
      <div className="help-layout">
        <main id="help-guides">
          <div className="help-section-heading">
            <div>
              <span className="panel-kicker">Step-by-step guidance</span>
              <h2>{query ? `Results for “${query}”` : "Popular guides"}</h2>
            </div>
            <small>
              {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
            </small>
          </div>
          <div className="help-guide-toolbar">
            <div className="help-categories" aria-label="Filter guides by category">
              {categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => { setCategory(item); setOpenGuide(null); }} aria-pressed={category === item} key={item}>{item}<b>{item === "All" ? guides.length : guides.filter((guide) => guide.category === item).length}</b></button>)}
            </div>
            <div className="help-view-switch" aria-label="Guide view">
              <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view" title="Grid view"><Grid2X2 size={16}/></button>
              <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view" title="List view"><List size={17}/></button>
            </div>
          </div>
          <div className={`help-guide-list ${view}-view`}>
            {filtered.map((guide) => {
              const Icon = guide.icon,
                open = openGuide === guide.title;
              return (
                <article className={open ? "open" : ""} key={guide.title}>
                  <button
                    onClick={() => setOpenGuide(open ? null : guide.title)}
                    aria-expanded={open}
                  >
                    <span className="help-guide-icon">
                      <Icon size={20} />
                    </span>
                    <span>
                      <small>{guide.category}</small>
                      <b>{guide.title}</b>
                      <em>{guide.text}</em>
                    </span>
                    <ChevronDown size={18} />
                  </button>
                  {open && (
                    <ol>
                      {guide.steps.map((step) => (
                        <li key={step}>
                          <i />
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              );
            })}
            {!filtered.length && (
              <div className="help-empty">
                <Search size={25} />
                <h3>No matching guide</h3>
                <p>Try a broader search or contact the platform team below.</p>
              </div>
            )}
          </div>
          <section className="help-faq" id="help-faq">
            <div className="help-section-heading">
              <div>
                <span className="panel-kicker">Quick answers</span>
                <h2>Frequently asked questions</h2>
              </div>
            </div>
            {faqs.map(([question, answer], index) => (
              <article
                className={openFaq === index ? "open" : ""}
                key={question}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <b>{question}</b>
                  <ChevronDown size={17} />
                </button>
                {openFaq === index && <p>{answer}</p>}
              </article>
            ))}
          </section>
        </main>
        <aside className="help-aside">
          <section className="help-contact-card">
            <span>
              <MessageCircle size={20} />
            </span>
            <small>Still need help?</small>
            <h3>Talk to the platform team.</h3>
            <p>
              Send the restaurant name, outlet, and what you were trying to do.
              Screenshots help us resolve issues faster.
            </p>
            <a
              href={`mailto:support@bitelink.app?subject=BiteLink support · ${encodeURIComponent(context.restaurantName || "Restaurant")}`}
            >
              <Mail size={16} /> Email support <ExternalLink size={14} />
            </a>
            <div className="help-contact-options">
              <button onClick={()=>{setSupportMode("chat");setSupportSent(false)}}><MessageSquareText size={16}/><span>Platform chat</span></button>
              <a href={`https://wa.me/${platformPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello BiteLink support, I need help with ${context.restaurantName || "my restaurant"}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/><span>WhatsApp</span><ExternalLink size={13}/></a>
              <a href={`tel:${platformPhone}`}><Phone size={16}/><span>Call support</span></a>
              <button onClick={()=>{setSupportMode("ticket");setSupportSent(false)}}><Ticket size={16}/><span>Create ticket</span></button>
            </div>
            <em>Typical reply: within one business day</em>
          </section>
          <section className="help-shortcuts">
            <h3>Workspace shortcuts</h3>
            <button onClick={() => setActivePage("Live orders")}>
              <ShoppingBag size={16} />
              <span>
                <b>Live orders</b>
                <small>Track active tickets</small>
              </span>
            </button>
            <button onClick={() => setActivePage("QR codes")}>
              <QrCode size={16} />
              <span>
                <b>QR codes</b>
                <small>Manage table access</small>
              </span>
            </button>
            <button onClick={() => setActivePage("Settings")}>
              <ShieldCheck size={16} />
              <span>
                <b>Account settings</b>
                <small>Plan and outlets</small>
              </span>
            </button>
          </section>
        </aside>
      </div>
      {supportMode && <div className="support-modal-backdrop" onMouseDown={(event)=>event.target===event.currentTarget&&setSupportMode(null)}><section className="support-modal" role="dialog" aria-modal="true" aria-labelledby="support-modal-title"><header><div><span className="page-eyebrow">BiteLink platform support</span><h2 id="support-modal-title">{supportMode==="chat"?"Chat with our team":"Create a support ticket"}</h2></div><button onClick={()=>setSupportMode(null)} aria-label="Close support"><X size={18}/></button></header>{supportSent?<div className="support-success"><span>✓</span><h3>{supportMode==="chat"?"Message sent":"Ticket created"}</h3><p>Our platform team will follow up using your account contact details.</p><button onClick={()=>setSupportMode(null)}>Done</button></div>:<form onSubmit={submitSupport}><div className="support-workspace"><small>Workspace</small><b>{context.restaurantName || "Restaurant"} · {context.outlet}</b></div>{supportMode==="ticket"&&<label><span>Subject</span><input required placeholder="Briefly describe the issue"/></label>}<label><span>{supportMode==="chat"?"How can we help?":"Issue details"}</span><textarea required rows="5" placeholder="Tell us what happened and what you were trying to do."/></label><label><span>Contact email</span><input required type="email" placeholder="you@restaurant.com"/></label><button className="support-submit">{supportMode==="chat"?<MessageSquareText size={16}/>:<Ticket size={16}/>} {supportMode==="chat"?"Send chat message":"Submit ticket"}</button></form>}</section></div>}
    </div>
  );
}
