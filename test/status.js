const axios = require('axios')
const fs = require('fs')

const configData = fs.readFileSync('./config.json', 'utf8')
const config = JSON.parse(configData)

const statusUrl = 'https://api.statuspage.io/v1/pages/' + config.pageId
const authHeader = { 'Authorization': 'OAuth ' + config.apiKey };

async function submit(ping, auth) {
    try {
        let start = Date.now();
        await ping()
        let responseTime = Date.now() - start

        let metricData = {
            data: {
                timestamp: Math.floor(start / 1000),
                value: responseTime    
            }
        }

        let resp = await axios.post(
            statusUrl + '/metrics/' + auth.metricId + '/data.json',
            metricData,
            { headers: authHeader }
        )

        let status = 'operational'
        if (responseTime > 2000) {
            status = 'degraded_performance'
        }

        let componentData = {
            component: {
                status
            }
        }

        await axios.patch(
            statusUrl + '/components/' + auth.componentId,
            componentData,
            { headers: authHeader }
        )
    } catch (error) {
        console.log(error)

        let componentData = {
            component: {
                status: 'major_outage'
            }
        }

        await axios.patch(
            statusUrl + '/components/' + auth.componentId,
            componentData,
            { headers: authHeader }
        )
    }
}

async function pingRestApi() {
    let response = await axios.get(config.url + '/api/catalog/catalog_json/course_box/?course_id=2321')
    if (response.status == 200 && response.data instanceof Object) {
        return true 
    } else {
        throw new Error('Invalid response')
    }
}

async function pingGraphqlApi() {
    let response = await axios.post(
        config.url + '/api/graphql',
        { query: 'query PingQuery{ ping }' }
    )
    if (response.status == 200 && response.data.data.ping == 'pong!') {
        return true 
    } else {
        throw new Error('Invalid response')
    }
}

async function pingFrontend() {
    let response = await axios.get(config.url + '/landing')
    if (response.status == 200 && typeof response.data == 'string') {
        return true 
    } else {
        throw new Error('Invalid response')
    }
}

async function update() {
    await submit(pingGraphqlApi, config.apiStatus)
    await submit(pingFrontend, config.frontendStatus)
}

update()
setInterval(update, config.statusInterval * 1000)

