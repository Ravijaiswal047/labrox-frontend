# Receipt Format Designer — Full Backend API Contract

**This document is self-contained.** It replaces every earlier partial doc in this folder
(`TABLE-BORDER-STYLING.md`, `FIELD-LABEL-ALIGNMENT.md`, `PAGE-MARGIN-BORDER.md`,
`ELEMENT-BORDER-STYLING.md`, `FULLY-PAID-RECEIPT.md`, and the previous revisions of this
file) — everything from those is folded in here so there's one place to build from. The
frontend (`src/Frontend/ReportBuilderNew/`) is already fully built and working against this
contract; nothing on the frontend needs to change to match what's below.

---

## 1. Overview

A visual drag-and-drop designer for printable patient receipt templates. A user lays out
text/image/table elements on a page canvas, configures which body/settlement/totals columns
show, and saves the result as a template. This API is purely about **storing and retrieving
that template definition** — not about generating the final printed/PDF receipt (see
Section 9, "Dynamic reflow", for what a real print pipeline needs to do with this data).

- **Base route:** `api/v1/ReportBuilderNew/{Action}` (frontend calls `ReportBuilderNew/{Action}` against a base URL of `/api/v1/`).
- **RPC-style naming** — `Module/Action`, not REST resource URLs.
- Reads are `GET` with query params. Writes (`SaveTemplate`, `PublishTemplate`, `DeleteTemplate`) are `POST` with a JSON body.
- **Auth:** every endpoint requires the standard bearer/cookie auth already used elsewhere in the app (`[Authorize]`).

### Response envelope

```json
{ "Message": /* string on error, or the payload object/array on success */, "success": true }
```

- **Success:** `success: true`, `Message` = the payload (object or array, per endpoint).
- **Validation/business failure:** HTTP 200, `success` **omitted entirely** (not `false` — just absent), `Message` is a plain string.
- **Not found:** HTTP **404**, response body is a **plain string** (no envelope at all).
- **Server error:** standard HTTP 500.

⚠️ Be consistent about `Message` casing — capital M. The frontend's parser
(`src/NetworkServices/ReportBuilderNew.js`) tolerates a lowercase `message` as a fallback
because this was inconsistent in an earlier build, but don't rely on that; always send `Message`.

⚠️ `Status` (see `template.status` in Section 8) must **never** be `null` in any response —
even for a validation-failure/rebuild scenario. If you don't have a status yet, send
`"Draft"`. Sending `null` here previously caused a `SaveTemplate` round-trip to reject
itself (`"Status field is required"`).

---

## 2. Report Types

Every read endpoint takes a `ReportType` query param. Two values exist today:

| Value | Meaning |
|---|---|
| `Receipt` | The standard patient receipt. Default or first-built type — build this one first. |
| `FullyPaidReceipt` | Same Header/Footer/Body fields as `Receipt`, **plus one extra Totals field** — see Section 10. |

Every template row is tagged with the `ReportType` it was created as. `GetTemplateList`
must filter by it. `GetFieldTokens`/`GetColumnCatalog` must return different data per type
once `FullyPaidReceipt` is seeded (Section 10) — until then, returning `Receipt`'s data for
both is fine as a temporary fallback, just don't crash/404 on an unrecognized `ReportType`.

---

## 3. Endpoints

### 3.1 `GET GetFieldTokens?ReportType=Receipt`

Returns the header/footer merge-field tokens available for the Palette.

**Response `Message`:**
```json
{
  "headerFields": [
    { "token": "{PatientName}", "key": "PatientName", "label": "Patient Name" },
    { "token": "{Age}", "key": "Age", "label": "Age" }
  ],
  "footerFields": [
    { "token": "{PrintedBy}", "key": "PrintedBy", "label": "Printed By" }
  ]
}
```
Full field list and casing: Section 11.1.

---

### 3.2 `GET GetColumnCatalog?ReportType=Receipt`

Returns the **default** column/totals set for building a brand-new template — this is
**template-independent** (does not read any specific template's saved config; a template's
own column choices live entirely inside its own saved `LayoutJson`, see Section 8).

**Response `Message`:**
```json
{
  "bodyColumns": [
    { "key": "sr", "label": "Sr", "w": 5, "align": "center", "visible": true, "money": false }
  ],
  "settlementColumns": [
    { "key": "sr", "label": "Sr", "w": 6, "align": "center", "visible": true, "money": false }
  ],
  "totals": [
    { "key": "gross", "label": "Gross Amount", "visible": true, "boldLabel": false, "boldValue": true }
  ]
}
```
Full column/totals list: Section 11.2. Also see Section 11.2's note on `boldLabel`/
`boldValue` replacing the older single `bold` flag.

⚠️ `key` **must** be the exact short key the frontend hardcodes rendering logic around
(`sr`, `dept`, `code`, ... — full list in Section 11.2). Any other key (e.g. a raw
`FieldName`/`TokenName`) will silently fail to render.

---

### 3.3 `GET GetTemplateList?ReportType=Receipt&Search=&Status=`

Returns the list used by the "Load template" dropdown. `Search` (free text, may be empty)
and `Status` (`Draft`/`Published`/empty for all) are both optional filters.

**Response `Message`:** array of:
```json
{
  "templateId": 12,
  "code": "RCPT-A4-STYLE2",
  "name": "Patient Receipt - Style 2",
  "status": "Published",
  "version": 3,
  "pageSize": "A4",
  "orientation": "Portrait",
  "pageWidth": 874,
  "pageHeight": 1123,
  "isDefault": true,
  "updatedBy": "System",
  "updatedOn": "07-Aug-2026 05:47 PM"
}
```

- `isDefault` (boolean) — **exactly one** template per `ReportType` should ever be `true`
  at a time. This is the template that `SaveTemplate`/`PublishTemplate` actually write into
  (see below) — it is the single "live" template for that report type. All other templates
  in the list are reference/inactive — the frontend still lets a user open and edit them,
  but writes always redirect to whichever one is `isDefault`.
- `updatedOn` — any consistent human-readable format is fine; the frontend only displays it.

---

### 3.4 `GET GetTemplateById?TemplateId=12`

Returns one template's full document. **Response `Message`:** exactly the shape in Section 8
(`{templateId, reportType, template, settings, elements, bodyColumns, settlementColumns, totals}`).

- Not found → HTTP 404, plain string body, e.g. `"Template not found."`.

---

### 3.5 `POST SaveTemplate`

