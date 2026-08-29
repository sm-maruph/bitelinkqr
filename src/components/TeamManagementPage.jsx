import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  KeyRound,
  Plus,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import useWorkspaceData from "../hooks/useWorkspaceData";
import { staffService } from "../services/staffService";
import { Button, Header } from "./PortalChrome";
import "../role-permissions.css";
const groups = [
    [
      "Menu",
      [
        ["menu.read", "View menu"],
        ["menu.write", "Edit menu"],
      ],
    ],
    [
      "Orders",
      [
        ["orders.read", "View orders"],
        ["orders.approve", "Accept or reject"],
        ["orders.cook", "Cook orders"],
        ["orders.ready", "Mark ready"],
        ["orders.serve", "Serve orders"],
        ["orders.complete", "Complete orders"],
      ],
    ],
    [
      "Operations",
      [
        ["tables.read", "View tables"],
        ["tables.write", "Edit tables"],
        ["payments.read", "View payments"],
        ["payments.verify", "Verify payments"],
        ["analytics.read", "View analytics"],
      ],
    ],
    [
      "People & setup",
      [
        ["staff.manage", "Manage team"],
        ["outlet.manage", "Manage outlets"],
        ["restaurant.manage", "Manage restaurant"],
      ],
    ],
  ],
  blank = () => ({
    name: "",
    code: "",
    description: "",
    scope: "outlet",
    permissions: ["menu.read", "orders.read"],
  }),
  slug = (v) =>
    v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
