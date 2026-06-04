import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EMPTY_FORM = {
  group_name: "",
  media_name: "",
  placement_name: "",
  size: "",
  file_format: "",
  file_size: "",
  guide: "",
  warnings: "",
  psd_path: "",
  official_link: "",
  work_sample_path: "",
  status: "확인 필요",
  updated_by: "",
};

const GROUP_ORDER = ["전체", "토스", "배달의민족", "카카오", "카카오페이", "에이블리", "메타", "당근", "오퍼월", "기타"];

function lineList(text) {
  if (!text) return [];
  return text.split("\n").map((v) => v.trim()).filter(Boolean);
}

function isUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function copyText(value) {
  if (!value) return;
  navigator.clipboard?.writeText(value);
  alert("복사했어요.");
}

function Pill({ children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, background: "#EEF0FF", color: "#0114A7", fontSize: 11, fontWeight: 700, padding: "4px 9px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function LinkOrPath({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#999", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F8FC", border: "1px solid #E5E7EF", borderRadius: 8, padding: "8px 10px" }}>
        {isUrl(value) ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 12, color: "#0114A7", wordBreak: "break-all" }}>{value}</a>
        ) : (
          <span style={{ flex: 1, fontSize: 12, color: "#555", wordBreak: "break-all", fontFamily: "monospace" }}>{value}</span>
        )}
        <button onClick={() => copyText(value)} style={{ border: "1px solid #D9DCEA", background: "#fff", borderRadius: 7, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>복사</button>
      </div>
    </div>
  );
}

function EditModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.group_name.trim() || !form.media_name.trim()) {
      alert("매체그룹과 매체명은 필수예요.");
      return;
    }
    setSaving(true);
    await onSave({ ...form, updated_at: new Date().toISOString() });
    setSaving(false);
  };

  const fields = [
    ["group_name", "매체그룹", "예: 토스, 배달의민족, 카카오"],
    ["media_name", "매체명", "예: 토스 페이지배너"],
    ["placement_name", "지면명", "예: 1:1 이미지, 오브젝트형"],
    ["size", "사이즈", "예: 1200 × 1200"],
    ["file_format", "파일형식", "예: JPG, PNG"],
    ["file_size", "용량제한", "예: 10MB 이하"],
    ["status", "상태", "예: 확인 완료 / 확인 필요 / 업데이트 필요"],
    ["updated_by", "수정자", "예: 송이"],
    ["official_link", "공식 가이드 링크", "https://..."],
    ["psd_path", "PSD/템플릿 경로", "/cr/..."],
    ["work_sample_path", "작업 사례 경로", "/cr/..."],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "min(760px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 24px 70px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #E5E7EF", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <strong style={{ fontSize: 16 }}>{initial?.id ? "매체 가이드 수정" : "매체 가이드 추가"}</strong>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {fields.map(([key, label, placeholder]) => (
              <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#444" }}>{label}</span>
                <input value={form[key] || ""} placeholder={placeholder} onChange={(e) => set(key, e.target.value)} style={{ border: "1px solid #DDE1EE", borderRadius: 9, padding: "10px 11px", fontSize: 13, outline: "none" }} />
              </label>
            ))}
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#444" }}>제작 가이드</span>
            <textarea value={form.guide || ""} placeholder={"한 줄에 하나씩 입력\n예: 상하좌우 여백 100px 이상"} onChange={(e) => set("guide", e.target.value)} rows={6} style={{ border: "1px solid #DDE1EE", borderRadius: 9, padding: 11, fontSize: 13, lineHeight: 1.6 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#C02525" }}>반려 / 주의사항</span>
            <textarea value={form.warnings || ""} placeholder={"한 줄에 하나씩 입력\n예: 이미지 내 문구 30% 초과 시 반려"} onChange={(e) => set("warnings", e.target.value)} rows={5} style={{ border: "1px solid #F0C8C8", borderRadius: 9, padding: 11, fontSize: 13, lineHeight: 1.6 }} />
          </label>
        </div>
        <div style={{ borderTop: "1px solid #E5E7EF", padding: "15px 22px", display: "flex", justifyContent: "flex-end", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ border: "1px solid #DDE1EE", background: "#fff", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}>취소</button>
          <button onClick={submit} disabled={saving} style={{ border: "none", background: "#0114A7", color: "#fff", borderRadius: 9, padding: "10px 18px", fontWeight: 800, cursor: "pointer" }}>{saving ? "저장 중..." : "저장"}</button>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ item, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const guides = lineList(item.guide);
  const warnings = lineList(item.warnings);
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EF", borderRadius: 14, overflow: "hidden", boxShadow: open ? "0 10px 30px rgba(1,20,167,0.08)" : "none" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: 18, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}><Pill>{item.group_name || "기타"}</Pill>{item.status && <Pill>{item.status}</Pill>}</div>
            <h3 style={{ margin: 0, fontSize: 16, color: "#0D0F1A" }}>{item.media_name}</h3>
            {item.placement_name && <p style={{ margin: "5px 0 0", fontSize: 12, color: "#777" }}>{item.placement_name}</p>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} style={{ border: "none", background: "#EEF0FF", color: "#0114A7", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>수정</button>
            <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} style={{ border: "none", background: "#F3F4F8", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>{open ? "접기" : "보기"}</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 13, color: "#555", fontSize: 12 }}>
          {item.size && <span>📐 {item.size}</span>}
          {item.file_format && <span>형식 {item.file_format}</span>}
          {item.file_size && <span>용량 {item.file_size}</span>}
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #EEF0F5", padding: "0 18px 18px" }}>
          {guides.length > 0 && <div style={{ marginTop: 16 }}><div style={{ fontSize: 11, fontWeight: 900, color: "#0114A7", marginBottom: 8 }}>제작 가이드</div><ul style={{ margin: 0, paddingLeft: 18, color: "#444", fontSize: 13, lineHeight: 1.7 }}>{guides.map((g, i) => <li key={i}>{g}</li>)}</ul></div>}
          {warnings.length > 0 && <div style={{ marginTop: 16 }}><div style={{ fontSize: 11, fontWeight: 900, color: "#D12F2F", marginBottom: 8 }}>반려 / 주의사항</div><ul style={{ margin: 0, paddingLeft: 18, color: "#B72525", fontSize: 13, lineHeight: 1.7 }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}
          <LinkOrPath label="공식 가이드" value={item.official_link} />
          <LinkOrPath label="PSD / 템플릿 경로" value={item.psd_path} />
          <LinkOrPath label="작업 사례 경로" value={item.work_sample_path} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}>
            <div style={{ fontSize: 11, color: "#999" }}>수정자: {item.updated_by || "-"} · 최종수정: {item.updated_at ? new Date(item.updated_at).toLocaleString("ko-KR") : "-"}</div>
            <button onClick={() => onDelete(item.id)} style={{ border: "1px solid #F0C8C8", color: "#C02525", background: "#fff", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [activeGroup, setActiveGroup] = useState("전체");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("media_guides").select("*").order("group_name", { ascending: true }).order("media_name", { ascending: true });
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const groups = useMemo(() => {
    const set = new Set(items.map((v) => v.group_name || "기타"));
    const result = ["전체", ...Array.from(set)];
    return result.sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a);
      const bi = GROUP_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, "ko");
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const groupOk = activeGroup === "전체" || (item.group_name || "기타") === activeGroup;
      const text = [item.group_name, item.media_name, item.placement_name, item.size, item.file_format, item.file_size, item.guide, item.warnings, item.psd_path, item.official_link, item.work_sample_path, item.status, item.updated_by].join(" ").toLowerCase();
      return groupOk && (!q || text.includes(q));
    });
  }, [items, activeGroup, search]);

  const saveItem = async (form) => {
    const payload = {
      group_name: form.group_name,
      media_name: form.media_name,
      placement_name: form.placement_name,
      size: form.size,
      file_format: form.file_format,
      file_size: form.file_size,
      guide: form.guide,
      warnings: form.warnings,
      psd_path: form.psd_path,
      official_link: form.official_link,
      work_sample_path: form.work_sample_path,
      status: form.status || "확인 필요",
      updated_by: form.updated_by,
      updated_at: new Date().toISOString(),
    };
    if (form.id) {
      const { error } = await supabase.from("media_guides").update(payload).eq("id", form.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("media_guides").insert(payload);
      if (error) return alert(error.message);
    }
    setEditItem(null);
    setShowAdd(false);
    await loadItems();
  };

  const deleteItem = async (id) => {
    if (!confirm("이 매체 가이드를 삭제할까요? 전사 화면에서도 사라져요.")) return;
    const { error } = await supabase.from("media_guides").delete().eq("id", id);
    if (error) return alert(error.message);
    await loadItems();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC", fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EF", padding: "22px 28px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div><h1 style={{ margin: 0, fontSize: 23, color: "#0D0F1A" }}>CR 매체 가이드 허브</h1><p style={{ margin: "6px 0 0", color: "#777", fontSize: 13 }}>기획·디자인팀이 매체별 제작 기준, 공식 가이드, 템플릿 경로, 반려 이슈를 한곳에서 관리하는 전사 가이드 시스템</p></div>
          <button onClick={() => setShowAdd(true)} style={{ border: "none", background: "#0114A7", color: "#fff", borderRadius: 10, padding: "12px 18px", fontWeight: 900, cursor: "pointer" }}>+ 매체 추가</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="매체명, 사이즈, 경로, 주의사항 검색..." style={{ flex: "1 1 320px", border: "1px solid #DDE1EE", borderRadius: 10, padding: "12px 14px", fontSize: 14, outline: "none" }} />
          <button onClick={loadItems} style={{ border: "1px solid #DDE1EE", background: "#fff", borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>새로고침</button>
        </div>
      </header>
      <main style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 18, padding: 24 }}>
        <aside style={{ background: "#fff", border: "1px solid #E5E7EF", borderRadius: 14, padding: 14, alignSelf: "start", position: "sticky", top: 126 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#999", marginBottom: 9, letterSpacing: "0.08em" }}>매체 그룹</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {groups.map((group) => <button key={group} onClick={() => setActiveGroup(group)} style={{ border: "none", textAlign: "left", background: activeGroup === group ? "#EEF0FF" : "transparent", color: activeGroup === group ? "#0114A7" : "#555", borderRadius: 9, padding: "10px 11px", cursor: "pointer", fontWeight: activeGroup === group ? 900 : 600, display: "flex", justifyContent: "space-between" }}><span>{group}</span><span style={{ color: "#aaa" }}>{group === "전체" ? items.length : items.filter((v) => (v.group_name || "기타") === group).length}</span></button>)}
          </div>
        </aside>
        <section>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#777", fontSize: 13 }}><span>{loading ? "불러오는 중..." : `${filtered.length}개 매체`}</span><span>Supabase 공용 DB 저장 · 사이트 내 수정 즉시 전사 반영</span></div>
          {error && <div style={{ background: "#FFF2F2", color: "#B72525", border: "1px solid #F5C5C5", borderRadius: 12, padding: 14, marginBottom: 12 }}>Supabase 연결 오류: {error}</div>}
          {!loading && filtered.length === 0 && <div style={{ background: "#fff", border: "1px dashed #CCD2E5", borderRadius: 14, padding: 42, textAlign: "center", color: "#999" }}>검색 결과가 없어요. 오른쪽 위 + 매체 추가로 새 가이드를 등록할 수 있어요.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>{filtered.map((item) => <GuideCard key={item.id} item={item} onEdit={setEditItem} onDelete={deleteItem} />)}</div>
        </section>
      </main>
      {(showAdd || editItem) && <EditModal initial={editItem || EMPTY_FORM} onClose={() => { setShowAdd(false); setEditItem(null); }} onSave={saveItem} />}
    </div>
  );
}
