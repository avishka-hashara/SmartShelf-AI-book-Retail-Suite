const t=(e="")=>String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),l=e=>`Rs. ${Number(e??0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,p=e=>{if(!e)return"—";const i=new Date(e);return Number.isNaN(i.getTime())?String(e):i.toLocaleDateString("en-LK",{year:"numeric",month:"short",day:"numeric"})},g={draft:"Draft",ordered:"Ordered",partially_received:"Partially Received",received:"Received",cancelled:"Cancelled"},u=(e,i={})=>{const d=i.shop_name||"Store",a=i.logo_path?`${window.location.origin}/storage/${i.logo_path}`:null,r=[i.address_line1,i.address_line2,[i.city,i.postal_code].filter(Boolean).join(" "),i.phone,i.email].filter(Boolean),o=e.supplier??{},n=[o.contact_person,o.phone,o.email,o.address].filter(Boolean),c=(e.items??[]).map((s,m)=>`
        <tr>
            <td class="num">${m+1}</td>
            <td>
                <div class="item-name">${t(s.product?.name??"Item")}</div>
                <div class="item-sku">${t(s.product?.sku??"")}</div>
            </td>
            <td class="num">${t(String(s.qty_ordered))}</td>
            <td class="num">${t(String(s.qty_received))}</td>
            <td class="num">${t(l(s.unit_cost))}</td>
            <td class="num">${t(l(s.qty_ordered*s.unit_cost))}</td>
        </tr>
    `).join("");return`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Purchase Order ${t(e.po_number)}</title>
    <style>
        @page { size: A4; margin: 16mm; }

        html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            font-family: "Segoe UI", system-ui, sans-serif;
            font-size: 13px;
        }

        .doc { max-width: 100%; }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }

        .shop-block { display: flex; gap: 12px; align-items: center; }
        .shop-logo { width: 56px; height: 56px; object-fit: contain; }
        .shop-name { font-size: 18px; font-weight: 800; letter-spacing: 0.04em; }
        .shop-meta { margin-top: 4px; font-size: 11px; color: #555; line-height: 1.5; }

        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .doc-title .po-number { margin-top: 4px; font-size: 14px; font-weight: 700; font-family: ui-monospace, "Cascadia Mono", monospace; }
        .status-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            background: #eef2ff;
            color: #4338ca;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 20px;
        }

        .meta-box h3 {
            margin: 0 0 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6b7280;
        }
        .meta-box p { margin: 0; line-height: 1.6; }
        .meta-box .name { font-weight: 700; font-size: 14px; }

        .dates-row { display: flex; gap: 28px; margin-bottom: 20px; }
        .dates-row div { font-size: 12px; }
        .dates-row .label { color: #6b7280; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; }
        .dates-row .value { font-weight: 700; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th {
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #6b7280;
            border-bottom: 1px solid #111827;
            padding: 8px 6px;
        }
        tbody td { padding: 10px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .num { text-align: right; font-family: ui-monospace, "Cascadia Mono", monospace; }
        thead th.num { text-align: right; }
        .item-name { font-weight: 600; }
        .item-sku { font-size: 10px; color: #6b7280; font-family: ui-monospace, monospace; }

        .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals-box { width: 260px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .totals-row.grand { border-top: 2px solid #111827; margin-top: 4px; padding-top: 10px; font-size: 16px; font-weight: 800; }

        .notes { margin-bottom: 24px; }
        .notes h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin: 0 0 6px; }
        .notes p { margin: 0; white-space: pre-wrap; }

        .footer {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e5e7eb;
            padding-top: 14px;
            font-size: 11px;
            color: #6b7280;
        }

        .signature-row { display: flex; justify-content: space-between; margin-top: 50px; }
        .signature-block { width: 220px; text-align: center; }
        .signature-line { border-top: 1px solid #111827; margin-bottom: 6px; padding-top: 40px; }
    </style>
</head>
<body>
    <div class="doc">
        <div class="header">
            <div class="shop-block">
                ${a?`<img class="shop-logo" src="${a}" alt="${t(d)}" />`:""}
                <div>
                    <div class="shop-name">${t(d)}</div>
                    ${r.length>0?`<div class="shop-meta">${r.map(s=>t(s)).join("<br />")}</div>`:""}
                </div>
            </div>
            <div class="doc-title">
                <h1>Purchase Order</h1>
                <div class="po-number">${t(e.po_number)}</div>
                <div class="status-badge">${t(g[e.status]??e.status)}</div>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-box">
                <h3>Supplier</h3>
                <p class="name">${t(o.name??"—")}</p>
                ${n.length>0?`<p>${n.map(s=>t(s)).join("<br />")}</p>`:""}
            </div>
            <div class="meta-box">
                <h3>Ordered By</h3>
                <p class="name">${t(e.creator?.name??"—")}</p>
                ${o.payment_terms?`<p>Payment Terms: ${t(o.payment_terms)}</p>`:""}
            </div>
        </div>

        <div class="dates-row">
            <div>
                <div class="label">Order Date</div>
                <div class="value">${t(p(e.order_date))}</div>
            </div>
            <div>
                <div class="label">Expected Date</div>
                <div class="value">${t(p(e.expected_date))}</div>
            </div>
            <div>
                <div class="label">Received Date</div>
                <div class="value">${t(p(e.received_date))}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="num">#</th>
                    <th>Item</th>
                    <th class="num">Qty Ordered</th>
                    <th class="num">Qty Received</th>
                    <th class="num">Unit Cost</th>
                    <th class="num">Line Total</th>
                </tr>
            </thead>
            <tbody>
                ${c}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-box">
                <div class="totals-row grand"><span>Total</span><span>${t(l(e.total_cost))}</span></div>
            </div>
        </div>

        ${e.notes?`<div class="notes"><h3>Notes</h3><p>${t(e.notes)}</p></div>`:""}

        <div class="signature-row">
            <div class="signature-block">
                <div class="signature-line"></div>
                Prepared By
            </div>
            <div class="signature-block">
                <div class="signature-line"></div>
                Authorized Signature
            </div>
        </div>

        <div class="footer">
            <span>Generated ${t(new Date().toLocaleString("en-LK"))}</span>
            <span>${t(d)}</span>
        </div>
    </div>
</body>
</html>`},f=(e,i={},{onAfterPrint:d}={})=>{if(typeof window>"u"||typeof document>"u"){d?.();return}const a=document.createElement("iframe");a.setAttribute("aria-hidden","true"),a.style.position="fixed",a.style.right="0",a.style.bottom="0",a.style.width="0",a.style.height="0",a.style.border="0";let r=!1;const o=()=>{r||(r=!0,d?.(),setTimeout(()=>{a.remove()},150))};a.onload=()=>{const n=a.contentWindow;if(!n){o();return}n.addEventListener("afterprint",o,{once:!0}),setTimeout(()=>{try{n.focus(),n.print()}catch{o();return}setTimeout(o,1500)},250)},document.body.appendChild(a),a.srcdoc=u(e,i)};export{f as p};
