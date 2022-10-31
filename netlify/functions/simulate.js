import Worker from 'web-worker';
// import rust_simulator from 'rust_simulator'

// console.log(rust_simulator);

exports.handler = async function (event, context) {
    try {
        const p = event.queryStringParameters;

        const parameter_names = [
            "postcode",
            "latitude",
            "longitude",
            "occupants",
            "temperature",
            "space_heating",
            "floor_area",
            "tes_max",
        ];

        function sendError(errorMsg) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: errorMsg,
                    inputs: p
                }),
            };
        }

        let undefined_parameter = false;
        for (const name of parameter_names) {
            const value = p[name];
            if (value == undefined) {
                undefined_parameter = true;
            }
            // console.log(parameter, value);
        }

        if (!undefined_parameter) {
            // console.log('parameters: ', p);

            if (isNaN(p.floor_area) || p.floor_area < 25 || p.floor_area > 1500) {
                return sendError(`The floor area is set to: ${p.floor_area}. This is either not a number, less than 25 m^2, or greater than 1500m^2`);
            } else if (isNaN(p.tes_max) || p.tes_max < 0.1 || p.tes_max > 3.0) {
                return sendError(`The tes-max is set to: ${p.tes_max}. This is either not a number, less than 0.1 m^3, or greater than 3.0m^3`);
            } else {
                const worker = new Worker('./pkg/webworker.cjs');

                const result = await new Promise((resolve, reject) => {
                    // console.log('PROMISE');
                    worker.addEventListener('message', e => {
                        // console.log('MSG', e.data);
                        resolve(e.data);
                    });

                    setTimeout(() => {
                        // console.log('TIMEOUT');
                        resolve('timeout');
                    }, 9500);

                    worker.postMessage(p);
                });

                // console.log('result', result);

                if (result === 'timeout') {
                    return sendError(`simulation exceeded allowed runtime of 9500ms`);
                } else {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            inputs: p,
                            result: JSON.parse(result),
                        }),
                    };
                }
            }
        } else {
            let url = event.headers.host + event.path;
            return sendError(`not all parameters defined. Example parameters: ${url}?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5`);
        }
    }
    catch (error) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: `An unhandled error occured. ${error}` }),
        };
    }
};