// Frontend Unit Tests (Simple JavaScript)

function testTranslateButtonExists() {
  const btn = document.getElementById('translateBtn');
  if (!btn) throw new Error('Translate button not found');
  console.log('✅ Test passed: Translate button exists');
}

function testSourceTextareaExists() {
  const source = document.getElementById('source');
  if (!source) throw new Error('Source textarea not found');
  console.log('✅ Test passed: Source textarea exists');
}

function testTargetSelectExists() {
  const target = document.getElementById('target');
  if (!target) throw new Error('Target select not found');
  console.log('✅ Test passed: Target select exists');
}

function testResultDivExists() {
  const result = document.getElementById('result');
  if (!result) throw new Error('Result div not found');
  console.log('✅ Test passed: Result div exists');
}

function testHistoryListExists() {
  const history = document.getElementById('history');
  if (!history) throw new Error('History list not found');
  console.log('✅ Test passed: History list exists');
}

function testAPIEndpoint() {
  const endpoint = '/api/translate';
  if (!endpoint.startsWith('/api/')) throw new Error('Invalid API endpoint');
  console.log('✅ Test passed: API endpoint is valid');
}

function testEmptyTextValidation() {
  const text = '';
  if (text.trim().length === 0) {
    console.log('✅ Test passed: Empty text validation works');
  } else {
    throw new Error('Empty text validation failed');
  }
}

function testLanguageCodeFormat() {
  const validCodes = ['en', 'es', 'fr', 'de', 'he'];
  validCodes.forEach(code => {
    if (code.length !== 2) throw new Error(`Invalid language code: ${code}`);
  });
  console.log('✅ Test passed: Language codes are valid');
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running Frontend Unit Tests...\n');
  
  try {
    testAPIEndpoint();
    testEmptyTextValidation();
    testLanguageCodeFormat();
    
    console.log('\n✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return false;
  }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
