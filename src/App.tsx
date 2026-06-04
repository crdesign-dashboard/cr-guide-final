import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

type MediaGuide = {
  id?: string;
  group_name: string;
  media_name: string;
  placement_name?: string;
  size?: string;
  file_format?: string;
  file_size?: string;
  guide?: string;
  warnings?: string;
  psd_path?: string;
  official_link?: string;
  work_sample_path?: string;
  example_image_url?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
};

const emptyForm: MediaGuide = {
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
  example_image_url: "",
  updated_by: "",
};

function splitLines(value?: string) {
  if (!value) return [];
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function isUrl(value?: string) {
  return !!value && /^https?:\/\//i.test(value);
}

function copyText(value?: string) {
  if (!value) return;
  navigator.clipboard.writeText(value);
  alert("복사했어!");
}

export default function App() {
  const [items, setItems] = useState<MediaGuide[]>([]);
  const [activeGroup, setActiveGroup] = useState("전체");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaGuide | null>(null);
  const [form, setForm] = useState<MediaGuide>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("media_guides")
      .select("*")
      .order("group_name", { ascending: true })
      .order("media_name", { ascending: true });

    if (error) {
      console.error(error);
      alert("데이터를 불러오지 못했어. Supabase 설정을 확인해줘.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const groups = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.group_name).filter(Boolean)));
    return ["전체", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const groupMatched = activeGroup === "전체" || item.group_name === activeGroup;
      const keyword = search.trim().toLowerCase();

      const searchTarget = [
        item.group_name,
        item.media_name,
        item.placement_name,
        item.size,
        item.file_format,
        item.file_size,
        item.guide,
        item.warnings,
        item.psd_path,
        item.official_link,
        item.work_sample_path,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatched = !keyword || searchTarget.includes(keyword);

      return groupMatched && searchMatched;
    });
  }, [items, activeGroup, search]);

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(item: MediaGuide) {
    setEditingItem(item);
    setForm({
      group_name: item.group_name || "",
      media_name: item.media_name || "",
      placement_name: item.placement_name || "",
      size: item.size || "",
      file_format: item.file_format || "",
      file_size: item.file_size || "",
      guide: item.guide || "",
      warnings: item.warnings || "",
      psd_path: item.psd_path || "",
      official_link: item.official_link || "",
      work_sample_path: item.work_sample_path || "",
      example_image_url: item.example_image_url || "",
      updated_by: item.updated_by || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function updateForm(key: keyof MediaGuide, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("예시 이미지는 PNG/JPG 같은 이미지 파일만 업로드해줘.");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `examples/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("guide-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      alert("이미지 업로드에 실패했어. Storage 정책이나 bucket 설정을 확인해줘.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("guide-images").getPublicUrl(path);

    updateForm("example_image_url", data.publicUrl);
    setUploading(false);
  }

  async function saveItem() {
    if (!form.group_name.trim()) {
      alert("매체 그룹을 입력해줘.");
      return;
    }

    if (!form.media_name.trim()) {
      alert("매체명을 입력해줘.");
      return;
    }

    setSaving(true);

    const payload = {
      group_name: form.group_name.trim(),
      media_name: form.media_name.trim(),
      placement_name: form.placement_name?.trim() || null,
      size: form.size?.trim() || null,
      file_format: form.file_format?.trim() || null,
      file_size: form.file_size?.trim() || null,
      guide: form.guide || null,
      warnings: form.warnings || null,
      psd_path: form.psd_path?.trim() || null,
      official_link: form.official_link?.trim() || null,
      work_sample_path: form.work_sample_path?.trim() || null,
      example_image_url: form.example_image_url?.trim() || null,
      updated_by: form.updated_by?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingItem?.id) {
      const { error } = await supabase.from("media_guides").update(payload).eq("id", editingItem.id);

      if (error) {
        console.error(error);
        alert("수정 저장에 실패했어.");
      } else {
        await fetchItems();
        closeModal();
      }
    } else {
      const { error } = await supabase.from("media_guides").insert(payload);

      if (error) {
        console.error(error);
        alert("매체 추가에 실패했어.");
      } else {
        await fetchItems();
        closeModal();
      }
    }

    setSaving(false);
  }

  async function deleteItem(item: MediaGuide) {
    if (!item.id) return;

    const ok = confirm(`"${item.media_name}" 매체를 삭제할까?`);
    if (!ok) return;

    const { error } = await supabase.from("media_guides").delete().eq("id", item.id);

    if (error) {
      console.error(error);
      alert("삭제에 실패했어.");
    } else {
      await fetchItems();
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>CR 매체 가이드 허브</h1>
          <p style={styles.subtitle}>
            기획·디자인팀이 매체별 제작 기준, 공식 가이드, 템플릿 경로, 반려 이슈를 한곳에서 관리하는 전사 가이드 시스템
          </p>
        </div>

        <button style={styles.primaryButton} onClick={openCreateModal}>
          + 매체 추가
        </button>
      </header>

      <section style={styles.searchArea}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="매체명, 사이즈, 경로, 주의사항 검색..."
          style={styles.searchInput}
        />
        <button style={styles.secondaryButton} onClick={fetchItems}>
          새로고침
        </button>
      </section>

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>매체 그룹</div>
          {groups.map((group) => {
            const count = group === "전체" ? items.length : items.filter((item) => item.group_name === group).length;

            return (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                style={{
                  ...styles.groupButton,
                  ...(activeGroup === group ? styles.groupButtonActive : {}),
                }}
              >
                <span>{group}</span>
                <span style={styles.groupCount}>{count}</span>
              </button>
            );
          })}
        </aside>

        <section style={styles.content}>
          <div style={styles.contentHeader}>
            <div>
              <strong>{filteredItems.length}개 매체</strong>
            </div>
            <div style={styles.notice}>Supabase 공용 DB 저장 · 사이트 내 수정 즉시 전사 반영</div>
          </div>

          {loading ? (
            <div style={styles.empty}>불러오는 중...</div>
          ) : filteredItems.length === 0 ? (
            <div style={styles.empty}>등록된 매체가 없어. + 매체 추가로 등록해줘.</div>
          ) : (
            <div style={styles.grid}>
              {filteredItems.map((item) => (
                <article key={item.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <span style={styles.badge}>{item.group_name}</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button style={styles.miniButton} onClick={() => openEditModal(item)}>
                        수정
                      </button>
                      <button style={styles.miniButtonGray} onClick={() => deleteItem(item)}>
                        삭제
                      </button>
                    </div>
                  </div>

                  <h2 style={styles.cardTitle}>{item.media_name}</h2>
                  {item.placement_name && <p style={styles.placement}>{item.placement_name}</p>}

                  <div style={styles.specRow}>
                    {item.size && <span>📐 {item.size}</span>}
                    {item.file_format && <span>형식 {item.file_format}</span>}
                    {item.file_size && <span>용량 {item.file_size}</span>}
                  </div>

                  {item.example_image_url && (
                    <div style={styles.imageWrap}>
                      <a href={item.example_image_url} target="_blank" rel="noreferrer">
                        <img src={item.example_image_url} alt={`${item.media_name} 예시 이미지`} style={styles.exampleImage} />
                      </a>
                    </div>
                  )}

                  {splitLines(item.guide).length > 0 && (
                    <section style={styles.section}>
                      <h3 style={styles.sectionTitleBlue}>제작 가이드</h3>
                      <ul style={styles.list}>
                        {splitLines(item.guide).map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {splitLines(item.warnings).length > 0 && (
                    <section style={styles.section}>
                      <h3 style={styles.sectionTitleRed}>반려 / 주의사항</h3>
                      <ul style={styles.warningList}>
                        {splitLines(item.warnings).map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {item.official_link && (
                    <section style={styles.linkBox}>
                      <div style={styles.linkLabel}>공식 가이드</div>
                      {isUrl(item.official_link) ? (
                        <a href={item.official_link} target="_blank" rel="noreferrer" style={styles.linkText}>
                          {item.official_link}
                        </a>
                      ) : (
                        <span style={styles.pathText}>{item.official_link}</span>
                      )}
                      <button style={styles.copyButton} onClick={() => copyText(item.official_link)}>
                        복사
                      </button>
                    </section>
                  )}

                  {item.psd_path && (
                    <section style={styles.linkBox}>
                      <div style={styles.linkLabel}>PSD / 템플릿 경로</div>
                      <span style={styles.pathText}>{item.psd_path}</span>
                      <button style={styles.copyButton} onClick={() => copyText(item.psd_path)}>
                        복사
                      </button>
                    </section>
                  )}

                  {item.work_sample_path && (
                    <section style={styles.linkBox}>
                      <div style={styles.linkLabel}>작업 사례 경로</div>
                      <span style={styles.pathText}>{item.work_sample_path}</span>
                      <button style={styles.copyButton} onClick={() => copyText(item.work_sample_path)}>
                        복사
                      </button>
                    </section>
                  )}

                  <div style={styles.meta}>
                    {item.updated_by && <span>수정자 {item.updated_by}</span>}
                    {item.updated_at && <span>최종 수정 {new Date(item.updated_at).toLocaleDateString("ko-KR")}</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingItem ? "매체 수정" : "매체 추가"}</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <div style={styles.formGrid}>
              <label style={styles.label}>
                매체 그룹 *
                <input
                  style={styles.input}
                  value={form.group_name}
                  onChange={(e) => updateForm("group_name", e.target.value)}
                  placeholder="예: 토스, 배달의민족, 카카오, 메타"
                />
              </label>

              <label style={styles.label}>
                매체명 *
                <input
                  style={styles.input}
                  value={form.media_name}
                  onChange={(e) => updateForm("media_name", e.target.value)}
                  placeholder="예: 토스 페이지배너"
                />
              </label>

              <label style={styles.label}>
                지면명
                <input
                  style={styles.input}
                  value={form.placement_name}
                  onChange={(e) => updateForm("placement_name", e.target.value)}
                  placeholder="예: 1:1 이미지, 사이배너"
                />
              </label>

              <label style={styles.label}>
                사이즈
                <input
                  style={styles.input}
                  value={form.size}
                  onChange={(e) => updateForm("size", e.target.value)}
                  placeholder="예: 1200 × 1200"
                />
              </label>

              <label style={styles.label}>
                파일 형식
                <input
                  style={styles.input}
                  value={form.file_format}
                  onChange={(e) => updateForm("file_format", e.target.value)}
                  placeholder="예: JPG, PNG"
                />
              </label>

              <label style={styles.label}>
                용량 제한
                <input
                  style={styles.input}
                  value={form.file_size}
                  onChange={(e) => updateForm("file_size", e.target.value)}
                  placeholder="예: 10MB 이하"
                />
              </label>
            </div>

            <label style={styles.labelFull}>
              제작 가이드
              <textarea
                style={styles.textarea}
                value={form.guide}
                onChange={(e) => updateForm("guide", e.target.value)}
                placeholder={`한 줄에 하나씩 입력\n예: 상하좌우 여백 100px 이상\n예: 로고 좌상단 고정`}
              />
            </label>

            <label style={styles.labelFull}>
              반려 / 주의사항
              <textarea
                style={styles.textarea}
                value={form.warnings}
                onChange={(e) => updateForm("warnings", e.target.value)}
                placeholder={`한 줄에 하나씩 입력\n예: 이미지 내 문구 30% 초과 시 반려`}
              />
            </label>

            <div style={styles.formGrid}>
              <label style={styles.label}>
                공식 가이드 링크
                <input
                  style={styles.input}
                  value={form.official_link}
                  onChange={(e) => updateForm("official_link", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label style={styles.label}>
                PSD / 템플릿 경로
                <input
                  style={styles.input}
                  value={form.psd_path}
                  onChange={(e) => updateForm("psd_path", e.target.value)}
                  placeholder="/cr/공통_매체가이드/..."
                />
              </label>

              <label style={styles.label}>
                작업 사례 경로
                <input
                  style={styles.input}
                  value={form.work_sample_path}
                  onChange={(e) => updateForm("work_sample_path", e.target.value)}
                  placeholder="/cr/2026_업무요청/..."
                />
              </label>

              <label style={styles.label}>
                수정자
                <input
                  style={styles.input}
                  value={form.updated_by}
                  onChange={(e) => updateForm("updated_by", e.target.value)}
                  placeholder="예: 송이"
                />
              </label>
            </div>

            <div style={styles.uploadArea}>
              <div>
                <div style={styles.uploadTitle}>예시 이미지</div>
                <div style={styles.uploadDesc}>PNG/JPG 이미지만 업로드해줘. PSD 원본은 경로로 관리.</div>
              </div>

              <label style={styles.uploadButton}>
                {uploading ? "업로드 중..." : "이미지 업로드"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            </div>

            {form.example_image_url && (
              <div style={styles.previewArea}>
                <img src={form.example_image_url} alt="예시 이미지 미리보기" style={styles.previewImage} />
                <button style={styles.secondaryButton} onClick={() => updateForm("example_image_url", "")}>
                  이미지 제거
                </button>
              </div>
            )}

            <div style={styles.modalFooter}>
              <button style={styles.secondaryButton} onClick={closeModal}>
                취소
              </button>
              <button style={styles.primaryButton} onClick={saveItem} disabled={saving || uploading}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F7F8FC",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    color: "#0D0F1A",
  },
  header: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "28px 24px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  title: {
    fontSize: 28,
    margin: 0,
    fontWeight: 800,
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 13,
    color: "#666",
  },
  searchArea: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px 24px",
    display: "flex",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    border: "1px solid #DDE1EA",
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px 40px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 18,
  },
  sidebar: {
    background: "#fff",
    border: "1px solid #E5E7EF",
    borderRadius: 14,
    padding: 14,
    height: "fit-content",
    position: "sticky",
    top: 16,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "#888",
    marginBottom: 10,
  },
  groupButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    padding: "11px 10px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  groupButtonActive: {
    background: "#EEF0FF",
    color: "#0114A7",
  },
  groupCount: {
    color: "#999",
  },
  content: {
    minWidth: 0,
  },
  contentHeader: {
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#666",
  },
  notice: {
    color: "#7A6A3A",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EF",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 24px rgba(13,15,26,0.04)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  badge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    background: "#EEF0FF",
    color: "#0114A7",
    fontSize: 12,
    fontWeight: 800,
  },
  cardActions: {
    display: "flex",
    gap: 6,
  },
  miniButton: {
    border: "none",
    borderRadius: 8,
    background: "#EEF0FF",
    color: "#0114A7",
    fontWeight: 800,
    padding: "6px 10px",
    cursor: "pointer",
  },
  miniButtonGray: {
    border: "none",
    borderRadius: 8,
    background: "#F3F4F8",
    color: "#777",
    fontWeight: 800,
    padding: "6px 10px",
    cursor: "pointer",
  },
  cardTitle: {
    fontSize: 19,
    margin: "16px 0 4px",
    fontWeight: 900,
  },
  placement: {
    fontSize: 13,
    color: "#777",
    margin: "0 0 14px",
  },
  specRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 13,
    color: "#555",
    borderTop: "1px solid #F0F1F5",
    borderBottom: "1px solid #F0F1F5",
    padding: "12px 0",
    marginBottom: 14,
  },
  imageWrap: {
    margin: "10px 0 16px",
    border: "1px solid #E5E7EF",
    borderRadius: 12,
    overflow: "hidden",
    background: "#F7F8FC",
  },
  exampleImage: {
    width: "100%",
    display: "block",
    maxHeight: 340,
    objectFit: "contain",
  },
  section: {
    marginTop: 14,
  },
  sectionTitleBlue: {
    fontSize: 13,
    color: "#0114A7",
    margin: "0 0 8px",
    fontWeight: 900,
  },
  sectionTitleRed: {
    fontSize: 13,
    color: "#D62F2F",
    margin: "0 0 8px",
    fontWeight: 900,
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    color: "#333",
    fontSize: 13,
    lineHeight: 1.8,
  },
  warningList: {
    margin: 0,
    paddingLeft: 18,
    color: "#C52020",
    fontSize: 13,
    lineHeight: 1.8,
  },
  linkBox: {
    marginTop: 12,
    border: "1px solid #E5E7EF",
    borderRadius: 10,
    padding: 10,
    background: "#FAFBFF",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
  },
  linkLabel: {
    gridColumn: "1 / -1",
    fontSize: 11,
    fontWeight: 900,
    color: "#888",
  },
  linkText: {
    fontSize: 12,
    color: "#0114A7",
    wordBreak: "break-all",
  },
  pathText: {
    fontSize: 12,
    color: "#444",
    wordBreak: "break-all",
  },
  copyButton: {
    border: "1px solid #DDE1EA",
    background: "#fff",
    borderRadius: 8,
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 800,
  },
  meta: {
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 11,
    color: "#aaa",
  },
  empty: {
    background: "#fff",
    border: "1px dashed #DDE1EA",
    borderRadius: 14,
    padding: 40,
    textAlign: "center",
    color: "#888",
  },
  primaryButton: {
    border: "none",
    borderRadius: 10,
    background: "#0114A7",
    color: "#fff",
    fontWeight: 900,
    padding: "12px 18px",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #DDE1EA",
    borderRadius: 10,
    background: "#fff",
    color: "#333",
    fontWeight: 800,
    padding: "12px 16px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },
  modal: {
    width: "min(860px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 28,
    cursor: "pointer",
    color: "#777",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: 900,
    color: "#333",
  },
  labelFull: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 12,
    fontWeight: 900,
    color: "#333",
    marginTop: 12,
  },
  input: {
    height: 40,
    border: "1px solid #DDE1EA",
    borderRadius: 10,
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
  },
  textarea: {
    minHeight: 120,
    border: "1px solid #DDE1EA",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    outline: "none",
    lineHeight: 1.6,
    resize: "vertical",
  },
  uploadArea: {
    marginTop: 16,
    border: "1px dashed #B8C2FF",
    background: "#F4F6FF",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0114A7",
  },
  uploadDesc: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  uploadButton: {
    background: "#0114A7",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  previewArea: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  previewImage: {
    width: 180,
    height: 110,
    objectFit: "contain",
    border: "1px solid #E5E7EF",
    borderRadius: 10,
    background: "#F7F8FC",
  },
  modalFooter: {
    marginTop: 18,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};
