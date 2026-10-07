/* Star Bao 首頁互動：選單、產品篩選、產品詳情、自我檢測（寫入 CRM）、推薦碼 */
(function () {
  "use strict";
  var SB = window.SB, U = SB.U, D = SB.data, icon = SB.icon;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA = (function () { try { return SB.Store.load().settings.company.whatsapp || D.brand.whatsapp; } catch (e) { return D.brand.whatsapp; } })();

  // 若頁面未經 build（直接開模板）也能顯示圖示
  $$("i[data-ico]").forEach(function (el) { el.outerHTML = icon(el.getAttribute("data-ico")); });
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---- 推薦碼 ?ref=CODE ---- */
  var REF = SB.Ref.capture();
  var refUser = REF ? SB.Store.userByCode(REF) : null;
  if (REF) {
    var rb = $("#refBanner");
    if (rb) { rb.style.display = "block"; rb.textContent = "您的專屬顧問推薦碼：" + REF + (refUser ? "（" + refUser.name.replace(/（示範）/, "") + "）" : ""); }
  }
  function waText(msg) { return msg + (REF ? "\n（推薦碼：" + REF + "）" : ""); }
  function refreshWA() {
    $$(".js-wa").forEach(function (a) { a.href = U.wa(WA, waText(a.getAttribute("data-msg") || "您好，我想了解星寶 Star Bao。")); });
  }
  refreshWA();

  /* ---- header / nav ---- */
  var header = $(".site-header");
  window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });
  var tog = $("#navToggle"), links = $("#navLinks");
  tog.addEventListener("click", function () { var o = links.classList.toggle("open"); tog.setAttribute("aria-expanded", o); });
  $$("#navLinks a").forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); }); });

  /* ---- reveal ---- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* ---- 產品篩選 ---- */
  function filter(sid) {
    $$(".filter-bar button").forEach(function (b) { var on = b.getAttribute("data-filter") === sid; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    $$(".prod-card").forEach(function (c) {
      var show = sid === "all" ? true : (" " + c.getAttribute("data-sols") + " ").indexOf(" " + sid + " ") > -1;
      c.hidden = !show; if (show) c.classList.add("in");
    });
  }
  $$(".filter-bar button").forEach(function (b) { b.addEventListener("click", function () { filter(b.getAttribute("data-filter")); }); });
  $$(".sol-card").forEach(function (c) {
    c.addEventListener("click", function () { filter(c.getAttribute("data-sol")); $("#products").scrollIntoView({ behavior: "smooth" }); });
  });

  /* ---- 產品詳情 ---- */
  var dlg = $("#pmodal");
  function openProduct(id) {
    var p = SB.prod(id); if (!p) return;
    var sols = p.solutions.primary.concat(p.solutions.secondary).map(function (s) { var so = SB.sol(s); return so ? '<span class="tag">' + so.name + "</span>" : ""; }).join(" ");
    dlg.innerHTML =
      '<button class="pm-close" aria-label="關閉" data-close>' + icon("x") + "</button>" +
      '<div class="pm-grid"><div class="pm-img"><img src="' + p.image + '" alt="' + U.esc(p.imageAlt || p.name) + '"></div>' +
      '<div class="pm-body"><span class="eyebrow">' + U.esc(p.series) + "</span>" +
      '<h3 id="pmTitle">' + U.esc(p.name) + "</h3><p><strong>" + U.esc(p.tagline) + "</strong>｜" + U.esc(p.category) + "｜" + U.esc(p.format) + "</p>" +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 6px">' + sols + "</div>" +
      "<p>" + U.esc(p.description) + "</p>" +
      "<h4>" + icon("star") + "亮點特色</h4><ul>" + p.highlights.map(function (h) { return "<li>" + U.esc(h) + "</li>"; }).join("") + "</ul>" +
      "<h4>" + icon("patent") + "專利原料</h4>" + (p.patents.length ? "<ul>" + p.patents.map(function (h) { return "<li>" + U.esc(h) + "</li>"; }).join("") + "</ul>" : '<p><span class="tag gray">資料待補</span></p>') +
      "<h4>" + icon("check") + "特色重點</h4><ol>" + p.benefits.map(function (h) { return "<li>" + U.esc(h) + "</li>"; }).join("") + "</ol>" +
      "<h4>" + icon("leaf") + "明星成分</h4><ul class='ing-list'>" + p.ingredients.map(function (i) { return "<li><b>" + U.esc(i.name) + "</b>" + U.esc(i.desc) + "</li>"; }).join("") + "</ul>" +
      "<h4>" + icon("users") + "適合族群</h4><p>" + p.suitableFor.map(U.esc).join("、") + "</p>" +
      "<h4>" + icon("clock") + "食用／使用方式</h4><p>" + U.esc(p.usage) + "</p>" +
      (p.cautions ? "<p style='font-size:.9rem;color:#8E5F0C'>⚠️ " + U.esc(p.cautions) + "</p>" : "") +
      '<div class="disc">' + U.esc(p.line === "supplement" ? D.disclaimers.supplement : D.disclaimers.skincare) + "</div>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn btn-wa" target="_blank" rel="noopener" href="' + U.wa(WA, waText("您好，我想了解「" + p.name + "」，適合我的狀況嗎？")) + '">' + icon("whatsapp") + "WhatsApp 詢問此產品</a>" +
      '<a class="btn btn-ghost" href="#quiz" data-close>' + icon("pulse") + "先做自我檢測</a></div>" +
      "</div></div>";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"); if (o) { openProduct(o.getAttribute("data-open")); return; }
    var card = e.target.closest(".prod-img"); if (card) { openProduct(card.closest(".prod-card").getAttribute("data-id")); return; }
    if (e.target.closest("[data-close]")) { dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  if (location.hash.indexOf("#p-") === 0) setTimeout(function () { openProduct(location.hash.slice(3)); }, 300);

  /* ---- 自我檢測 ---- */
  var R = SB.RULES;
  var QUIZ_SYMPTOMS = ["s_hard", "s_light", "m_stress", "e_tired", "e_cold", "g_const", "g_bloat", "b_sleepy", "b_sweet", "w_gain", "w_crave", "x_face", "x_leg", "c_sit", "k_dull", "k_dry", "f_period", "m_vital"];
  var symMap = {}; R.groups.forEach(function (g) { g.items.forEach(function (i) { symMap[i.id] = i; }); });
  $("#qSymptoms").innerHTML = QUIZ_SYMPTOMS.map(function (id) { return '<label class="chip"><input type="checkbox" name="sym" value="' + id + '"><span>' + symMap[id].label + "</span></label>"; }).join("");
  $("#qLifestyle").innerHTML = R.lifestyle.filter(function (q) { return ["sleepHours", "sugary", "exercise", "stress"].indexOf(q.id) > -1; }).map(function (q) {
    return '<div class="q-row"><span class="lbl">' + q.label + '</span><div class="chips-select">' + q.options.map(function (o) {
      return '<label class="chip"><input type="radio" name="ls_' + q.id + '" value="' + o.v + '"><span>' + o.label + "</span></label>";
    }).join("") + "</div></div>";
  }).join("");
  $("#qRedflags").innerHTML = R.redFlags.slice(0, 8).map(function (r) { return '<label class="chip red"><input type="checkbox" name="rf" value="' + r.id + '"><span>' + r.label + "</span></label>"; }).join("");
  $("#qCautions").innerHTML = R.cautions.map(function (r) { return '<label class="chip"><input type="checkbox" name="ct" value="' + r.id + '"><span>' + r.label + "</span></label>"; }).join("");

  var step = 1, last = 4, form = $("#quizForm");
  function show(n) {
    step = n;
    $$(".quiz-step", form).forEach(function (s) { s.classList.toggle("active", +s.getAttribute("data-step") === n); });
    $("#quizBar").style.width = Math.min(100, n / (last + 1) * 100) + "%";
    $("#qPrev").disabled = n === 1;
    $("#qNext").innerHTML = n === last ? "查看我的結果" + icon("arrow") : "下一步" + icon("arrow");
    $("#quizNav").style.display = n > last ? "none" : "flex";
  }
  function vals(name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
  $("#qPrev").addEventListener("click", function () { if (step > 1) show(step - 1); });
  $("#qNext").addEventListener("click", function () {
    if (step === 1 && !vals("sym").length) { if (!confirm("尚未勾選任何狀況，確定要繼續嗎？")) return; }
    if (step < last) { show(step + 1); $("#quizCard").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    finish();
  });
  $("#qConsent").addEventListener("change", function () { if (this.checked) $("#qConsentErr").hidden = true; });

  function finish() {
    var ls = {}; R.lifestyle.forEach(function (q) { var v = vals("ls_" + q.id)[0]; if (v) ls[q.id] = v; });
    var a = SB.assess({ symptoms: vals("sym"), lifestyle: ls, redFlags: vals("rf"), cautions: vals("ct") });
    var name = $("#qName").value.trim(), phone = $("#qPhone").value.trim(), consent = $("#qConsent").checked;
    var cfg = SB.config(), gender = $("#qGender").value, age = $("#qAge").value;
    var done = function (saved) { renderResult(a, name, saved); show(5); $("#quizCard").scrollIntoView({ behavior: "smooth", block: "start" }); };
    // PDPA：同意框預設不勾選；有填聯絡資料但未勾選 → 不送出名單，停在此步提示
    if ((name || phone) && !consent) { var er = $("#qConsentErr"); er.hidden = false; $("#qConsent").focus(); er.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!(name || phone)) { done(false); return; }
    try {
      if (cfg.leadWebhook) fetch(cfg.leadWebhook, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ name: name, phone: phone, gender: gender, age: age, ref: REF, focus: a.focus, products: a.products.map(function (p) { return p.name; }), redFlags: a.redFlagLabels, at: new Date().toISOString(), page: location.href }) }).catch(function () {});
    } catch (e2) {}
    if (cfg.cloud) {
      // 雲端模式：只寫入 Supabase leads（匿名只能新增，伺服器依推薦碼指派經銷商並建立客戶／任務）
      var btn = $("#qNext"); btn.disabled = true; btn.textContent = "送出中⋯";
      var body = { name: name || null, phone: U.normPhone(phone) || null, gender: gender || null, age: age ? parseInt(age, 10) || null : null, ref_code: REF || null, consent: true,
        assessment: { focus: a.focus, symptoms: a.symptoms, lifestyle: a.lifestyle, redFlags: a.redFlags, redFlagLabels: a.redFlagLabels, cautions: a.cautions, cautionLabels: a.cautionLabels, scores: a.scores,
          products: a.products.map(function (p) { return { id: p.id, name: p.name, score: p.score, reasons: p.reasons }; }), at: a.at },
        page_url: location.href.slice(0, 500), user_agent: navigator.userAgent.slice(0, 400) };
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
      fetch(cfg.supabaseUrl + "/rest/v1/leads", { method: "POST", signal: ctl ? ctl.signal : undefined, headers: Object.assign({ apikey: cfg.supabaseAnonKey, "Content-Type": "application/json", Prefer: "return=minimal" }, /^eyJ/.test(cfg.supabaseAnonKey) ? { Authorization: "Bearer " + cfg.supabaseAnonKey } : {}), body: JSON.stringify(body) })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return true; })
        .catch(function (e) { console.warn("lead 送出失敗", e); return false; })
        .then(function (ok) { clearTimeout(to); btn.disabled = false; done(ok); });
      return;
    }
    var saved = false;
    try { SB.Store.addLead({ name: name, phone: phone, gender: gender, age: age, ref: REF, assessment: a }); saved = true; } catch (e) { console.warn(e); }
    done(saved);
  }
  function renderResult(a, name, saved) {
    var el = $("#quizResult"), H = [];
    var symLabels = a.symptoms.map(function (s) { return symMap[s] ? symMap[s].label : s; });
    var lines = ["您好，我剛完成星寶健康生活自我檢測" + (name ? "，我是 " + name : "") + "。"];
    if (symLabels.length) lines.push("我的狀況：" + symLabels.join("、"));
    if (a.redFlags.length) {
      H.push('<div class="alert red">' + icon("alert") + '<div><h4>請盡快就醫</h4>您勾選了「' + a.redFlagLabels.join("、") + "」。這類狀況需要醫療專業人員評估，請先就醫，不建議以營養補充食品替代就醫。" +
        (a.redFlags.indexOf("rf_self") > -1 ? "<br>如您現在感到非常難受，請立即撥打 999，或聯絡 Befrienders 03-7627 2929。" : "") + "</div></div>");
      lines.push("（檢測顯示需先就醫：" + a.redFlagLabels.join("、") + "）");
    } else {
      var top = a.ranked.filter(function (r) { return r.raw > 0; }).slice(0, 4);
      H.push("<h3>你的平衡指數</h3><p class='hint'>分數越高，代表越值得優先保養（非醫療診斷）。</p>");
      if (!top.length) H.push('<div class="alert green">' + icon("check") + "<div>目前沒有明顯需要優先保養的方向，繼續保持良好的生活習慣！</div></div>");
      else H.push('<div class="bars">' + top.map(function (r) { return '<div class="bar"><span>' + r.name + '</span><span class="track"><i data-w="' + Math.max(8, r.pct) + '"></i></span><b>' + r.pct + "</b></div>"; }).join("") + "</div>");
      if (a.products.length) {
        H.push("<h3 style='margin-top:18px'>可以參考的日常保養方向</h3><div class='rec-list'>" + a.products.slice(0, 3).map(function (r) {
          var p = SB.prod(r.id);
          return '<div class="rec"><img src="' + p.thumb + '" alt="' + U.esc(p.imageAlt || p.name) + '"><div><b>' + U.esc(p.name) + "</b><small>" + U.esc(p.tagline) + "<br>" + U.esc(r.reasons[0] || "") + "</small></div></div>";
        }).join("") + "</div>");
        lines.push("想優先關注：" + a.focus.map(function (f) { return SB.sol(f).name; }).join("、"));
      }
      if (a.cautions.length) H.push('<div class="alert amber" style="margin-top:10px">' + icon("alert") + "<div>您勾選了「" + a.cautionLabels.join("、") + "」：食用任何營養補充食品前，請先諮詢醫師。</div></div>");
      if (a.cautions.length) lines.push("備註：" + a.cautionLabels.join("、"));
    }
    lines.push("想請顧問為我說明，謝謝！");
    H.push('<p class="hint" style="margin-top:14px;font-size:.82rem">' + U.esc(D.disclaimers.assessment) + "</p>");
    H.push('<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><a class="btn btn-wa btn-lg" target="_blank" rel="noopener" href="' + U.wa(WA, waText(lines.join("\n"))) + '">' + icon("whatsapp") + "把結果 WhatsApp 給顧問</a>" +
      '<button type="button" class="btn btn-ghost" id="qRestart">' + icon("back") + "重新檢測</button></div>");
    if (saved) H.push('<p class="hint" style="margin-top:10px;color:var(--green)">' + icon("check") + " 已為您建立諮詢紀錄，顧問將盡快與您聯絡。</p>");
    el.innerHTML = H.join("");
    requestAnimationFrame(function () { setTimeout(function () { $$(".bar i", el).forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; }); }, 60); });
    $("#qRestart").addEventListener("click", function () { form.reset(); $("#qConsent").checked = false; $("#qConsentErr").hidden = true; show(1); });
  }
  show(1);
})();
