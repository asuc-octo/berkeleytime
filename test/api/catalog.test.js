const expect = require('chai').expect;
const axios = require('axios');
const setup = require('../setup')

describe('Catalog test', function() {
    it('should compare the /catalog_json endpoint', async function() {
        this.timeout(50000)

        let restResponse = await axios.get(process.env.URL + '/api/catalog/catalog_json/')
        expect(restResponse.status).to.equal(200)
        let restData = await restResponse.data

        let gqlResponse = await axios.post(process.env.URL + '/api/graphql', { query: setup.graphql.catalog })
        expect(gqlResponse.status).to.equal(200)
        let gqlData = await gqlResponse.data
    })
})