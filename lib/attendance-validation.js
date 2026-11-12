const VALID_ATTENDANCE_STATUSES = new Set(['P', 'F', 'FJ']);

export function validateAttendanceEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;

  const studentId = Number(entry.aluno_id);
  return Number.isSafeInteger(studentId)
    && studentId > 0
    && VALID_ATTENDANCE_STATUSES.has(entry.status);
}
