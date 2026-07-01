import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

type MediaGuide = {
  id?: string;
  group_name: string;
  media_name: string;
  placement_name?: string | null;
  size?: string | null;
  file_format?: string | null;
  file_size?: string | null;
  guide?: string | null;
  warnings?: string | null;
  psd_path?: string | null;
  official_link?: string | null;
  work_sample_path?: string | null;
  work_sample_paths?: string[] | null;
  example_image_url?: string | null;
  example_image_urls?: string[] | null;
  updated_by?: string | null;
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
  work_sample_paths: [],
  example_image_url: "",
  example_image_urls: [],
  updated_by: "",
};

function splitLines(value?: string | null) {
  if (!value) return [];
  return value.split("\n").map((v) => v.trim()).filter(Boolean);
}

function isUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

function normalizeImageUrls(item: MediaGuide) {
  const urls: string[] = [];
  if (Array.isArray(item.example_image_urls)) urls.push(...item.example_image_urls.filter(Boolean));
  if (item.example_image_url && !urls.includes(item.example_image_url)) urls.unshift(item.example_image_url);
  return urls;
}

function normalizeWorkSamplePaths(item: MediaGuide) {
  const paths: string[] = [];
  if (Array.isArray(item.work_sample_paths)) paths.push(...item.work_sample_paths.filter(Boolean));
  if (item.work_sample_path && !paths.includes(item.work_sample_path)) paths.unshift(item.work_sample_path);
  return paths;
}

function copyText(value?: string | null) {
  if (!value) return;
  navigator.clipboard.writeText(value);
  alert("복사했어!");
}

function makeUpdateSignature(items: MediaGuide[]) {
  const latestItem = [...items]
    .filter((item) => item.updated_at || item.created_at)
    .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)))[0];

  return `${items.length}:${latestItem?.id || ""}:${latestItem?.updated_at || latestItem?.created_at || ""}`;
}

