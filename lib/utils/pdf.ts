// PDF generation utilities for report cards
// Uses @react-pdf/renderer — call from an API route (Node.js only)

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer'
import type { Student, ReportCard, School, AcademicYear } from '@/types/api'
import { formatPercentage } from './grades'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  schoolName: { fontSize: 18, fontWeight: 'bold' },
  motto: { fontSize: 9, color: '#555', marginTop: 2 },
  divider: { borderBottom: '1pt solid #333', marginVertical: 8 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 140, color: '#555' },
  value: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a5276',
    color: '#fff',
    padding: '4 6',
    fontWeight: 'bold',
  },
  tableRow: { flexDirection: 'row', padding: '3 6', borderBottom: '0.5pt solid #ddd' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'center' },
  col4: { flex: 1, textAlign: 'center' },
  footer: { marginTop: 20, fontSize: 8, color: '#888', textAlign: 'center' },
  commentBox: { border: '0.5pt solid #ccc', padding: 6, marginTop: 4, minHeight: 40 },
  positionBox: { flexDirection: 'row', gap: 20, marginTop: 8 },
  positionItem: { flex: 1, border: '0.5pt solid #ccc', padding: 6, textAlign: 'center' },
  positionLabel: { fontSize: 8, color: '#555' },
  positionValue: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
})

interface MarkRow {
  subject: string
  score: number
  maxScore: number
  gradeLetter: string
  comment: string
}

interface ReportCardDocProps {
  school: School
  student: Student
  academicYear: AcademicYear
  reportCard: ReportCard
  markRows: MarkRow[]
  className: string
  attendancePercent: number
}

function ReportCardDocument({
  school,
  student,
  academicYear,
  reportCard,
  markRows,
  className,
  attendancePercent,
}: ReportCardDocProps) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.schoolName }, school.name),
          school.motto ? React.createElement(Text, { style: styles.motto }, `"${school.motto}"`) : null,
          React.createElement(Text, { style: { fontSize: 9, marginTop: 2 } }, school.address ?? '')
        ),
        React.createElement(
          View,
          { style: { textAlign: 'right' } },
          React.createElement(Text, { style: { fontWeight: 'bold' } }, 'STUDENT REPORT CARD'),
          React.createElement(Text, { style: { fontSize: 9 } }, `${academicYear.year} — Term ${academicYear.term}`),
          React.createElement(Text, { style: { fontSize: 9, marginTop: 4 } }, `Class: ${className}`)
        )
      ),
      React.createElement(View, { style: styles.divider }),
      // Student Info
      React.createElement(Text, { style: styles.sectionTitle }, 'Student Information'),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Name:'),
        React.createElement(Text, { style: styles.value }, `${student.first_name} ${student.last_name}`)
      ),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Registration Number:'),
        React.createElement(Text, { style: styles.value }, student.reg_number)
      ),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Attendance:'),
        React.createElement(Text, { style: styles.value }, formatPercentage(attendancePercent))
      ),
      React.createElement(View, { style: styles.divider }),
      // Marks table
      React.createElement(Text, { style: styles.sectionTitle }, 'Academic Performance'),
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(Text, { style: styles.col1 }, 'Subject'),
        React.createElement(Text, { style: styles.col2 }, 'Score'),
        React.createElement(Text, { style: styles.col2 }, 'Max'),
        React.createElement(Text, { style: styles.col3 }, '%'),
        React.createElement(Text, { style: styles.col4 }, 'Grade')
      ),
      ...markRows.map((row, i) =>
        React.createElement(
          View,
          { key: i, style: { ...styles.tableRow, backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#fff' } },
          React.createElement(Text, { style: styles.col1 }, row.subject),
          React.createElement(Text, { style: styles.col2 }, String(row.score)),
          React.createElement(Text, { style: styles.col2 }, String(row.maxScore)),
          React.createElement(Text, { style: styles.col3 }, formatPercentage((row.score / row.maxScore) * 100)),
          React.createElement(Text, { style: styles.col4 }, row.gradeLetter)
        )
      ),
      // Position
      React.createElement(
        View,
        { style: styles.positionBox },
        React.createElement(
          View,
          { style: styles.positionItem },
          React.createElement(Text, { style: styles.positionLabel }, 'OVERALL AVERAGE'),
          React.createElement(Text, { style: styles.positionValue }, formatPercentage(reportCard.overall_average ?? 0))
        ),
        React.createElement(
          View,
          { style: styles.positionItem },
          React.createElement(Text, { style: styles.positionLabel }, 'CLASS POSITION'),
          React.createElement(Text, { style: styles.positionValue }, `${reportCard.class_position ?? '-'} / ${reportCard.total_students ?? '-'}`)
        )
      ),
      React.createElement(View, { style: { ...styles.divider, marginTop: 12 } }),
      // Comments
      React.createElement(Text, { style: styles.sectionTitle }, "Class Teacher's Comment"),
      React.createElement(View, { style: styles.commentBox },
        React.createElement(Text, null, reportCard.class_teacher_comment ?? '')
      ),
      React.createElement(Text, { style: { ...styles.sectionTitle, marginTop: 8 } }, "Head's Comment"),
      React.createElement(View, { style: styles.commentBox },
        React.createElement(Text, null, reportCard.head_comment ?? '')
      ),
      // Footer
      React.createElement(
        Text,
        { style: styles.footer },
        `Generated on ${new Date().toLocaleDateString('en-ZW')} — ${school.name}`
      )
    )
  )
}

export async function generateReportCardPdf(props: ReportCardDocProps): Promise<Buffer> {
  const doc = React.createElement(ReportCardDocument, props)
  return renderToBuffer(doc as React.ReactElement)
}
