const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, BorderStyle, WidthType, ShadingType,
  VerticalAlign, HeadingLevel,
} = require('docx')

// ---------- Activities ----------
// Each: { no, name, color, weeks: [w1, w2, ...] }
// Colors loosely match the user's old chart (pink → orange → green).
const PINK   = 'E8B4D0'
const ORANGE = 'F2B084'
const GREEN  = 'BEE5B0'

const activities = [
  { no: 1,  name: 'Project Proposal',                                      color: PINK,   weeks: [1] },
  { no: 2,  name: 'Requirement Analysis',                                  color: PINK,   weeks: [2] },
  { no: 3,  name: 'System Design & ERD',                                   color: PINK,   weeks: [3] },
  { no: 4,  name: 'Frontend Development (React + Tailwind)',               color: ORANGE, weeks: [4, 5] },
  { no: 5,  name: 'Backend Setup (Laravel + Cloud PostgreSQL)',            color: ORANGE, weeks: [4, 5] },
  { no: 6,  name: 'Authentication & Role-based Access',                    color: ORANGE, weeks: [5] },
  { no: 7,  name: 'Venue & Vendor Catalog (with Filters)',                 color: ORANGE, weeks: [6, 7] },
  { no: 8,  name: 'Cart, Checkout & Commission System',                    color: ORANGE, weeks: [8] },
  { no: 9,  name: 'Budget Tracker & AI Budget Planner (Groq)',             color: ORANGE, weeks: [8, 9] },
  { no: 10, name: 'Couple, Vendor & Admin Dashboards',                     color: ORANGE, weeks: [9, 10] },
  { no: 11, name: 'Map Integration & UI Polish',                           color: ORANGE, weeks: [10] },
  { no: 12, name: 'System Integration & Testing',                          color: GREEN,  weeks: [11, 12] },
  { no: 13, name: 'Deployment to Cloud (Frontend + Backend)',              color: GREEN,  weeks: [12, 13] },
  { no: 14, name: 'Documentation & Final Presentation',                    color: GREEN,  weeks: [13, 14] },
]

// ---------- Layout ----------
// Landscape US Letter content width = 15840 - 2*1440 = 12960 DXA
const COL_NO    = 500
const COL_NAME  = 4100
const TOTAL_WEEK_W = 12960 - COL_NO - COL_NAME // 8360
const WEEK_W   = Math.floor(TOTAL_WEEK_W / 14) // 597
const TABLE_W  = COL_NO + COL_NAME + WEEK_W * 14 // 12958

const columnWidths = [COL_NO, COL_NAME, ...Array(14).fill(WEEK_W)]

// Borders
const thin = { style: BorderStyle.SINGLE, size: 6, color: '666666' }
const cellBorders = { top: thin, bottom: thin, left: thin, right: thin }

// Helper: cell builder
function cell({ text, bold = false, width, shading, alignment = AlignmentType.CENTER, italic = false }) {
  const children = Array.isArray(text)
    ? text
    : [new Paragraph({
        alignment,
        children: [new TextRun({ text: String(text), bold, italics: italic, size: 18, font: 'Arial' })],
      })]
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { fill: shading, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children,
  })
}

// ---------- Header rows ----------
// Row 1: "Weeks" merged across the 14 week columns
const headerRow1 = new TableRow({
  tableHeader: true,
  children: [
    new TableCell({
      borders: cellBorders,
      width: { size: COL_NO, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      rowSpan: 2,
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'No', bold: true, size: 20, font: 'Arial' })],
      })],
    }),
    new TableCell({
      borders: cellBorders,
      width: { size: COL_NAME, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      rowSpan: 2,
      margins: { top: 60, bottom: 60, left: 120, right: 60 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Project Activities', bold: true, size: 20, font: 'Arial' })],
      })],
    }),
    // Single cell spanning all 14 week columns
    new TableCell({
      borders: cellBorders,
      width: { size: WEEK_W * 14, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      columnSpan: 14,
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Weeks', bold: true, size: 20, font: 'Arial' })],
      })],
    }),
  ],
})

// Row 2: week numbers 1..14
const headerRow2 = new TableRow({
  tableHeader: true,
  children: Array.from({ length: 14 }, (_, i) =>
    cell({ text: String(i + 1), bold: true, width: WEEK_W, shading: 'EFEFEF' }),
  ),
})

// ---------- Data rows ----------
const dataRows = activities.map((act) => {
  const cells = [
    cell({ text: act.no, width: COL_NO }),
    cell({
      text: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: act.name, size: 18, font: 'Arial' })],
      })],
      width: COL_NAME,
      alignment: AlignmentType.LEFT,
    }),
  ]
  for (let w = 1; w <= 14; w++) {
    const filled = act.weeks.includes(w)
    cells.push(cell({ text: '', width: WEEK_W, shading: filled ? act.color : undefined }))
  }
  return new TableRow({ children: cells })
})

// ---------- Table ----------
const ganttTable = new Table({
  width: { size: TABLE_W, type: WidthType.DXA },
  columnWidths,
  rows: [headerRow1, headerRow2, ...dataRows],
})

// ---------- Legend ----------
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
}

function legendCellPair(color, label) {
  return [
    new TableCell({
      borders: cellBorders,
      width: { size: 500, type: WidthType.DXA },
      shading: { fill: color, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text: ' ', size: 14 })] })],
    }),
    new TableCell({
      borders: noBorders,
      width: { size: 2200, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 120, right: 60 },
      children: [new Paragraph({ children: [new TextRun({ text: label, size: 18, font: 'Arial' })] })],
    }),
  ]
}

const legendTable = new Table({
  width: { size: 8100, type: WidthType.DXA },
  columnWidths: [500, 2200, 500, 2200, 500, 2200],
  rows: [new TableRow({ children: [
    ...legendCellPair(PINK,   'Planning Phase'),
    ...legendCellPair(ORANGE, 'Development Phase'),
    ...legendCellPair(GREEN,  'Testing, Deployment & Submission'),
  ] })],
})

// ---------- Document ----------
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '7B1F2A' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '7B1F2A' },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840,
          orientation: PageOrientation.LANDSCAPE,
        },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Golden Promise — Project Schedule (Gantt Chart)', bold: true, size: 32, font: 'Arial', color: '7B1F2A' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: 'Wedding Planning Marketplace for Malaysia', italics: true, size: 22, font: 'Arial', color: '8B5340' }),
          new TextRun({ text: '   |   ', size: 22, color: '999999' }),
          new TextRun({ text: '14-week timeline · Target submission: 15 July 2026', size: 22, font: 'Arial', color: '666666' }),
        ],
      }),
      ganttTable,
      new Paragraph({ children: [new TextRun({ text: '', size: 12 })], spacing: { before: 240, after: 120 } }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Legend', bold: true, size: 24, font: 'Arial', color: '7B1F2A' })],
      }),
      legendTable,
      new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 60 } }),
    ],
  }, {
    properties: {
      page: {
        size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Activity Breakdown', bold: true, size: 26, font: 'Arial', color: '7B1F2A' })],
      }),
      ...activities.map((a) => new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `Week ${a.weeks.join('–')}   `, bold: true, font: 'Arial', size: 20, color: '7B1F2A' }),
          new TextRun({ text: `${a.no}. ${a.name}`, font: 'Arial', size: 20 }),
        ],
      })),
    ],
  }],
})

const outPath = path.join(__dirname, 'GoldenPromise-Gantt-Chart.docx')
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf)
  console.log('Wrote: ' + outPath)
})