**Request body:** the full document from Section 8, with `templateId` set to:
- the id being updated (an existing row), **or**
- `null` for a genuinely new template (server should create a new row and return its new `templateId`).

⚠️ Important behavior the frontend already relies on: **the frontend always resolves
`templateId` to whichever template is currently `isDefault` before calling Save**, except
when creating a brand-new template (`templateId: null`). So in practice, `SaveTemplate`
almost always means *"overwrite the current default template's Draft content"* — it is not
generally creating new rows for that report type after the first one exists. Don't be
surprised that most saves target the same id repeatedly.

**Response `Message`:** the saved document echoed back, same shape as Section 8 (must
include the resolved/assigned `templateId`, and `template.status`/`template.version`
reflecting the save — typically stays/moves to `"Draft"` with the version unchanged, since
Publish is the only thing that bumps version/status).

**Validation failures** (200 + no `success` key + string `Message`), at minimum:
- `template.code` or `template.name` missing/empty → `"Template code and name are required."`

---

### 3.6 `POST PublishTemplate`

**Request body:** `{ "templateId": 12 }`

Marks that template's current content as the published version — typically: flip
`Status` to `Published`, bump `version`, and (recommended) start a fresh Draft copy for
further edits so the next Save doesn't silently overwrite what's now published.

**Response `Message`:**
```json
{ "status": "Published", "version": 4 }
```

---

### 3.7 `POST DeleteTemplate`

**Request body:** `{ "templateId": 12 }`

**Response `Message`:** any truthy confirmation is fine — the frontend only checks
`success`. A plain string like `"Template deleted."` is fine as `Message`.

---

## 4. Existing endpoints reused (not part of this module, already live elsewhere)

