import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import pkg from 'pg';
const { Pool } = pkg;

// Integration Tests - בדיקות עם DB אמיתי!

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db-test:5432/translations_test'
});

describe('Database Integration Tests', () => {
  
  before(async () => {
    // יצירת טבלה לפני הטסטים
    await pool.query(`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        source_lang VARCHAR(10),
        target_lang VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  after(async () => {
    // ניקוי אחרי הטסטים
    await pool.query('DROP TABLE IF EXISTS translations');
    await pool.end();
  });

  it('should connect to database', async () => {
    const result = await pool.query('SELECT NOW()');
    assert.ok(result.rows.length > 0, 'Database should respond');
  });

  it('should insert translation to database', async () => {
    const result = await pool.query(
      'INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1, $2, $3) RETURNING id',
      ['Hello', 'es', 'Hola']
    );
    
    assert.ok(result.rows[0].id, 'Should return inserted ID');
  });

  it('should retrieve translations from database', async () => {
    // הכנס נתונים
    await pool.query(
      'INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1, $2, $3)',
      ['Test', 'fr', 'Tester']
    );
    
    // שלוף נתונים
    const result = await pool.query('SELECT * FROM translations WHERE source_text = $1', ['Test']);
    
    assert.strictEqual(result.rows.length, 1, 'Should find one translation');
    assert.strictEqual(result.rows[0].source_text, 'Test');
    assert.strictEqual(result.rows[0].translated_text, 'Tester');
  });

  it('should handle multiple translations', async () => {
    // הכנס כמה תרגומים
    await pool.query('INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1, $2, $3)', ['One', 'es', 'Uno']);
    await pool.query('INSERT INTO translations (source_text, target_lang, translated_text) VALUES ($1, $2, $3)', ['Two', 'es', 'Dos']);
    
    // שלוף את כולם
    const result = await pool.query('SELECT COUNT(*) FROM translations');
    
    assert.ok(parseInt(result.rows[0].count) >= 2, 'Should have at least 2 translations');
  });
});
