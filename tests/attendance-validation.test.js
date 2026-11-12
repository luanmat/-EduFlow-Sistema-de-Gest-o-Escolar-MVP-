import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAttendanceEntry } from '../lib/attendance-validation.js';

test('unidade: aceita os três status de frequência permitidos', () => {
  for (const status of ['P', 'F', 'FJ']) {
    assert.equal(validateAttendanceEntry({ aluno_id: 10, status }), true);
  }
});

test('unidade: rejeita registro ausente ou identificador inválido', () => {
  assert.equal(validateAttendanceEntry(null), false);
  assert.equal(validateAttendanceEntry({ status: 'P' }), false);
  assert.equal(validateAttendanceEntry({ aluno_id: 0, status: 'P' }), false);
  assert.equal(validateAttendanceEntry({ aluno_id: 'abc', status: 'P' }), false);
});

test('unidade: rejeita status fora da regra de frequência', () => {
  assert.equal(validateAttendanceEntry({ aluno_id: 10, status: 'A' }), false);
  assert.equal(validateAttendanceEntry({ aluno_id: 10, status: '' }), false);
});
