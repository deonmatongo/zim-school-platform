import type { ApiResponse } from '@/types/api'

type FetchOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { body, ...rest } = options
  const res = await fetch(path, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json: ApiResponse<T> = await res.json()
  return json
}

// ── Students ──────────────────────────────────────────────────
export const studentsApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/students?${new URLSearchParams(params).toString()}`),
  get: (id: string) => apiFetch<unknown>(`/api/students/${id}`),
  create: (body: unknown) => apiFetch<unknown>('/api/students', { method: 'POST', body }),
  update: (id: string, body: unknown) =>
    apiFetch<unknown>(`/api/students/${id}`, { method: 'PUT', body }),
  delete: (id: string) => apiFetch<unknown>(`/api/students/${id}`, { method: 'DELETE' }),
}

// ── Classes ───────────────────────────────────────────────────
export const classesApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/classes?${new URLSearchParams(params).toString()}`),
  get: (id: string) => apiFetch<unknown>(`/api/classes/${id}`),
  create: (body: unknown) => apiFetch<unknown>('/api/classes', { method: 'POST', body }),
}

// ── Grades ────────────────────────────────────────────────────
export const gradesApi = {
  list: () => apiFetch<unknown[]>('/api/grades'),
}

// ── Subjects ──────────────────────────────────────────────────
export const subjectsApi = {
  list: () => apiFetch<unknown[]>('/api/subjects'),
  create: (body: unknown) => apiFetch<unknown>('/api/subjects', { method: 'POST', body }),
}

// ── Marks ─────────────────────────────────────────────────────
export const marksApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/marks?${new URLSearchParams(params).toString()}`),
  bulkUpsert: (body: unknown) => apiFetch<unknown>('/api/marks', { method: 'POST', body }),
}

// ── Assessments ───────────────────────────────────────────────
export const assessmentsApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/assessments?${new URLSearchParams(params).toString()}`),
  create: (body: unknown) => apiFetch<unknown>('/api/assessments', { method: 'POST', body }),
}

// ── Attendance ────────────────────────────────────────────────
export const attendanceApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/attendance?${new URLSearchParams(params).toString()}`),
  bulkUpsert: (body: unknown) => apiFetch<unknown>('/api/attendance', { method: 'POST', body }),
}

// ── Homework ──────────────────────────────────────────────────
export const homeworkApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/homework?${new URLSearchParams(params).toString()}`),
  create: (body: unknown) => apiFetch<unknown>('/api/homework', { method: 'POST', body }),
}

// ── Fees ──────────────────────────────────────────────────────
export const feesApi = {
  ledger: (studentId: string, academicYearId?: string) =>
    apiFetch<unknown>(`/api/fees?student_id=${studentId}${academicYearId ? `&academic_year_id=${academicYearId}` : ''}`),
  summary: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/fees/summary?${new URLSearchParams(params).toString()}`),
  recordPayment: (body: unknown) =>
    apiFetch<unknown>('/api/fees/payment', { method: 'POST', body }),
  payments: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/fees/payment?${new URLSearchParams(params).toString()}`),
}

// ── Announcements ─────────────────────────────────────────────
export const announcementsApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/announcements?${new URLSearchParams(params).toString()}`),
  create: (body: unknown) =>
    apiFetch<unknown>('/api/announcements', { method: 'POST', body }),
}

// ── Reports ───────────────────────────────────────────────────
export const reportsApi = {
  student: (id: string, academicYearId?: string) =>
    apiFetch<unknown>(`/api/reports/student/${id}${academicYearId ? `?academic_year_id=${academicYearId}` : ''}`),
  class: (id: string, academicYearId?: string) =>
    apiFetch<unknown>(`/api/reports/class/${id}${academicYearId ? `?academic_year_id=${academicYearId}` : ''}`),
  generate: (studentId: string, academicYearId?: string) =>
    apiFetch<unknown>(`/api/reports/generate/${studentId}${academicYearId ? `?academic_year_id=${academicYearId}` : ''}`, { method: 'POST' }),
}

// ── Messages ──────────────────────────────────────────────────
export const messagesApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/messages?${new URLSearchParams(params).toString()}`),
  send: (body: unknown) => apiFetch<unknown>('/api/messages', { method: 'POST', body }),
}

// ── Parent ────────────────────────────────────────────────────
export const parentApi = {
  children: () => apiFetch<unknown[]>('/api/parent/children'),
}

// ── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  sms: (body: unknown) =>
    apiFetch<unknown>('/api/notifications/sms', { method: 'POST', body }),
}

// ── Teachers ──────────────────────────────────────────────────
export const teachersApi = {
  list: () => apiFetch<unknown[]>('/api/teachers'),
}

// ── Teacher Assignments ───────────────────────────────────────
export const teacherAssignmentsApi = {
  list: (params?: Record<string, string>) =>
    apiFetch<unknown[]>(`/api/teacher-assignments?${new URLSearchParams(params).toString()}`),
  assign: (body: unknown) =>
    apiFetch<unknown>('/api/teacher-assignments', { method: 'POST', body }),
  remove: (id: string) =>
    apiFetch<unknown>(`/api/teacher-assignments/${id}`, { method: 'DELETE' }),
}
