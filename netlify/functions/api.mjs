import fetch from 'node-fetch';
import cheerio from 'cheerio'

// npm i node-fetch cheerio

async function get_addresses(postcode) {
    const url = `https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${postcode.replace(' ', '+')}`;
    const address_link_list = [];
    const response = await fetch(url);
    console.log('url: ', url);
    const body = await response.text();
    const $ = cheerio.load(body);
    const gov_partial_url = 'https://find-energy-certificate.service.gov.uk';
    let links = $("a.govuk-link");
    links.each((i, link) => {
        let href = $(link).attr("href");
        if (href.startsWith('/energy-certificate')) {
            let address = $(link).text().trim();
            const full_link = `${href.split('e/')[1]}`;
            address_link_list.push([address, full_link]);
            console.log(address, full_link);
        }
    });
    return address_link_list;
}

async function get_data_from_certificate(url) {
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

async function fetch_epc_data({ postcode, certificate }) {
    try {
        console.log('postcode: ', postcode);
        console.log('certificate: ', certificate);
        if (postcode) {
            const address_link_list = await get_addresses(postcode);
            //console.log(address_link_list);
            if (address_link_list.length === 0) {
                return { 'status': 404, 'error': `postcode <${postcode}> is not valid` };
            } else {
                return { 'status': 200, 'result': address_link_list };
            }
        } else if (certificate) {
            const url_cert = 'https://find-energy-certificate.service.gov.uk/energy-certificate/' + certificate
            const data = await get_data_from_certificate(url_cert);

            if (Object.keys(data).length === 0) {
                return { 'status': 404, 'error': `certificate <${certificate}> is not valid` };
            } else {
                return { 'status': 200, 'result': data };
            }
        } else {
            const url = req.get('host') + req.baseUrl + req.path;
            return { 'status': 404, 'error': `must provide url parameter (either ${url}?postcode=CV47AL or ${url}?certificate=2808-3055-6321-9909-2974)` };
        }
    } catch (error) {
        return {
            'status': 404,
            'error': `An unhandled error occured. ${error}`,
        };
    }
}

exports.handler = async function (event, context) {
    try {
        console.log(event.queryStringParameters);
        const result = await fetch_epc_data(event.queryStringParameters);
        console.log(result);

        return {
            statusCode: 404,
            body: JSON.stringify({ 'hello world': 'success' }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 404,
            body: JSON.stringify({ 'hello world': 'error' }),
        };
    }

};