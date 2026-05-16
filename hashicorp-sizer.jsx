import { useState, useMemo } from "react";

const PROVIDERS = [
  {
    id: "aws", name: "Amazon Web Services", short: "AWS", color: "#FF9900",
    resources: [
      { id: "aws_instance", name: "Instancias EC2", desc: "Servidores virtuales" },
      { id: "aws_s3_bucket", name: "Buckets S3", desc: "Almacenamiento de objetos" },
      { id: "aws_vpc", name: "VPCs", desc: "Redes virtuales privadas" },
      { id: "aws_subnet", name: "Subnets", desc: "Subredes dentro de VPC" },
      { id: "aws_security_group", name: "Security Groups", desc: "Reglas de firewall" },
      { id: "aws_db_instance", name: "Instancias RDS", desc: "Bases de datos relacionales" },
      { id: "aws_lb", name: "Load Balancers", desc: "Balanceadores de carga" },
      { id: "aws_iam_role", name: "Roles IAM", desc: "Roles de permisos" },
      { id: "aws_eks_cluster", name: "Clusters EKS", desc: "Kubernetes administrado" },
      { id: "aws_lambda_function", name: "Funciones Lambda", desc: "Funciones serverless" },
      { id: "aws_route53_record", name: "Records DNS (Route53)", desc: "Entradas de DNS" },
    ]
  },
  {
    id: "azure", name: "Microsoft Azure", short: "Azure", color: "#0078D4",
    resources: [
      { id: "azurerm_virtual_machine", name: "Máquinas Virtuales", desc: "VMs en Azure" },
      { id: "azurerm_resource_group", name: "Resource Groups", desc: "Grupos de recursos" },
      { id: "azurerm_virtual_network", name: "Virtual Networks (VNet)", desc: "Redes virtuales" },
      { id: "azurerm_subnet", name: "Subnets", desc: "Subredes dentro de VNet" },
      { id: "azurerm_network_security_group", name: "Network Security Groups", desc: "Reglas de firewall de red" },
      { id: "azurerm_storage_account", name: "Storage Accounts", desc: "Cuentas de almacenamiento" },
      { id: "azurerm_kubernetes_cluster", name: "Clusters AKS", desc: "Kubernetes administrado" },
      { id: "azurerm_mssql_database", name: "Bases de datos SQL", desc: "Azure SQL Database" },
      { id: "azurerm_app_service", name: "App Services", desc: "Aplicaciones web administradas" },
    ]
  },
  {
    id: "gcp", name: "Google Cloud", short: "GCP", color: "#4285F4",
    resources: [
      { id: "google_compute_instance", name: "Instancias Compute", desc: "VMs en GCP" },
      { id: "google_compute_network", name: "VPC Networks", desc: "Redes virtuales" },
      { id: "google_compute_subnetwork", name: "Subnets", desc: "Subredes dentro de VPC" },
      { id: "google_container_cluster", name: "Clusters GKE", desc: "Kubernetes administrado" },
      { id: "google_sql_database_instance", name: "Cloud SQL", desc: "Bases de datos administradas" },
      { id: "google_storage_bucket", name: "Storage Buckets", desc: "Almacenamiento de objetos" },
      { id: "google_compute_firewall", name: "Reglas de Firewall", desc: "Políticas de red" },
    ]
  },
  {
    id: "kubernetes", name: "Kubernetes / OpenShift", short: "K8s / OCP", color: "#326CE5",
    resources: [
      { id: "kubernetes_namespace", name: "Namespaces / Proyectos", desc: "Espacios de trabajo aislados" },
      { id: "kubernetes_deployment", name: "Deployments", desc: "Definición de aplicaciones" },
      { id: "kubernetes_service", name: "Services", desc: "Exposición de aplicaciones" },
      { id: "kubernetes_config_map", name: "ConfigMaps", desc: "Configuraciones de aplicaciones" },
      { id: "kubernetes_secret", name: "Secrets K8s", desc: "Datos sensibles en el clúster" },
      { id: "kubernetes_ingress_v1", name: "Ingress", desc: "Enrutamiento de tráfico externo" },
      { id: "kubernetes_resource_quota", name: "Resource Quotas", desc: "Límites de recursos por namespace" },
      { id: "kubernetes_network_policy", name: "Network Policies", desc: "Reglas de red entre pods" },
      { id: "kubernetes_service_account", name: "Service Accounts", desc: "Identidades de aplicaciones" },
      { id: "kubernetes_persistent_volume_claim", name: "PersistentVolumeClaims", desc: "Almacenamiento persistente" },
    ]
  },
  {
    id: "vsphere", name: "VMware vSphere", short: "vSphere", color: "#9DC7E8",
    resources: [
      { id: "vsphere_virtual_machine", name: "Máquinas Virtuales", desc: "VMs en vSphere" },
      { id: "vsphere_folder", name: "Folders", desc: "Carpetas de organización" },
      { id: "vsphere_resource_pool", name: "Resource Pools", desc: "Agrupaciones de cómputo" },
      { id: "vsphere_distributed_port_group", name: "Port Groups (dvSwitch)", desc: "Grupos de puertos de red virtual" },
      { id: "vsphere_nas_datastore", name: "Datastores NAS", desc: "Almacenamiento en red" },
    ]
  },
  {
    id: "vault_p", name: "HashiCorp Vault", short: "Vault", color: "#FFD814",
    resources: [
      { id: "vault_mount", name: "Secret Engines", desc: "Motores de secretos (mounts)" },
      { id: "vault_policy", name: "Políticas", desc: "Políticas de acceso a secretos" },
      { id: "vault_auth_backend", name: "Auth Backends", desc: "Métodos de autenticación" },
    ]
  },
  {
    id: "helm", name: "Helm", short: "Helm", color: "#6C7EE1",
    resources: [
      { id: "helm_release", name: "Helm Releases", desc: "Despliegues de charts de Helm" },
    ]
  },
];