- `GET Centre/getAccessCentres` → `{ "message": [ { "CentreID": 3, "Centre": "NPLRC Kathmandu" }, ... ] }` (note: lowercase `message`, this is a different, older convention than Section 1's envelope — used for the centre picker in Preview & Print and Page & Branding).
- `POST CommonController/UploadDocument` (multipart form, `file` + `DocumentID` + `Page` + `Guid` + others) — used for the letterhead "Image: Static" upload (Section 12).
- `POST CommonController/GetDocument` — `{ "Page": "...", "Guid": "..." }` → `{ "message": [ { "awsKey": "...", ... } ] }` — used to look up what was uploaded under a given tag.
- `POST CommonController/GetFileUrl` — `{ "Key": "<awsKey>" }` → `{ "message": "<viewable URL>" }`.

These three already exist and are not part of this module's build — just confirming the frontend already calls them correctly.

---

## 5. `templateId` / draft-vs-published semantics — summary

- A template has exactly one row of "current truth" (`rcpt_template`-style row) plus
  versioned content (Draft being edited, Published being what's live).
- `isDefault` (Section 3.3) marks the one row per `ReportType` that Save/Publish actually
  write to, regardless of which template a user has loaded/is looking at in the UI.
- The frontend never assumes anything about *how* you implement draft/publish/versioning
  internally — it only needs: Save always succeeds and returns the resolved `templateId`;
  Publish flips status/bumps version and returns the new `status`/`version`; a subsequent
  `GetTemplateById` returns the latest content either way.

---

## 8. Full `LayoutJson` document shape — the actual contract

This is what `GetTemplateById`/`SaveTemplate`/`PublishTemplate` all pass around, and what
must be stored (as one JSON blob, recommended) per template version.

```json
{
  "templateId": 12,
  "reportType": "Receipt",
  "template": {
    "code": "RCPT-NEW-01",
    "name": "New Receipt Template",
    "pageSize": "A4",
    "orientation": "Portrait",
    "pageWidth": 874,
    "pageHeight": 1123,
    "font": "Arial",
    "fontSize": 10,
    "bg": "#ffffff",
    "letterheadType": "html_static",
    "staticHtml": "<h2 style='margin:0'>Company Name</h2><p>Address line &middot; Phone &middot; Email</p>",
    "letterheadImageSize": { "x": 0, "y": 0, "width": 300, "height": 80 },
    "stampImage": null,
    "inclusionStyle": "brackets",
    "showSettlement": true,
    "tableBorder": {
      "headerTopBorder": true,
      "headerBottomBorder": true,
      "outerBorder": true,
      "cellBorder": false,
      "borderWidth": 1,
      "borderColor": "#1B2E5E",
      "headerFill": true,
      "headerBg": "#1B2E5E",
      "headerColor": "#ffffff",
      "headerUppercase": true
    },
    "settlementTableBorder": { "headerTopBorder": true, "headerBottomBorder": true, "outerBorder": true, "cellBorder": false, "borderWidth": 1, "borderColor": "#1B2E5E", "headerFill": true, "headerBg": "#1B2E5E", "headerColor": "#ffffff", "headerUppercase": true },
    "totalsTableBorder": { "headerTopBorder": true, "headerBottomBorder": true, "outerBorder": true, "cellBorder": false, "borderWidth": 1, "borderColor": "#1B2E5E", "headerFill": true, "headerBg": "#1B2E5E", "headerColor": "#ffffff", "headerUppercase": true },
    "fieldLabelWidth": 90,
    "pageMargin": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
    "pageBorder": { "top": false, "right": false, "bottom": false, "left": false, "borderWidth": 1, "borderColor": "#1B2E5E" },
    "status": "Draft",
    "version": 1
  },
  "settings": {
    "LOCK_CREDIT_PANEL": false,
    "LOCK_RATETYPE": false,
    "ONLY_ACTIVE_ITEM": false
  },
  "elements": [ /* Section 8.1 */ ],
  "bodyColumns": [ /* Section 11.2 */ ],
  "settlementColumns": [ /* Section 11.2 */ ],
  "totals": [ /* Section 11.2 */ ]
}
```

### `template.*` field reference

| Field | Type | Notes |
|---|---|---|
| `code` | string | Required for Save. |
| `name` | string | Required for Save. |
| `pageSize` | `"A4"` \| `"A5"` \| `"Letter"` \| `"Thermal 80mm"` \| `"Custom"` | See Section 16. |
| `orientation` | `"Portrait"` \| `"Landscape"` | Ignored when `pageSize` is `"Custom"`. |
| `pageWidth` | number (px) | **Always present**, for every `pageSize` — the resolved, exact page width in CSS px @ 96dpi. For a preset it's derived from `pageSize`+`orientation` frontend-side (not user-editable); for `"Custom"` it's the literal value the user typed. See Section 16 — render/PDF-export the page at exactly this size. |
| `pageHeight` | number (px) | Same as `pageWidth`, height. |
| `font` | string | e.g. `"Arial"`, `"Verdana"`, `"Times New Roman"`, `"Georgia"`, `"Courier New"`, `"Tahoma"` — free text, not a closed enum. |
| `fontSize` | number | Base font size (px), used as a fallback wherever an element doesn't set its own. |
| `bg` | string | Hex color, page background. |
| `letterheadType` | `"none"` \| `"html_static"` \| `"html_centrewise"` \| `"image_static"` \| `"image_centrewise"` | See Section 12. Default for a brand-new template is `"html_static"`, not `"none"`. |
| `staticHtml` | string | Raw HTML, used when `letterheadType` is either `html_*` variant. |
| `letterheadImageSize.x`, `.y`, `.width`, `.height` | number (px) | Only meaningful when `letterheadType` is `"image_static"` — the position + size to render that backend-resolved image at, page-relative like any element's own `x`/`y`/`w`/`h`. Default `x:0, y:0, width:300, height:80`. See Section 12. |
| `stampImage` | string \| null | A **base64 data URI**, by design — not uploaded/hosted anywhere server-side, same reasoning as `image` elements' `previewSrc` below and Section 12's letterhead images: no upload endpoint needed, store/echo it as an opaque string. |
| `inclusionStyle` | `"brackets"` \| `"subrows"` | How package-inclusion items print under a package row. |
| `showSettlement` | boolean | Whether the Settlement table prints at all. |
| `tableBorder` | object | Body table's border/header styling. Section 13. |
| `settlementTableBorder` | object | Settlement table's own, independent border/header styling — same shape as `tableBorder`. Section 13. |
| `totalsTableBorder` | object | Totals block's own, independent border/header styling — same shape as `tableBorder`. Section 13. |
| `fieldLabelWidth` | number (px) | Section 14. |
| `pageMargin` | object | Section 15. |
| `pageBorder` | object | Section 15. |
| `status` | `"Draft"` \| `"Published"` | **Never null** (see Section 1). |
| `version` | number | Bumped by Publish. |

### 8.1 `elements[]` — every element's shape

Every element has these base fields, regardless of type:

| Field | Type |
|---|---|
| `id` | string (uuid) |
| `type` | string, see table below |
| `x`, `y` | number (px, page-relative, unbounded — can be negative, elements can be dragged off-page on any side) |
| `w`, `h` | number (px) |
| `z` | number, stacking order (higher paints on top) |
| `opacity` | number, `0.1`–`1` |
| `rotation` | number, degrees, clockwise, default `0`. Universal across every type **except** the three singleton table anchors (`bodytable`/`settletable`/`totalsblock` — see Section 19, "Rotation"), which ignore it. Rotates the whole element (box + content together) around its own center; the stored `x`/`y`/`w`/`h` values themselves don't change, but the rendered shape extends beyond that unrotated footprint once rotated. |

Type-specific extra fields:

| `type` | Extra fields |
|---|---|
| `field` | `token` (string, e.g. `"{PatientName}"`), `label` (string, printed caption), `showLabel` (bool), `boldLabel` (bool, default `false`), `boldValue` (bool, default `true`), `labelWidth` (number, optional — per-element override of `template.fieldLabelWidth`, Section 14), `italic` (bool), `align` (`left`\|`center`\|`right`), `color` (hex), `fontSize` (number). *(`bold` may also be present for legacy reasons but is ignored for this type — use `boldLabel`/`boldValue` instead, Section 14.)* |
| `label` (Static Text) | `text` (string), `fontSize`, `bold` (bool), `italic` (bool), `align`, `color`, plus border fields — Section 17. |
| `html` (Static HTML) | `html` (string, raw HTML), `fontSize`, plus border fields — Section 17. |
| `image` | `previewSrc` (string \| null — base64 data URI by design, same as `stampImage`), `fit` (`"cover"` etc., CSS `object-fit` value). |
| `barcode` | `token` (string). |
| `qrcode` | `token` (string). |
| `stamp` | `previewSrc` (string \| null, same local-only caveat). |
| `pageno` | `format` (string, e.g. `"Page {page} of {pages}"`), `fontSize`, `align`. |
| `line` | `color` (hex), `thickness` (number), `orientation` (`"H"` \| `"V"`). |
| `rect` | `borderColor` (hex), `borderWidth` (number), `fill` (hex \| `"transparent"`). |
| `bodytable` / `settletable` / `totalsblock` | No extra fields — these are **singleton anchors** (at most one of each per template) marking where the body table / settlement table / totals block render. Their own `w`/`h` are just a canvas placeholder box, **not** the real print size — see Section 9. |

---

## 9. Dynamic reflow — required for real print/PDF rendering

**`elements[].h` on the three table-anchor types is a Designer-canvas placeholder box
only — never the real render height.** A patient with 1 test and a patient with 10 tests
use the identical `LayoutJson`; only the row count differs at print time. Whatever
generates the real printed/PDF receipt must reflow layout around the real content, not
replay the designed placeholder size.

**Three zones, relative to the body table's designed position `(bodyTableEl.x, bodyTableEl.y)`, on the page's `template.pageSize`/`orientation`:**

1. **Header zone** — every non-table element with `y < bodyTableEl.y`. Renders unshifted, at its designed position, on every page (if you paginate).
2. **Flow zone** — the Settlement table + Totals block (side by side, not stacked) plus every other non-table element with `y >= min(settleTableEl.y, totalsEl.y)` and `y < footerZoneY`. These sit right after the body table and shift down/up together by however much the body table's *real* rendered height differs from its designed placeholder:
   `belowShiftY = (bodyTableEl.y + realBodyHeight + 20) - min(settleTableEl.y, totalsEl.y)`,
   then every flow-zone element renders at `y + belowShiftY`.
3. **Footer zone** — every non-table element with `y >= footerZoneY`, where `footerZoneY = pageHeight - 150px`. This is the *true* footer (page no., printed-by/on, ...) — pinned at its designed spot regardless of how much dynamic content is above it.

**If real content is taller than the page fits**, don't clip. Either let the physical page
grow (fine for a thermal roll) or paginate however your PDF library supports — never
silently truncate content past the page boundary.

**What this means for the backend / print pipeline:**
- Never lay out the final receipt using `elements[].h` for the three table anchors — measure/compute real content height first.
- `bodyColumns[]`/`settlementColumns[]`/`totals[]` widths/visibility still apply as designed; only the *height* of the tables is dynamic.
- Reference implementation: `src/Frontend/ReportBuilderNew/components/PreviewPrintTab.jsx`.

---

## 10. Fully Paid Receipt — the second report type

Per the field-master spec already shared: `FullyPaidReceipt` inherits `Receipt`'s
Letterhead/Header Fields (32)/Footer Fields (13)/Body Table columns (17) **unchanged**,
plus **one new Totals field**:

| Field | Value |
|---|---|
| `ShortKey` (→ frontend's `key`) | `totalMRP` |
| Label | "Total of MRP" |
| Meaning | `SUM(Rate * Qty)` across body table line items — **before** any per-item discount. Distinct from the existing `gross` total, which is already net of item-level discounts. |
| Data type | Amount (`money: true`) |

To make `GetFieldTokens?ReportType=FullyPaidReceipt` and
`GetColumnCatalog?ReportType=FullyPaidReceipt` actually return this correctly:
- `rcpt_field_master` needs a `ReportType` column (it doesn't have to be duplicated data —
  a `ReportType` filter that falls back to shared/`Receipt` rows for everything except the
  one new Totals row is fine, whatever's least duplication for you).
- Add one new `TOTALS` row scoped to `FullyPaidReceipt`, with `ShortKey = 'totalMRP'`.

---

## 11. Full field/column reference

### 11.1 Header + Footer tokens (41 + 7) — `GetFieldTokens`

Header (`SectionCode = 'HEADER'`), in `SeqInSection` order:

`{CentreID} {CentreCode} {Centre} {CentreAddress} {CentreMobile} {RateTypeID} {RateTypeCode} {RateTypeName} {RateTypeMobile} {RateTypeAddress} {DoctorName} {PatientTitle} {PatientName} {Age} {DOB} {Gender} {Mobile} {Address} {PatientCode} {VisitNo} {BillNo} {ReceiptNo} {RegDate} {RegTime} {DueAmount} {Country} {PassportNo} {SecondReferralDoctor} {ReferLab} {ReceiptPrintType} {ReportDeliveryMode} {BillingRemark} {BarcodeNo} {TRFNo} {Height} {Weight} {EmailID} {PRO_Billing} {PRO_Doctor} {PRO_RateType} {PhleboName}`

Footer (`SectionCode = 'FOOTER'`), in `SeqInSection` order:

`{CreatedBy} {CreatedOn} {PrintedBy} {PrintedOn} {UserName} {Password} {OnlinelabLink}`

⚠️ **Casing is exact and intentional** — `BarcodeNo` (not `Barcodeno`), `TRFNo` (not
`TrfNo`), `EmailID` (not `EmailId`), `PRO_Billing`/`PRO_Doctor`/`PRO_RateType` (not
`Pro_Billing` etc.), `OnlinelabLink` (not `OnlineLabLink`). These exact tokens are what the
frontend's sample-data preview resolves against (`utils/sampleData.js`) — a mismatched
casing means that token silently renders as its own literal placeholder text instead of a
value, both in preview and (if replicated) in real print output.

Response `key` for each = the token with `{}` stripped (e.g. `{PatientName}` → key `PatientName`).

### 11.2 Body / Settlement / Totals short keys — `GetColumnCatalog`

These exact keys are hardcoded into the frontend's rendering logic (money formatting,
package-inclusion sub-rows, column config UI) — any other key silently fails to render.

**Body columns** (13), with recommended defaults:

| key | label | w (%) | align | visible | money |
|---|---|---|---|---|---|
| `sr` | Sr | 5 | center | true | false |
| `dept` | Department | 12 | left | true | false |
| `code` | Code | 8 | left | false | false |
| `item` | Investigation / Item | 30 | left | true | false |
| `incl` | Inclusions | 0 | left | true | false |
| `rate` | Rate | 9 | right | true | true |
| `qty` | Qty | 5 | center | true | false |
| `disc` | Disc | 8 | right | true | true |
| `amount` | Amount | 10 | right | true | true |
| `token` | Token | 6 | center | false | false |
| `delivery` | Delivery | 13 | center | true | false |
| `scan` | Scan Date | 10 | center | false | false |
| `barcode` | Barcode | 12 | left | false | false |

**Settlement columns** (8):

| key | label | w (%) | align | visible | money |
|---|---|---|---|---|---|
| `sr` | Sr | 6 | center | true | false |
| `rtype` | Receipt Type | 16 | left | true | false |
| `rdate` | Date | 18 | center | true | false |
| `mode` | Mode | 14 | left | true | false |
| `amount` | Amount | 14 | right | true | true |
| `txn` | Transaction ID | 18 | left | true | false |
| `user` | User | 14 | left | true | false |
| `userid` | UserID | 8 | left | false | false |

**Totals** (5, no `w`/`align`/`money` — just `visible`/`boldLabel`/`boldValue`):

| key | label | visible | boldLabel | boldValue |
|---|---|---|---|---|
| `gross` | Gross Amount | true | false | true |
| `discTotal` | Discount On Total | true | false | false |
| `net` | Net Amount | true | false | true |
| `paid` | Paid Amount | true | false | true |
| `due` | Due Amount | true | false | true |

⚠️ `boldLabel`/`boldValue` bold the row's caption and its printed amount **independently**
— e.g. "Net Amount" (caption) plain but "₹3,400.00" (value) bold, or vice versa. This
replaces an older single shared `bold` flag that bolded both at once. A row missing
`boldLabel`/`boldValue` (an older/legacy row that only has `bold`) falls back to that
`bold` value for both — send the two new fields going forward; `bold` itself is no longer
read once they're present.

(Plus `totalMRP` for `FullyPaidReceipt` only — Section 10.)

---

## 12. Letterhead — 5 modes + independent Image elements

`template.letterheadType`:

| Value | Behavior |
|---|---|
| `none` | Nothing renders at the top of the page at all — the template relies entirely on its own `elements[]` (Image/HTML/label/... placed directly on the canvas) instead of a dedicated letterhead block. Not the default for a new template (that's `html_static`, with placeholder boilerplate text) — a user has to explicitly pick this. |
| `html_static` | `template.staticHtml` renders as the letterhead, same for every centre. |
| `html_centrewise` | Still **not built on the frontend** (Preview & Print always renders `staticHtml` regardless of centre selected) — but for the real PDF-render pipeline, per-centre HTML already exists elsewhere in this system: `centres_html.HeaderInfo` (`WHERE CompanyID=@CompanyID AND Type='Bill_Header' AND IsActive=1`), the same table/column an existing bill-print flow already reads. Reuse that as the per-centre override when this mode is selected; fall back to `template.staticHtml` for a centre with no `Bill_Header` row. See "Images" below — this applies identically to centre-wise HTML. |
| `image_static` | A single, **company-wide** header image — same for every centre, like `html_static` but an image instead of HTML. ⚠️ **Not uploaded/managed by this module at all.** The image itself already exists in some other backend table/setting (the frontend was only told this exists, not which table/column — coordinate with your team on the actual source, the same way `html_centrewise` above points at `centres_html.HeaderInfo`). All `template` carries for this mode is `letterheadImageSize` (below) — the position/size to render that image at; there is no upload endpoint, no guid, nothing else to resolve from the frontend's side. Preview & Print/the Designer canvas can only show a size-accurate placeholder box for this mode, never the real image, since they have no way to fetch it. |
| `image_centrewise` | **No upload happens through this module at all.** Per-centre header images already exist via Centre Master's own upload flow (`CommonController/UploadDocument` with `pageName: "attachmentHeader"`, tagged by that centre's own `CentreIDHash`) — this mode just means "use whatever's already set per-centre there," resolved the same GetDocument→GetFileUrl way but keyed by the printing centre's `CentreIDHash` instead of a template-level guid. |

`template.letterheadImageSize` — `{ x, y, width, height }`, all px, default `{ x: 0, y: 0,
width: 300, height: 80 }`. Only read when `letterheadType` is `"image_static"`; ignored
otherwise. Unlike every other letterhead mode (which is always pinned at the page's own
`(0, 0)`, full width), `image_static` is **freely positioned** — `x`/`y` work exactly like
any element's own position (page-relative, draggable on the Designer canvas, can sit
anywhere on the page, not just the top). The real PDF-render pipeline should position the
resolved backend image's box at `(x, y)` and size it to `width`×`height` (scaling/cropping
however makes sense for your source image) — same as rendering any other positioned
element, just with a server-resolved image instead of one from `elements[]`.

⚠️ **This is a different, incompatible meaning for `image_static` than an earlier revision
of this contract used** — that version had the frontend itself upload the image (network
upload through the shared `UploadFile` modal, a guid in a now-removed
`template.letterheadImages.static` field, resolved via `CommonController/GetDocument`→
`GetFileUrl`). That flow no longer exists in the frontend at all; if any template was saved
under the old meaning, its stored guid is meaningless now — `letterheadImageSize` is the
only field this mode reads today.

**Images: use `elements[]`, not `letterheadType`.** A logo, header image, or any number of
images (one left, one right, etc.) are just regular `type: "image"` elements in the
document's `elements[]` array (Section 8.1) — each has its own `x`/`y`/`w`/`h` (freely
positioned/resized, independent of the others) and `previewSrc`, a base64 `data:` URI
(no upload endpoint, no guid, nothing to resolve — store/echo it as an opaque string, same
as `staticHtml`). This is deliberately how multi-image and mixed image+text letterhead
layouts are built: an `image` element positioned top-left plus another positioned top-right,
overlaid with whatever `html_static`/`html_centrewise` content is chosen above (letterhead
HTML and `elements[]` already render together, not as alternatives to each other — nothing
new needed there). `staticHtml` can *also* contain its own `<img src="data:...">` tags for
an image that's meant to flow inline within the HTML text itself (Section 8.1's `label`/
`html` element notes and `RbnHtmlEditor.jsx`'s Quill/HTML-source toggle) — both are valid
and can be used together; `elements[]`-based images are simply the normal way to place an
independently-positioned image, matching every other element type.