function formatKoreanDate(value?: string | null) {
  if (!value) return "날짜 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 없음";

  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});
  const [updateNoticeOpen, setUpdateNoticeOpen] = useState(false);
  const [noticeCollapsed, setNoticeCollapsed] = useState(false);
  const updateSignatureRef = useRef("");

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
      const nextItems = data || [];
      updateSignatureRef.current = makeUpdateSignature(nextItems);
      setItems(nextItems);
      setUpdateNoticeOpen(false);
    }
    setLoading(false);
  }

  async function checkForUpdates() {
    if (!updateSignatureRef.current) return;

    const { data, error, count } = await supabase
      .from("media_guides")
      .select("id, updated_at, created_at", { count: "exact" })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    const latest = data?.[0];
    const nextSignature = `${count ?? 0}:${latest?.id || ""}:${latest?.updated_at || latest?.created_at || ""}`;
    if (nextSignature && nextSignature !== updateSignatureRef.current) {
      setUpdateNoticeOpen(true);
    }
  }

  useEffect(() => {
    fetchItems();
    const intervalId = window.setInterval(checkForUpdates, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const groups = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.group_name).filter(Boolean)));
    return ["전체", ...unique];
  }, [items]);

  const recentUpdates = useMemo(() => {
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return [...items]
      .filter((item) => {
        const value = item.updated_at || item.created_at;
        if (!value) return false;
        const time = new Date(value).getTime();
        return !Number.isNaN(time) && time >= oneMonthAgo;
      })
      .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)))
      .slice(0, 3);
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
        ...(Array.isArray(item.work_sample_paths) ? item.work_sample_paths : []),
      ].join(" ").toLowerCase();
      const searchMatched = !keyword || searchTarget.includes(keyword);
      return groupMatched && searchMatched;
    });
  }, [items, activeGroup, search]);

  function isCardOpen(item: MediaGuide) {
    if (!item.id) return false;
    return !!openCards[item.id];
  }

  function toggleCard(item: MediaGuide) {
    if (!item.id) return;
    setOpenCards((prev) => ({ ...prev, [item.id as string]: !prev[item.id as string] }));
  }

  function openCreateModal() {
    setEditingItem(null);
    setForm({ ...emptyForm, example_image_urls: [], work_sample_paths: [] });
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
      work_sample_paths: normalizeWorkSamplePaths(item),
      example_image_url: item.example_image_url || "",
      example_image_urls: normalizeImageUrls(item),
      updated_by: item.updated_by || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ ...emptyForm, example_image_urls: [], work_sample_paths: [] });
  }

  function updateForm(key: keyof MediaGuide, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(files: FileList | File[]) {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    const invalidFile = fileArray.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      alert("예시 이미지는 PNG/JPG 같은 이미지 파일만 업로드해줘.");
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      const ext = file.name.split(".").pop();
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `examples/${safeName}`;

      const { error: uploadError } = await supabase.storage.from("guide-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        console.error(uploadError);
        alert(`이미지 업로드에 실패했어: ${file.name}`);
        continue;
      }

      const { data } = supabase.storage.from("guide-images").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => {
        const current = Array.isArray(prev.example_image_urls) ? prev.example_image_urls : [];
        const next = [...current, ...uploadedUrls];
        return { ...prev, example_image_urls: next, example_image_url: next[0] || "" };
      });
    }

    setUploading(false);
  }

  function removeImageUrl(url: string) {
    setForm((prev) => {
      const current = Array.isArray(prev.example_image_urls) ? prev.example_image_urls : [];
      const next = current.filter((item) => item !== url);
      return { ...prev, example_image_urls: next, example_image_url: next[0] || "" };
    });
  }

  function addWorkSamplePath() {
    setForm((prev) => {
      const current = Array.isArray(prev.work_sample_paths) ? prev.work_sample_paths : [];
      return { ...prev, work_sample_paths: [...current, ""] };
    });
  }

  function updateWorkSamplePath(index: number, value: string) {
    setForm((prev) => {
      const current = Array.isArray(prev.work_sample_paths) ? [...prev.work_sample_paths] : [];
      current[index] = value;
      return { ...prev, work_sample_paths: current };
    });
  }

  function removeWorkSamplePath(index: number) {
    setForm((prev) => {
      const current = Array.isArray(prev.work_sample_paths) ? prev.work_sample_paths : [];
      const next = current.filter((_, i) => i !== index);
      return { ...prev, work_sample_paths: next, work_sample_path: next[0] || "" };
    });
  }

  async function saveItem() {
    if (!form.group_name.trim()) return alert("매체 그룹을 입력해줘.");
    if (!form.media_name.trim()) return alert("매체명을 입력해줘.");

    setSaving(true);
    const imageUrls = Array.isArray(form.example_image_urls) ? form.example_image_urls.filter(Boolean) : [];
    const workSamplePaths = Array.isArray(form.work_sample_paths) ? form.work_sample_paths.map((v) => v.trim()).filter(Boolean) : [];

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
      work_sample_path: workSamplePaths[0] || form.work_sample_path?.trim() || null,
      work_sample_paths: workSamplePaths,
      example_image_url: imageUrls[0] || null,
      example_image_urls: imageUrls,
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
          <p style={styles.subtitle}>기획·디자인팀이 매체별 제작 기준, 공식 가이드, 템플릿 경로, 반려 이슈를 한곳에서 관리하는 전사 가이드 시스템</p>
        </div>
      </header>

      <section style={styles.searchArea}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="매체명, 사이즈, 경로, 주의사항 검색..." style={styles.searchInput} />
      </section>

      <section style={{ ...styles.updateBoard, ...(updateNoticeOpen ? styles.updateBoardActive : {}) }}>
        <div style={styles.updateBoardHeader}>
          <div style={styles.updateBoardTitleWrap}>
            <div style={styles.updateBoardIcon}>📢</div>
            <div style={styles.updateBoardText}>
              <strong style={styles.updateBoardTitle}>공지사항</strong>
              <p style={styles.updateBoardDesc}>
                {updateNoticeOpen
                  ? "새로운 수정 내용이 있습니다. 최신 내용 보기 버튼을 눌러 반영해 주세요."
                  : "매체 가이드가 수정되면 이 영역에서 최근 업데이트 내역을 확인하실 수 있습니다."}
              </p>
            </div>
          </div>
          <div style={styles.updateBoardActions}>
            <button style={styles.updateBoardButton} onClick={fetchItems}>최신 내용 보기</button>
            <button style={styles.foldButton} onClick={() => setNoticeCollapsed((prev) => !prev)}>
              {noticeCollapsed ? "펼치기" : "접기"}
            </button>
          </div>
        </div>

        {!noticeCollapsed && (
          <div style={styles.recentUpdateList}>
            {recentUpdates.length > 0 ? recentUpdates.map((item) => (
              <div key={item.id || `${item.group_name}-${item.media_name}`} style={styles.recentUpdateItem}>
                <span style={styles.recentUpdateDate}>{formatKoreanDate(item.updated_at || item.created_at)}</span>
                <span style={styles.recentUpdateName}>{item.group_name} · {item.media_name}</span>
                {item.updated_by && <span style={styles.recentUpdateBy}>수정자 {item.updated_by}</span>}
              </div>
            )) : (
              <div style={styles.recentUpdateEmpty}>최근 한 달 내 업데이트 내역이 없습니다.</div>
            )}
          </div>
        )}
      </section>

      <section style={styles.actionArea}>
        <div style={styles.notice}>Supabase 공용 DB 저장 · 사이트 내 수정 즉시 전사 반영</div>
        <div style={styles.actionButtons}>
          <button style={styles.primaryButton} onClick={openCreateModal}>+ 매체 추가</button>
          <button style={styles.secondaryButton} onClick={fetchItems}>새로고침</button>
        </div>
      </section>

      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>매체 그룹</div>
          {groups.map((group) => {
            const count = group === "전체" ? items.length : items.filter((item) => item.group_name === group).length;
            return (
              <button key={group} onClick={() => setActiveGroup(group)} style={{ ...styles.groupButton, ...(activeGroup === group ? styles.groupButtonActive : {}) }}>
                <span>{group}</span>
                <span style={styles.groupCount}>{count}</span>
              </button>
            );
          })}
        </aside>

        <section style={styles.content}>
          <div style={styles.contentHeader}>
            <div><strong>{filteredItems.length}개 매체</strong></div>
          </div>

          {loading ? <div style={styles.empty}>불러오는 중...</div> : filteredItems.length === 0 ? <div style={styles.empty}>등록된 매체가 없어. + 매체 추가로 등록해줘.</div> : (
            <div style={styles.grid}>
              {filteredItems.map((item) => {
                const imageUrls = normalizeImageUrls(item);
                const workSamplePaths = normalizeWorkSamplePaths(item);
                const opened = isCardOpen(item);
                return (
                  <article key={item.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div style={styles.badgeRow}>
                        <span style={styles.badge}>{item.group_name}</span>
                        {imageUrls.length > 0 && <span style={styles.imageBadge}>예시 이미지 {imageUrls.length}</span>}
                      </div>
                      <div style={styles.cardActions}>
                        <button style={styles.miniButton} onClick={() => openEditModal(item)}>수정</button>
                        <button style={styles.miniButtonGray} onClick={() => toggleCard(item)}>{opened ? "접기" : "보기"}</button>
                      </div>
                    </div>

                    <h2 style={styles.cardTitle}>{item.media_name}</h2>
                    {item.placement_name && <p style={styles.placement}>{item.placement_name}</p>}
                    <div style={styles.specRow}>
                      {item.size && <span>📐 {item.size}</span>}
                      {item.file_format && <span>형식 {item.file_format}</span>}
                      {item.file_size && <span>용량 {item.file_size}</span>}
                    </div>

                    {opened && <>
                      {imageUrls.length > 0 && <section style={styles.section}>
                        <h3 style={styles.sectionTitleBlue}>예시 이미지</h3>
                        <div style={styles.imageGrid}>
                          {imageUrls.map((url, idx) => (
                            <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer" style={styles.imageLink}>
                              <img src={url} alt={`${item.media_name} 예시 이미지 ${idx + 1}`} style={styles.exampleImage} />
                            </a>
                          ))}
                        </div>
                      </section>}

                      {splitLines(item.guide).length > 0 && <section style={styles.section}>
                        <h3 style={styles.sectionTitleBlue}>제작 가이드</h3>
                        <ul style={styles.list}>{splitLines(item.guide).map((line, idx) => <li key={idx}>{line}</li>)}</ul>
                      </section>}

                      {splitLines(item.warnings).length > 0 && <section style={styles.section}>
                        <h3 style={styles.sectionTitleRed}>반려 / 주의사항</h3>
                        <ul style={styles.warningList}>{splitLines(item.warnings).map((line, idx) => <li key={idx}>{line}</li>)}</ul>
                      </section>}

                      {item.official_link && <section style={styles.linkBox}>
                        <div style={styles.linkLabel}>공식 가이드</div>
                        {isUrl(item.official_link) ? <a href={item.official_link} target="_blank" rel="noreferrer" style={styles.linkText}>{item.official_link}</a> : <span style={styles.pathText}>{item.official_link}</span>}
                        <button style={styles.copyButton} onClick={() => copyText(item.official_link)}>복사</button>
                      </section>}

                      {item.psd_path && <section style={styles.linkBox}>
                        <div style={styles.linkLabel}>PSD / 템플릿 경로</div>
                        <span style={styles.pathText}>{item.psd_path}</span>
                        <button style={styles.copyButton} onClick={() => copyText(item.psd_path)}>복사</button>
                      </section>}

                      {workSamplePaths.length > 0 && <section style={styles.pathListBox}>
                        <div style={styles.linkLabel}>작업 사례 경로</div>
                        {workSamplePaths.map((path, idx) => (
                          <div key={`${path}-${idx}`} style={styles.pathListItem}>
                            <span style={styles.pathText}>{path}</span>
                            <button style={styles.copyButton} onClick={() => copyText(path)}>복사</button>
                          </div>
                        ))}
                      </section>}

                      <div style={styles.meta}>
                        {item.updated_by && <span>수정자 {item.updated_by}</span>}
                        {item.updated_at && <span>최종 수정 {new Date(item.updated_at).toLocaleDateString("ko-KR")}</span>}
                      </div>
                      <div style={styles.deleteRow}><button style={styles.deleteButton} onClick={() => deleteItem(item)}>삭제</button></div>
                    </>}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {modalOpen && <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>{editingItem ? "매체 수정" : "매체 추가"}</h2>
            <button style={styles.closeButton} onClick={closeModal}>×</button>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.label}>매체 그룹 *<input style={styles.input} value={form.group_name} onChange={(e) => updateForm("group_name", e.target.value)} placeholder="예: 토스, 배달의민족, 카카오, 메타" /></label>
            <label style={styles.label}>매체명 *<input style={styles.input} value={form.media_name} onChange={(e) => updateForm("media_name", e.target.value)} placeholder="예: 토스 페이지배너" /></label>
            <label style={styles.label}>지면명<input style={styles.input} value={form.placement_name || ""} onChange={(e) => updateForm("placement_name", e.target.value)} placeholder="예: 1:1 이미지, 사이배너" /></label>
            <label style={styles.label}>사이즈<input style={styles.input} value={form.size || ""} onChange={(e) => updateForm("size", e.target.value)} placeholder="예: 1200 × 1200" /></label>
            <label style={styles.label}>파일 형식<input style={styles.input} value={form.file_format || ""} onChange={(e) => updateForm("file_format", e.target.value)} placeholder="예: JPG, PNG" /></label>
            <label style={styles.label}>용량 제한<input style={styles.input} value={form.file_size || ""} onChange={(e) => updateForm("file_size", e.target.value)} placeholder="예: 10MB 이하" /></label>
          </div>

          <label style={styles.labelFull}>제작 가이드<textarea style={styles.textarea} value={form.guide || ""} onChange={(e) => updateForm("guide", e.target.value)} placeholder={`한 줄에 하나씩 입력\n예: 상하좌우 여백 100px 이상\n예: 로고 좌상단 고정`} /></label>
          <label style={styles.labelFull}>반려 / 주의사항<textarea style={styles.textarea} value={form.warnings || ""} onChange={(e) => updateForm("warnings", e.target.value)} placeholder={`한 줄에 하나씩 입력\n예: 이미지 내 문구 30% 초과 시 반려`} /></label>

          <div style={styles.formGrid}>
            <label style={styles.label}>공식 가이드 링크<input style={styles.input} value={form.official_link || ""} onChange={(e) => updateForm("official_link", e.target.value)} placeholder="https://..." /></label>
            <label style={styles.label}>PSD / 템플릿 경로<input style={styles.input} value={form.psd_path || ""} onChange={(e) => updateForm("psd_path", e.target.value)} placeholder="/cr/공통_매체가이드/..." /></label>
            <label style={styles.label}>수정자<input style={styles.input} value={form.updated_by || ""} onChange={(e) => updateForm("updated_by", e.target.value)} placeholder="예: 송이" /></label>
          </div>

          <div style={styles.multiPathArea}>
            <div style={styles.multiPathHeader}>
              <div>
                <div style={styles.uploadTitle}>작업 사례 경로</div>
                <div style={styles.uploadDesc}>+ 버튼으로 이전 작업 경로를 여러 개 등록할 수 있어.</div>
              </div>
              <button type="button" style={styles.addPathButton} onClick={addWorkSamplePath}>+ 경로 추가</button>
            </div>
            {(!Array.isArray(form.work_sample_paths) || form.work_sample_paths.length === 0) && (
              <button type="button" style={styles.emptyPathButton} onClick={addWorkSamplePath}>첫 작업 사례 경로 추가</button>
            )}
            {Array.isArray(form.work_sample_paths) && form.work_sample_paths.map((path, idx) => (
              <div key={idx} style={styles.pathInputRow}>
                <input
                  style={styles.input}
                  value={path}
                  onChange={(e) => updateWorkSamplePath(idx, e.target.value)}
                  placeholder="/cr/2026_업무요청/..."
                />
                <button type="button" style={styles.removePathButton} onClick={() => removeWorkSamplePath(idx)}>삭제</button>
              </div>
            ))}
          </div>

          <div style={styles.uploadArea}>
            <div>
              <div style={styles.uploadTitle}>예시 이미지</div>
              <div style={styles.uploadDesc}>PNG/JPG 이미지를 여러 장 업로드할 수 있어. PSD 원본은 경로로 관리.</div>
            </div>
            <label style={styles.uploadButton}>{uploading ? "업로드 중..." : "이미지 여러 장 업로드"}
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { const files = e.target.files; if (files) handleImageUpload(files); e.currentTarget.value = ""; }} />
            </label>
          </div>

          {Array.isArray(form.example_image_urls) && form.example_image_urls.length > 0 && <div style={styles.previewGrid}>
            {form.example_image_urls.map((url, idx) => <div key={`${url}-${idx}`} style={styles.previewItem}>
              <img src={url} alt={`예시 이미지 미리보기 ${idx + 1}`} style={styles.previewImage} />
              <button style={styles.removeImageButton} onClick={() => removeImageUrl(url)}>삭제</button>
            </div>)}
          </div>}

          <div style={styles.modalFooter}>
            <button style={styles.secondaryButton} onClick={closeModal}>취소</button>
            <button style={styles.primaryButton} onClick={saveItem} disabled={saving || uploading}>{saving ? "저장 중..." : "저장"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#F7F8FC", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", color: "#0D0F1A" },
  header: { maxWidth: 1180, margin: "0 auto", padding: "28px 24px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 },
  title: { fontSize: 28, margin: 0, fontWeight: 800 },
  subtitle: { margin: "8px 0 0", fontSize: 13, color: "#666" },
  searchArea: { maxWidth: 1180, margin: "0 auto", padding: "0 24px 14px", display: "flex", gap: 10 },
  searchInput: { flex: 1, height: 44, border: "1px solid #DDE1EA", borderRadius: 10, padding: "0 14px", fontSize: 14, outline: "none", background: "#fff" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 18 },
  sidebar: { background: "#fff", border: "1px solid #E5E7EF", borderRadius: 14, padding: 14, height: "fit-content", position: "sticky", top: 16 },
  sidebarTitle: { fontSize: 12, fontWeight: 800, color: "#888", marginBottom: 10 },
  groupButton: { width: "100%", border: "none", background: "transparent", padding: "11px 10px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#333", display: "flex", justifyContent: "space-between", cursor: "pointer" },
  groupButtonActive: { background: "#EEF0FF", color: "#0114A7" },
  groupCount: { color: "#999" },
  content: { minWidth: 0 },
  contentHeader: { marginBottom: 12, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" },
  notice: { color: "#7A6A3A", fontSize: 13 },
  actionArea: { maxWidth: 1180, margin: "0 auto 18px", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  actionButtons: { display: "flex", gap: 10, alignItems: "center" },
  updateBoard: {
    maxWidth: 1180,
    margin: "0 auto 14px",
    padding: "16px 18px",
    background: "#FFFDF1",
    border: "1px solid #EADFA8",
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(122,106,58,0.08)",
  },
  updateBoardActive: { background: "#FFF8D9", border: "1px solid #F0C94F" },
  updateBoardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 },
  updateBoardTitleWrap: { display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 },
  updateBoardIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: "#FFE889",
    color: "#7A5B00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: 18,
  },
  updateBoardText: { minWidth: 0, textAlign: "left" },
  updateBoardTitle: { display: "block", fontSize: 15, color: "#4E3A00", marginBottom: 4, fontWeight: 900 },
  updateBoardDesc: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "#7A6A3A" },
  updateBoardActions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  updateBoardButton: { border: "none", borderRadius: 10, background: "#0D0F1A", color: "#fff", fontWeight: 900, padding: "10px 12px", cursor: "pointer", whiteSpace: "nowrap" },
  foldButton: { border: "1px solid #EADFA8", borderRadius: 10, background: "#fff", color: "#7A5B00", fontWeight: 900, padding: "9px 12px", cursor: "pointer", whiteSpace: "nowrap" },
  recentUpdateList: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  recentUpdateItem: { display: "grid", gridTemplateColumns: "74px 1fr auto", gap: 8, alignItems: "center", fontSize: 12, color: "#4E3A00", background: "rgba(255,255,255,0.68)", border: "1px solid rgba(234,223,168,0.9)", borderRadius: 10, padding: "8px 10px" },
  recentUpdateDate: { fontWeight: 900, color: "#7A5B00", whiteSpace: "nowrap" },
  recentUpdateName: { fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  recentUpdateBy: { color: "#8A7A4A", whiteSpace: "nowrap" },
  recentUpdateEmpty: { fontSize: 12, color: "#8A7A4A", background: "rgba(255,255,255,0.68)", border: "1px dashed rgba(234,223,168,0.9)", borderRadius: 10, padding: "8px 10px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid #E5E7EF", borderRadius: 16, padding: 18, boxShadow: "0 8px 24px rgba(13,15,26,0.04)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 12 },
  badgeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  badge: { display: "inline-block", padding: "5px 10px", borderRadius: 999, background: "#EEF0FF", color: "#0114A7", fontSize: 12, fontWeight: 800 },
  imageBadge: { display: "inline-block", padding: "5px 10px", borderRadius: 999, background: "#E8F8F0", color: "#008A4B", fontSize: 12, fontWeight: 800 },
  cardActions: { display: "flex", gap: 6 },
  miniButton: { border: "none", borderRadius: 8, background: "#EEF0FF", color: "#0114A7", fontWeight: 800, padding: "6px 10px", cursor: "pointer" },
  miniButtonGray: { border: "none", borderRadius: 8, background: "#F3F4F8", color: "#777", fontWeight: 800, padding: "6px 10px", cursor: "pointer" },
  cardTitle: { fontSize: 19, margin: "16px 0 4px", fontWeight: 900 },
  placement: { fontSize: 13, color: "#777", margin: "0 0 14px" },
  specRow: { display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#555", borderTop: "1px solid #F0F1F5", borderBottom: "1px solid #F0F1F5", padding: "12px 0", marginBottom: 14 },
  imageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 },
  imageLink: { display: "block", border: "1px solid #E5E7EF", borderRadius: 12, overflow: "hidden", background: "#F7F8FC" },
  exampleImage: { width: "100%", height: 150, display: "block", objectFit: "contain" },
  section: { marginTop: 14 },
  sectionTitleBlue: { fontSize: 13, color: "#0114A7", margin: "0 0 8px", fontWeight: 900 },
  sectionTitleRed: { fontSize: 13, color: "#D62F2F", margin: "0 0 8px", fontWeight: 900 },
  list: { margin: 0, paddingLeft: 18, color: "#333", fontSize: 13, lineHeight: 1.8 },
  warningList: { margin: 0, paddingLeft: 18, color: "#C52020", fontSize: 13, lineHeight: 1.8 },

  pathListBox: {
    marginTop: 12,
    border: "1px solid #E5E7EF",
    borderRadius: 10,
    padding: 10,
    background: "#FAFBFF",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  pathListItem: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
  },
  multiPathArea: {
    marginTop: 16,
    border: "1px solid #E5E7EF",
    background: "#FAFBFF",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  multiPathHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  addPathButton: {
    border: "none",
    borderRadius: 10,
    background: "#0114A7",
    color: "#fff",
    fontWeight: 900,
    padding: "9px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  emptyPathButton: {
    border: "1px dashed #B8C2FF",
    borderRadius: 10,
    background: "#F4F6FF",
    color: "#0114A7",
    fontWeight: 900,
    padding: "11px 12px",
    cursor: "pointer",
  },
  pathInputRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
  },
  removePathButton: {
    border: "1px solid #F3CCCC",
    borderRadius: 10,
    background: "#FFF5F5",
    color: "#C52020",
    fontWeight: 900,
    padding: "10px 12px",
    cursor: "pointer",
  },
  linkBox: { marginTop: 12, border: "1px solid #E5E7EF", borderRadius: 10, padding: 10, background: "#FAFBFF", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" },
  linkLabel: { gridColumn: "1 / -1", fontSize: 11, fontWeight: 900, color: "#888" },
  linkText: { fontSize: 12, color: "#0114A7", wordBreak: "break-all" },
  pathText: { fontSize: 12, color: "#444", wordBreak: "break-all" },
  copyButton: { border: "1px solid #DDE1EA", background: "#fff", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontWeight: 800 },
  meta: { marginTop: 14, display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, color: "#aaa" },
  deleteRow: { marginTop: 12, display: "flex", justifyContent: "flex-end" },
  deleteButton: { border: "1px solid #FFD5D5", background: "#FFF5F5", color: "#D62F2F", borderRadius: 8, padding: "7px 10px", fontWeight: 800, cursor: "pointer" },
  empty: { background: "#fff", border: "1px dashed #DDE1EA", borderRadius: 14, padding: 40, textAlign: "center", color: "#888" },
  primaryButton: { border: "none", borderRadius: 10, background: "#0114A7", color: "#fff", fontWeight: 900, padding: "12px 18px", cursor: "pointer" },
  secondaryButton: { border: "1px solid #DDE1EA", borderRadius: 10, background: "#fff", color: "#333", fontWeight: 800, padding: "12px 16px", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 },
  modal: { width: "min(860px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.25)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  modalTitle: { margin: 0, fontSize: 22, fontWeight: 900 },
  closeButton: { border: "none", background: "transparent", fontSize: 28, cursor: "pointer", color: "#777" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 900, color: "#333" },
  labelFull: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 900, color: "#333", marginTop: 12 },
  input: { height: 40, border: "1px solid #DDE1EA", borderRadius: 10, padding: "0 12px", fontSize: 14, outline: "none" },
  textarea: { minHeight: 120, border: "1px solid #DDE1EA", borderRadius: 10, padding: 12, fontSize: 14, outline: "none", lineHeight: 1.6, resize: "vertical" },
  uploadArea: { marginTop: 16, border: "1px dashed #B8C2FF", background: "#F4F6FF", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 },
  uploadTitle: { fontSize: 14, fontWeight: 900, color: "#0114A7" },
  uploadDesc: { fontSize: 12, color: "#777", marginTop: 4 },
  uploadButton: { background: "#0114A7", color: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" },
  previewGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 },
  previewItem: { border: "1px solid #E5E7EF", borderRadius: 12, padding: 8, background: "#F7F8FC" },
  previewImage: { width: "100%", height: 100, objectFit: "contain", borderRadius: 8, background: "#fff" },
  removeImageButton: { width: "100%", marginTop: 6, border: "1px solid #FFD5D5", background: "#FFF5F5", color: "#D62F2F", borderRadius: 8, padding: "6px 8px", fontWeight: 800, cursor: "pointer" },
  modalFooter: { marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 },
};
