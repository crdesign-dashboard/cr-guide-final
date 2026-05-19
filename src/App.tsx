import { useState, useEffect, useRef, useCallback } from "react";

// ─── INITIAL DATA ────────────────────────────────────────────────────────────
const INITIAL_DATA = [
  {
    id: "toss-list", group: "toss", badgeText: "TOSS",
    title: "토스 리스트배너",
    size: "1200 × 675", format: "JPG, PNG", filesize: "10MB 이하",
    guide: ["이미지 내 문구 30% 이하 (초과 시 심사 반려)", "투명 배경, 강한 형광색 사용 금지", "상하좌우 여백 70px 이상", "소재가 너무 단순하지 않도록 디자인 요소 추가"],
    warnings: ["이미지 내 문구 30% 초과 → 반려", "투명 배경 사용 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/260428_진닭잡_수정+추가소재_JMK/1200x675",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/feedtype"
  },
  {
    id: "toss-page-1200", group: "toss", badgeText: "TOSS",
    title: "토스 페이지배너 (1:1)",
    size: "1200 × 1200", format: "JPG, PNG", filesize: "10MB 이하",
    guide: ["메인 이미지 가운데 배치 권장", "상하좌우 여백 100px 이상", "이미지 내 문구 30% 이하 (초과 시 반려)", "로고 좌상단 고정 배치", "심의필 가운데 정렬 — 40px 텍스트 권장", "케이뱅크 컬러 100% 준수 불필요 — 이미지에 맞는 배경색 활용"],
    warnings: ["이미지 내 문구 30% 초과 → 반려", "과도한 분할/크롭, 문구 중복 50% 이상 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/264029_4월_진닭잡_JMK/1200x1200(토스_심의필)",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/moment"
  },
  {
    id: "toss-page-1920", group: "toss", badgeText: "TOSS",
    title: "토스 페이지배너 전체이미지",
    size: "1080 × 1920", format: "PNG", filesize: "10MB 이하",
    guide: ["이미지만 제작 — 카피는 세팅 시 별도 입력", "상하좌우 여백 150px 이상", "투명 / 흰색 / 검정 배경 사용 금지", "심의필: 좌우 150px 상하 50px 이내 작성", "하단 텍스트 세팅 예정 → 하단 여백 넉넉하게"],
    warnings: ["투명/흰색/검정 배경 → 반려", "이미지 내 카피 삽입 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/264029_4월_진닭잡_JMK/1080x1920(토스)",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/fullpage"
  },
  {
    id: "toss-brand", group: "toss", badgeText: "TOSS",
    title: "토스 브랜드이미지",
    size: "800 × 800", format: "JPG(로고) / PNG(제품)", filesize: "10MB 이하",
    guide: ["로고이미지: JPG, 배경색 필수 (블랙 로고 시 배경색 반드시 지정)", "제품이미지: PNG, 배경 없는 누끼 권장", "전체 이미지 1/3 이상 로고가 차지하도록 크게 배치", "실제 노출 시 모서리 둥글게 처리 → 가능한 크게 제작"],
    warnings: ["로고 너무 작으면 실제 노출 시 식별 불가"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/260428_진닭잡_수정+추가소재_JMK/오브젝트",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/logo"
  },
  {
    id: "toss-board-part", group: "toss", badgeText: "TOSS",
    title: "토스 보드배너 부분이미지",
    size: "1200 × 1200", format: "JPG, PNG", filesize: "10MB 이하",
    guide: ["주요 사물 우측 배치 권장 (주요 문구와 겹침 방지)", "상하좌우 여백 70px 이상", "주요/보조/심의필 문구 영역 글자색: 검정 또는 흰색만 허용", "우측 하단 CTA 버튼과 주요 사물 겹치지 않게"],
    warnings: ["컬러 텍스트 → 주요 문구 영역 가독성 위반"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/260428_진닭잡_수정+추가소재_JMK/1200x675",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/thumbnail"
  },
  {
    id: "toss-board-full", group: "toss", badgeText: "TOSS",
    title: "토스 보드배너 전체이미지",
    size: "1200 × 675", format: "JPG, PNG", filesize: "10MB 이하",
    guide: ["이미지만 제작 — 카피는 세팅 시 별도 입력", "주요 사물 우측 배치 권장", "상하좌우 여백 70px 이상", "주요/보조/심의필 영역 글자색: 검정/흰색만 허용", "단색+이미지보다 배경에 디자인 요소 추가 선호"],
    warnings: ["텍스트 컬러 가독성 반드시 확인"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/260428_진닭잡_수정+추가소재_JMK/1200x675",
    link: "https://toss-ads.gitbook.io/guide/a-d/banner/creative/thumbnail"
  },
  {
    id: "toss-vote", group: "toss", badgeText: "TOSS",
    title: "토스 두근두근1등찍기",
    size: "1024 × 1024", format: "JPG, PNG", filesize: "-",
    guide: ["1:1 비율 정사각형", "테두리/마진 있는 이미지 사용 금지", "상품 최소 4개 ~ 최대 10개, 상품명 최대 14자"],
    warnings: ["직접적인 금액 기재, 현금성 리워드 상품 등록 불가", "실제 디바이스 이미지 사용 금지"],
    prevPath: "", link: "https://toss-ads.gitbook.io/guide/a-d/catalog_vote/creative"
  },
  {
    id: "baemin-side", group: "baemin", badgeText: "배민",
    title: "배민 사이배너",
    size: "720 × 240", format: "JPG, PNG", filesize: "1MB 이하",
    guide: ["흰색(#fff), 블랙(#000~#222) 배경 불가", "명도값 90% 이상 불가 (채도+명도 20~180 사이만)", "폰트: Pretendard 사용", "메인텍스트: Bold/43pt/#333(#fff)/자간-20", "서브텍스트: Regular/24pt/#333(#fff)/자간-20", "심의필: Regular/14pt or 18pt/자간-20", "버튼 포함 제작 필수 (디자인·위치 수정 불가)"],
    warnings: ["흰색/블랙 배경 → 반려", "명도 90% 초과 → 반려", "버튼 없이 제작 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/264029_4월_진닭잡_JMK/720x240(배민)",
    link: "https://bm-with-design.woowahan.com/hidden-link/bpsr9MDnZk/71"
  },
  {
    id: "baemin-banner", group: "baemin", badgeText: "배민",
    title: "배달함배너",
    size: "720 × 405", format: "JPG, PNG", filesize: "-",
    guide: ["배민 가이드 링크 내 PSD 파일 참고"],
    warnings: [], prevPath: "",
    link: "https://bm-with-design.woowahan.com/hidden-link/bpsr9MDnZk/71"
  },
  {
    id: "kakao-biz-obj", group: "kakao", badgeText: "카카오",
    title: "카카오 비즈보드 (오브젝트)",
    size: "315 × 258", format: "PNG (투명 배경)", filesize: "150KB 이하",
    guide: ["투명 배경 필수", "실제 오브젝트 가로 최소 219px", "텍스트 포함 불가 — 이미지 형태로만 제작"],
    warnings: ["텍스트 포함 → 반려", "오브젝트 가로 219px 미만 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/264029_4월_진닭잡_JMK/315x258(비즈보드)",
    link: "https://kakaobusiness.gitbook.io/main/ad/moment/performance/talkboard/content-guide"
  },
  {
    id: "kakao-biz-thumb", group: "kakao", badgeText: "카카오",
    title: "카카오 비즈보드 (썸네일)",
    size: "315 × 258", format: "JPG, PNG", filesize: "10MB 이하",
    guide: ["로고 우상단 지정 영역에 기입", "썸네일 영역 가득 차게 제작 권장", "텍스트 미기재 권장 — 기재 시 이미지 비중 50% 이하"],
    warnings: ["텍스트 이미지 비중 50% 초과 → 반려"],
    prevPath: "/cr/2026_업무요청/케이뱅크/4월/264029_4월_진닭잡_JMK/315x258(비즈보드)",
    link: "https://kakaobusiness.gitbook.io/main/ad/moment/performance/talkboard/content-guide"
  },
  {
    id: "kakao-biz-wide", group: "kakao", badgeText: "카카오",
    title: "카카오 비즈보드 (가이드 완화)",
    size: "1029 × 258", format: "PNG", filesize: "-",
    guide: ["완화 버전 가이드 PDF 별도 확인 필수"],
    warnings: [],
    prevPath: "/cr/2026_업무요청/케이뱅크/5월/260506_진닭잡_비즈보드_JMK",
    link: "https://t1.daumcdn.net/biz/%ec%8b%ac%ec%82%ac_2025/kakaobizboard_guide_openstyle_v2.pdf"
  },
  {
    id: "kakaopay-roll", group: "kakao", badgeText: "카카오페이",
    title: "카카오페이 롤스크린",
    size: "1371 × 1218", format: "PNG", filesize: "-",
    guide: ["PSD 반드시 사용", "로고+키비주얼+배경 통이미지로 합쳐서 제작", "메인카피: 12자씩 최대 2줄(합쳐 23자 이내)", "서브카피: 32자 이내 / 버튼텍스트: 10자 이내", "심의필: 60자 이내"],
    warnings: [], prevPath: "", link: ""
  },
  {
    id: "kakaopay-fit", group: "kakao", badgeText: "카카오페이",
    title: "카카오페이 핏배너",
    size: "400 × 1218", format: "PNG", filesize: "-",
    guide: ["첨부된 PSD 사용 필수", "이미지에 텍스트만 단독 불가 — 오브젝트 위에 텍스트 올리기", "텍스트와 결합한 오브젝트 1개만 가능", "메인카피: 12자 이내 / 서브카피: 15자 이내 / 심의필: 60자 이내"],
    warnings: ["텍스트 단독 사용 → 불가", "오브젝트 2개 이상 + 텍스트 → 불가"],
    prevPath: "", link: ""
  },
  {
    id: "ably-list", group: "ably", badgeText: "에이블리",
    title: "에이블리 혜택탭 리스트배너",
    size: "200 × 200", format: "JPG, PNG", filesize: "-",
    guide: ["PSD 가이드 링크 내 참고"], warnings: [], prevPath: "",
    link: "https://ablyda.oopy.io/asset"
  },
  {
    id: "ably-search", group: "ably", badgeText: "에이블리",
    title: "에이블리 검색 페이지배너",
    size: "750 × 96", format: "PNG, JPG", filesize: "-",
    guide: ["PSD 가이드 링크 내 참고"], warnings: [], prevPath: "",
    link: "https://ablyda.oopy.io/asset"
  },
  {
    id: "ably-mypage", group: "ably", badgeText: "에이블리",
    title: "에이블리 마이페이지배너",
    size: "720 × 156", format: "PNG, JPG", filesize: "-",
    guide: ["PSD 가이드 링크 내 참고"], warnings: [], prevPath: "",
    link: "https://ablyda.oopy.io/asset"
  },
  {
    id: "ably-delivery", group: "ably", badgeText: "에이블리",
    title: "에이블리 배송조회 페이지배너",
    size: "1200 × 675", format: "PNG, JPG", filesize: "-",
    guide: ["PSD 가이드 링크 내 참고"], warnings: [], prevPath: "",
    link: "https://ablyda.oopy.io/asset"
  },
  {
    id: "meta-feed", group: "meta", badgeText: "META",
    title: "메타 피드",
    size: "1080×1080(1:1) / 1080×1350(4:5)", format: "JPG, PNG", filesize: "30MB 이하",
    guide: ["정방형: 1:1 비율 1080×1080", "세로형: 4:5 비율 1080×1350", "세이프티존 반드시 확인"],
    warnings: [], prevPath: "", link: ""
  },
  {
    id: "meta-story", group: "meta", badgeText: "META",
    title: "메타 스토리 / 릴스",
    size: "1080 × 1920", format: "JPG, PNG", filesize: "30MB 이하",
    guide: ["9:16 비율", "상/하단 세이프티존 확인 — 프로필·CTA 버튼 겹침 주의", "상하단 주요 텍스트/디자인 요소 배치 금지", "템플릿화 권장"],
    warnings: ["상하단 텍스트 → UI와 겹쳐 노출 품질 저하"],
    prevPath: "", link: ""
  },
  {
    id: "daangn-display", group: "other", badgeText: "당근",
    title: "당근 디스플레이",
    size: "200 × 200 이상 (1:1)", format: "JPG, PNG", filesize: "-",
    guide: ["1:1 비율 정사각형", "최소 200×200px"],
    warnings: [], prevPath: "",
    link: "https://businessdaangn.gitbook.io/business.daangn/ads-pro/product/creative"
  },
  {
    id: "daangn-walk", group: "other", badgeText: "당근",
    title: "당근 동네걷기",
    size: "90 × 56 (전달: 3배수 이상)", format: "JPG, PNG", filesize: "4MB 이하",
    guide: ["전달 이미지 기존 규격 3배수 이상 (고해상도)", "모서리 radius 8px — 전달 시 0으로 전달", "배경 #F7F8F9와 유사 컬러 사용 불가", "형광색, 강한 그라데이션 불가", "CI/BI 외 텍스트 이미지 불가"],
    warnings: ["#F7F8F9 유사 배경 → 불가", "텍스트 포함 이미지 → 불가"],
    prevPath: "", link: ""
  },
  {
    id: "timoney", group: "other", badgeText: "티머니GO",
    title: "티머니GO 홈화면 콘텐츠배너",
    size: "1005 × 360", format: "JPG, PNG", filesize: "-",
    guide: ["링크 내 가이드 확인"], warnings: [], prevPath: "",
    link: "https://tmoneymobility.gitbook.io/tmoney-ads-guidelines/home/contents-banner"
  },
  {
    id: "yeolpumta", group: "other", badgeText: "열품타",
    title: "열품타 전면팝업",
    size: "1080 × 1566", format: "PNG, JPG", filesize: "200KB 이하 권장",
    guide: ["200KB 이하 권장"], warnings: [], prevPath: "", link: ""
  },
  {
    id: "alwayze", group: "other", badgeText: "올웨이즈",
    title: "올웨이즈 올팜",
    size: "144 × 144 (누끼)", format: "JPG, PNG, AI, PSD", filesize: "-",
    guide: ["누끼 이미지 제작"], warnings: [], prevPath: "", link: ""
  }
];

const GROUPS = [
  { id: "all", label: "전체 보기", icon: "◈" },
  { id: "toss", label: "토스", icon: "●", color: "#0066FF" },
  { id: "baemin", label: "배달의민족", icon: "●", color: "#00C8A0" },
  { id: "kakao", label: "카카오 / 카카오페이", icon: "●", color: "#FEE500" },
  { id: "ably", label: "에이블리", icon: "●", color: "#FF0060" },
  { id: "meta", label: "메타", icon: "●", color: "#1877F2" },
  { id: "other", label: "기타 매체", icon: "●", color: "#999" },
];

const BADGE_COLORS = {
  TOSS: { bg: "#E6F1FF", color: "#0055DD" },
  배민: { bg: "#E0FBF3", color: "#007A58" },
  카카오: { bg: "#FFFACC", color: "#664000" },
  카카오페이: { bg: "#FFF0CC", color: "#804000" },
  에이블리: { bg: "#FFE5F0", color: "#99003D" },
  META: { bg: "#E6EDFF", color: "#0033AA" },
  당근: { bg: "#FFE8D5", color: "#882200" },
  default: { bg: "#F0F0F0", color: "#555" },
};

function fmt(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────
async function loadStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
async function saveStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { }
}

// ─── EDIT MODAL ─────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({ ...item, guide: [...item.guide], warnings: [...item.warnings] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setList = (k, i, v) => setForm(f => { const a = [...f[k]]; a[i] = v; return { ...f, [k]: a }; });
  const addItem = (k) => setForm(f => ({ ...f, [k]: [...f[k], ""] }));
  const delItem = (k, i) => setForm(f => { const a = f[k].filter((_, j) => j !== i); return { ...f, [k]: a }; });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0D0F1A" }}>가이드 수정</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999", padding: "2px 6px" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[["title","매체 이름"],["size","사이즈"],["format","파일 형식"],["filesize","파일 용량"],["prevPath","이전 작업 경로"],["link","공식 가이드 링크"]].map(([k, label]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>{label}</label>
              <input value={form[k] || ""} onChange={e => set(k, e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, outline: "none", color: "#0D0F1A" }} />
            </div>
          ))}
          {[["guide","📋 제작 가이드","#0114A7"],["warnings","⚠️ 주의 / 반려 기준","#E03A3A"]].map(([k, label, col]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>{label}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {form[k].map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 6 }}>
                    <input value={v} onChange={e => setList(k, i, e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", border: "1px solid #ddd", borderRadius: 7, fontSize: 12.5, outline: "none", color: "#0D0F1A" }} />
                    <button onClick={() => delItem(k, i)} style={{ background: "none", border: "1px solid #eee", borderRadius: 7, padding: "0 10px", cursor: "pointer", color: "#ccc", fontSize: 13 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addItem(k)} style={{ alignSelf: "flex-start", fontSize: 12, color: col, background: "none", border: `1px dashed ${col}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>+ 항목 추가</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #eee", display: "flex", gap: 8, justifyContent: "flex-end", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>취소</button>
          <button onClick={() => onSave(form)} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "#0114A7", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ─── MEDIA CARD ─────────────────────────────────────────────────────────────
function MediaCard({ item, onEdit, onAddCard }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();
  const bc = BADGE_COLORS[item.badgeText] || BADGE_COLORS.default;

  // load persisted files
  useEffect(() => {
    loadStorage("files:" + item.id).then(d => { if (d) setFiles(d); });
  }, [item.id]);

  const persistFiles = useCallback(async (arr) => {
    setFiles(arr);
    // store only metadata + base64 data
    await saveStorage("files:" + item.id, arr);
  }, [item.id]);

  const addFiles = async (fileList) => {
    const newFiles = await Promise.all(Array.from(fileList).map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({ name: f.name, size: f.size, type: f.type, data: e.target.result });
      r.readAsDataURL(f);
    })));
    persistFiles([...files, ...newFiles]);
  };

  const delFile = (i) => persistFiles(files.filter((_, j) => j !== i));

  return (
    <div style={{
      background: "#fff", border: open ? "1.5px solid #0114A7" : "1px solid #E5E7EF",
      borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: open ? "0 4px 24px rgba(1,20,167,0.1)" : "none"
    }}>
      {/* HEAD */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: "16px 18px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: bc.bg, color: bc.color, marginBottom: 7, letterSpacing: "0.03em" }}>{item.badgeText}</span>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0D0F1A", lineHeight: 1.35 }}>{item.title}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, background: "#EEF0FF", padding: "4px 10px", borderRadius: 7 }}>
            <span style={{ fontSize: 11 }}>📐</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0114A7", fontVariantNumeric: "tabular-nums" }}>{item.size}</span>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
            {[["형식", item.format], ["용량", item.filesize]].map(([l, v]) => (
              <div key={l} style={{ fontSize: 11.5 }}>
                <span style={{ color: "#aaa", marginRight: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</span>
                <span style={{ color: "#555" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onEdit(item); }}
            style={{ fontSize: 11, color: "#0114A7", background: "#EEF0FF", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontWeight: 600 }}>수정</button>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: open ? "#EEF0FF" : "#F3F4F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: open ? "#0114A7" : "#aaa", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
        </div>
      </div>

      {/* BODY */}
      {open && (
        <div style={{ borderTop: "1px solid #F0F1F5" }}>
          <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {item.guide.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0114A7", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>📋 제작 가이드</div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {item.guide.map((g, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "#444", display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0114A7", flexShrink: 0, marginTop: 7 }}></span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.warnings.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#E03A3A", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>⚠️ 주의 / 반려 기준</div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {item.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "#C02020", display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E03A3A", flexShrink: 0, marginTop: 7 }}></span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.prevPath && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0A8A4E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>📁 이전 작업 경로</div>
                <div style={{ background: "#F4F5F8", border: "1px solid #E5E7EF", borderRadius: 7, padding: "8px 12px", fontSize: 11, color: "#555", fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.6 }}>{item.prevPath}</div>
              </div>
            )}

            {/* FILE UPLOAD */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#C07800", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>📦 참고 PSD / 파일</div>
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${drag ? "#0114A7" : "#B8C2FF"}`, borderRadius: 10,
                  padding: "14px", textAlign: "center", cursor: "pointer", transition: "all 0.15s",
                  background: drag ? "#E8EBFF" : "#EEF0FF"
                }}>
                <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
                <div style={{ fontSize: 13, color: "#0114A7", fontWeight: 600 }}>☁️ 파일 업로드</div>
                <div style={{ fontSize: 11, color: "#8892CC", marginTop: 3 }}>클릭하거나 드래그해서 올려주세요 · PSD, PNG, JPG 등</div>
              </div>
              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#F4F5F8", border: "1px solid #E5E7EF", borderRadius: 8, padding: "8px 12px" }}>
                      <span style={{ fontSize: 18 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0D0F1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>{fmt(f.size)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <a href={f.data} download={f.name}
                          style={{ fontSize: 11, fontWeight: 600, color: "#0114A7", background: "#EEF0FF", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", textDecoration: "none" }}>⬇ 다운로드</a>
                        <button onClick={() => delFile(i)}
                          style={{ fontSize: 11, color: "#bbb", background: "none", border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#0114A7", background: "#EEF0FF", border: "1px solid rgba(1,20,167,0.2)", borderRadius: 7, padding: "7px 14px", textDecoration: "none", alignSelf: "flex-start" }}>
                🔗 공식 가이드 보기
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD CARD MODAL ──────────────────────────────────────────────────────────
function AddCardModal({ onSave, onClose }) {
  const [form, setForm] = useState({ group: "toss", badgeText: "", title: "", size: "", format: "", filesize: "", guide: [""], warnings: [], prevPath: "", link: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setList = (k, i, v) => setForm(f => { const a = [...f[k]]; a[i] = v; return { ...f, [k]: a }; });
  const addItem = (k) => setForm(f => ({ ...f, [k]: [...f[k], ""] }));
  const delItem = (k, i) => setForm(f => ({ ...f, [k]: f[k].filter((_, j) => j !== i) }));

  const handleSave = () => {
    if (!form.title || !form.size) return alert("매체 이름과 사이즈는 필수입니다");
    onSave({ ...form, id: "custom-" + Date.now(), guide: form.guide.filter(Boolean), warnings: form.warnings.filter(Boolean) });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0D0F1A" }}>새 매체 추가</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>그룹</label>
            <select value={form.group} onChange={e => set("group", e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, color: "#0D0F1A", background: "#fff" }}>
              {GROUPS.filter(g => g.id !== "all").map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
          {[["badgeText","뱃지 텍스트 (예: TOSS)"],["title","매체 이름 *"],["size","사이즈 *"],["format","파일 형식"],["filesize","파일 용량"],["prevPath","이전 작업 경로"],["link","공식 가이드 링크"]].map(([k, label]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>{label}</label>
              <input value={form[k] || ""} onChange={e => set(k, e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, outline: "none", color: "#0D0F1A" }} />
            </div>
          ))}
          {[["guide","📋 제작 가이드","#0114A7"],["warnings","⚠️ 주의 / 반려","#E03A3A"]].map(([k, label, col]) => (
            <div key={k}>
              <label style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>{label}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {form[k].map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 6 }}>
                    <input value={v} onChange={e => setList(k, i, e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", border: "1px solid #ddd", borderRadius: 7, fontSize: 12.5, outline: "none", color: "#0D0F1A" }} />
                    <button onClick={() => delItem(k, i)} style={{ background: "none", border: "1px solid #eee", borderRadius: 7, padding: "0 10px", cursor: "pointer", color: "#ccc", fontSize: 13 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addItem(k)} style={{ alignSelf: "flex-start", fontSize: 12, color: col, background: "none", border: `1px dashed ${col}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>+ 항목 추가</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #eee", display: "flex", gap: 8, justifyContent: "flex-end", position: "sticky", bottom: 0, background: "#fff" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}>취소</button>
          <button onClick={handleSave} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "#0114A7", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>추가</button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKLIST ───────────────────────────────────────────────────────────────
const CHECKLIST = [
  { section: "📐 사이즈 / 파일", items: ["매체별 정확한 사이즈 확인 (px 단위)","파일 형식 확인 (JPG/PNG/AI/PSD 구분)","파일 용량 제한 이내인지 확인"] },
  { section: "🏷️ 로고 / 브랜드", items: ["케이뱅크 로고 가려지지 않도록 배치","키컬러 코드 확인: 메인 #0114A7 / 서브 #4262FF","로고 위치 매체 가이드 준수 (좌상단 고정 등)"] },
  { section: "⚖️ 금융 심의", items: ["심의필 문구 포함 여부 확인","심의필 위치·폰트·크기 매체 가이드 준수","과도한 분할/크롭/문구 중복(50% 이상) 없는지 확인"] },
  { section: "🎨 디자인 퀄리티", items: ["이미지 내 텍스트 비율 30% 이하 확인","텍스트 가독성 확인 (흑/백 계열 적절히 사용)","소재가 너무 단순하지 않도록 디자인 요소 추가","여백(safe zone) 매체별 기준 준수"] },
  { section: "📦 납품", items: ["납품 경로에 업로드 완료","파일명 규칙 확인","광고주 컨펌 필요 여부 확인"] },
];

function ChecklistView() {
  const [checked, setChecked] = useState({});
  useEffect(() => { loadStorage("checklist").then(d => { if (d) setChecked(d); }); }, []);
  const toggle = async (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next); await saveStorage("checklist", next);
  };
  const reset = async () => { setChecked({}); await saveStorage("checklist", {}); };
  const total = CHECKLIST.flatMap(s => s.items).length;
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D0F1A", marginBottom: 4 }}>작업 전 체크리스트</h1>
          <p style={{ fontSize: 13, color: "#888" }}>소재 제작 및 납품 전 반드시 확인 · 체크 내용은 자동 저장됩니다</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: done === total ? "#0A8A4E" : "#0114A7" }}>{done} / {total}</div>
          <button onClick={reset} style={{ fontSize: 11, color: "#aaa", background: "none", border: "1px solid #eee", borderRadius: 6, padding: "4px 10px", cursor: "pointer", marginTop: 4 }}>초기화</button>
        </div>
      </div>
      <div style={{ height: 4, background: "#EEF0FF", borderRadius: 99, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#0114A7", borderRadius: 99, width: `${(done / total) * 100}%`, transition: "width 0.3s" }} />
      </div>
      {CHECKLIST.map(({ section, items }) => (
        <div key={section} style={{ background: "#fff", border: "1px solid #E5E7EF", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: "#0D0F1A", background: "#F7F8FC", borderBottom: "1px solid #E5E7EF" }}>{section}</div>
          {items.map((item, i) => {
            const key = section + i;
            return (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 18px", borderBottom: i < items.length - 1 ? "1px solid #F0F1F5" : "none", cursor: "pointer" }}>
                <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)}
                  style={{ width: 16, height: 16, marginTop: 1, accentColor: "#0114A7", flexShrink: 0, cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: checked[key] ? "#bbb" : "#444", textDecoration: checked[key] ? "line-through" : "none", lineHeight: 1.5 }}>{item}</span>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [cards, setCards] = useState(INITIAL_DATA);
  const [activeGroup, setActiveGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  // load persisted card data
  useEffect(() => {
    loadStorage("cards-data").then(d => { if (d && d.length) setCards(d); });
  }, []);

  const persistCards = async (next) => {
    setCards(next); setSaving(true);
    await saveStorage("cards-data", next);
    setSaving(false);
  };

  const handleSaveEdit = (updated) => {
    persistCards(cards.map(c => c.id === updated.id ? updated : c));
    setEditItem(null);
  };

  const handleAddCard = (newCard) => {
    persistCards([...cards, newCard]);
    setShowAdd(false);
  };

  const handleDeleteCard = (id) => {
    if (!confirm("이 매체 카드를 삭제할까요?")) return;
    persistCards(cards.filter(c => c.id !== id));
  };

  const filtered = cards.filter(c => {
    const matchGroup = activeGroup === "all" || c.group === activeGroup;
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.size.toLowerCase().includes(q) || c.badgeText.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  const activeLabel = GROUPS.find(g => g.id === activeGroup)?.label || "전체 보기";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F8FC", fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 220, background: "#fff", borderRight: "1px solid #E5E7EF", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", overflowY: "auto", zIndex: 100, flexShrink: 0 }}>
          <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #F0F1F5" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "#0114A7", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>K</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0F1A", lineHeight: 1.3 }}>케이뱅크 제작 가이드</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>v1.0 · 2025.05</div>
          </div>
          <div style={{ padding: "12px 8px 4px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px 6px" }}>NAVIGATION</div>
            {[{ id: "overview", label: "🏠 공통 가이드" }, { id: "checklist", label: "✅ 체크리스트" }].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveGroup(id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12.5, color: activeGroup === id ? "#0114A7" : "#666", background: activeGroup === id ? "#EEF0FF" : "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontWeight: activeGroup === id ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 8px 4px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px 6px" }}>매체별 가이드</div>
            {GROUPS.map(g => (
              <button key={g.id} onClick={() => setActiveGroup(g.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12.5, color: activeGroup === g.id ? "#0114A7" : "#666", background: activeGroup === g.id ? "#EEF0FF" : "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontWeight: activeGroup === g.id ? 700 : 400 }}>
                {g.id !== "all" && <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color, border: g.id === "kakao" ? "1px solid #ddd" : "none", flexShrink: 0 }} />}
                {g.id === "all" && <span style={{ fontSize: 11 }}>◈</span>}
                {g.label}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#ccc", fontWeight: 400 }}>
                  {g.id === "all" ? cards.length : cards.filter(c => c.group === g.id).length}
                </span>
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 8px", marginTop: "auto", borderTop: "1px solid #F0F1F5" }}>
            <button onClick={() => setShowAdd(true)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px", border: "1.5px dashed rgba(1,20,167,0.3)", borderRadius: 9, background: "#EEF0FF", color: "#0114A7", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              + 매체 추가
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ marginLeft: sidebarOpen ? 220 : 0, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* TOPBAR */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EF", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#888", padding: "4px 6px", borderRadius: 6 }}>☰</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0D0F1A" }}>{activeLabel}</span>
            {saving && <span style={{ fontSize: 11, color: "#0A8A4E", background: "#E8F8F0", padding: "3px 8px", borderRadius: 99 }}>💾 저장 중...</span>}
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#ccc" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="매체명, 사이즈 검색..."
              style={{ width: 220, height: 34, border: "1px solid #ddd", borderRadius: 8, padding: "0 12px 0 32px", fontSize: 13, outline: "none", background: "#F7F8FC", color: "#0D0F1A" }} />
          </div>
        </div>

        <div style={{ padding: "24px", flex: 1 }}>
          {/* OVERVIEW */}
          {activeGroup === "overview" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D0F1A", marginBottom: 4 }}>공통 디자인 가이드</h1>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>케이뱅크 광고 소재 제작 시 모든 매체에 공통 적용</p>
              <div style={{ background: "linear-gradient(135deg,#0114A7,#4262FF)", borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🏦 케이뱅크 브랜드 공통 주의사항</div>
                {["로고가 가려지지 않도록 제작 (복잡한 패턴·유사 색상 배경 위 아이콘 사용 금지)","파란색만 단조롭게 사용하지 않고 다양한 강조색 활용","소재가 너무 단순해 보이지 않도록 디자인 요소 추가","이미지 내 문구 비율 30% 이하 권장 · 가독성 우선","금융 광고: 심의필 필수 · 과장 표현 금지 · 과도한 분할/크롭 금지"].map((t, i) => (
                  <div key={i} style={{ fontSize: 12.5, opacity: 0.9, display: "flex", gap: 7, alignItems: "flex-start", marginTop: 5 }}>
                    <span style={{ opacity: 0.5, marginTop: 2 }}>·</span><span>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {[["메인 컬러","#0114A7"],["서브 컬러","#4262FF"],["화이트","#FFFFFF"]].map(([name, hex]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #E5E7EF", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: hex, border: hex === "#FFFFFF" ? "1px solid #ddd" : "none" }} />
                    <div><div style={{ fontSize: 11, fontWeight: 700, color: "#0D0F1A" }}>{name}</div><div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{hex}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
                {[
                  ["소스 파일 경로", "/cr/2026_업무요청/케이뱅크/#소스/★로고\n/cr/2026_업무요청/케이뱅크/#소스/26.04_미성년"],
                  ["업로드 경로", "/cr/2026_업무요청/케이뱅크"],
                  ["담당자", "박현 대리님 / 유가람 매니저님 / 임주희 매니저님\n문의: #design-ad"],
                  ["브랜드 가이드", "https://brand.kbanknow.com/resource.html"]
                ].map(([title, body]) => (
                  <div key={title} style={{ background: "#fff", border: "1px solid #E5E7EF", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0D0F1A", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: "#0114A7", display: "inline-block" }}></span>{title}
                    </div>
                    {String(body).startsWith("http") ? (
                      <a
                        href={body}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11.5,
                          color: "#0114A7",
                          lineHeight: 1.6,
                          textDecoration: "underline",
                          wordBreak: "break-all"
                        }}
                      >
                        {body}
                      </a>
                    ) : (
                      <p style={{ fontSize: 11.5, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line", margin: 0 }}>{body}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHECKLIST */}
          {activeGroup === "checklist" && <ChecklistView />}

          {/* MEDIA GRID */}
          {!["overview","checklist"].includes(activeGroup) && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D0F1A", marginBottom: 3 }}>{activeLabel}</h1>
                  <p style={{ fontSize: 13, color: "#888" }}>{filtered.length}개 매체 · 카드 클릭해서 가이드 펼치기 · 수정 버튼으로 내용 편집</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0114A7", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  + 매체 추가
                </button>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#bbb" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                  <p style={{ fontSize: 14 }}>검색 결과가 없습니다</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                  {filtered.map(item => (
                    <div key={item.id} style={{ position: "relative" }}>
                      <MediaCard item={item} onEdit={setEditItem} />
                      {item.id.startsWith("custom-") && (
                        <button onClick={() => handleDeleteCard(item.id)}
                          style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 12, padding: 4 }}
                          title="삭제">🗑</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #E5E7EF", background: "#fff", fontSize: 11, color: "#bbb", display: "flex", justifyContent: "space-between" }}>
          <span>케이뱅크 매체별 제작 가이드 v1.0</span>
          <span>업데이트: 2026.05.19 · 데이터 자동 저장됨</span>
        </div>
      </div>

      {editItem && <EditModal item={editItem} onSave={handleSaveEdit} onClose={() => setEditItem(null)} />}
      {showAdd && <AddCardModal onSave={handleAddCard} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
