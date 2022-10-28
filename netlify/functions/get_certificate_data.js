import fetch from 'node-fetch';
import cheerio from 'cheerio'

// http://localhost:8888/.netlify/functions/get_certificate_data?certificate=2808-3055-6321-9909-2974

async function get_data_from_certificate({ certificate }) {
    const url = 'https://find-energy-certificate.service.gov.uk/energy-certificate/' + certificate;
    const response = await fetch(url);
    console.log('url: ', url);
    if (response.ok) {
        const body = await response.text();
        const $ = cheerio.load(body);
        const links = $("dl.govuk-summary-list");

        const floor_area_node = $("#main-content > div > div.govuk-grid-column-two-thirds.epc-domestic-sections > div.govuk-body.epc-blue-bottom.printable-area.epc-box-container > dl > div:nth-child(2) > dd");
        const floor_area_txt = floor_area_node.text().trim();
        console.log('Floor Area: ', floor_area_txt);

        const epc_space_heating_node = $("#current-space-heating-demand");
        const epc_space_heating_txt = epc_space_heating_node.text().trim();
        console.log('Space heating: ', epc_space_heating_txt);

        const valid_until_node = $("#main-content > div > div.govuk-grid-column-two-thirds.epc-domestic-sections > div.govuk-body.epc-blue-bottom.printable-area.epc-box-container > div > div.epc-extra-boxes > p:nth-child(1) > b");
        const valid_until_txt = valid_until_node.text().trim();
        console.log('Valid Until: ', valid_until_txt);
        return { 'floor-area': floor_area_txt, 'space-heating': epc_space_heating_txt, 'valid-until': valid_until_txt };
    } else {
        return {};
    }
}

exports.handler = async function (event, context) {
    try {
        console.log(event.queryStringParameters);
        const data = await get_data_from_certificate(event.queryStringParameters);

        if (Object.keys(data).length === 0) {
            // return { 'status': 404, 'error': `certificate <${certificate}> is not valid` };
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `certificate <${certificate}> is not valid` }),
            };
        } else {
            // return { 'status': 200, 'result': data };
            return {
                statusCode: 200,
                body: JSON.stringify({ result: data }),
            };
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 404,
            body: JSON.stringify({ error: `An unhandled error occured. ${error}` }),
        };
    }
};