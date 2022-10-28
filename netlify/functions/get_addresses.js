import fetch from 'node-fetch';
import cheerio from 'cheerio';

// localhost:8888/.netlify/functions/get_addresses?postcode=CV47AL

async function get_addresses({ postcode }) {
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

exports.handler = async function (event, context) {
    try {
        console.log(event.queryStringParameters);
        const address_link_list = await get_addresses(event.queryStringParameters);
        console.log(address_link_list);

        if (address_link_list.length === 0) {
            // res.send({ statusCode: 404, 'error': `postcode <${postcode}> is not valid` });
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `postcode <${postcode}> is not valid` }),
            };
        } else {
            // res.send({ statusCode: 200, 'result': address_link_list });
            return {
                statusCode: 200,
                body: JSON.stringify({ result: address_link_list }),
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