          {/* OVERVIEW */}
          {activeGroup === "overview" && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D0F1A", marginBottom: 4 }}>공통 디자인 가이드</h1>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>케이뱅크 광고 소재 제작 시 모든 매체에 공통 적용</p>

              <div style={{ background: "linear-gradient(135deg,#0114A7,#4262FF)", borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🏦 케이뱅크 브랜드 공통 주의사항</div>
                {[
                  "로고가 가려지지 않도록 제작 (복잡한 패턴·유사 색상 배경 위 아이콘 사용 금지)",
                  "파란색만 단조롭게 사용하지 않고 다양한 강조색 활용",
                  "소재가 너무 단순해 보이지 않도록 디자인 요소 추가",
                  "이미지 내 문구 비율 30% 이하 권장 · 가독성 우선",
                  "금융 광고: 심의필 필수 · 과장 표현 금지 · 과도한 분할/크롭 금지"
                ].map((t, i) => (
                  <div key={i} style={{ fontSize: 12.5, opacity: 0.9, display: "flex", gap: 7, alignItems: "flex-start", marginTop: 5 }}>
                    <span style={{ opacity: 0.5, marginTop: 2 }}>·</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  ["메인 컬러", "#0114A7"],
                  ["서브 컬러", "#4262FF"],
                  ["화이트", "#FFFFFF"]
                ].map(([name, hex]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #E5E7EF", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: hex, border: hex === "#FFFFFF" ? "1px solid #ddd" : "none" }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0D0F1A" }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{hex}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
                {[
                  {
                    title: "소스 파일 경로",
                    body: "/cr/2026_업무요청/케이뱅크/#소스/★로고\n/cr/2026_업무요청/케이뱅크/#소스/26.04_미성년"
                  },
                  {
                    title: "업로드 경로",
                    body: "/cr/2026_업무요청/케이뱅크"
                  },
                  {
                    title: "담당자",
                    body: "박현 대리님 / 유가람 매니저님 / 임주희 매니저님"
                  },
                  {
                    title: "브랜드 가이드",
                    body: "https://brand.kbanknow.com/resource.html"
                  }
                ].map(({ title, body }) => (
                  <div key={title} style={{ background: "#fff", border: "1px solid #E5E7EF", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0D0F1A", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: "#0114A7", display: "inline-block" }}></span>
                      {title}
                    </div>

                    {body.startsWith("http") ? (
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
                      <p style={{ fontSize: 11.5, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line", margin: 0 }}>
                        {body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
