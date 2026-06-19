// resources/js/Pages/POS/POSTerminal.jsx
//
// DEPENDENCIES (run once):
//   npm install jspdf jspdf-autotable

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { BookOpen, Pencil, Backpack, Package, Phone, Star, User, UserPlus, ShoppingCart, Store, FileText, MessageCircle, Loader, CheckCircle, Banknote, CreditCard, Trash2, Calendar, Gift, Tag, Sparkles, X, Percent, RefreshCcw, AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
let globalSymbol = 'Rs. ';
const fmt = (n) =>
    `${globalSymbol}${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const avatarColor = (name) => {
    const colors = [
        'bg-indigo-100 text-indigo-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
        'bg-cyan-100 text-cyan-700',
        'bg-rose-100 text-rose-700',
        'bg-violet-100 text-violet-700',
    ];
    return colors[(name || 'A').charCodeAt(0) % colors.length];
};
const initials = (name) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** Category → gradient + letter used in the image placeholder */
const CATEGORY_META = {
    books: { gradient: 'from-indigo-400 to-indigo-600', letter: 'B', Icon: BookOpen },
    stationery: { gradient: 'from-amber-400 to-amber-600', letter: 'S', Icon: Pencil },
    school_accessories: { gradient: 'from-emerald-400 to-emerald-600', letter: 'A', Icon: Backpack },
};
const categoryMeta = (cat) =>
    CATEGORY_META[cat] ?? { gradient: 'from-slate-400 to-slate-600', letter: '?', Icon: Package };

/* ─────────────────────────────────────────────────
    RECEIPT HELPERS
    ───────────────────────────────────────────────── */
const generateReceiptPDF = async (order, settings = {}) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ unit: 'mm', format: [80, 200], orientation: 'portrait' });
    const W = 80;
    let y = 8;

    const center = (text, fontSize = 10, bold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(text, W / 2, y, { align: 'center' });
        y += fontSize * 0.5;
    };
    const line = () => {
        doc.setDrawColor(200);
        doc.line(4, y, W - 4, y);
        y += 3;
    };

    // ── Store header (from settings) ──
    const shopName = settings.shop_name || 'STORE';
    const tagline = settings.tagline || 'Point of Sale';
    const cityPhone = [settings.city, settings.phone].filter(Boolean).join(' | ');

    center(shopName.toUpperCase(), 14, true);
    y += 1;
    center(tagline, 8);
    if (cityPhone) center(cityPhone, 7);
    y += 2;
    line();

    // ── Receipt header text ──
    if (settings.receipt_header) {
        center(settings.receipt_header, 7);
        y += 2;
        line();
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(`Receipt #: ${order.receiptNo}`, 4, y);
    doc.text(`Date: ${now.toLocaleDateString('en-LK')}`, W - 4, y, { align: 'right' });
    y += 4;
    doc.text(`Time: ${now.toLocaleTimeString('en-LK')}`, 4, y);
    doc.text(`Cashier: ${order.cashier}`, W - 4, y, { align: 'right' });
    y += 4;
    if (order.customer) {
        doc.text(`Customer: ${order.customer.name}`, 4, y);
        y += 4;
    }
    line();

    autoTable(doc, {
        startY: y,
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: order.items.map((item) => {
            const promoText = item.isPromotion && item.promotionName ? `\n[Promo: ${item.promotionName}]` : '';
            return [
                `${item.name}\n${item.brand}${promoText}`,
                item.qty,
                `Rs. ${item.price.toLocaleString()}`,
                `Rs. ${(item.qty * item.price).toLocaleString()}`,
            ];
        }),
        styles: { fontSize: 7, cellPadding: 1.5, textColor: [17, 24, 39], lineColor: [17, 24, 39], lineWidth: 0.1 },
        headStyles: { fillColor: [255, 255, 255], textColor: [17, 24, 39], fontSize: 7, fontStyle: 'bold', lineWidth: 0.15 },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 8, halign: 'center' },
            2: { cellWidth: 20, halign: 'right' },
            3: { cellWidth: 20, halign: 'right' },
        },
        margin: { left: 4, right: 4 },
        theme: 'grid',
    });

    y = doc.lastAutoTable.finalY + 4;
    line();

    const totalsData = [
        ['Subtotal', fmt(order.subtotal)],
        ...(order.discount > 0
            ? [[`Discount (${order.discountPct}%)`, `-${fmt(order.discount)}`]]
            : []),
        ['Total', fmt(order.total)],
    ];
    if (order.isSplitPayment) {
        order.splitPayments.forEach(sp => totalsData.push([sp.method.toUpperCase(), fmt(sp.amount)]));
        if (order.change > 0) totalsData.push(['Change', fmt(order.change)]);
    } else {
        totalsData.push(['Payment', order.paymentMethod === 'cash' ? `Cash — ${fmt(order.cashGiven)}` : 'Card']);
        if (order.paymentMethod === 'cash' && order.change > 0) totalsData.push(['Change', fmt(order.change)]);
    }

    totalsData.forEach(([label, value]) => {
        const isTotal = label === 'Total';
        doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
        doc.setFontSize(isTotal ? 9 : 8);
        doc.text(label, 4, y);
        doc.text(value, W - 4, y, { align: 'right' });
        y += isTotal ? 5 : 4;
    });

    line();
    y += 2;

    // ── Receipt footer text ──
    if (settings.receipt_footer) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const footerLines = doc.splitTextToSize(settings.receipt_footer, W - 8);
        footerLines.forEach(fl => {
            doc.text(fl, W / 2, y, { align: 'center' });
            y += 3.5;
        });
        y += 1;
    } else {
        center('Thank you for shopping with us!', 8, true);
        y += 2;
        center('Please come again!', 7);
    }

    // ── Active social / website links ──
    const links = [
        settings.receipt_show_website && settings.website && `Web: ${settings.website}`,
        settings.receipt_show_facebook && settings.facebook && `FB:  ${settings.facebook}`,
        settings.receipt_show_instagram && settings.instagram && `IG:  ${settings.instagram}`,
        settings.receipt_show_whatsapp && settings.whatsapp && `WA:  ${settings.whatsapp}`,
    ].filter(Boolean);

    if (links.length > 0) {
        y += 2;
        line();
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        links.forEach(link => {
            doc.text(link, W / 2, y, { align: 'center' });
            y += 3.5;
        });
    }

    return doc;
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatReceiptDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime())
        ? new Date().toLocaleDateString('en-LK')
        : date.toLocaleDateString('en-LK');
};

const formatReceiptTime = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime())
        ? new Date().toLocaleTimeString('en-LK')
        : date.toLocaleTimeString('en-LK');
};

const normalizeReceiptItems = (items = []) =>
    items.map((item) => {
        const price = Number(item.price ?? item.unit_price ?? 0);
        const qty = Number(item.qty ?? 0);

        return {
            id: item.id,
            name: item.name ?? item.title ?? 'Item',
            brand: item.brand ?? '',
            qty,
            price,
            total: Number(item.subtotal ?? qty * price),
        };
    });