No size cap is enforced on any of this today; a template with several embedded images will
produce a correspondingly large `elements[]`/`staticHtml` and `LayoutJson` blob overall —
expected, not a bug to guard against unless it becomes an actual problem in practice.

**Where it renders:** the letterhead is not one of the free-position `elements[]` — it
renders as its own block, pinned to `(x: 0, y: 0)`, full page width, height auto (grows to
fit its content, not fixed/clipped). It renders *underneath* whatever's in `elements[]` in
paint order, so a template's own header-field elements (patient info, title, top barcode,
...) are expected to be positioned below wherever the letterhead's real content ends —
same "the designer is responsible for leaving room" relationship the Body Table has with
whatever comes after it (Section 9). Reference implementation:
`src/Frontend/ReportBuilderNew/components/LetterheadPreview.jsx`.

`template.stampImage` (separate from letterhead) is a base64 data URI by design, same as
`image` elements and letterhead images (Section 8's field table) — no upload endpoint.

---

## 13. Table borders — `template.tableBorder`, `template.settlementTableBorder`, `template.totalsTableBorder`

**Independently configurable per table**, not shared — `tableBorder` is the Body table's own
settings, `settlementTableBorder` is the Settlement table's, `totalsTableBorder` is the
Totals block's. All three are the exact same shape (below); a change to one does not affect
the others. (Earlier revisions of this contract had one shared `tableBorder` for all three —
if you already built against that, treat `settlementTableBorder`/`totalsTableBorder` as new
sibling fields on `template`, same object shape, and stop reusing `tableBorder` for the
other two tables.)

```json
{
  "headerTopBorder": true,
  "headerBottomBorder": true,
  "outerBorder": true,
  "cellBorder": false,
  "borderWidth": 1,
  "borderColor": "#1B2E5E",
  "headerFill": true,
  "headerBg": "#1B2E5E",
  "headerColor": "#ffffff",
  "headerUppercase": true
}
```

| Field | Meaning |
|---|---|
| `headerTopBorder` | Line above the header row (the table's top edge), colored `borderColor`. |
| `headerBottomBorder` | Line below the header row, separating it from data rows. Also `borderColor`. |
| `outerBorder` | Full border box around the whole table, colored `borderColor`. When `headerTopBorder` is also on, the top edge uses the same `borderColor` — the two aren't additive for that one edge, header wins (same color either way now, unlike before this section's most recent revision). |
| `cellBorder` | When on, every cell (header **and** data) gets a full `borderColor` border on all 4 sides — a full grid look. When off, data rows get a thin light-grey (`#edf0f4`, fixed, not configurable) bottom rule between rows instead, and header cells show only whatever `headerBottomBorder` draws. |
| `borderWidth` | Line thickness (px), shared by every border drawn above. |
| `borderColor` | Hex color shared by every border line drawn above (table outline, header top/bottom rules, cell grid). **New** — previously two separate hardcoded navy/grey constants with no config; now one configurable color. |
| `headerFill` | Whether the header row gets a solid background fill at all. **New** — previously the header row was *always* solid navy with white text, with no way to turn it off, regardless of any other border setting (this is what earlier looked like "the border config isn't working" — it wasn't a border, it was an entirely separate hardcoded fill). `false` gives a plain header (still shows whatever border lines are on) — for a plain black-and-white receipt style. |
| `headerBg` | Header row background color, only used when `headerFill` is `true`. |
| `headerColor` | Header row text color, only used when `headerFill` is `true`. |
| `headerUppercase` | Whether header labels force-render in ALL CAPS. **New** — previously always uppercased regardless of how the column label was actually typed in Section 11.2's Body/Settlement column config, no way to turn off. `false` prints the label exactly as typed. |

Defaults (used when `template.tableBorder` is absent, or missing individual fields, e.g. an
older template saved before this revision): `headerTopBorder`/`headerBottomBorder`/
`outerBorder`/`headerFill`/`headerUppercase` all `true`, `cellBorder` `false`, `borderWidth:
1`, `borderColor: "#1B2E5E"`, `headerBg: "#1B2E5E"`, `headerColor: "#ffffff"` — i.e. defaults
reproduce the exact look every existing template already has today; nothing changes visually
for a template that never touches these new fields.

Reference implementation: `src/Frontend/ReportBuilderNew/components/TablePreviews.jsx`,
function `tableBorderStyles()`.

---

## 14. Field label alignment & independent bold — `template.fieldLabelWidth`, `elements[].labelWidth`/`boldLabel`/`boldValue`

A `field` element prints as `Label: Value`. Without a fixed-width label column, a stack of
fields with different-length labels (Patient Name / Age / Mobile / Address / ...) has their
values start at a ragged, inconsistent X. Fix: every field's label reserves the same width.

- `template.fieldLabelWidth` (number, px) — the template-wide default. Default when absent: `90`.
- `elements[].labelWidth` (number, px, optional) — per-field override. Resolution order: `element.labelWidth` → `template.fieldLabelWidth` → `90`.
- `elements[].boldLabel` (boolean, default `false`) — bold **just the label** ("Patient Name:"), independent of the value.
- `elements[].boldValue` (boolean, default `true`) — bold **just the value** ("Asha Verma"), independent of the label.

For `field` elements, `boldLabel`/`boldValue` are authoritative — the legacy `bold` field
(used by every other element type for their single bold toggle) is ignored here, since
"bold the field" is ambiguous between key and value.

Rendering rule: label text renders inside a fixed-width, no-wrap box (left-aligned within
that box); the value renders immediately after. If the field's own `align` is `center`/
`right`, the label+value pair as a *whole* shifts within the element's box — the label's
own width stays fixed either way. **Don't clip the value** if it doesn't fit in the
remaining space (patient names/addresses/bill numbers are unpredictable length) — let it
overflow visibly rather than truncate.

Reference implementation: `src/Frontend/ReportBuilderNew/components/ElementRenderer.jsx`, `case "field"`.

---

## 15. Page margin & border — `template.pageMargin`, `template.pageBorder`

```json
{
  "pageMargin": { "top": 20, "right": 15, "bottom": 20, "left": 15 },
  "pageBorder": { "top": true, "right": false, "bottom": true, "left": false, "borderWidth": 2, "borderColor": "#1B2E5E" }
}
```

- `pageMargin` — `{top, right, bottom, left}`, each px. Default: all `0`.
- `pageBorder` — `{top, right, bottom, left, borderWidth, borderColor}`. Each side independent on/off; `borderWidth` (px) and `borderColor` (hex) shared. Default: all sides `false`, `borderWidth: 1`, `borderColor: "#1B2E5E"`. `borderColor` is **new** — previously a hardcoded navy constant with no config, same reasoning as `tableBorder.borderColor` in Section 13.

**This is a print-safe INSET margin — it never changes the page's own physical size**
(`pageWidth`/`pageHeight`, Section 16), and it does not move or resize anything on the
page either. `pageMargin.left: 20` means "draw the left border 20px inset from the true
left edge of the page" — not "grow the page 20px wider" and not "shift every element 20px
right." Every element's `x`/`y` stays exactly as designed, relative to the true page origin
`(0,0)`; the page's total printed size stays exactly `pageWidth`×`pageHeight` regardless of
margin/border values. This matters for real printing specifically: a physical printer's
paper size is fixed, so a margin implementation that tried to grow the page to fit extra
space would either get scaled down by the print driver (shrinking the whole receipt) or
clipped — neither of which is "add a margin." ⚠️ An earlier revision of this contract
described margin as whitespace added *around the outside* of the page (growing its total
size) — that was wrong for exactly this reason and has been corrected here.

Because this never affects layout, the border is purely a visual frame — keeping any
element from visually overlapping it (if the designer placed something close to the true
page edge) is the same "designer's own responsibility" relationship every other layout
guide in this contract already has (e.g. Section 9's footer zone).

If your PDF pipeline is HTML/CSS-based: don't add padding/border to the page's own root
element (that would grow it). Instead, render the page at its normal fixed
`pageWidth`×`pageHeight` size, then draw the border as a separate overlay — a
position:absolute rectangle inset from each edge by `pageMargin.{side}`px, with
`border-{side}: {borderWidth}px solid {borderColor}` for whichever sides are `true` —
layered on top of (not around) the unchanged page content.

⚠️ **Physical printer unprintable edge.** This only matters for an actual paper printout
(not PDF-only output): most printers have a hardware-level strip around every physical
page — typically ~3–5mm — that they simply cannot print on, regardless of what the PDF/HTML
says. A border with `pageMargin.{side}` smaller than that can render correctly in a
screen/PDF preview and still get silently clipped on a real printout. Nothing in this
contract can fix that (it's a printer hardware limit, not a layout bug) — the frontend just
warns the user in the UI when a border's margin is under ~16px (~4mm) on that side. If your
print pipeline has its own known-safe minimum for the printers actually in use, consider
enforcing/warning on it too, but don't silently increase a template's saved `pageMargin`
values to compensate — that's a per-printer concern, not something to bake into the stored
template data.

Reference implementation: `src/Frontend/ReportBuilderNew/utils/pageFrame.js`.

---

## 16. Page size — presets vs `Custom`, and exact `pageWidth`/`pageHeight`

`template.pageSize` is one of `"A4"`, `"A5"`, `"Letter"`, `"Thermal 80mm"`, or `"Custom"`.

**For the four presets**, the frontend resolves an exact pixel box (CSS px @ 96dpi) from a
hardcoded table, swapped for `orientation`:

| Preset | Portrait `[w, h]` px |
|---|---|
| `A4` | `[874, 1123]` |
| `A5` | `[559, 794]` |
| `Letter` | `[816, 1056]` |
| `Thermal 80mm` | `[302, 1123]` |

⚠️ Note `A4` here is **874px wide, not true A4** (`210mm` @ 96dpi = `794px`) — it's
deliberately widened ~10% for more comfortable editing room in the Designer. `orientation:
"Landscape"` swaps width/height.

**For `"Custom"`**, there is no lookup — the user types an exact width/height in px directly
in Page & Branding, and `orientation` is ignored/not shown (a custom box has no
implicit rotation).

**In both cases, `template.pageWidth`/`template.pageHeight` are sent on every Save as the
final resolved numbers** — this is the field to actually use for print/PDF generation.
**Do not re-derive page size from `pageSize`+`orientation` on the backend** — that would
reproduce the app's own widened "A4" incorrectly (or fail entirely for `"Custom"`, which has
no table entry at all). Render/export the page at exactly `pageWidth`×`pageHeight` px so the
output matches the Designer/Preview pixel-for-pixel:

```json
{ "pageSize": "A4", "orientation": "Portrait", "pageWidth": 874, "pageHeight": 1123 }
```

```json
{ "pageSize": "Custom", "orientation": "Portrait", "pageWidth": 600, "pageHeight": 900 }
```

Changing `pageSize`/`orientation`/the Custom width/height fields resizes both the Designer
canvas and Preview & Print immediately and identically — both read `pageWidth`/`pageHeight`
from the same place (`getPageDimensions(template)`, `src/Frontend/ReportBuilderNew/constants/pageSizes.js`).

Reference implementation: `src/Frontend/ReportBuilderNew/constants/pageSizes.js`,
`src/Frontend/ReportBuilderNew/utils/layoutJson.js` (`toLayoutJson`/`fromLayoutJson`).

---

## 17. Static Text / Static HTML element borders — `elements[].borderTop/Right/Bottom/Left/borderWidth/borderColor`

Only for `type: "label"` and `type: "html"` elements (typical use: boxing a "For Online
Report..." note or a disclaimer paragraph).

```json
{
  "borderTop": true,
  "borderRight": false,
  "borderBottom": true,
  "borderLeft": false,
  "borderWidth": 1,
  "borderColor": "#1B2E5E"
}
```

Same per-side + shared-width shape as `template.pageBorder` (Section 15), scoped to one
element, with color also configurable (unlike the page/table border features, which use a
fixed color). Default when absent: all sides `false`, `borderWidth: 1`, `borderColor: "#1B2E5E"`.

Reference implementation: `ElementRenderer.jsx`, function `elementBorderStyle()`.

---

## 18. Recommended database schema

Minimum to implement Sections 3–17. Table/column names are suggestions — match your own
conventions if you already have a pattern for similar "one JSON blob per row" storage.

```sql
CREATE TABLE rcpt_field_master (
  FieldID        INT AUTO_INCREMENT PRIMARY KEY,
  ReportType     VARCHAR(50) NOT NULL DEFAULT 'Receipt',     -- 'Receipt' | 'FullyPaidReceipt'
  SectionCode    ENUM('LETTERHEAD','HEADER','FOOTER','BODY_COL','SETTLE_COL','TOTALS','CONFIG') NOT NULL,
  FieldName      VARCHAR(200) NOT NULL,
  TokenName      VARCHAR(100) NULL,        -- e.g. '{PatientName}'; NULL for BODY_COL/SETTLE_COL/TOTALS rows
  ShortKey       VARCHAR(20)  NULL,        -- e.g. 'sr', 'gross' — REQUIRED for BODY_COL/SETTLE_COL/TOTALS, see Section 11.2
  DataType       VARCHAR(20)  NULL,        -- 'Text' | 'Number' | 'Date' | 'DateTime' | 'Amount' | 'Barcode' | 'URL'
  DefaultFormat  VARCHAR(50)  NULL,
  DefaultWidth   DECIMAL(5,2) NULL,        -- % width; BODY_COL/SETTLE_COL only
  DefaultAlign   VARCHAR(1)   NULL,        -- 'L' | 'C' | 'R'; BODY_COL/SETTLE_COL only
  DefaultVisible   TINYINT(1) NOT NULL DEFAULT 1,
  DefaultBoldLabel TINYINT(1) NOT NULL DEFAULT 0,  -- TOTALS only — bolds the row's caption
  DefaultBoldValue TINYINT(1) NOT NULL DEFAULT 0,  -- TOTALS only — bolds the row's amount, independently of the caption
  Remarks        VARCHAR(255) NULL,
  SeqInSection   INT NOT NULL DEFAULT 0,
  IsActive       TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE rcpt_template (
  TemplateID        INT AUTO_INCREMENT PRIMARY KEY,
  ReportType        VARCHAR(50) NOT NULL DEFAULT 'Receipt',
  Code              VARCHAR(50) NOT NULL,
  Name              VARCHAR(200) NOT NULL,
  IsDefault         TINYINT(1) NOT NULL DEFAULT 0,  -- exactly one TRUE per ReportType — see Section 3.3/5
  CurrentStatus     VARCHAR(20) NOT NULL DEFAULT 'Draft',
  CurrentVersion    INT NOT NULL DEFAULT 1,
  CreatedBy         VARCHAR(100) NULL,
  CreatedOn         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedBy         VARCHAR(100) NULL,
  UpdatedOn         DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  IsActive          TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE rcpt_template_version (
  VersionID     INT AUTO_INCREMENT PRIMARY KEY,
  TemplateID    INT NOT NULL,
  VersionNo     INT NOT NULL,
  Status        VARCHAR(20) NOT NULL DEFAULT 'Draft',  -- 'Draft' | 'Published' | 'Archived'
  LayoutJson    JSON NOT NULL,   -- the ENTIRE document from Section 8, stored verbatim
  CreatedOn     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (TemplateID) REFERENCES rcpt_template(TemplateID)
);
```

⚠️ **`LayoutJson` must store the Section 8 shape exactly as the frontend sends it** —
`{template, settings, elements[], bodyColumns[], settlementColumns[], totals[]}`. Do not
transform it into a different internal representation (e.g. a row/column grid) — the
Designer's canvas is intentionally free-form x/y positioning, not a grid, and any
reshaping will corrupt the layout on the next load.

**Queries:**

```sql
-- GetFieldTokens (repeat for SectionCode='FOOTER')
SELECT TokenName AS token, TRIM(BOTH '{}' FROM TokenName) AS `key`, FieldName AS label
FROM rcpt_field_master
WHERE ReportType = @ReportType AND SectionCode = 'HEADER' AND TokenName IS NOT NULL AND IsActive = 1
ORDER BY SeqInSection;

-- GetColumnCatalog — bodyColumns (repeat for SETTLE_COL -> settlementColumns)
SELECT ShortKey AS `key`, FieldName AS label, DefaultWidth AS w,
       CASE DefaultAlign WHEN 'L' THEN 'left' WHEN 'C' THEN 'center' WHEN 'R' THEN 'right' END AS align,
       (DefaultVisible = 1) AS visible,
       (DataType = 'Amount') AS money
FROM rcpt_field_master
WHERE ReportType = @ReportType AND SectionCode = 'BODY_COL' AND IsActive = 1
ORDER BY SeqInSection;

-- GetColumnCatalog — totals
SELECT ShortKey AS `key`, FieldName AS label, (DefaultVisible = 1) AS visible,
       (DefaultBoldLabel = 1) AS boldLabel, (DefaultBoldValue = 1) AS boldValue
FROM rcpt_field_master
WHERE ReportType = @ReportType AND SectionCode = 'TOTALS' AND IsActive = 1
ORDER BY SeqInSection;

-- GetTemplateList
SELECT TemplateID AS templateId, Code AS code, Name AS name, CurrentStatus AS status,
       CurrentVersion AS version, IsDefault AS isDefault, UpdatedBy AS updatedBy, UpdatedOn AS updatedOn
       -- pageSize/orientation: pull from the current version's LayoutJson, or duplicate onto rcpt_template if easier to query
FROM rcpt_template
WHERE ReportType = @ReportType AND IsActive = 1
  AND (@Search = '' OR Name LIKE CONCAT('%', @Search, '%'))
  AND (@Status = '' OR CurrentStatus = @Status)
ORDER BY UpdatedOn DESC;

-- GetTemplateById
SELECT tv.LayoutJson
FROM rcpt_template t
JOIN rcpt_template_version tv ON tv.TemplateID = t.TemplateID AND tv.VersionNo = t.CurrentVersion
WHERE t.TemplateID = @TemplateId;
```

**Seed data**: every value needed to seed `rcpt_field_master` is already listed in full in
Sections 11.1 (all 41 HEADER + 7 FOOTER tokens, exact casing, in order) and 11.2 (all 13
BODY_COL + 8 SETTLE_COL + 5 TOTALS rows, with `ShortKey`/`w`/`align`/`visible`/`money`/
`boldLabel`/`boldValue` each) — write the `INSERT`s directly from those two tables, row for row.

---

## 19. Rotation — `elements[].rotation`

Every element type except the three singleton table anchors (`bodytable`/`settletable`/
`totalsblock`) can be rotated:

```json
{ "type": "label", "text": "PAID", "x": 40, "y": 400, "w": 120, "h": 40, "rotation": -20 }
```

- `rotation` — number, **degrees, clockwise**, default `0`. Negative values rotate
  counter-clockwise (e.g. `-20` above tilts the text slightly up-and-to-the-right, a common
  "PAID"/"DUPLICATE"-stamp-style treatment).
- Rotates the **whole element** — position box and content together as one rigid unit,
  pivoting around the box's own center. `x`/`y`/`w`/`h` still describe the *unrotated*
  box (rotation never changes them), but the actual rendered/printed shape is that box
  turned by `rotation` degrees in place — it will visually extend beyond its own unrotated
  `x/y/w/h` footprint (e.g. a wide, short element rotated 90° reads as tall and narrow on
  the page). Render it the same way the frontend does: position/size the box normally from
  `x`/`y`/`w`/`h`, then apply a CSS `transform: rotate({rotation}deg)` (default
  `transform-origin: 50% 50%`) **to that same box** — content fills the box at 100%, so
  nothing inside it needs separate rotation math or gets clipped.
  ⚠️ An earlier revision of this contract described rotating only the element's inner
  content while keeping its box axis-aligned — that was wrong (or at least, undesired):
  a 90°-rotated element's content overflowed its own still-horizontal box and got clipped
  in the actual output. Rotate the box itself, not just what's inside it.
- **Not applicable to `bodytable`/`settletable`/`totalsblock`.** These render as live
  tables in a separate code path (Sections 9/13) that doesn't apply any rotation transform;
  the Designer's own UI hides the rotation control for these three types for the same
  reason. A `rotation` value present on one of these three (e.g. from hand-edited JSON)
  should be ignored, not rendered.
- Frontend UI: a numeric "Rotation°" field in the Property Panel (every non-table-anchor
  type), plus a small drag handle above the selected element on the Designer canvas —
  dragging it computes the angle from the element's center to the mouse; holding Shift
  while dragging snaps to 15° increments. Both write the same `rotation` field; there's no
  separate "how it was set" flag to track.

---

## 20. Explicitly out of scope / known gaps

- **No real print/PDF generation pipeline** — this API only stores/retrieves template
  definitions. Whatever generates the actual printed receipt for a real patient is a
  separate system and must independently implement Section 9 (reflow) plus render
  everything in Sections 8/13–16 correctly — this frontend's own Preview & Print tab still
  renders against bundled sample data, not real patient data.
- **No `GetReceiptData` endpoint built yet** — real patient/bill data lookup (by
  transaction hash) for the Preview tab is a known future need, not part of this contract.
- **`stampImage`/`image` element `previewSrc`/letterhead `staticHtml` embedded images** — base64 data URIs by design, not uploaded/hosted server-side (Sections 8, 12). Not a gap to close.
- **Per-centre HTML letterhead override** (`html_centrewise`) — behaves identically to
  `html_static` today; no frontend UI exists yet to actually set a different HTML per
  centre, despite the option existing in the radio list.
- **Template-to-centre/rate-type/print-type assignment rules** (which template prints for
  which combination) — not part of this module; out of scope.
