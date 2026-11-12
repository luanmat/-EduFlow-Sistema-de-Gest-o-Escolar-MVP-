const VALID_ATTENDANCE_STATUSES = new Set(['P', 'F', 'FJ']);

export function isValidAttendanceStatus(status) {
  return VALID_ATTENDANCE_STATUSES.has(status);
}