const buildReceiptPrintHtml = (order, settings = {}) => {
    const receiptItems = normalizeReceiptItems(order.items);
    const shopName = settings.shop_name || 'Store';
    const tagline = settings.tagline || 'Point of Sale';
    const logoUrl = settings.logo_path ? `${window.location.origin}/storage/${settings.logo_path}` : null;
    const customerName = order.customer?.name || 'Walk-in Customer';
    let paymentMarkup = '';
    if (order.isSplitPayment) {
        paymentMarkup = order.splitPayments.map(sp => `
            <div class="summary-row"><span>${escapeHtml(sp.method.toUpperCase())}</span><span>${escapeHtml(fmt(sp.amount))}</span></div>
        `).join('');
    } else {
        const paymentLabel = order.paymentMethod === 'cash'
            ? `Cash${order.cashGiven ? ` - ${fmt(order.cashGiven)}` : ''}`
            : 'Card';
        paymentMarkup = `<div class="summary-row"><span>Payment</span><span>${escapeHtml(paymentLabel)}</span></div>`;
    }

    const storeLines = [
        settings.address_line1,
        settings.address_line2,
        [settings.city, settings.postal_code].filter(Boolean).join(' '),
        settings.phone,
        settings.email,
    ].filter(Boolean);

    const linkLines = [
        settings.receipt_show_website && settings.website ? settings.website : null,
        settings.receipt_show_facebook && settings.facebook ? settings.facebook : null,
        settings.receipt_show_instagram && settings.instagram ? settings.instagram : null,
        settings.receipt_show_whatsapp && settings.whatsapp ? settings.whatsapp : null,
    ].filter(Boolean);

    const itemsMarkup = receiptItems.map((item) => `
        <div class="item-row-wrap">
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${item.brand ? `<div class="item-brand">${escapeHtml(item.brand)}</div>` : ''}
            <div class="item-meta">
                <span>${escapeHtml(`${item.qty} x ${fmt(item.price)}`)}</span>
                <span>${escapeHtml(fmt(item.total))}</span>
            </div>
        </div>
    `).join('');

    const footerMarkup = settings.receipt_footer
        ? `<div class="footer-text">${escapeHtml(settings.receipt_footer).replace(/\n/g, '<br />')}</div>`
        : '<div class="footer-text">Thank you for shopping with us.</div>';

    const headerMarkup = settings.receipt_header
        ? `<div class="banner">${escapeHtml(settings.receipt_header)}</div>`
        : '';

    const linkMarkup = linkLines.length > 0
        ? `<div class="meta-stack muted">${linkLines.map((lineValue) => `<div>${escapeHtml(lineValue)}</div>`).join('')}</div>`
        : '';

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(order.receiptNo)}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 5mm 4mm;
        }

        html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111111;
            font-family: "Segoe UI", system-ui, sans-serif;
        }

        body {
            width: 72mm;
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .receipt {
            font-size: 13px;
            line-height: 1.5;
        }

        .center {
            text-align: center;
        }

        .shop-logo {
            width: 72px;
            height: 72px;
            object-fit: contain;
            margin: 0 auto 8px;
            display: block;
        }

        .shop-name {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .tagline {
            margin-top: 3px;
            font-size: 12px;
            color: #444444;
        }

        .meta-stack {
            margin-top: 6px;
        }

        .rule {
            border-top: 1px dashed #111111;
            margin: 10px 0;
        }

        .banner {
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .meta-row,
        .summary-row,
        .item-meta {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }

        .meta-row span:last-child,
        .summary-row span:last-child,
        .item-meta span:last-child {
            text-align: right;
        }

        .section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            margin-bottom: 6px;
        }

        .item-row-wrap {
            padding: 7px 0;
            border-bottom: 1px dotted #a3a3a3;
        }

        .item-row-wrap:last-child {
            border-bottom: 0;
        }

        .item-name {
            font-weight: 600;
        }

        .item-brand,
        .muted {
            color: #555555;
        }

        .item-brand {
            margin-top: 1px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .item-meta,
        .meta-row,
        .summary-row {
            font-family: ui-monospace, "Cascadia Mono", "Courier New", monospace;
        }

        .total-row {
            border-top: 1px solid #111111;
            margin-top: 6px;
            padding-top: 7px;
            font-size: 16px;
            font-weight: 800;
        }

        .footer {
            margin-top: 12px;
            text-align: center;
        }

        .footer-text {
            font-size: 12px;
            font-weight: 600;
            line-height: 1.5;
        }

        .powered-by {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #bbbbbb;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #888888;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="center">
            ${logoUrl ? `<img class="shop-logo" src="${logoUrl}" alt="${escapeHtml(shopName)}" />` : ''}
            <div class="shop-name">${escapeHtml(shopName)}</div>
            <div class="tagline">${escapeHtml(tagline)}</div>
            ${storeLines.length > 0 ? `<div class="meta-stack muted">${storeLines.map((lineValue) => `<div>${escapeHtml(lineValue)}</div>`).join('')}</div>` : ''}
        </div>

        <div class="rule"></div>
        ${headerMarkup}

        <div class="meta-row"><span>Receipt</span><span>${escapeHtml(order.receiptNo)}</span></div>
        <div class="meta-row"><span>Date</span><span>${escapeHtml(formatReceiptDate(order.createdAt))}</span></div>
        <div class="meta-row"><span>Time</span><span>${escapeHtml(formatReceiptTime(order.createdAt))}</span></div>
        <div class="meta-row"><span>Cashier</span><span>${escapeHtml(order.cashier)}</span></div>
        <div class="meta-row"><span>Customer</span><span>${escapeHtml(customerName)}</span></div>

        <div class="rule"></div>
        <div class="section-title">Items</div>
        ${itemsMarkup}

        <div class="rule"></div>
        <div class="summary-row"><span>Subtotal</span><span>${escapeHtml(fmt(order.subtotal))}</span></div>
        ${order.discount > 0 ? `<div class="summary-row"><span>Discount${order.discountPct ? ` (${escapeHtml(String(order.discountPct))}%)` : ''}</span><span>-${escapeHtml(fmt(order.discount))}</span></div>` : ''}
        <div class="summary-row total-row"><span>Total</span><span>${escapeHtml(fmt(order.total))}</span></div>
        ${paymentMarkup}
        ${order.change > 0 && (order.isSplitPayment || order.paymentMethod === 'cash') ? `<div class="summary-row"><span>Change</span><span>${escapeHtml(fmt(order.change))}</span></div>` : ''}

        <div class="rule"></div>
        <div class="footer">
            ${footerMarkup}
            ${linkMarkup}
            <div class="powered-by">PosSystem.LK</div>
        </div>
    </div>
</body>
</html>`;
};

const printReceipt = (order, settings = {}, { onAfterPrint } = {}) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        onAfterPrint?.();
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    let completed = false;

    const finalize = () => {
        if (completed) return;
        completed = true;
        onAfterPrint?.();
        setTimeout(() => {
            iframe.remove();
        }, 150);
    };

    iframe.onload = () => {
        const frameWindow = iframe.contentWindow;
        if (!frameWindow) {
            finalize();
            return;
        }

        frameWindow.addEventListener('afterprint', finalize, { once: true });

        setTimeout(() => {
            try {
                frameWindow.focus();
                frameWindow.print();
            } catch {
                finalize();
                return;
            }

            setTimeout(finalize, 1500);
        }, 250);
    };

    document.body.appendChild(iframe);
    iframe.srcdoc = buildReceiptPrintHtml(order, settings);
};

/* ─────────────────────────────────────────────────
   PRODUCT IMAGE (with graceful placeholder)
   Same pattern as employee avatars in Employees.jsx:
     <img src={`/storage/${employee.avatar}`} />
   product.imagePath = raw DB value e.g. "products/photo.jpg"
   ───────────────────────────────────────────────── */
const ProductImage = ({ product, className = '' }) => {
    const [imgError, setImgError] = useState(false);
    const meta = categoryMeta(product.category);

    // Support both `image_url` (full/relative URL) and `imagePath` (raw DB path)
    const rawPath = product.image_url || product.imagePath || null;
    const src = rawPath
        ? (rawPath.startsWith('http') || rawPath.startsWith('/')
            ? rawPath
            : `/storage/${rawPath}`)
        : null;

    if (src && !imgError) {
        return (
            <img
                src={src}
                alt={product.name}
                onError={() => setImgError(true)}
                className={`object-contain ${className}`}
            />
        );
    }

    /* Placeholder — gradient tile with category icon */
    return (
        <div
            className={`bg-gradient-to-br ${meta.gradient} flex items-center justify-center ${className}`}
            aria-hidden="true"
        >
            <meta.Icon className="w-6 h-6 text-white/80" />
        </div>
    );
};

/* ─────────────────────────────────────────────────
   PRODUCT CARD (Touch-friendly, image-first)
   ───────────────────────────────────────────────── */
const ProductCard = ({ product, cartQty, onTap }) => {
    const outOfStock = product.stock === 0;
    const inCart = cartQty > 0;

    const stockBadgeClass =
        product.stock === 0 ? 'bg-red-100 text-red-600'
            : product.stock <= 5 ? 'bg-red-100 text-red-600'
                : product.stock <= 15 ? 'bg-amber-100 text-amber-600'
                    : 'bg-emerald-100 text-emerald-600';

    return (
        <button
            onClick={() => !outOfStock && onTap(product)}
            disabled={outOfStock}
            className={`relative w-full rounded-2xl border-2 text-left transition-all duration-150 active:scale-95 overflow-hidden flex flex-col
                ${outOfStock
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50'
                    : inCart
                        ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50'}`}
        >
            {/* Cart qty badge */}
            {inCart && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                    {cartQty}
                </div>
            )}

            {/* Out-of-stock overlay */}
            {outOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Out of Stock
                    </span>
                </div>
            )}

            {/* Product image / placeholder */}
            <div className="w-full aspect-[4/3] flex-shrink-0 overflow-hidden">
                <ProductImage
                    product={product}
                    className="w-full h-full"
                />
            </div>

            {/* Info */}
            <div className="p-2.5 flex flex-col flex-1">
                {/* Stock badge */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stockBadgeClass}`}>
                        {product.stock === 0 ? 'Out' : `${product.stock} left`}
                    </span>
                    {inCart && (
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            In cart
                        </span>
                    )}
                </div>

                {/* Name & brand */}
                <p className="font-semibold text-slate-800 text-xs leading-tight line-clamp-2 mb-0.5 flex-1">
                    {product.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate mb-1.5">{product.brand}</p>

                {/* Price */}
                <p className="font-bold text-indigo-700 text-sm">{fmt(product.price)}</p>
            </div>
        </button>
    );
};

/* ─────────────────────────────────────────────────
   CART ITEM ROW
   ───────────────────────────────────────────────── */
const CartItem = ({ item, onQtyChange, onRemove }) => (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
        {/* Tiny product thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
            <ProductImage product={item} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{item.name}</p>
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-1 items-center">
                {item.isPromotion && item.originalPrice && item.originalPrice > item.price ? (
                    <>
                        <span className="line-through text-slate-300">{fmt(item.originalPrice)}</span>
                        <span className="text-emerald-600 font-bold">{fmt(item.price)}</span>
                    </>
                ) : (
                    <span>{fmt(item.price)} each</span>
                )}
                {item.promotionName && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ml-1">
                        {item.promotionName}
                    </span>
                )}
            </div>
        </div>
        {/* Qty controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
                onClick={() => onQtyChange(item.id, item.qty - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 font-bold text-lg flex items-center justify-center transition-all active:scale-90"
            >
                −
            </button>
            <span className="w-8 text-center font-bold text-slate-800 text-sm">{item.qty}</span>
            <button
                onClick={() => onQtyChange(item.id, item.qty + 1)}
                disabled={item.qty >= item.stock}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 font-bold text-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
            >
                +
            </button>
        </div>
        {/* Line total */}
        <div className="text-right flex-shrink-0 w-20">
            <p className="font-bold text-slate-800 text-sm">{fmt(item.qty * item.price)}</p>
            <button
                onClick={() => onRemove(item.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
                Remove
            </button>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   CUSTOMER SEARCH POPUP
   ───────────────────────────────────────────────── */
const CustomerPopup = ({ customers, onSelect, onGuest, onClose, onNewCustomer }) => {
    const [search, setSearch] = useState('');
    const [view, setView] = useState('search'); // 'search' | 'add'
    const inputRef = useRef(null);

    // Quick-add form state
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => { inputRef.current?.focus(); }, [view]);

    const filtered = useMemo(
        () =>
            customers.filter(
                (c) =>
                    !search ||
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    (c.phone && c.phone.includes(search))
            ),
        [search, customers]
    );

    const setField = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setFormErrors((fe) => ({ ...fe, [field]: null }));
    };

    const handleQuickAdd = async () => {
        // Client-side validation — email is optional at the POS counter
        const errors = {};
        if (!form.name.trim()) errors.name = 'Name is required';
        if (!form.phone.trim()) errors.phone = 'Phone is required';
        if (Object.keys(errors).length) { setFormErrors(errors); return; }

        setSaving(true);
        try {
            const xsrfCookie = document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='));
            const csrfToken = xsrfCookie
                ? decodeURIComponent(xsrfCookie.split('=').slice(1).join('='))
                : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');

            // Send as form-encoded — matches what Inertia/Laravel expects natively
            const params = new URLSearchParams({ name: form.name.trim(), phone: form.phone.trim(), status: 'Active' });
            if (form.email.trim()) params.append('email', form.email.trim());

            const res = await fetch('/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: params.toString(),
            });

            // 422 = Laravel validation errors (JSON because of Accept header)
            if (res.status === 422) {
                try {
                    const json = await res.json();
                    if (json.errors) {
                        const mapped = {};
                        Object.entries(json.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
                        setFormErrors(mapped);
                    } else {
                        alert(json.message || 'Validation failed.');
                    }
                } catch {
                    alert('Validation failed. Please check your input.');
                }
                setSaving(false);
                return;
            }

            if (!res.ok) {
                alert(`Server error (${res.status}). Please try again.`);
                setSaving(false);
                return;
            }

            // Inertia routes redirect on success — build the customer locally from form data.
            // A temporary negative ID avoids clashing with real IDs in the customer list.
            const newCustomer = {
                id: -(Date.now()),
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                visits: 0,
                totalSpent: 0,
                loyaltyPts: 0,
            };

            onNewCustomer(newCustomer);
            onSelect(newCustomer);
        } catch {
            alert('Network error. Could not save customer.');
        }
        setSaving(false);
    };

    /* ── Search view ── */
    if (view === 'search') return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modal-in_200ms_ease]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Select Customer</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Search by name or phone number</p>
                    </div>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pb-3">
                    <div className="search-input-wrapper">
                        <span className="search-icon">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                            </svg>
                        </span>
                        <input
                            ref={inputRef}
                            className="search-input"
                            placeholder="Search name or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Customer list */}
                <div className="max-h-64 overflow-y-auto px-4 pb-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 text-sm">No customers found</p>
                            <button
                                onClick={() => setView('add')}
                                className="mt-3 text-indigo-600 text-sm font-semibold hover:underline"
                            >
                                + Add "{search || 'new customer'}"
                            </button>
                        </div>
                    ) : (
                        filtered.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => onSelect(c)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all text-left"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(c.name)}`}>
                                    {initials(c.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                                    <p className="text-xs text-slate-400">
                                        <Phone className="w-3 h-3 inline -mt-0.5 mr-0.5 text-slate-400" /> {c.phone ?? '—'} &nbsp;·&nbsp; {c.visits} visits
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-indigo-600">{fmt(c.totalSpent)}</p>
                                    {c.loyaltyPts > 0 && (
                                        <p className="text-[10px] text-amber-500"><Star className="w-3 h-3 inline -mt-0.5 mr-0.5" /> {c.loyaltyPts} pts</p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer gap-2">
                    <button onClick={onGuest} className="btn-secondary flex-1">
                        <User className="w-4 h-4 inline -mt-0.5 mr-1" /> Guest
                    </button>
                    <button onClick={() => setView('add')} className="btn-primary flex-1">
                        <UserPlus className="w-4 h-4 inline -mt-0.5 mr-1" /> New Customer
                    </button>
                </div>
            </div>
        </div>
    );

    /* ── Quick-add view ── */
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !saving && setView('search')}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modal-in_200ms_ease]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('search')}
                            disabled={saving}
                            className="btn-icon text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="modal-title">Quick Add Customer</h2>
                            <p className="text-xs text-slate-400 mt-0.5">New customer will be saved & selected</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={saving} className="btn-icon text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="px-5 py-4 space-y-3">
                    {/* Name */}
                    <div>
                        <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                        <input
                            ref={inputRef}
                            className={`form-input ${formErrors.name ? 'border-red-400' : ''}`}
                            placeholder="e.g. Jane Cooper"
                            value={form.name}
                            onChange={setField('name')}
                            disabled={saving}
                        />
                        {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="form-label">Email Address <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                        <input
                            type="email"
                            className={`form-input ${formErrors.email ? 'border-red-400' : ''}`}
                            placeholder="e.g. jane@example.com"
                            value={form.email}
                            onChange={setField('email')}
                            disabled={saving}
                        />
                        {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                        <input
                            className={`form-input ${formErrors.phone ? 'border-red-400' : ''}`}
                            placeholder="e.g. +94 77 000 0000"
                            value={form.phone}
                            onChange={setField('phone')}
                            disabled={saving}
                        />
                        {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button onClick={() => setView('search')} disabled={saving} className="btn-secondary">
                        Back
                    </button>
                    <button onClick={handleQuickAdd} disabled={saving} className="btn-primary flex-1">
                        {saving
                            ? <><Loader className="w-4 h-4 inline -mt-0.5 mr-1.5 animate-spin" /> Saving…</>
                            : <><UserPlus className="w-4 h-4 inline -mt-0.5 mr-1.5" /> Add & Select</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   QUANTITY NUMPAD MODAL
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
const NumpadModal = ({ product, currentQty, onConfirm, onClose }) => {
    const [qty, setQty] = useState(currentQty > 0 ? String(currentQty) : '');
    const inputRef = useRef(null);

    // Auto-focus and select all text when the modal opens
    useEffect(() => {
        const t = setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 30);
        return () => clearTimeout(t);
    }, []);

    const confirm = () => {
        const n = parseInt(qty, 10);
        const safe = (!n || n < 1) ? 1 : Math.min(n, product.stock);
        onConfirm(safe);
    };

    // Numpad button handler — just manipulates the qty string, then refocuses input
    const numpadPress = (k) => {
        if (k === 'C')  { setQty('');                                                  }
        else if (k === '\u232b') { setQty(v => v.length > 1 ? v.slice(0, -1) : '');   }
        else            { setQty(v => v === '' ? k : v + k);                          }
        inputRef.current?.focus();
    };

    const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '\u232b'];

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xs animate-[modal-in_200ms_ease]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5">
                    {/* Product mini-preview */}
                    <div className="flex items-center gap-3 mb-4 bg-slate-50 rounded-xl p-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                            <ProductImage product={product} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.stock} in stock</p>
                        </div>
                    </div>

                    {/* Quantity input — this IS the display */}
                    <div className="mb-4 text-center">
                        <p className="text-xs text-slate-400 mb-2">Quantity</p>
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={qty}
                            placeholder="1"
                            onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter')  { e.preventDefault(); confirm(); }
                                if (e.key === 'Escape') { e.preventDefault(); onClose(); }
                            }}
                            className="w-full text-center text-4xl font-bold text-indigo-600 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            = {fmt((parseInt(qty, 10) || 0) * product.price)}
                        </p>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {KEYS.map((k) => (
                            <button
                                key={k}
                                onClick={() => numpadPress(k)}
                                className={`h-14 rounded-xl font-bold text-lg transition-all active:scale-95
                                    ${k === '\u232b'
                                        ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                                        : k === 'C'
                                            ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={confirm} className="btn-primary flex-1">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   RECEIPT MODAL (Post-checkout)
   ───────────────────────────────────────────────── */
const ReceiptPreview = ({ order, settings = {} }) => {
    const receiptItems = normalizeReceiptItems(order.items);
    const storeLines = [
        settings.address_line1,
        settings.address_line2,
        [settings.city, settings.postal_code].filter(Boolean).join(' '),
        settings.phone,
    ].filter(Boolean);

    return (
        <div className="mx-auto w-full max-w-[310px] rounded-[28px] border border-slate-200 bg-white p-4 text-[11px] text-slate-800 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.55)]">
            <div className="text-center">
                {settings.logo_path && (
                    <img
                        src={`/storage/${settings.logo_path}`}
                        alt={settings.shop_name || 'Store'}
                        className="mx-auto mb-2 h-16 w-16 rounded-lg object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <p className="text-[17px] font-black uppercase tracking-[0.28em] text-slate-900">{settings.shop_name || 'Store'}</p>
                <p className="mt-1 text-[11px] text-slate-500">{settings.tagline || 'Point of Sale'}</p>
                {storeLines.length > 0 && (
                    <div className="mt-2 space-y-0.5 text-[10px] text-slate-500">
                        {storeLines.map((lineValue) => (
                            <p key={lineValue}>{lineValue}</p>
                        ))}
                    </div>
                )}
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            {settings.receipt_header && (
                <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {settings.receipt_header}
                </p>
            )}

            <div className="space-y-1 font-mono text-[10px] text-slate-600">
                <div className="flex items-center justify-between gap-3"><span>Receipt</span><span>{order.receiptNo}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Date</span><span>{formatReceiptDate(order.createdAt)}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Time</span><span>{formatReceiptTime(order.createdAt)}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Cashier</span><span>{order.cashier}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Customer</span><span className="truncate text-right">{order.customer?.name || 'Walk-in Customer'}</span></div>
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            <div className="space-y-2">
                {receiptItems.map((item) => (
                    <div key={`${item.id}-${item.name}`} className="border-b border-dotted border-slate-200 pb-2 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.brand && <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-400">{item.brand}</p>}
                        <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[10px] text-slate-600">
                            <span>{item.qty} x {fmt(item.price)}</span>
                            <span>{fmt(item.total)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            <div className="space-y-1 font-mono text-[10px] text-slate-700">
                <div className="flex items-center justify-between gap-3"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                {order.discount > 0 && (
                    <div className="flex items-center justify-between gap-3"><span>Discount {order.discountPct ? `(${order.discountPct}%)` : ''}</span><span>-{fmt(order.discount)}</span></div>
                )}
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-900 pt-2 text-[13px] font-bold text-slate-900">
                    <span>Total</span>
                    <span>{fmt(order.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-3"><span>Payment</span><span>{order.paymentMethod === 'cash' ? `Cash${order.cashGiven ? ` - ${fmt(order.cashGiven)}` : ''}` : 'Card'}</span></div>
                {order.paymentMethod === 'cash' && order.change > 0 && (
                    <div className="flex items-center justify-between gap-3"><span>Change</span><span>{fmt(order.change)}</span></div>
                )}
            </div>

            <div className="my-3 border-t border-dashed border-slate-300" />

            <div className="space-y-2 text-center text-[11px] font-semibold text-slate-500">
                <p>{settings.receipt_footer || 'Thank you for shopping with us.'}</p>
                {(settings.receipt_show_website && settings.website) && <p>{settings.website}</p>}
                {(settings.receipt_show_instagram && settings.instagram) && <p>{settings.instagram}</p>}
                {(settings.receipt_show_whatsapp && settings.whatsapp) && <p>{settings.whatsapp}</p>}
            </div>
            <div className="mt-3 border-t border-dashed border-slate-200 pt-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                PosSystem.LK
            </div>
        </div>
    );
};

const ReceiptModal = ({ order, onClose, onNewSale, settings = {} }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [printing, setPrinting] = useState(false);

    const handlePrint = () => {
        setPrinting(true);
        printReceipt(order, settings, {
            onAfterPrint: () => setPrinting(false),
        });
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            handlePrint();
        }, 180);

        return () => window.clearTimeout(timer);
    }, []);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const doc = await generateReceiptPDF(order, settings);
            doc.save(`Receipt-${order.receiptNo}.pdf`);
        } catch {
            alert('PDF generation failed. Run: npm install jspdf jspdf-autotable');
        }
        setDownloading(false);
    };

    const handleWhatsApp = async () => {
        if (!order.customer?.phone) {
            alert('No customer phone number. Please select a customer first.');
            return;
        }
        setSending(true);
        try {
            const doc = await generateReceiptPDF(order, settings);
            doc.save(`Receipt-${order.receiptNo}.pdf`);
            const shopName = settings.shop_name || 'Our Store';
            const footer = settings.receipt_footer ? `\n_${settings.receipt_footer}_` : '\nThank you for shopping with us!';
            const website = settings.receipt_show_website && settings.website ? `\nWeb: ${settings.website}` : '';
            const instagram = settings.receipt_show_instagram && settings.instagram ? `\nIG: ${settings.instagram}` : '';
            const whatsapp = settings.receipt_show_whatsapp && settings.whatsapp ? `\nWA: ${settings.whatsapp}` : '';
            const msg = encodeURIComponent(
                `*${shopName.toUpperCase()} - Receipt #${order.receiptNo}*\n\n` +
                `Date: ${new Date().toLocaleDateString('en-LK')}\n` +
                `Customer: ${order.customer.name}\n\n` +
                order.items.map((i) => `- ${i.name} x${i.qty} -- ${fmt(i.qty * i.price)}`).join('\n') +
                `\n\nSubtotal: ${fmt(order.subtotal)}\n` +
                (order.discount > 0
                    ? `Discount (${order.discountPct}%): -${fmt(order.discount)}\n`
                    : '') +
                `*Total: ${fmt(order.total)}*\n` +
                `Payment: ${order.paymentMethod === 'cash' ? 'Cash' : 'Card'}\n` +
                (order.paymentMethod === 'cash' && order.change > 0
                    ? `Change: ${fmt(order.change)}\n`
                    : '') +
                footer + website + instagram + whatsapp
            );
            const phone = order.customer.phone.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
            setSent(true);
        } catch {
            alert('Failed. Run: npm install jspdf jspdf-autotable');
        }
        setSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-md animate-[modal-in_200ms_ease] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Success header */}
                <div className="bg-slate-950 px-6 py-6 text-center border-b border-slate-800 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:text-white hover:border-white/30"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 rounded-full border border-white/10 bg-white text-3xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-black/20">
                        ✓
                    </div>
                    <h2 className="text-xl font-bold text-white">Sale Complete!</h2>
                    <p className="text-sm text-slate-300 mt-1">Receipt #{order.receiptNo}</p>
                </div>

                {/* Summary */}
                <div className="px-6 py-5 space-y-4 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%)] overflow-y-auto flex-1">
                    {order.customer && (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${avatarColor(order.customer.name)}`}
                            >
                                {initials(order.customer.name)}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{order.customer.name}</p>
                                <p className="text-xs text-slate-500"><Phone className="w-3 h-3 inline -mt-0.5 mr-0.5 text-slate-400" /> {order.customer.phone}</p>
                            </div>
                        </div>
                    )}

                    <ReceiptPreview order={order} settings={settings} />

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
                        {printing ? 'Sending 80mm receipt to the printer...' : 'Receipt is ready in 80mm black and white. Use Print Bill to reprint anytime.'}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            onClick={handlePrint}
                            disabled={printing}
                            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-950 text-white hover:bg-black font-semibold text-sm transition-all active:scale-95 disabled:opacity-60"
                        >
                            {printing ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {printing ? 'Printing...' : 'Print Bill'}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-950 font-semibold text-sm transition-all active:scale-95"
                        >
                            {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {downloading ? 'Generating…' : 'Download PDF'}
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            disabled={sending || !order.customer}
                            className={`col-span-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-all active:scale-95
                                ${sent ? 'bg-emerald-500 text-white' : 'bg-[#25D366] text-white hover:bg-[#1ebe5d]'}
                                ${!order.customer ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!order.customer ? 'Select a customer to send via WhatsApp' : ''}
                        >
                            {sending ? <Loader className="w-4 h-4 animate-spin" /> : sent ? <CheckCircle className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}{' '}
                            {sending ? 'Opening…' : sent ? 'Sent!' : 'WhatsApp'}
                        </button>
                        <button onClick={onNewSale} className="btn-primary h-12 text-sm rounded-xl">
                            <ShoppingCart className="w-4 h-4 inline -mt-0.5 mr-1.5" /> New Sale
                        </button>
                    </div>
                    {!order.customer && (
                        <p className="text-xs text-slate-400 text-center">
                            Select a customer to enable WhatsApp sending
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   REFUND RECEIPT MODAL
   ───────────────────────────────────────────────── */
const RefundReceiptModal = ({ receipt, onFinish }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-[modal-in_200ms_ease]">
                {/* Success header */}
                <div className="bg-amber-50 rounded-t-2xl px-6 py-6 text-center border-b border-amber-100">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-amber-200">
                        <RefreshCcw className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-800">Refund Complete!</h2>
                    <p className="text-sm text-amber-600 mt-1">Return Note #{receipt.return_number}</p>
                </div>

                {/* Summary */}
                <div className="px-6 py-5 space-y-3">
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>{receipt.refunded_items.length} item(s)</span>
                            <span>{receipt.refunded_items.reduce((s, i) => s + i.qty, 0)} qty refunded</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-200">
                            <span>Total Refunded</span>
                            <span className="text-amber-600">{fmt(receipt.refund_amount)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button onClick={onFinish} className="bg-amber-500 hover:bg-amber-600 text-white font-bold w-full h-12 text-base rounded-xl transition-colors">
                        <RefreshCcw className="w-5 h-5 inline -mt-0.5 mr-1.5" /> Start New Refund
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmModal = ({ title, message, onConfirm, onClose, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-[modal-in_200ms_ease] overflow-hidden">
                <div className={`p-6 text-center ${type === 'danger' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg ${type === 'danger' ? 'bg-rose-500 shadow-rose-200' : 'bg-amber-500 shadow-amber-200'
                        }`}>
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 h-12 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CATEGORY EMOJI MAP (for tab icons)
   ───────────────────────────────────────────────── */
const CATEGORY_ICONS = {
    all: Store,
    books: BookOpen,
    stationery: Pencil,
    school_accessories: Backpack,
};

/* ─────────────────────────────────────────────────
   MAIN POS TERMINAL PAGE
   ───────────────────────────────────────────────── */
export default function POSTerminal({ auth, products = [], customers = [], categories = [], promotions = [], settings = {} }) {
    const CURRENCY_SYMBOLS = {
        LKR: 'Rs ', USD: '$', EUR: '€', GBP: '£', INR: '₹',
        AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'AED ', JPY: '¥'
    };
    globalSymbol = CURRENCY_SYMBOLS[settings?.currency] || '$';
    const { can } = usePermissions();
    const [activeKey, setActiveKey] = useState('pos');

    /* ── State ── */
    // localProducts mirrors the Inertia prop but can be updated client-side
    // (e.g. after a sale reduces stock) without a full page reload.
    const [localProducts, setLocalProducts] = useState(products);
    const [localCustomers, setLocalCustomers] = useState(customers);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [discountMode, setDiscountMode] = useState('pct'); // 'pct' | 'amt'
    const [discountInput, setDiscountInput] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashGiven, setCashGiven] = useState('');
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [splitPayments, setSplitPayments] = useState([{ method: 'cash', amount: '' }]);
    const [cashier] = useState(auth?.user?.name ?? 'Cashier');
    const searchRef = useRef(null); // used to refocus after barcode scan

    /* ── Modal states ── */
    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [numpadProduct, setNumpadProduct] = useState(null);
    const [receiptOrder, setReceiptOrder] = useState(null);
    const [showPromotions, setShowPromotions] = useState(false);

    /* ── Refund Mode State ── */
    const [isRefundMode, setIsRefundMode] = useState(false);
    const [refundSearch, setRefundSearch] = useState('');
    const [refundInvoice, setRefundInvoice] = useState(null);
    const [refundCart, setRefundCart] = useState([]); // Holds items being refunded
    const [fetchingInvoice, setFetchingInvoice] = useState(false);
    const [processingRefund, setProcessingRefund] = useState(false);
    const [refundReceipt, setRefundReceipt] = useState(null);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);

    /* ── Filtered products (client-side, all data loaded on page mount) ── */
    const filteredProducts = useMemo(() => {
        const q = search.toLowerCase();
        return localProducts.filter((p) => {
            const matchCat = category === 'all' || p.category === category;
            const matchSearch = !q
                || p.name.toLowerCase().includes(q)
                || p.brand.toLowerCase().includes(q)
                || p.sku.toLowerCase().includes(q);
            return matchCat && matchSearch;
        });
    }, [category, search, localProducts]);

    /* ── Cart totals ── */
    const subtotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);
    const discountAmt = useMemo(() => {
        const val = parseFloat(discountInput) || 0;
        if (discountMode === 'pct') return Math.round(subtotal * Math.min(val, 100) / 100);
        return Math.min(val, subtotal); // flat amount — can't exceed subtotal
    }, [subtotal, discountInput, discountMode]);
    const discountPct = useMemo(() => {
        if (subtotal <= 0) return 0;
        return parseFloat(((discountAmt / subtotal) * 100).toFixed(2));
    }, [discountAmt, subtotal]);
    const total = subtotal - discountAmt;
    
    const splitTotal = useMemo(() => isSplitPayment ? splitPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) : 0, [isSplitPayment, splitPayments]);
    
    const change = isSplitPayment
        ? Math.max(0, splitTotal - total)
        : (paymentMethod === 'cash' ? Math.max(0, Number(cashGiven) - total) : 0);

    /* ── Cart helpers ── */
    const cartQtyMap = useMemo(() => Object.fromEntries(cart.map((i) => [i.id, i.qty])), [cart]);

    const handleProductTap = useCallback((product) => {
        setNumpadProduct(product);
    }, []);

    /* ── Barcode / scanner Enter-key handler ─────────────────────────────────
       Called when the cashier (or scanner) presses Enter inside the search
       input.  Fast path: exact SKU match → open quantity modal immediately.
       Fallback: single filtered result → same behaviour.
       Neither path breaks the normal "browse by typing" workflow.
    ── */
    const handleSearchKeyDown = useCallback((e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const q = search.trim();
        if (!q) return;

        // 1. Exact SKU / barcode match (primary fast-scan path)
        const exactSku = localProducts.find(
            (p) => p.sku.toLowerCase() === q.toLowerCase() && p.stock > 0
        );
        if (exactSku) {
            setSearch('');
            setNumpadProduct(exactSku);
            return;
        }

        // 2. Single filtered result — treat it as an unambiguous match
        if (filteredProducts.length === 1 && filteredProducts[0].stock > 0) {
            setSearch('');
            setNumpadProduct(filteredProducts[0]);
            return;
        }

        // 3. Zero or multiple matches — do nothing; cashier browses the grid
    }, [search, localProducts, filteredProducts]);

    const handleNumpadConfirm = useCallback(
        (qty) => {
            const product = numpadProduct;
            setCart((prev) => {
                const existing = prev.find((i) => i.id === product.id);
                if (qty === 0) return prev.filter((i) => i.id !== product.id);
                
                // Automatically calculate best active discount for this product
                let applyPrice = Number(product.unit_price || product.price || 0);
                let appliedPromo = false;
                let promoName = null;
                
                if (promotions && promotions.length > 0) {
                    const applicablePromos = promotions.filter(p => 
                        p.type === 'discount' && p.products.some(prod => prod.id === product.id)
                    );
                    
                    if (applicablePromos.length > 0) {
                        let bestDiscount = 0;
                        applicablePromos.forEach(p => {
                            let d = p.discount_type === 'fixed' 
                                ? Number(p.discount_value) 
                                : (applyPrice * (Number(p.discount_value) / 100));
                            if (d > bestDiscount) {
                                bestDiscount = d;
                                promoName = p.name;
                            }
                        });
                        
                        if (bestDiscount > 0) {
                            applyPrice = Math.max(0, applyPrice - bestDiscount);
                            appliedPromo = true;
                        }
                    }
                }

                if (existing) {
                    return prev.map((i) => (i.id === product.id ? { ...i, qty, price: applyPrice, isPromotion: appliedPromo, promotionName: promoName, originalPrice: Number(product.unit_price || product.price || 0) } : i));
                }
                return [...prev, { ...product, qty, price: applyPrice, isPromotion: appliedPromo, promotionName: promoName, originalPrice: Number(product.unit_price || product.price || 0) }];
            });
            setNumpadProduct(null);
            // Refocus the scanner/search input so the next scan is ready immediately
            setTimeout(() => searchRef.current?.focus(), 50);
        },
        [numpadProduct, promotions]
    );

    const handleQtyChange = useCallback(
        (id, newQty) => {
            if (newQty <= 0) { setCart((prev) => prev.filter((i) => i.id !== id)); return; }
            // Guard against exceeding live stock
            const liveProduct = localProducts.find((p) => p.id === id);
            if (liveProduct && newQty > liveProduct.stock) return;
            setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i)));
        },
        [localProducts]
    );

    const handleRemove = useCallback((id) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setCustomer(null);
        setDiscountInput('');
        setDiscountMode('pct');
        setCashGiven('');
        setPaymentMethod('cash');
    }, []);

    /* ── Add promotion to cart ── */
    const handleAddPromotion = useCallback((promotion) => {
        // Add all products from the promotion to cart
        promotion.products.forEach((product) => {
            setCart((prev) => {
                const existing = prev.find((i) => i.id === product.id);
                if (existing) {
                    // Add the promotion quantity to existing quantity
                    return prev.map((i) =>
                        i.id === product.id
                            ? { ...i, qty: i.qty + product.quantity }
                            : i
                    );
                }
                // Add new item with promotion quantity
                return [...prev, {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    sku: product.sku,
                    price: product.price,
                    stock: product.stock,
                    imagePath: product.imagePath,
                    qty: product.quantity,
                    isPromotion: true,
                    promotionName: promotion.name,
                }];
            });
        });
        setShowPromotions(false);
    }, []);

    /* ── Checkout ── */
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!isSplitPayment && paymentMethod === 'cash' && Number(cashGiven) < total) {
            alert(`Cash given (${fmt(Number(cashGiven))}) is less than total (${fmt(total)})`);
            return;
        }
        if (isSplitPayment && splitTotal < total) {
            alert(`Split payments total (${fmt(splitTotal)}) is less than total (${fmt(total)})`);
            return;
        }

        // ── Reduce stock for each sold item via the existing adjustStock endpoint ──
        // Fire all requests in parallel; failures are non-blocking (receipt still shown).
        // Laravel's Inertia setup sets an XSRF-TOKEN cookie (URL-encoded); decode and send as header.
        const xsrfCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='));
        const csrfToken = xsrfCookie
            ? decodeURIComponent(xsrfCookie.split('=').slice(1).join('='))
            : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');

        const configuredPrefix = String(settings?.invoice_prefix || 'LB-').trim() || 'LB-';
        const normalizedPrefix = configuredPrefix.endsWith('-') ? configuredPrefix : `${configuredPrefix}-`;
        const receiptNo = `${normalizedPrefix}${Date.now().toString().slice(-6)}`;

        const stockResults = await Promise.allSettled(
            cart.map((item) =>
                fetch(`/products/${item.id}/stock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        quantity: -item.qty,   // negative = deduction
                        reason: `POS Sale — Receipt ${receiptNo}`,
                        type: 'sale',
                    }),
                }).then((r) => r.json())
            )
        );

        // ── Update local product stock so the product grid reflects the new quantities immediately ──
        setLocalProducts((prev) =>
            prev.map((p) => {
                const result = stockResults[cart.findIndex((i) => i.id === p.id)];
                if (result?.status === 'fulfilled' && result.value?.product) {
                    return { ...p, stock: result.value.product.stock_level };
                }
                // Fallback: subtract locally if the API call failed
                const cartItem = cart.find((i) => i.id === p.id);
                if (cartItem) {
                    return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
                }
                return p;
            })
        );

        // ── Map POS payment label → value accepted by StoreOrderRequest ──
        const paymentMethodMap = {
            cash: 'Cash',
            card: 'Credit Card',
        };

        const payload = {
            customer_id: customer?.id ?? null,
            customer_name: customer?.name ?? null,
            customer_email: customer?.email ?? null,
            payment_method: paymentMethodMap[paymentMethod] ?? 'Cash',
            status: 'Completed',
            discount: discountAmt,
            notes: `POS Receipt: ${receiptNo}`,
            items: cart.map((item) => ({
                product_id: item.id,
                title: item.isPromotion && item.promotionName ? `${item.name} (Promo: ${item.promotionName})` : item.name,
                qty: item.qty,
                unit_price: item.price,
            })),
        };

        if (isSplitPayment) {
            payload.split_payments = splitPayments.map(p => ({
                method: paymentMethodMap[p.method] ?? 'Cash',
                amount: Number(p.amount)
            }));
            payload.payment_method = payload.split_payments.length > 0
                ? [...payload.split_payments].sort((a, b) => b.amount - a.amount)[0].method
                : 'Cash';
        }

        // ── Save the completed order to the Sales table ──
        // Failures are non-blocking — the receipt is still shown even if this call fails.
        try {
            await fetch('/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            // Log but don't block the receipt — cashier can see the sale was made
            console.error('Failed to save order to sales:', err);
        }

        setReceiptOrder({
            receiptNo,
            cashier,
            customer,
            items: cart,
            subtotal,
            discountPct,
            discount: discountAmt,
            total,
            paymentMethod,
            cashGiven: Number(cashGiven),
            change,
            isSplitPayment,
            splitPayments,
            createdAt: new Date().toISOString(),
        });
    };

    const handleNewSale = () => {
        clearCart();
        setReceiptOrder(null);
    };

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const canCheckout = cart.length > 0 && (
        isSplitPayment 
            ? splitTotal >= total 
            : (paymentMethod === 'card' || Number(cashGiven) >= total)
    );

    /* ── Category counts ── */
    const categoryCounts = useMemo(() => {
        const counts = { all: localProducts.length };
        localProducts.forEach((p) => {
            counts[p.category] = (counts[p.category] ?? 0) + 1;
        });
        return counts;
    }, [localProducts]);

    /* ── Refund Handlers ── */
    const handleRefundSearch = async (e) => {
        e.preventDefault();
        const cleanedSearch = refundSearch.replace(/\s+/g, '');
        if (!cleanedSearch) return;
        setFetchingInvoice(true);
        try {
            const res = await fetch(`/pos/invoice/${cleanedSearch}`);
            if (!res.ok) {
                alert('Invoice not found.');
                setRefundInvoice(null);
                setRefundCart([]);
            } else {
                const data = await res.json();
                setRefundInvoice(data.order);
                // Initialize cart with all items, quantity 0, ready to be marked
                setRefundCart(data.order.items.map(i => ({
                    ...i,
                    qty_refunded: 0,
                    return_to_stock: true,
                })));
            }
        } catch {
            alert('Error fetching invoice.');
        }
        setFetchingInvoice(false);
    };

    const handleRefundQtyChange = (itemId, val) => {
        setRefundCart(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, qty_refunded: Math.min(Math.max(0, val), item.qty) };
            }
            return item;
        }));
    };

    const handleToggleReturnStock = (itemId) => {
        setRefundCart(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, return_to_stock: !item.return_to_stock };
            }
            return item;
        }));
    };

    const totalRefundAmount = useMemo(() => {
        return refundCart.reduce((sum, item) => sum + (item.qty_refunded * item.price), 0);
    }, [refundCart]);

    const handleProcessRefund = async () => {
        const itemsToRefund = refundCart.filter(i => i.qty_refunded > 0);
        if (itemsToRefund.length === 0) {
            alert("No items selected for refund.");
            return;
        }

        setShowRefundConfirm(true);
    };

    const executeRefund = async () => {
        setShowRefundConfirm(false);
        const itemsToRefund = refundCart.filter(i => i.qty_refunded > 0);

        setProcessingRefund(true);
        const xsrfCookie = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
        const csrfToken = xsrfCookie
            ? decodeURIComponent(xsrfCookie.split('=').slice(1).join('='))
            : (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');

        try {
            const res = await fetch('/pos/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    order_id: refundInvoice.id,
                    items: itemsToRefund.map(i => ({
                        id: i.id,
                        qty_refunded: i.qty_refunded,
                        return_to_stock: i.return_to_stock,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to process refund.');
            } else {
                setRefundReceipt(data);

                // Update local product stock proactively if items returned to stock
                setLocalProducts(prev => {
                    let updated = [...prev];
                    data.refunded_items.forEach(ri => {
                        if (ri.returned_to_stock) {
                            const pIndex = updated.findIndex(p => p.name === ri.name); // Using name as fallback matching
                            if (pIndex > -1) {
                                updated[pIndex] = { ...updated[pIndex], stock: updated[pIndex].stock + ri.qty };
                            }
                        }
                    });
                    return updated;
                });
            }
        } catch (err) {
            alert('Error processing refund.');
            console.error(err);
        }
        setProcessingRefund(false);
    };

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="POS Terminal"
            user={auth?.user ?? { name: 'Cashier', email: 'cashier@luminabooks.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="POS Terminal" />

            {/* ── Full-height terminal layout ── */}
            <div className="flex gap-4 h-[calc(100vh-80px)] -mt-2">

                {/* ════════════════════════════════════════════
                    LEFT PANEL — Product Browser
                    ════════════════════════════════════════════ */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 mb-3">
                        {isRefundMode ? (
                            <form onSubmit={handleRefundSearch} className="search-input-wrapper flex-1 border-amber-300 ring-amber-100 shadow-amber-50">
                                <span className="search-icon text-amber-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                                    </svg>
                                </span>
                                <input
                                    className="search-input"
                                    placeholder="Search Invoice Number (e.g., LB-123456)..."
                                    value={refundSearch}
                                    onChange={(e) => setRefundSearch(e.target.value)}
                                />
                            </form>
                        ) : (
                            <div className="search-input-wrapper flex-1">
                                <span className="search-icon">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                                    </svg>
                                </span>
                                <input
                                    ref={searchRef}
                                    className="search-input"
                                    placeholder="Search products by name, brand, SKU…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>
                        )}
                        {!isRefundMode && search && (
                            <button onClick={() => setSearch('')} className="btn-secondary btn-sm">
                                Clear
                            </button>
                        )}

                        {/* Refund Mode Toggle */}
                        <button
                            onClick={() => {
                                setIsRefundMode(!isRefundMode);
                                setRefundInvoice(null);
                                setRefundCart([]);
                                setRefundSearch('');
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap
                                ${isRefundMode
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-600'}`}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            {isRefundMode ? 'Exit Refund Mode' : 'Refund'}
                        </button>

                        {/* Promotions Button */}
                        {!isRefundMode && promotions.length > 0 && (
                            <button
                                onClick={() => setShowPromotions(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-300 transition-all whitespace-nowrap"
                            >
                                <Sparkles className="w-4 h-4" />
                                Promotions
                                <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {promotions.length}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Category tabs (Only for Sale) */}
                    {!isRefundMode && (
                        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap flex-shrink-0 transition-all
                                        ${category === cat.value
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                                >
                                    <span>{(() => { const Icon = CATEGORY_ICONS[cat.value] ?? Package; return <Icon className="w-4 h-4" />; })()}</span>
                                    <span>{cat.label}</span>
                                    <span
                                        className={`text-xs rounded-full px-1.5 py-0.5 font-bold
                                            ${category === cat.value
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {categoryCounts[cat.value] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Product grid / Refund Panel — scrollable */}
                    <div className={`flex-1 overflow-y-auto pr-1 ${isRefundMode ? 'bg-white rounded-2xl border border-slate-200 shadow-sm p-4' : ''}`}>
                        {isRefundMode ? (
                            fetchingInvoice ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Loader className="w-8 h-8 animate-spin mb-3 text-amber-500" />
                                    <p className="font-semibold">Loading invoice...</p>
                                </div>
                            ) : refundInvoice ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800">Invoice: {refundInvoice.orderId}</h3>
                                                {refundInvoice.notes && (
                                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap">
                                                        Receipt #: {refundInvoice.notes}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{refundInvoice.date} • {refundInvoice.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700">{refundInvoice.customer.name}</p>
                                            <p className="text-xs text-slate-500">Total: {fmt(refundInvoice.total)}</p>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold w-10"></th>
                                                    <th className="px-4 py-3 font-semibold">Item</th>
                                                    <th className="px-4 py-3 font-semibold text-center w-24">Original Qty</th>
                                                    <th className="px-4 py-3 font-semibold text-center w-32">Refund Qty</th>
                                                    <th className="px-4 py-3 font-semibold text-center w-32">Return to Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {refundCart.map((item) => {
                                                    const isSelected = item.qty_refunded > 0;
                                                    return (
                                                        <tr key={item.id} className={isSelected ? "bg-amber-50/50" : ""}>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className={`w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 transition-all ${item.qty === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                    checked={isSelected}
                                                                    disabled={item.qty === 0}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            handleRefundQtyChange(item.id, 1);
                                                                        } else {
                                                                            handleRefundQtyChange(item.id, 0);
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-semibold text-slate-800">{item.title}</p>
                                                                <p className="text-xs text-slate-500">{fmt(item.price)} each</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-slate-600 font-medium">
                                                                {item.qty === 0 ? (
                                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Returned</span>
                                                                ) : item.qty}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {item.qty > 1 ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={item.qty}
                                                                        disabled={!isSelected}
                                                                        value={item.qty_refunded}
                                                                        onChange={(e) => handleRefundQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                                        className={`w-16 form-input text-center p-1 py-1.5 m-0 inline-block transition-all ${isSelected ? 'bg-white opacity-100' : 'bg-slate-50 opacity-50 cursor-not-allowed border-transparent shadow-none'
                                                                            }`}
                                                                    />
                                                                ) : (
                                                                    <span className={`text-sm font-bold ${isSelected ? 'text-amber-600' : 'text-slate-300'}`}>
                                                                        {isSelected ? '1' : '0'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <button
                                                                        onClick={() => isSelected && handleToggleReturnStock(item.id)}
                                                                        disabled={!isSelected}
                                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${!isSelected ? 'bg-slate-200 cursor-not-allowed opacity-50' :
                                                                                item.return_to_stock ? 'bg-emerald-500' : 'bg-slate-300'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            aria-hidden="true"
                                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.return_to_stock ? 'translate-x-5' : 'translate-x-0'
                                                                                }`}
                                                                        />
                                                                    </button>
                                                                    <span className={`text-[10px] font-bold uppercase transition-colors ${!isSelected ? 'text-slate-300' :
                                                                            item.return_to_stock ? 'text-emerald-700' : 'text-slate-500'
                                                                        }`}>
                                                                        {item.return_to_stock ? 'Resell' : 'Waste'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <RefreshCcw className="w-12 h-12 mb-3 text-slate-300" />
                                    <p className="font-semibold text-slate-500">Refund Mode Active</p>
                                    <p className="text-sm">Search for an invoice number to start a refund.</p>
                                </div>
                            )
                        ) : (
                            filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                    <Package className="w-10 h-10 text-slate-300 mb-2" />
                                    <p className="font-semibold">No products found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            cartQty={cartQtyMap[product.id] ?? 0}
                                            onTap={handleProductTap}
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════════════
                    RIGHT PANEL — Order / Cart
                    ════════════════════════════════════════════ */}
                <div className="w-[380px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Customer selector */}
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Customer</p>
                        {isRefundMode ? (
                            refundInvoice ? (
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-amber-100 text-amber-700`}>
                                        {initials(refundInvoice.customer.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm">{refundInvoice.customer.name}</p>
                                        <p className="text-xs text-slate-500">Invoice: {refundInvoice.orderId}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 font-medium text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Waiting for invoice...
                                </div>
                            )
                        ) : customer ? (
                            <div className="flex items-center gap-3 bg-indigo-50 rounded-xl px-3 py-2.5">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(customer.name)}`}
                                >
                                    {initials(customer.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 text-sm">{customer.name}</p>
                                    <p className="text-xs text-slate-500"><Phone className="w-3 h-3 inline -mt-0.5 mr-0.5 text-slate-400" /> {customer.phone ?? '—'}</p>
                                </div>
                                <button
                                    onClick={() => setCustomer(null)}
                                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCustomerPopup(true)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Select Customer or Guest
                            </button>
                        )}
                    </div>

                    {/* Cart items — scrollable */}
                    <div className="flex-1 overflow-y-auto px-4">
                        {isRefundMode ? (
                            refundCart.filter(i => i.qty_refunded > 0).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-300 py-12">
                                    <RefreshCcw className="w-16 h-16 mb-3 text-amber-200" />
                                    <p className="font-semibold text-slate-400">No items selected</p>
                                    <p className="text-xs text-slate-300 mt-1">Select items from the invoice to refund</p>
                                </div>
                            ) : (
                                <div className="py-2 space-y-2">
                                    {refundCart.filter(i => i.qty_refunded > 0).map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                            <div className="flex-1 pr-2">
                                                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.qty_refunded}x @ {fmt(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800">{fmt(item.qty_refunded * item.price)}</p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.return_to_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {item.return_to_stock ? 'RESELL' : 'WASTE'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-12">
                                <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-9-9v9m4-9v9" />
                                </svg>
                                <p className="font-semibold text-slate-400">Cart is empty</p>
                                <p className="text-xs text-slate-300 mt-1">Tap a product to add it</p>
                            </div>
                        ) : (
                            <div>
                                {cart.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onQtyChange={handleQtyChange}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom: totals + payment */}
                    {isRefundMode && refundCart.filter(i => i.qty_refunded > 0).length > 0 ? (
                        <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-3 bg-slate-50/50">
                            {/* Totals */}
                            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5">
                                <div className="flex justify-between font-bold text-slate-800 text-base border-slate-100">
                                    <span>Total Refund</span>
                                    <span className="text-amber-600 text-lg">-{fmt(totalRefundAmount)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => setRefundCart(refundInvoice.items.map(i => ({ ...i, qty_refunded: 0, return_to_stock: true })))}
                                    className="h-12 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition-all active:scale-95"
                                >
                                    <X className="w-4 h-4 inline mr-1" /> Reset
                                </button>
                                <button
                                    onClick={handleProcessRefund}
                                    disabled={processingRefund}
                                    className="flex-1 h-12 rounded-xl bg-amber-500 text-white font-bold text-base shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingRefund ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                                    Process Refund
                                </button>
                            </div>
                        </div>
                    ) : cart.length > 0 && !isRefundMode ? (
                        <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-3 bg-slate-50/50">

                            {/* Discount */}
                            {can('apply_discount') && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0">Discount</label>
                                    <div className="flex flex-1 items-center gap-1.5">
                                        {/* Mode toggle */}
                                        <div className="flex rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                                            <button
                                                onClick={() => { setDiscountMode('pct'); setDiscountInput(''); }}
                                                className={`px-2.5 h-8 text-xs font-bold transition-all ${
                                                    discountMode === 'pct'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >%</button>
                                            <button
                                                onClick={() => { setDiscountMode('amt'); setDiscountInput(''); }}
                                                className={`px-2.5 h-8 text-xs font-bold transition-all border-l border-slate-200 ${
                                                    discountMode === 'amt'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >Rs</button>
                                        </div>
                                        {/* Free-type input */}
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max={discountMode === 'pct' ? 100 : subtotal}
                                                step={discountMode === 'pct' ? '0.5' : '1'}
                                                value={discountInput}
                                                onChange={(e) => setDiscountInput(e.target.value)}
                                                placeholder={discountMode === 'pct' ? '0' : '0.00'}
                                                className="w-full h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-right pr-8"
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                                                {discountMode === 'pct' ? '%' : 'Rs'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1.5">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span><span>{fmt(subtotal)}</span>
                                </div>
                                {discountAmt > 0 && (
                                    <div className="flex justify-between text-sm text-amber-600 font-medium">
                                        <span>Discount{discountMode === 'pct' ? ` (${discountPct}%)` : ` (${fmt(discountAmt)} off)`}</span>
                                        <span>-{fmt(discountAmt)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-slate-800 text-base pt-1.5 border-t border-slate-100">
                                    <span>Total</span>
                                    <span className="text-indigo-700 text-lg">{fmt(total)}</span>
                                </div>
                            </div>

                            {/* Payment method */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-500">Payment Method</span>
                                {(settings?.allow_split_payment ?? true) && (
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                            checked={isSplitPayment}
                                            onChange={(e) => {
                                                setIsSplitPayment(e.target.checked);
                                                if (e.target.checked) setSplitPayments([{ method: 'cash', amount: total }]);
                                            }}
                                        />
                                        Split Payment
                                    </label>
                                )}
                            </div>

                            {!isSplitPayment ? (
                                <>
                                    <div className="flex gap-2">
                                        {['cash', 'card'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                                                    ${paymentMethod === m
                                                        ? m === 'cash'
                                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                                            : 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                        : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                            >
                                                <span>{m === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}</span>
                                                <span>{m === 'cash' ? 'Cash' : 'Card'}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Cash given field */}
                                    {paymentMethod === 'cash' && (
                                        <div className="mt-3">
                                            <label className="text-xs font-semibold text-slate-500 block mb-1">Cash Given</label>
                                            <input
                                                type="number"
                                                min={total}
                                                className="form-input text-right font-bold text-lg"
                                                placeholder={`Min. ${fmt(total)}`}
                                                value={cashGiven}
                                                onChange={(e) => setCashGiven(e.target.value)}
                                            />
                                            {Number(cashGiven) >= total && total > 0 && (
                                                <p className="text-emerald-600 font-bold text-sm mt-1.5 text-right">
                                                    Change: {fmt(change)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-2 mt-2 border-t border-slate-100 pt-3">
                                    {splitPayments.map((split, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <select 
                                                className="form-select text-sm flex-1 h-10 py-0"
                                                value={split.method}
                                                onChange={e => {
                                                    const newSplits = [...splitPayments];
                                                    newSplits[index].method = e.target.value;
                                                    setSplitPayments(newSplits);
                                                }}
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="card">Card</option>
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-input text-right font-bold text-sm w-28 h-10 py-0"
                                                placeholder="Amount"
                                                value={split.amount}
                                                onChange={e => {
                                                    const newSplits = [...splitPayments];
                                                    newSplits[index].amount = e.target.value;
                                                    setSplitPayments(newSplits);
                                                }}
                                            />
                                            {splitPayments.length > 1 && (
                                                <button 
                                                    onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== index))}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setSplitPayments([...splitPayments, { method: 'card', amount: '' }])}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        + Add Payment Method
                                    </button>
                                    
                                    <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-slate-100">
                                        <span className="font-semibold text-slate-500">Remaining</span>
                                        <span className={`font-bold ${splitTotal >= total ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {fmt(Math.max(0, total - splitTotal))}
                                        </span>
                                    </div>
                                    {splitTotal >= total && (
                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <span className="font-semibold text-slate-500">Change (from Cash)</span>
                                            <span className="font-bold text-emerald-600">
                                                {fmt(change)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={clearCart}
                                    className="h-12 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition-all active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4 inline -mt-0.5 mr-1" /> Clear
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={!canCheckout}
                                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Charge {fmt(total)}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Empty cart CTA */}
                    {cart.length === 0 && !isRefundMode && (
                        <div className="px-4 pb-4">
                            <div className="text-center text-xs text-slate-400 py-3 border-t border-slate-100">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Terminal ready — {new Date().toLocaleTimeString('en-LK')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════
                MODALS
                ════════════════════════════════════════════ */}

            {/* Customer popup */}
            {showCustomerPopup && (
                <CustomerPopup
                    customers={localCustomers}
                    onSelect={(c) => { setCustomer(c); setShowCustomerPopup(false); }}
                    onGuest={() => { setCustomer(null); setShowCustomerPopup(false); }}
                    onClose={() => setShowCustomerPopup(false)}
                    onNewCustomer={(c) => setLocalCustomers((prev) => [c, ...prev])}
                />
            )}

            {/* Numpad for qty */}
            {numpadProduct && (
                <NumpadModal
                    product={numpadProduct}
                    currentQty={cartQtyMap[numpadProduct.id] ?? 0}
                    onConfirm={handleNumpadConfirm}
                    onClose={() => {
                        setNumpadProduct(null);
                        setTimeout(() => searchRef.current?.focus(), 50);
                    }}
                />
            )}

            {/* Receipt / success */}
            {receiptOrder && (
                <ReceiptModal
                    order={receiptOrder}
                    onClose={handleNewSale}
                    onNewSale={handleNewSale}
                    settings={settings}
                />
            )}

            {/* Refund Receipt / success */}
            {refundReceipt && (
                <RefundReceiptModal
                    receipt={refundReceipt}
                    onFinish={() => {
                        setRefundReceipt(null);
                        setRefundInvoice(null);
                        setRefundCart([]);
                        setRefundSearch('');
                    }}
                />
            )}

            {showRefundConfirm && (
                <ConfirmModal
                    title="Process Refund?"
                    message={`You are about to process a refund for ${refundCart.filter(i => i.qty_refunded > 0).length} items. This will generate a return note and update stock levels.`}
                    confirmText="Process Refund"
                    onConfirm={executeRefund}
                    onClose={() => setShowRefundConfirm(false)}
                    type="warning"
                />
            )}

            {/* Promotions Panel */}
            {showPromotions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowPromotions(false)}
                    />
                    <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-[slide-in-right_200ms_ease]">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-500 to-orange-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-white" />
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Active Promotions</h2>
                                        <p className="text-xs text-white/80">Tap to add to order</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPromotions(false)}
                                    className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Promotions List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {promotions.map((promo) => {
                                const TypeIcon = promo.type === 'bundle' ? Gift : Percent;
                                return (
                                    <div
                                        key={promo.id}
                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                                        onClick={() => handleAddPromotion(promo)}
                                    >
                                        {/* Banner/Header */}
                                        <div className={`px-4 py-3 ${promo.type === 'bundle' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                                            <div className="flex items-center gap-2">
                                                <TypeIcon className="w-4 h-4 text-white/80" />
                                                <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                                                    {promo.type === 'bundle' ? 'Bundle Deal' : 'Special Discount'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-800 text-lg mb-1">{promo.name}</h3>
                                            {promo.description && (
                                                <p className="text-sm text-slate-500 mb-3">{promo.description}</p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2 mb-3">
                                                <span className="text-2xl font-bold text-slate-800">{fmt(promo.final_price)}</span>
                                                {promo.savings > 0 && (
                                                    <>
                                                        <span className="text-sm text-slate-400 line-through">{fmt(promo.original_price)}</span>
                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                            Save {fmt(promo.savings)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Products */}
                                            <div className="space-y-2 mb-3">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Includes</p>
                                                {promo.products.map((product) => (
                                                    <div key={product.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {product.imagePath ? (
                                                                <img src={`/storage/${product.imagePath}`} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                                                            <p className="text-xs text-slate-500">Qty: {product.quantity}</p>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-600">{fmt(product.price)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Promo Code */}
                                            {promo.promo_code && (
                                                <div className="bg-slate-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm font-mono font-semibold text-slate-700">{promo.promo_code}</span>
                                                </div>
                                            )}

                                            {/* Add Button */}
                                            <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors group-hover:shadow-lg group-hover:shadow-indigo-200 flex items-center justify-center gap-2">
                                                <ShoppingCart className="w-4 h-4" />
                                                Add to Order
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {promotions.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="font-semibold text-slate-500">No active promotions</p>
                                    <p className="text-sm">Check back later for deals!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}