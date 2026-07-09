<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

> 本文件是给 Codex 用的项目说明文件（Codex 会自动读取仓库根目录的 AGENTS.md）。以下内容由原 Claude Code 记忆迁移而来，涵盖 maydo 项目的背景、技术栈、进度与偏好。

---

## 项目背景：Sushi Maydo

客户是西班牙巴塞罗那 L'Hospitalet de Llobregat 的日式自助餐厅，从 Wix 迁移到 Next.js 自建网站。四语言站点，需配 Supabase 后台。

- **域名（2026-04-27 更新）**：新站统一用 `sushimaydo.es`（旧 Wix 站是 `sushimaydo.com`）。所有 Resend `from`、metadata、sitemap、robots、JSON-LD、checkout callback fallback 都已切换。以后若需再次改域名，参考 `Grep "sushimaydo\.es"` 全文检查。
- **迁移动机**：客户现有 Wix 网站功能受限、性能差、缺乏多语言支持。
- **推进原则**：按需求书优先级推进，外卖和礼品卡放最后，配色以项目现有为准（不是需求书上的）。

### 技术栈

- Next.js v16 + React 19 + Tailwind CSS 4 + TypeScript
- Framer Motion + next-intl 四语言（ES / EN / CA / ZH，默认 ES）
- 后台：Orderlix（推单 / 优惠券，已配）+ Supabase（与 Orderlix 共用）+ Resend（邮件，待填 key）+ Twilio（短信，待填 key）
- 不用 Stripe，自提到店付款

### 通知系统现状（`lib/order-fulfillment.ts`）

- 代码已实现：餐厅邮件 + 顾客多语言确认邮件 + 餐厅短信 + Orderlix 推单
- 各 notifier 在环境变量缺失时短路，下单流程不会被阻塞
- `.env` 里 `RESEND_API_KEY`、`TWILIO_*` 还是空，所以邮件 / 短信目前不会真发出
- 要打开：Resend 验证 sushimaydo.es 域名（SPF / DKIM），Twilio 买能发西班牙的号码

---

## 2026-05 客户反馈三件套进度

2026-05 客户对网站发了几条反馈，已全部落地代码（POS 那边 14.95€ 套餐还在改，UI 必须先动起来）：

1. **删套餐 hero**：前端强推 14.95€ 套餐入口已删（PedidoContent set meals hero 块）。SetMealSelector 保留，Orderlix `set_meal` 数据流不动，未来 POS 改完套餐方案再恢复入口。
2. **网站底色 → 黑色**：选用 `#0A0A0A` 深炭灰。`globals.css` 把 cream/beige/ink/gray 重新映射为深色系，让现有组件自动适配。home 几个硬编码 `bg-white` 的 section（FAQ / Reservation / GoogleReviews / InstagramFeed）和 PedidoContent 内 9 处 `bg-white` 已改 `bg-cream`。
3. **HERO carousel**：组件 `components/home/HeroCarousel.tsx`，自动 5.5s 切换 + 鼠标悬停暂停 + 圆点指示器。当前 8 张选自客户给的 117 张 GAMMA 新拍（P1007131/292/416/511/344/462/170/553），存放 `public/images/hero/`。
4. **统一流程**：A/B 切换器在 `/pedido` 顶部 sticky。A = 单点（原点单 UI），B = 自助餐 3 步（下午/晚上 → 成人/儿童 → PDF iframe）。新组件 `components/pedido/BuffetFlow.tsx`。首页 MenuSection 改成两个入口卡（→ `/pedido` 和 `/pedido?flow=buffet`）。

### 落地细节 / How to apply

- 下次客户审核时，重点对照这 4 点解释 → 演示。
- PDF 占位用 `prueba.pdf` 复制为 4 份放在 `public/menus/buffet-{tarde,noche}-{adulto,nino}.pdf`，等真 PDF 来了直接覆盖。
- HERO 原图 ~50MB，部署前要压缩 webp/avif（目标 ≤400KB/张）。

### 待客户提供

- 4 份真自助餐 PDF（下午成人 / 下午儿童 / 晚上成人 / 晚上儿童）
- 套餐外带价格（POS 那边商量）
- 是否确认 8 张 HERO 选图 / 顺序

---

## 技术偏好

### Next.js 版本

- 使用 Next.js **v16** 而不是 v15。新项目一律用 Next.js v16+。
- **原因**：用户在 v15 中遇到过 bug（具体未详述），且 personal-site 项目已经在用 v16。
- **注意**：v16 的 i18n 实现方式与之前版本有差异，需要适配。

---

## 仓库内原 CLAUDE.md 内容

原 CLAUDE.md 仅指向本文件（`@AGENTS.md`），无额外独立内容，已并入本文件。