const newStaff = () => ({
  displayName: "",
  email: "",
  phone: "",
  temporaryPassword: `Bite!${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}9A`,
  roleId: "",
});
export default function TeamManagementPage({ context }) {
  const { session } = useAuth(),
    { data, loading, error } = useWorkspaceData(context),
    [members, setMembers] = useState([]),
    [roles, setRoles] = useState([]),
    [modal, setModal] = useState(""),
    [role, setRole] = useState(blank()),
    [roleId, setRoleId] = useState(""),
    [target, setTarget] = useState(null),
    [assignId, setAssignId] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [staff, setStaff] = useState(newStaff());
  const load = () =>
    staffService
      .getRoles(session, context.tenantId)
      .then((r) => setRoles(r.items.filter((x) => x.code !== "owner")));
  useEffect(() => {
    if (data?.team) setMembers(data.team);
  }, [data]);
  useEffect(() => {
    if (session && context.tenantId) load();
  }, [session, context.tenantId]);
  const chosen = roles.find((x) => x.id === assignId),
    system = false,
    toggle = (c) =>
      setRole((r) => ({
        ...r,
        permissions: r.permissions.includes(c)
          ? r.permissions.filter((x) => x !== c)
          : [...r.permissions, c],
      })),
    openRole = (r) => {
      setRoleId(r?.id || "");
      setRole(
        r
          ? {
              name: r.name,
              code: r.code,
              description: r.description || "",
              scope: r.scope,
              permissions: r.permissions || [],
            }
          : blank(),
      );
      setModal("editor");
    },
    openMember = (m) => {
      setTarget(m);
      setAssignId(roles[0]?.id || "");
      setPassword("");
      setMessage("");
      setModal("assign");
    };
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const p = {
      ...role,
      code: role.code || slug(role.name),
      restaurantId:
        role.scope === "tenant" ? undefined : context.restaurantUuid,
      outletId: role.scope === "outlet" ? context.outletId : undefined,
    };
    try {
      const r = roleId
        ? await staffService.updateRole(session, context.tenantId, roleId, p)
        : await staffService.createRole(session, context.tenantId, p);
      setRoles((a) =>
        roleId ? a.map((x) => (x.id === r.id ? r : x)) : [...a, r],
      );
      setModal("roles");
      setMessage(`${r.name} saved.`);
    } catch (e) {
      setMessage(
        e.payload?.error === "system_role_read_only"
          ? "System roles are read-only."
          : "Could not save role.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function assign(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await staffService.assignRole(session, context.tenantId, {
        membershipId: target.membership_id,
        roleId: assignId,
        password,
        restaurantId:
          chosen.scope === "tenant" ? undefined : context.restaurantUuid,
        outletId: chosen.scope === "outlet" ? context.outletId : undefined,
      });
      setMembers((a) =>
        a.map((x) =>
          x.id === target.id
            ? {
                ...x,
                roles: x.roles.includes(chosen.name)
                  ? x.roles
                  : `${x.roles}, ${chosen.name}`,
              }
            : x,
        ),
      );
      setModal("");
      setMessage(`${chosen.name} assigned to ${target.display_name}.`);
    } catch (e) {
      setMessage(
        e.status === 401 || e.payload?.error === "password_incorrect"
          ? "Incorrect password. Nothing was changed."
          : e.payload?.error === "permission_denied"
            ? "Your account is not allowed to assign this role."
            : e.payload?.error === "role_scope_required" ||
                e.payload?.error === "invalid_role_scope"
              ? "This role does not match the selected restaurant or outlet."
              : `Role assignment failed${e.payload?.error ? `: ${e.payload.error}` : "."}`,
      );
    } finally {
      setBusy(false);
    }
  }
  async function createStaff(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const selected = roles.find((item) => item.id === staff.roleId);
    try {
      const result = await staffService.create(session, context.tenantId, {
        ...staff,
        restaurantId:
          selected?.scope === "tenant" ? undefined : context.restaurantUuid,
        outletId: selected?.scope === "outlet" ? context.outletId : undefined,
      });
      setMembers((items) => [...items, { ...result, roles: result.role }]);
      setModal("");
      setMessage(`${result.display_name} was added to the team.`);
    } catch (error) {
      setMessage(
        error.status === 409
          ? "This email is already registered."
          : "Could not add the team member.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function removeAssignedRole(){setBusy(true);setMessage("");try{await staffService.removeRole(session,context.tenantId,{membershipId:target.membership_id,roleId:assignId,password,restaurantId:chosen.scope==="tenant"?undefined:context.restaurantUuid,outletId:chosen.scope==="outlet"?context.outletId:undefined});setMembers((items)=>items.map((item)=>item.id===target.id?{...item,roles:item.roles.split(",").map((name)=>name.trim()).filter((name)=>name.toLowerCase()!==chosen.name.toLowerCase()).join(", ")||"Member"}:item));setModal("");setMessage(`${chosen.name} removed from ${target.display_name}.`)}catch(error){setMessage(error.status===401||error.payload?.error==="password_incorrect"?"Incorrect password. Nothing was changed.":error.payload?.error==="owner_role_cannot_be_removed"?"The Owner role cannot be removed.":"Could not remove this role.")}finally{setBusy(false)}}
  const staffMembers = members.filter(
    (item) =>
      !item.roles
        ?.split(",")
        .some((name) => name.trim().toLowerCase() === "owner"),
  );
  const assignedRoleNames = (target?.roles || "")
      .split(",")
      .map((name) => name.trim().toLowerCase()),
    alreadyAssigned = Boolean(
      chosen && assignedRoleNames.includes(chosen.name.toLowerCase()),
    );
  return (
    <>
      <Header
        eyebrow="People / Access control"
        title="Restaurant team"
        action="Add team member"
        onAction={() => {
          setStaff({ ...newStaff(), roleId: roles[0]?.id || "" });
          setModal("member");
        }}
      />
      <div className="welcome-line">
        <span>Click a member to assign a reusable role template.</span>
        <Button className="primary" onClick={() => setModal("roles")}>
          <ShieldCheck size={15} /> Role templates
        </Button>
      </div>
      {message && !modal && <div className="management-notice">{message}</div>}
      {loading && (
        <div className="team-loading">
          <i />
          <i />
          <i />
        </div>
      )}
      {error && <div className="panel state-message">{error}</div>}
      {!loading && (
        <section className="panel full-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                {staffMembers.length} members
              </span>
              <h2>Staff access</h2>
            </div>
          </div>
          {staffMembers.map((m) => (
            <button
              className="team-row member-role-trigger"
              onClick={() => openMember(m)}
              key={m.id}
            >
              <span className="user-avatar">
                {m.display_name.slice(0, 2).toUpperCase()}
              </span>
              <span>
                <b>{m.display_name}</b>
                <small>{m.email}</small>
              </span>
              <span className="role-pill">{m.roles}</span>
              <span className="scope">{m.status}</span>
              <span>
                <KeyRound size={15} />
              </span>
            </button>
          ))}
        </section>
      )}
      {modal && (
        <div className="staff-modal-backdrop">
          <section
            className={`staff-modal ${modal !== "assign" ? "roles-modal" : ""}`}
          >
            <header>
              <div>
                <span className="page-eyebrow">Secure staff access</span>
                <h2>
                  {modal === "roles"
                    ? "Role templates"
                    : modal === "editor"
                      ? roleId
                        ? "View & edit role"
                        : "Create role"
                      : modal === "member"
                        ? "Add team member"
                        : "Confirm role assignment"}
                </h2>
              </div>
              <button onClick={() => setModal("")}>
                <X />
              </button>
            </header>
            {modal === "roles" && (
              <div className="role-template-manager">
                <div className="role-template-heading">
                  <p>Create a role once, then reuse it for staff.</p>
                  <Button className="primary" onClick={() => openRole()}>
                    <Plus /> New role
                  </Button>
                </div>
                <div className="role-template-grid">
                  {roles.map((r) => (
                    <button onClick={() => openRole(r)} key={r.id}>
                      <ShieldCheck />
                      <small>{r.scope}</small>
                      <h3>{r.name}</h3>
                      <p>
                        {r.description || "Reusable staff access template."}
                      </p>
                      <footer>
                        <b>{r.permissions.length} permissions</b>
                        <em>
                          <Eye /> {r.is_system ? "View" : "Edit"}
                        </em>
                      </footer>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {modal === "editor" && (
              <form className="role-editor" onSubmit={save}>
                <div className="staff-fields">
                  <label>
                    <span>Name</span>
                    <input
                      disabled={system}
                      required
                      value={role.name}
                      onChange={(e) =>
                        setRole({
                          ...role,
                          name: e.target.value,
                          code: slug(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Code</span>
                    <input disabled={system} required value={role.code} />
                  </label>
                  <label>
                    <span>Scope</span>
                    <select
                      disabled={system}
                      value={role.scope}
                      onChange={(e) =>
                        setRole({ ...role, scope: e.target.value })
                      }
                    >
                      <option value="outlet">Outlet</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="tenant">Account</option>
                    </select>
                  </label>
                  <label>
                    <span>Description</span>
                    <input
                      disabled={system}
                      value={role.description}
                      onChange={(e) =>
                        setRole({ ...role, description: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="permission-groups">
                  {groups.map(([g, ps]) => (
                    <section key={g}>
                      <h3>{g}</h3>
                      {ps.map(([c, l]) => (
                        <label key={c}>
                          <input
                            disabled={system}
                            type="checkbox"
                            checked={role.permissions.includes(c)}
                            onChange={() => toggle(c)}
                          />
                          <span>{l}</span>
                          <small>{c}</small>
                        </label>
                      ))}
                    </section>
                  ))}
                </div>
                <footer>
                  <button type="button" onClick={() => setModal("roles")}>
                    Back
                  </button>
                  {!system && (
                    <Button className="primary" disabled={busy}>
                      Save role
                    </Button>
                  )}
                </footer>
              </form>
            )}
            {modal === "assign" && (
              <form className="secure-role-assignment" onSubmit={assign}>
                <div className="assignment-member">
                  <span className="user-avatar">
                    {target.display_name.slice(0, 2).toUpperCase()}
                  </span>
                  <b>{target.display_name}</b>
                </div>
                <label>
                  <span>Role template</span>
                  <select
                    value={assignId}
                    onChange={(e) => setAssignId(e.target.value)}
                  >
                    {roles.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.name}
                        {assignedRoleNames.includes(r.name.toLowerCase())
                          ? " ✓ Assigned"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {chosen && (
                  <div className="assignment-permission-preview">
                    <header>
                      <ShieldCheck />
                      <span>
                        <b>{chosen.name}</b>
                        <small>
                          {chosen.scope} · {chosen.permissions.length}{" "}
                          permissions
                        </small>
                      </span>
                    </header>
                    <ul>
                      {chosen.permissions.map((c) => (
                        <li key={c}>
                          <Check />
                          <span>
                            {groups
                              .flatMap((g) => g[1])
                              .find((x) => x[0] === c)?.[1] || c}
                            <small>{c}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {alreadyAssigned ? (
                  <>
                  <div className="assignment-verified">
                    <span>
                      <Check size={18} />
                    </span>
                    <p>
                      <b>Role verified and assigned</b>
                      {target.display_name} already has this role. No password
                      verification is needed again.
                    </p>
                  </div>
                  <label><span>Current password required to remove this role</span><input required minLength="8" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter password to revoke access"/></label>
                  </>
                ) : (
                  <>
                    <div className="assignment-warning">
                      <KeyRound />
                      <p>
                        <b>Password confirmation required</b>These permissions
                        take effect immediately.
                      </p>
                    </div>
                    <label>
                      <span>Your current password</span>
                      <input
                        required
                        minLength="8"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                  </>
                )}
                {message && <p className="auth-error">{message}</p>}
                <footer>
                  <button type="button" onClick={() => setModal("")}>
                    Cancel
                  </button>
                  {alreadyAssigned&&<Button type="button" className="danger-role-action" onClick={removeAssignedRole} disabled={busy||!password}><KeyRound size={15}/>{busy?"Verifyingâ€¦":"Verify & remove role"}</Button>}
                  <Button
                    type={alreadyAssigned ? "button" : "submit"}
                    onClick={alreadyAssigned ? () => setModal("") : undefined}
                    className={`primary ${alreadyAssigned ? "role-already-verified" : ""}`}
                    disabled={!alreadyAssigned && (busy || !password)}
                  >
                    {alreadyAssigned && <Check size={15} />}
                    {busy ? "Verifying…" : "Verify & assign"}
                  </Button>
                </footer>
              </form>
            )}
            {modal === "member" && (
              <form className="secure-role-assignment" onSubmit={createStaff}>
                <label>
                  <span>Full name</span>
                  <input
                    required
                    value={staff.displayName}
                    onChange={(e) =>
                      setStaff({ ...staff, displayName: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Email address</span>
                  <input
                    required
                    type="email"
                    value={staff.email}
                    onChange={(e) =>
                      setStaff({ ...staff, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    value={staff.phone}
                    onChange={(e) =>
                      setStaff({ ...staff, phone: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Initial role template</span>
                  <select
                    required
                    value={staff.roleId}
                    onChange={(e) =>
                      setStaff({ ...staff, roleId: e.target.value })
                    }
                  >
                    <option value="">Select a role</option>
                    {roles.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Temporary password</span>
                  <input
                    required
                    minLength="8"
                    value={staff.temporaryPassword}
                    onChange={(e) =>
                      setStaff({ ...staff, temporaryPassword: e.target.value })
                    }
                  />
                </label>
                {message && <p className="auth-error">{message}</p>}
                <footer>
                  <button type="button" onClick={() => setModal("")}>
                    Cancel
                  </button>
                  <Button className="primary" disabled={busy || !staff.roleId}>
                    <UserPlus size={15} />
                    {busy ? "Addingâ€¦" : "Add team member"}
                  </Button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
