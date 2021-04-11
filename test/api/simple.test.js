var expect = require('chai').expect

describe('Simple test', function() {
    it('should banana', function() {
        let banana = ('b' + 'a' + + 'a' + 'a').toLowerCase()
        expect(banana).to.equal('banana')
    })
})