const VAULT_CASES = [
  {
    id: "static", label: "Secretos Estáticos",
    desc: "Contraseñas, API keys, tokens y credenciales almacenados en Vault",
    question: "¿Cuántos secretos únicos almacenarán?",
    helper: "Cuenta cada secreto individual: cada contraseña, API key o token por separado",
    type: "simple", ruPer: 1, unit: "secretos",
    icon: "🔑",
  },
  {
    id: "dynamic", label: "Secretos Dinámicos / Auto-rotados",
    desc: "Credenciales de bases de datos u otros servicios que Vault genera automáticamente y que expiran",
    question: "¿Cuántos roles de credenciales configurarán?",
    helper: "Un rol = configuración para un tipo de credencial. Ej: un rol por base de datos que genera usuarios temporales",
    type: "simple", ruPer: 1, unit: "roles",
    icon: "🔄",
  },
  {
    id: "pki", label: "PKI — Certificados TLS/SSL",
    desc: "Vault actúa como Autoridad Certificadora (CA) emitiendo y gestionando certificados",
    question: "¿Cuántos certificados activos habrá simultáneamente?",
    helper: "Considera el máximo de certificados activos en cualquier momento del mes",
    type: "duration", unit: "certificados",
    durationQ: "¿Cuántas horas vive cada certificado en promedio?",
    durationHint: "90 días = 2,160 hrs  |  30 días = 720 hrs  |  1 año = 8,760 hrs  |  (730 hrs = 1 RU)",
    durationDefault: 720,
    icon: "🏛️",
  },
  {
    id: "ssh", label: "SSH — Credenciales de acceso temporales",
    desc: "Vault genera credenciales SSH de corta duración para acceso seguro a servidores",
    question: "¿Cuántas credenciales SSH activas habrá simultáneamente?",
    helper: "Considera el máximo de sesiones activas en cualquier momento del mes",
    type: "duration", unit: "credenciales",
    durationQ: "¿Cuántas horas vive cada credencial SSH?",
    durationHint: "Típico: 1–24 hrs  |  (730 hrs = 1 RU)",
    durationDefault: 8,
    icon: "💻",
  },
  {
    id: "transit", label: "Transit / Transform — Encriptación como servicio",
    desc: "Vault encripta y desencripta datos para las aplicaciones sin que estas manejen las llaves directamente",
    question: "¿Cuántas operaciones de encriptación/desencriptación harán por mes?",
    helper: "Incluye encrypt, decrypt, rewrap y sign. Cada 150,000 operaciones = 1 RU",
    type: "api_calls", unit: "operaciones/mes", divisor: 150000,
    icon: "🔐",
  },
  {
    id: "kmse", label: "KMSE — Gestión de llaves de encriptación",
    desc: "Vault administra llaves de encriptación para sistemas externos como bases de datos o almacenamiento",
    question: "¿Cuántas llaves de encriptación administrará Vault?",
    helper: "Una llave por sistema cifrado. Ej: una llave por base de datos Oracle con TDE",
    type: "simple", ruPer: 1, unit: "llaves",
    icon: "🗝️",
  },
];

