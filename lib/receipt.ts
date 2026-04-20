import "server-only";

type ReceiptUser = {
  _id?: string;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type ReceiptDish = {
  _id?: string;
  name?: string;
  slug?: string;
  price?: number;
};

type ReceiptItem = {
  quantity?: number;
  dish?: ReceiptDish;
};

export type ReceiptOrder = {
  _id: string;
  _createdAt: string;
  totalPrice?: number;
  status?: string;
  paymentProvider?: string;
  paymentStatus?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paidAt?: string;
  user?: ReceiptUser;
  items?: ReceiptItem[];
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 48;
const RIGHT = 48;
const TOP = 70;
const BOTTOM = 48;
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(roundMoney(value));
}

function formatDate(value?: string) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Ljubljana",
  }).format(date);
}

function measureTextWidth(text: string, fontSize = FONT_SIZE) {
  return text.length * fontSize * 0.52;
}

function wrapText(text: string, maxWidth: number, fontSize = FONT_SIZE) {
  const normalized = text.trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (measureTextWidth(next, fontSize) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [normalized];
}

function textCommand(x: number, y: number, text: string, fontSize = FONT_SIZE) {
  return `BT /F1 ${fontSize} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`;
}

function lineCommand(x1: number, y1: number, x2: number, y2: number) {
  return `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;
}

function rectFillCommand(x: number, y: number, width: number, height: number, gray: number) {
  return `${gray.toFixed(2)} g ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f 0 g`;
}

function buildReceiptLines(order: ReceiptOrder) {
  const customerName =
    [order.user?.name, order.user?.surname].filter(Boolean).join(" ") || "Customer";
  const items = order.items ?? [];
  const itemLines = items.map((item, index) => {
    const quantity = Number(item.quantity ?? 0);
    const unitPrice = roundMoney(Number(item.dish?.price ?? 0));
    const lineTotal = roundMoney(quantity * unitPrice);

    return {
      index: index + 1,
      quantity,
      dishName: item.dish?.name ?? item.dish?.slug ?? "Dish",
      unitPrice,
      lineTotal,
    };
  });

  return {
    customerName,
    itemLines,
  };
}

export function buildReceiptFileName(orderId: string) {
  return `receipt-${orderId.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`;
}

export function buildReceiptPdf(order: ReceiptOrder) {
  const commands: string[] = [];
  const usableWidth = PAGE_WIDTH - LEFT - RIGHT;
  const { customerName, itemLines } = buildReceiptLines(order);
  let cursorY = PAGE_HEIGHT - TOP;

  const pushText = (text: string, options?: { x?: number; size?: number }) => {
    const x = options?.x ?? LEFT;
    const size = options?.size ?? FONT_SIZE;
    commands.push(textCommand(x, cursorY, text, size));
    cursorY -= size >= 18 ? 24 : LINE_HEIGHT;
  };

  const pushWrappedText = (label: string, value: string) => {
    const lines = wrapText(`${label}${value}`, usableWidth);

    for (const line of lines) {
      pushText(line);
    }
  };

  commands.push(rectFillCommand(LEFT, cursorY - 22, usableWidth, 48, 0.94));
  pushText("FOODY RECEIPT", { size: 20 });
  pushText(`Receipt for order ${order._id}`, { size: 12 });
  cursorY -= 4;
  commands.push(lineCommand(LEFT, cursorY, PAGE_WIDTH - RIGHT, cursorY));
  cursorY -= 20;

  pushText("Order summary", { size: 14 });
  pushWrappedText("Created at: ", `${formatDate(order._createdAt)}`);
  pushWrappedText("Paid at: ", order.paidAt ? `${formatDate(order.paidAt)} (${order.paidAt})` : "N/A");
  pushWrappedText("Order status: ", order.status ?? "pending");
  pushWrappedText("Payment provider: ", order.paymentProvider ?? "N/A");
  pushWrappedText("Payment status: ", order.paymentStatus ?? "N/A");
  pushWrappedText("PayPal order id: ", order.paypalOrderId ?? "N/A");
  pushWrappedText("PayPal capture id: ", order.paypalCaptureId ?? "N/A");
  cursorY -= 4;

  pushText("Customer", { size: 14 });
  pushWrappedText("Name: ", customerName);
  pushWrappedText("Email: ", order.user?.email ?? "N/A");
  pushWrappedText("Phone: ", order.user?.phone ?? "N/A");
  pushWrappedText("Address: ", order.user?.address ?? "N/A");
  cursorY -= 4;

  pushText("Purchased dishes", { size: 14 });

  const tableTop = cursorY + 6;
  commands.push(rectFillCommand(LEFT, tableTop - 20, usableWidth, 22, 0.92));
  commands.push(textCommand(LEFT + 8, tableTop - 14, "#", 10));
  commands.push(textCommand(LEFT + 28, tableTop - 14, "Dish", 10));
  commands.push(textCommand(PAGE_WIDTH - RIGHT - 160, tableTop - 14, "Qty x Price", 10));
  commands.push(textCommand(PAGE_WIDTH - RIGHT - 70, tableTop - 14, "Line Total", 10));
  cursorY -= 22;

  for (const item of itemLines) {
    const nameLines = wrapText(item.dishName, 250);
    const rowHeight = Math.max(nameLines.length * LINE_HEIGHT, LINE_HEIGHT);
    const rowTop = cursorY;

    commands.push(textCommand(LEFT + 8, rowTop, String(item.index), FONT_SIZE));

    let nameY = rowTop;
    for (const line of nameLines) {
      commands.push(textCommand(LEFT + 28, nameY, line, FONT_SIZE));
      nameY -= LINE_HEIGHT;
    }

    commands.push(
      textCommand(
        PAGE_WIDTH - RIGHT - 160,
        rowTop,
        `${item.quantity} x ${formatCurrency(item.unitPrice)}`,
        FONT_SIZE,
      ),
    );
    commands.push(
      textCommand(
        PAGE_WIDTH - RIGHT - 70,
        rowTop,
        formatCurrency(item.lineTotal),
        FONT_SIZE,
      ),
    );

    cursorY -= rowHeight + 4;
    commands.push(lineCommand(LEFT, cursorY + 8, PAGE_WIDTH - RIGHT, cursorY + 8));
  }

  cursorY -= 14;
  pushText(`Grand total: ${formatCurrency(Number(order.totalPrice ?? 0))}`, {
    x: PAGE_WIDTH - RIGHT - 170,
    size: 14,
  });
  cursorY -= 6;
  pushText("Thank you for your purchase.", { x: LEFT, size: 12 });

  if (cursorY < BOTTOM) {
    throw new Error("Receipt is too long to fit on a single PDF page.");
  }

  const content = commands.join("\n");
  const stream = `${content}\n`;
  const streamLength = Buffer.byteLength(stream, "utf8");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
