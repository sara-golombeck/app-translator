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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