const S = {
  app: { fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0D1117", minHeight: "100vh", color: "#E6EDF3", fontSize: "13px" },
  header: { background: "#0D1117", borderBottom: "1px solid #21262D", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 100 },
  logo: { width: 32, height: 32, background: "linear-gradient(135deg, #0F62FE, #7C3AED)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  title: { fontSize: "15px", fontWeight: 700, letterSpacing: "0.05em", color: "#E6EDF3" },
  subtitle: { fontSize: "11px", color: "#7D8590", letterSpacing: "0.08em" },
  tabs: { display: "flex", borderBottom: "1px solid #21262D", background: "#0D1117", position: "sticky", top: 57, zIndex: 99, padding: "0 20px" },
  tab: (active, color) => ({
    padding: "12px 20px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em",
    cursor: "pointer", border: "none", background: "transparent",
    borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
    color: active ? color : "#7D8590", transition: "all 0.15s",
    fontFamily: "inherit",
  }),
  content: { padding: "20px", maxWidth: 900, margin: "0 auto" },
  sectionLabel: { fontSize: "10px", letterSpacing: "0.12em", color: "#7D8590", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 },
  providerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px", marginBottom: "24px" },
  providerBtn: (selected, color) => ({
    padding: "10px 8px", border: `1px solid ${selected ? color : "#21262D"}`,
    background: selected ? `${color}18` : "#161B22", borderRadius: 6,
    cursor: "pointer", textAlign: "center", transition: "all 0.15s",
    color: selected ? color : "#7D8590", fontFamily: "inherit",
  }),
  providerBtnName: { fontSize: "11px", fontWeight: 700, display: "block", marginTop: "4px" },
  card: { background: "#161B22", border: "1px solid #21262D", borderRadius: 8, marginBottom: "12px", overflow: "hidden" },
  cardHeader: (color) => ({
    padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px",
    borderBottom: "1px solid #21262D", background: `${color}10`,
  }),
  cardHeaderTitle: { fontSize: "12px", fontWeight: 700 },
  resourceRow: { display: "flex", alignItems: "center", padding: "8px 14px", borderBottom: "1px solid #21262D", gap: "10px" },
  resourceName: { flex: 1, fontSize: "12px", color: "#E6EDF3" },
  resourceDesc: { fontSize: "10px", color: "#7D8590", flex: 1 },
  input: { width: "70px", background: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3", padding: "4px 8px", borderRadius: 4, fontSize: "12px", textAlign: "right", fontFamily: "inherit", outline: "none" },
  inputWide: { width: "100px", background: "#0D1117", border: "1px solid #30363D", color: "#E6EDF3", padding: "4px 8px", borderRadius: 4, fontSize: "12px", textAlign: "right", fontFamily: "inherit", outline: "none" },
  rumUnit: { fontSize: "10px", color: "#7D8590", width: "40px", textAlign: "right" },
  totalBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#161B22", borderTop: "1px solid #21262D", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 200 },
  totalLabel: { fontSize: "11px", color: "#7D8590", letterSpacing: "0.08em" },
  totalValue: (color) => ({ fontSize: "24px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }),
  totalSub: { fontSize: "10px", color: "#7D8590" },
  vaultCard: { background: "#161B22", border: "1px solid #21262D", borderRadius: 8, marginBottom: "12px", padding: "14px" },
  vaultCardTitle: { fontSize: "12px", fontWeight: 700, color: "#E6EDF3", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" },
  vaultCardDesc: { fontSize: "11px", color: "#7D8590", marginBottom: "10px" },
  vaultRow: { display: "flex", flexDirection: "column", gap: "6px" },
  vaultQuestion: { fontSize: "12px", color: "#C9D1D9" },
  vaultHelper: { fontSize: "10px", color: "#7D8590", marginTop: "2px" },
  vaultInputRow: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" },
  vaultRU: (active) => ({ fontSize: "11px", color: active ? "#3FB950" : "#3D444D", fontWeight: 600, minWidth: 60 }),
  separator: { height: "1px", background: "#21262D", margin: "16px 0" },
  kmipBox: { background: "#1C2128", border: "1px solid #30363D", borderRadius: 8, padding: "14px", marginBottom: 16 },
  kmipTitle: { fontSize: "12px", fontWeight: 700, color: "#E6EDF3", marginBottom: "4px" },
  kmipDesc: { fontSize: "11px", color: "#7D8590", marginBottom: "10px" },
  radioRow: { display: "flex", gap: "12px" },
  radio: (selected) => ({
    padding: "6px 12px", borderRadius: 4, border: `1px solid ${selected ? "#F1C21B" : "#30363D"}`,
    background: selected ? "#F1C21B18" : "#0D1117", color: selected ? "#F1C21B" : "#7D8590",
    cursor: "pointer", fontSize: "11px", fontWeight: 600, fontFamily: "inherit",
  }),
  kmipResult: (needed) => ({
    marginTop: "10px", padding: "8px 12px", borderRadius: 4,
    background: needed ? "#FF6B6B18" : "#3FB95018",
    border: `1px solid ${needed ? "#FF6B6B40" : "#3FB95040"}`,
    fontSize: "11px", color: needed ? "#FF6B6B" : "#3FB950", fontWeight: 600,
  }),
  badge: (color) => ({
    padding: "2px 6px", borderRadius: 3, background: `${color}20`,
    color, fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
  }),
  emptyState: { textAlign: "center", padding: "40px 20px", color: "#7D8590", fontSize: "12px" },
  resetBtn: { background: "transparent", border: "1px solid #30363D", color: "#7D8590", padding: "4px 10px", borderRadius: 4, fontSize: "10px", cursor: "pointer", fontFamily: "inherit" },
  summaryBox: { background: "#161B22", border: "1px solid #21262D", borderRadius: 8, padding: "14px", marginBottom: 80 },
  summaryTitle: { fontSize: "11px", fontWeight: 700, color: "#7D8590", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #21262D" },
  summaryKey: { fontSize: "11px", color: "#7D8590" },
  summaryVal: (color) => ({ fontSize: "12px", fontWeight: 700, color: color || "#E6EDF3" }),
};

function calcRU(uc, val, dur) {
  const v = parseInt(val) || 0;
  if (!v) return 0;
  if (uc.type === "simple") return v * uc.ruPer;
  if (uc.type === "duration") {
    const d = parseInt(dur) || uc.durationDefault;
    return Math.ceil((v * d) / 730);
  }
  if (uc.type === "api_calls") return Math.ceil(v / uc.divisor);
  return 0;
}

function TerraformTab() {
  const [selected, setSelected] = useState({});
  const [qty, setQty] = useState({});

  const toggle = (id) => setSelected(p => ({ ...p, [id]: !p[id] }));
  const setQ = (id, v) => setQty(p => ({ ...p, [id]: v }));

  const totalRUM = useMemo(() =>
    Object.values(qty).reduce((s, v) => s + (parseInt(v) || 0), 0), [qty]);

  const selectedProviders = PROVIDERS.filter(p => selected[p.id]);

  const providerRUM = (p) =>
    p.resources.reduce((s, r) => s + (parseInt(qty[r.id]) || 0), 0);

  const reset = () => { setSelected({}); setQty({}); };

  return (
    <div style={S.content}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
        <p style={S.sectionLabel}>① Selecciona los providers que usará el cliente</p>
        <button style={S.resetBtn} onClick={reset}>Limpiar todo</button>
      </div>

      <div style={S.providerGrid}>
        {PROVIDERS.map(p => (
          <button key={p.id} style={S.providerBtn(selected[p.id], p.color)} onClick={() => toggle(p.id)}>
            <span style={{ fontSize: 18 }}>
              {p.id === "aws" ? "🟠" : p.id === "azure" ? "🔵" : p.id === "gcp" ? "🔴" : p.id === "kubernetes" ? "⚓" : p.id === "vsphere" ? "🖥️" : p.id === "vault_p" ? "🔒" : "⛵"}
            </span>
            <span style={S.providerBtnName}>{p.short}</span>
            {selected[p.id] && providerRUM(p) > 0 && (
              <span style={{ fontSize: "10px", color: p.color, display: "block" }}>{providerRUM(p).toLocaleString()} RUM</span>
            )}
          </button>
        ))}
      </div>

      {selectedProviders.length === 0 && (
        <div style={S.emptyState}>
          Selecciona uno o más providers para comenzar a ingresar cantidades de recursos
        </div>
      )}

      <p style={{ ...S.sectionLabel, display: selectedProviders.length > 0 ? "block" : "none" }}>
        ② Ingresa la cantidad de cada recurso que administrarán con Terraform
      </p>

      {selectedProviders.map(p => (
        <div key={p.id} style={S.card}>
          <div style={S.cardHeader(p.color)}>
            <span style={S.badge(p.color)}>{p.short}</span>
            <span style={S.cardHeaderTitle}>{p.name}</span>
            {providerRUM(p) > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 700, color: p.color }}>
                {providerRUM(p).toLocaleString()} RUM
              </span>
            )}
          </div>
          <div>
            {p.resources.map((r, i) => (
              <div key={r.id} style={{ ...S.resourceRow, background: i % 2 === 0 ? "transparent" : "#0D111720" }}>
                <div style={{ flex: 2 }}>
                  <div style={S.resourceName}>{r.name}</div>
                  <div style={S.resourceDesc}><code style={{ fontSize: "9px", color: "#484F58" }}>{r.id}</code> — {r.desc}</div>
                </div>
                <input
                  type="number" min="0" placeholder="0"
                  value={qty[r.id] || ""}
                  onChange={e => setQ(r.id, e.target.value)}
                  style={S.input}
                />
                <span style={S.rumUnit}>RUM</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary */}
      {totalRUM > 0 && (
        <>
          <div style={S.separator} />
          <div style={S.summaryBox}>
            <div style={S.summaryTitle}>Resumen de dimensionamiento</div>
            {selectedProviders.filter(p => providerRUM(p) > 0).map(p => (
              <div key={p.id} style={S.summaryRow}>
                <span style={S.summaryKey}>{p.name}</span>
                <span style={{ ...S.summaryVal(p.color) }}>{providerRUM(p).toLocaleString()} RUM</span>
              </div>
            ))}
            <div style={{ ...S.summaryRow, marginTop: "8px", borderBottom: "none" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#E6EDF3" }}>TOTAL</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F62FE" }}>{totalRUM.toLocaleString()} RUM</span>
            </div>
            {totalRUM < 10000 && (
              <div style={{ marginTop: "8px", padding: "6px 10px", background: "#FF9900" + "18", border: "1px solid #FF990040", borderRadius: 4, fontSize: "10px", color: "#FF9900" }}>
                ⚠️ El mínimo recomendado es 10,000 RUM. Considera escenarios de crecimiento a 12 meses.
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ height: 80 }} />

      {/* Sticky total */}
      <div style={S.totalBar}>
        <div>
          <div style={S.totalLabel}>TERRAFORM · RESOURCES UNDER MANAGEMENT</div>
          <div style={S.totalSub}>Suma de todos los recursos en state files administrados</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={S.totalValue("#0F62FE")}>{totalRUM.toLocaleString()}</div>
          <div style={S.totalSub}>RUM totales</div>
        </div>
      </div>
    </div>
  );
}

function VaultTab() {
  const [vals, setVals] = useState({});
  const [durs, setDurs] = useState({});
  const [kmip, setKmip] = useState(null);

  const setV = (id, v) => setVals(p => ({ ...p, [id]: v }));
  const setD = (id, v) => setDurs(p => ({ ...p, [id]: v }));

  const ruByCase = useMemo(() =>
    VAULT_CASES.map(uc => ({ id: uc.id, ru: calcRU(uc, vals[uc.id], durs[uc.id]) }))
  , [vals, durs]);

  const totalRU = useMemo(() => ruByCase.reduce((s, r) => s + r.ru, 0), [ruByCase]);

  const kmipRec = useMemo(() => {
    const kmseVal = parseInt(vals["kmse"]) || 0;
    return kmip === "si" || (kmseVal > 0 && kmip === null) ? true : kmip === "si";
  }, [kmip, vals]);

  const reset = () => { setVals({}); setDurs({}); setKmip(null); };

  const getRU = (id) => ruByCase.find(r => r.id === id)?.ru || 0;

  return (
    <div style={S.content}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
        <p style={S.sectionLabel}>Ingresa las cantidades por caso de uso de Vault</p>
        <button style={S.resetBtn} onClick={reset}>Limpiar todo</button>
      </div>

      {VAULT_CASES.map(uc => {
        const ru = getRU(uc.id);
        const active = ru > 0;
        return (
          <div key={uc.id} style={{ ...S.vaultCard, borderColor: active ? "#F1C21B40" : "#21262D" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={S.vaultCardTitle}>
                  <span>{uc.icon}</span>
                  <span>{uc.label}</span>
                </div>
                <div style={S.vaultCardDesc}>{uc.desc}</div>

                <div style={S.vaultQuestion}>{uc.question}</div>
                <div style={S.vaultHelper}>{uc.helper}</div>

                <div style={S.vaultInputRow}>
                  <input
                    type="number" min="0" placeholder="0"
                    value={vals[uc.id] || ""}
                    onChange={e => setV(uc.id, e.target.value)}
                    style={S.inputWide}
                  />
                  <span style={{ fontSize: "10px", color: "#7D8590" }}>{uc.unit}</span>
                </div>

                {uc.type === "duration" && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ fontSize: "11px", color: "#C9D1D9", marginBottom: "3px" }}>{uc.durationQ}</div>
                    <div style={{ fontSize: "10px", color: "#7D8590", marginBottom: "5px" }}>{uc.durationHint}</div>
                    <div style={S.vaultInputRow}>
                      <input
                        type="number" min="1"
                        placeholder={String(uc.durationDefault)}
                        value={durs[uc.id] || ""}
                        onChange={e => setD(uc.id, e.target.value)}
                        style={S.inputWide}
                      />
                      <span style={{ fontSize: "10px", color: "#7D8590" }}>horas</span>
                    </div>
                  </div>
                )}

                {uc.type === "api_calls" && (parseInt(vals[uc.id]) || 0) > 0 && (
                  <div style={{ fontSize: "10px", color: "#7D8590", marginTop: "4px" }}>
                    {(parseInt(vals[uc.id]) || 0).toLocaleString()} ops ÷ 150,000 = {ru} RU
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right", minWidth: 60, marginLeft: 12 }}>
                <div style={S.vaultRU(active)}>{active ? ru.toLocaleString() : "—"}</div>
                <div style={{ fontSize: "9px", color: "#484F58" }}>RU</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* KMIP section */}
      <div style={{ ...S.separator }} />
      <div style={S.kmipBox}>
        <div style={S.kmipTitle}>🔒 ¿Requieren instalación con KMIP?</div>
        <div style={S.kmipDesc}>
          El KMIP Install ($360K lista) es necesario cuando sistemas externos como Oracle TDE, SQL Server TDE,
          sistemas de almacenamiento o backup necesitan conectarse a Vault usando el protocolo KMIP
          para gestión de llaves de encriptación.
        </div>
        <div style={{ fontSize: "11px", color: "#C9D1D9", marginBottom: "8px" }}>
          ¿Tienen sistemas externos que usan el protocolo KMIP para gestión de llaves?
        </div>
        <div style={S.radioRow}>
          <button style={S.radio(kmip === "si")} onClick={() => setKmip("si")}>Sí</button>
          <button style={S.radio(kmip === "no")} onClick={() => setKmip("no")}>No</button>
          <button style={S.radio(kmip === null)} onClick={() => setKmip(null)}>No sé aún</button>
        </div>
        {kmip !== null && (
          <div style={S.kmipResult(kmip === "si")}>
            {kmip === "si"
              ? "⚠️ Recomendado: IBM Vault Self Managed Platform Standard including KMIP Install"
              : "✅ Recomendado: IBM Vault Self Managed Platform Standard Install"}
          </div>
        )}
      </div>

      {/* Summary */}
      {totalRU > 0 && (
        <div style={S.summaryBox}>
          <div style={S.summaryTitle}>Resumen de dimensionamiento</div>
          {VAULT_CASES.filter(uc => getRU(uc.id) > 0).map(uc => (
            <div key={uc.id} style={S.summaryRow}>
              <span style={S.summaryKey}>{uc.icon} {uc.label}</span>
              <span style={S.summaryVal("#F1C21B")}>{getRU(uc.id).toLocaleString()} RU</span>
            </div>
          ))}
          <div style={{ ...S.summaryRow, marginTop: "8px", borderBottom: "none" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#E6EDF3" }}>TOTAL</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#F1C21B" }}>{totalRU.toLocaleString()} RU/mes</span>
          </div>
          <div style={{ marginTop: "8px", padding: "6px 10px", background: "#7D859018", borderRadius: 4, fontSize: "10px", color: "#7D8590" }}>
            💡 IBM recomienda vender RUs adicionales sobre el uso estimado para absorber picos y nuevos proyectos. Considera un buffer del 20%.
            {totalRU > 0 && <span style={{ color: "#F1C21B", fontWeight: 700 }}> → Buffer 20%: {Math.ceil(totalRU * 1.2).toLocaleString()} RU recomendados</span>}
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />

      {/* Sticky total */}
      <div style={S.totalBar}>
        <div>
          <div style={S.totalLabel}>VAULT · RESOURCE UNITS MENSUALES</div>
          <div style={S.totalSub}>Se resetean cada mes — use it or lose it</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={S.totalValue("#F1C21B")}>{totalRU.toLocaleString()}</div>
          <div style={S.totalSub}>RU / mes</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("terraform");

  return (
    <div style={S.app}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        input[type=number]:focus { border-color: #0F62FE !important; outline: none; }
        * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
      `}</style>

      <div style={S.header}>
        <div style={S.logo}>⬡</div>
        <div>
          <div style={S.title}>HashiCorp License Sizer</div>
          <div style={S.subtitle}>DIMENSIONAMIENTO DE LICENCIAS · IBM PARTNER</div>
        </div>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(tab === "terraform", "#0F62FE")} onClick={() => setTab("terraform")}>
          ⬡ TERRAFORM
        </button>
        <button style={S.tab(tab === "vault", "#F1C21B")} onClick={() => setTab("vault")}>
          ▲ VAULT
        </button>
      </div>

      {tab === "terraform" ? <TerraformTab /> : <VaultTab />}
    </div>
  );
}
