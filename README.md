# HeatNinja-Netlify

This repository is a recreation of the original hosted from https://github.com/heatmyhome-ninja. Maintaince of the original website was dropped, so it was faithfully rebuilt here. The limitation of this version is simulations can only be run on the client, and not the server. See the new website below.

https://heatmyhome.netlify.app

The documentation for the original website and api have been copied below.

# Website

www.heatmyhome.ninja is a web tool to allow consumers to simulate their home's heating for a range of heating systems.

# Table of Contents

- [Technologies Simulated](#technologies-simulated)
    - [Primary Heaters](#primary-heaters)
    - [Electrified Heating Technologies](#electrified-heating-technologies)
        - [Solar Ancillaries](#solar-ancillaries)
        - [Thermal Energy Storage](#thermal-energy-storage)
        - [Tariff options](#tariff-options)
    - [Hydrogen Sources](#hydrogen-sources)
- [Performance Metrics](#performance-metrics)
- [Input Form](#input-form)
    - [Model Inputs](#model-inputs)
    - [Additional Options](#additional-options)
- [Core Simulation Stages](#core-simulation-stages)
    - [Estimating Thermal Transmittance](#estimating-thermal-transmittance)
    - [Estimating Space, Water and Total Heating Demand](#estimating-space-water-and-total-heating-demand)
    - [Applying Demand to Non-Electrified Heating Technologies](#applying-demand-to-non-electrified-heating-technologies)
    - [Applying Demand to Electrified Heating Technologies](#applying-demand-to-electrified-heating-technologies)
- [Computational Complexity](#computational-complexity)
- [The Code](#the-code)
    - [Folder Guide](#folder-guide)
    - [Website UI](#website-ui)
    - [API Server](#api--server)
- [Credits](#credits)
# Technologies Simulated

### Primary Heaters

The following heating systems are simulated:
```
1. Air Source Heat Pumps (ASHP)
2. Ground Source Heat Pumps (GSHP)
3. Electric Resistance Heating (ERH)
    *(also known as Electric Boilers or Direct Electrical heating (DEH))*
4. Hydrogen Boilers
5. Hydrogen Fuel Cells
6. Biomass Boilers
7. Natural Gas Boilers
```
ERH is also known as Electric Boilers or Direct Electrical heating (DEH).

### Electrified Heating Technologies
The electrified heating technologies (ASHPs, GSHPs and ERHs) are simulated with solar 
ancillaries and thermal energy storage, along with different energy tariffs.
These technologies are sized based on the peak hourly energy demand experience over the 
simulated year.

#### Solar Ancillaries

The following solar ancillaries (a mix of solar photovoltaic and solar thermal technologies)
are simulated:
```
1. Photovoltaic Panels (PV)
2. Evacuated Tube Solar Thermal Collectors (ET)
3. Flat Plate Solar Thermal Collectors (FP)
4. Photovoltaic-Thermal Hydrid Collectors
```
PV and ET, and PV and FP are also simulated in combination.
The solar ancillaries are sized from 2m<sup>2</sup> upto 1/4 the inputted floor area of 
the property (assume half the roof area), in 2m<sup>2</sup> increments.

#### Thermal Energy Storage

Water tanks are the only thermal energy storage (TES) technology currently simulated. The minimum
water tank volume is 0.1m<sup>3</sup> with a maximum of 3m<sup>3</sup>, and is simulated in 
0.1m<sup>3</sup> increments.

#### Tariff options
The heating systems are simulated with five different tariff options to find the cheapest option.
The five tariffs are:
```
1. Flat-rate
2. Night off-peak
3. Evening-peak
4. EV off-peak
5. Variable. 
```

**The tariff are based off 2019 prior to the economic impact on the UK of Covid-19. 
Therefore expect current prices to vary from those estimated by the model.**

### Hydrogen Sources
For the hydrogen technologies (boiler and fuel cell) they are simulated using hydrogen from
three different sources:

**Grey**: Hydrogen produced from steam methane reforming.

**Blue**: Hydrogen produced from steam methane reforming, but with the addition of Carbon 
Capture and Storage (CCS).

**Green**: Hydrogen produced from the electrolysis of water, with the electroylsis powered 
using grid electricity.

# Performance Metrics
The simulator calaculates the following metrics for each of the systems modeled:
```
1. Capital Expenditure (Upfront Cost)
2. Operational Expenditure (Yearly Cost)
3. Net Present Cost (Lifetime Cost / Cost over 20 years)
```

Additionally for the electrified heating technologies the solar ancillery type and size,
along with TES size that achieves the lowest lifetime cost is outputted.

# Input Form

## Model Inputs
The model requires six inputs from the user, being the:
```
1. Dwelling’s postcode
2. Number of occupants
3. Thermostat temperature
4. Floor area
5. Yearly space heating energy consumption
6. Maximum TES volume. 
```
From the postcode, the longitude and latitude of the home can be determined, which are rounded to the nearest half a degree. The rounded position is used to load the hourly outside temperature and solar radiation datasets for the location. While the user may not know their home’s floor area and yearly space heating energy consumption, this information can usually be found on their Energy Performance Certificate (EPC), a legal requirement for any building sold, let or constructed in the UK since 2007. As the simulator only outputs the optimal TES size for a given system an upper TES size limit is required as input from the user to ensure the model does not optimise for a TES size that could not feasibly fit into the user’s home.

## Additional Options
In addition to the inputs required by the model, users can also select:
1. Where the simualtion is computed, either server-side using Rust (default), client-side using Rust or clinet-side using C++.
2. If the simulation is run client-side you can choose to turn off optimisation (a global optmisation algorithm)

You can choose to save a completed, valid input form as a URL for sharing or later use. You can also download results and reupload the file to reload the results as well as the inputs for those results.

# Core Simulation Stages

## Estimating Thermal Transmittance

The first step of the model is to estimate the thermal transmittance (U value) of the 
property. This is done by simulating the home’s yearly space heating demand at an hourly
resolution using a range of U values from 0.5 to 3.0 in 0.01 W/m<sup>2</sup>K step 
increments and selecting the U value which results in a yearly space heating demand closest
to that specified by the user. 
 
The hourly space heating demand is taken as the energy required to raise the inside 
temperature to the desired temperature. The inside temperature is a function of heat loss 
to the environment, and gain from body heat and solar radiation.

## Estimating Space, Water and Total Heating Demand
With the U value calculated, the space heating demand is recalculated, in addition to 
hot water demand, using the inputted thermostat temperature. Hot water energy consumption
is a function of inlet cold water temperature and hot water consumption per occupant, 
accounting for daily and monthly variation. 
 
### Applying Demand to Non-Electrified Heating Technologies
The total demand is then used to calculate the operational costs and emissions of the 
hydrogen, biomass and gas heating systems, by multiplying the energy demand with operating 
costs and emissions per unit energy respectively, whilst adjusting for system efficiencies. 

### Applying Demand to Electrified Heating Technologies
As for the electrified heating technologies, the model is more complex, being simulated 
for a range of solar thermal and photovoltaic ancillary technology sizes and combinations,
TES sizes and tariffs. For each hour over a year, the following steps occur.

1.	Calculate the change in inside temperature due to heat loss to the environment and 
heat gain from body heat, solar radiation and heat loss from the TES into the living space.
2.	Update the TES state of charge due to heat loss, solar thermal generation, space and
 hot water usage, and heat produced from the electrified heating technology, powered 
 either from grid import or solar photovoltaics.
3.	Calculate operational costs from electricity import for the hour using the selected
 tariff and operational emissions associated with the solar ancillaries and grid import.

The optimal solar ancillary size, TES size and tariff is then outputted to the user for
each electrified heat technology - solar ancillary combination, where the optimal 
system is considered that with the lowest lifetime cost.

# Computational Complexity

Due to each of the 3 electrified heating systems being simulated at an hourly resolution 
over a year, for each combination and size of solar ancillary, TES sizes and tariff options,
del has a considerable computational cost. 

The number of solar ancillary combinations tested
 per heating technology, O_solar, given by Eq. 1, is dependent on the dwelling’s floor area,
  A. The number of iterations required to go through all TES sizes is given by Eq. 2, 
  and the total number of hours simulated for all electrified heating system combinations 
  is given by Eq. 3.

The number of solar ancillary combinations tested per heating technology if given by:

```
solar_combinations = 6 * floor( floor_area / 8) - 1
tes_combinations = tes_max / 10
total_hours_simulated = 8670*3*5*solar_combinations*tes_combinations
total_hours_simulated = 130,050*solar_combinations*tes_combinations
```
The number of tes combinations tested per solar ancillary if given by:
```
tes_combinations = tes_max / 10
```
The total number of hours simulated for each heating technology, solar ancillary, TES 
and tariff option.
```
total_hours_simulated = 8670 * 3 * 5 * solar_combinations * tes_combinations
total_hours_simulated = 130,050 * solar_combinations * tes_combinations
```

# The code

The simulator was originally developed in Python, but was migrated first to C++ 
and then Rust. This was to achieve improved performance and utilisation of WASM. 
Please contact Jack Kirby via [GitHub](https://github.com/Jackrekirby) if you wish to
discuss implementation aspects fo the code.

## Folder Guide

Here is a summary of the contents of the main folders:

- `docs` contains all the files required for the HeatMyHome website (which is hosted through GitHub Pages)
- `native-cpp` contains the native C++ code for the heating simulator. This version is not as well maintained / written after the Rust implementation, although should produce the same outputs. You can choose to run this version client side on the website under experimental options.
- `native-rust` contains the native Rust code for the heating simulator. This version is run server side, and can also be run client side on the website under experimental options.

If you are wanting to use a version of the heating model but unsure about which version to decide on I have summarised a list of pros and cons of the C++ and Rust versions below.

### Advantages of C++ Version / Disadvantages of Rust Version

1. The C++ version is faster than Rust, especially for large property sizes.
2. The WASM version compiled from C++ is faster than that compiled from Rust, especially for large property sizes. (Although this is not a problem if you plan to run the code natively).
3. The C++ version is much easier to performance profile (I used Visual Studio, for Windows). This is partially because the code is highly functionised, making it easy to see the performance of small sections of code.

### Disadvantages of C++ Version / Advantages of Rust Version

1. If you are unfamiliar with Rust or C++, but you have used Python or other similar language, I would recommend Rust.
2. The C++ version is highly functionised, but this can make the code difficult to read as one must jump between functions, rather than being in chronological order.
3. If you wanting to use the WASM compiled version, you must use Emscripten, while the Rust provides a crate (library).
4. The Rust version contains an improved global optimisation algorithm (although the C++ version still performs better).

## Website UI

The website UI was developed with pure HTML, CSS and Javascript. 

[Chart.js](https://www.chartjs.org) was used to create the output graph.

Simulations are by default run on a server using Rust compiled WASM, but one can select 
to run the simulations client-side with Rust or C++ compiled WASM.

The structure of the website pages are outlined below:

- Home
- About Us
    - Our Team
    - Privacy Policy
    - Motivation
- Education
    - Heating Technologies
    - Solar Technologies
    - Why Switch?
- Documentation
    - Simulator Inputs
    - Simulator Outputs
    - How-It-Works
- Simulate

# API / Server

The server is split into two major parts:
1. For fetching EPC certificates.
2. For computing the heating simulations.

The API is currently unavailable for public use due to limited compute hours. 
However the code is publicly available if you wish to view it or host the server yourself.

For further information please see the API specific [repository](https://github.com/heatmyhome-ninja/epc-api). 

# Credits
Credit to Vecteezy for the following Vector Graphics: [Tree](https://www.vecteezy.com/free-vector/tree"), [Nature](https://www.vecteezy.com/free-vector/nature) and [Human](https://www.vecteezy.com/free-vector/human). 
We wish to thank credit Dr Wei He and Micheal Ryland for developing the  heating simulation model.
HeatMyHome is a University of Warwick Engineering Master's project developed by Jack Kirby, Aaron Hickman, Lina Khalil, Tudor Sucala, and Saahil Dhand.
If you have any questions, please contact us at heatmyhome.ninja@gmail.com.


# HeatMyHome API

This repository contains the code used to run the API server used by the [HeatMyHome-Website](https://github.com/heatmyhome-ninja/HeatMyHome-Website).
Although the API is currently not publically callable, due to limited compute hours you may wish to read the code and coumentation to develop your own API / Heating Simulator, or host the server for your own use.

# Documentation

The URL of the API is: [customapi.heatmyhome.ninja](https://customapi.heatmyhome.ninja)

The API returns JSON objects, which contains the following keys: "status", "result", "error", with "result" and "error" keys being conditional upon the status. A list of example requests are provided below to show the possible outputs of the API dependent on the appended subdomain / url parameters.

Request-Response List
- [No Subdomain or Parameters](#no-subdomain-or-parameters)
- [EPC Subdomain: No Parameters](#epc-subdomain-no-parameters)
- [EPC Subdomain: Invalid Postcode](#epc-subdomain-invalid-postcode)
- [EPC Subdomain: Invalid EPC Certificate](#epc-subdomain-invalid-epc-certificate)
- [EPC Subdomain: Unhandled Error](#epc-subdomain-unhandled-error)
- [EPC Subdomain: Valid Postcode](#epc-subdomain-valid-postcode)
- [EPC Subdomain: Valid EPC Certificate](#epc-subdomain-valid-epc-certificate)
- [Simulate Subdomain: No Parameters](#simulate-subdomain-no-parameters)
- [Simulate Subdomain: Not All Parameters Provided](#simulate-subdomain-not-all-parameters-provided)
- [Simulate Subdomain: Floor Area Out of Range](#simulate-subdomain-floor-area-out-of-range)
- [Simulate Subdomain: TES Max Out of Range](#simulate-subdomain-tes-max-out-of-range)
- [Simulate Subdomain: Unhandled Error](#simulate-subdomain-unhandled-error)
- [Simulate Subdomain: Timeout Error](#simulate-subdomain-timeout-error)
- [Simulate Subdomain: Successful Simulation](#simulate-subdomain-successful-simulation)
___
### No Subdomain or Parameters 
https://customapi.heatmyhome.ninja

When no parameters entered API returns recommendation to goto either EPC API or Simulator subdomain. 
```json
{
    "status": 404,
    "error": "must call customapi.heatmyhome.ninja/epc or customapi.heatmyhome.ninja/simulate with their respective url parameters",
    "info": "API Version 0.9"
}
```
___
### EPC Subdomain: No Parameters 
https://customapi.heatmyhome.ninja/epc

With EPC API you may request a list of addresses and EPC certificate numbers for a given postcode, or request the EPC Space Heating Value and Floor Area of a given property.
```json
{
    "status": 404,
    "error": "must provide url parameter (either customapi.heatmyhome.ninja/epc?postcode=CV47AL or customapi.heatmyhome.ninja/epc?certificate=2808-3055-6321-9909-2974)"
}
```
___
### EPC Subdomain: Invalid Postcode
https://customapi.heatmyhome.ninja/epc?postcode=ABCDEFG

If the postcode is not recognised by the gov.uk epc register it will return this error.
```json
{
    "status": 404,
    "error": "must provide url parameter (either customapi.heatmyhome.ninja/epc?postcode=CV47AL or customapi.heatmyhome.ninja/epc?certificate=2808-3055-6321-9909-2974)"
}
```
___
### EPC Subdomain: Invalid EPC Certificate
https://customapi.heatmyhome.ninja/epc?certificate=1234-5678-1234-5678-1234

If the certificate number is not recognised by the gov.uk epc register it will return this error.
```json
{
    "status": 404,
    "error": "certificate <1234-5678-1234-5678-1234> is not valid"
}
```

___
### EPC Subdomain: Unhandled Error
https://customapi.heatmyhome.ninja/epc?certificate=1234-5678-1234-5678-1234

In the event that any unhandled error occurs, such as if the gov.uk website went down, the following error is returned where INSERT_ERROR_HERE would be replaced by the unhandled error message.
```json
{
    "status": 404,
    "error": "An unhandled error occured. INSERT_ERROR_HERE",
}
```
___
### EPC Subdomain: Valid Postcode
https://customapi.heatmyhome.ninja/epc?certificate=1234-5678-1234-5678-1234

If postcode is valid a list of addresses and their corresponding epc certicate numbers are returned. However the postcode may not contain any domestic EPC certicates, in which can the array is empty. Note JSON result address list shortened for demonstration purposes.
```json
{
    "status": 200,
    "result": [
        ["Bluebell Warden, Bluebell Residences, COVENTRY, CV4 7AL", "2808-3055-6321-9909-2974"],
        ["The Gatehouse, The Westwood Site, COVENTRY, CV4 7AL", "8901-8006-7229-6896-8143"],
        ["Toar Cottage, Gibbet Hill Road, COVENTRY, CV4 7AL", "2018-8084-6235-6021-5020"],
        ["University of Warwick, Gibbet Hill Road, COVENTRY, CV4 7AL", "0740-2870-6466-0891-7525"],
    ]
}
```
___
### EPC Subdomain: Valid EPC Certificate
https://customapi.heatmyhome.ninja/epc?certificate=1234-5678-1234-5678-1234

If EPC certifcate is valid floor area, space heating value and valid until date return. Valid until date not currently utilised by website. EPC certicate may not contain an floor area or space heating value, in which case the value for those keys are just returned as an empty string, and the client must check for empty strings. Client must also filter out numbers from units (which can be done using regex).
```json
{
    "status": 200,
    "result": {
        "floor-area": "109 square metres",
        "space-heating": "5963 kWh per year",
        "valid-until": "19 September 2021"
    }
}
```
___
### Simulate Subdomain: No Parameters 
https://customapi.heatmyhome.ninja/simulate

With Simulator API you must provide all parameters otherwise the API will return an error (no paramaters are optional) 
```json
{
    "status": 404,
    "error": "not all parameters defined. Example parameters: customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5",
    "inputs": {}
}
```
___
### Simulate Subdomain: Not all parameters provided
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL?postcode=CV47AL&latitude=52.3833

Not providing all parameters returns the following error. The simulator also returns a list of inputs so you can check the API interpretted your request correctly.
```json
{
    "status": 404,
    "error": "not all parameters defined. Example parameters: customapi.heatmyhome.ninja/simulate?postcode=CV47AL?postcode=CV47AL&latitude=52.3833?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5",
    "inputs": {
        "postcode": "CV47AL?postcode=CV47AL",
        "latitude": "52.3833"
    }
}
```
___
### Simulate Subdomain: Floor Area Out of Range
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=900000&tes_max=0.5

Due to floor area affecting computation time, floor area is limited to a max of 1500m<sup>2</sup>. Note not all parameters are not limit checked server side, as this is done client side. However limiting floor area is important to prevent the server being stressed incase a large floor area is requested.
```json
{
    "status": 404,
    "error": "The floor area is set to: 900000. This is either not a number, less than 25 m^2, or greater than 1500m^2",
    "inputs": {
        "postcode": "CV47AL",
        "latitude": "52.3833",
        "longitude": "-1.5833",
        "occupants": "2",
        "temperature": "20",
        "space_heating": "3000",
        "floor_area": "900000",
        "tes_max": "0.5"
    }
}
```
___
### Simulate Subdomain: TES Max Out of Range
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=4

Due to TES max affecting computation time, TES max is limited to a max of 3.0m<sup>2</sup>. Note not all parameters are not limit checked server side, as this is done client side. However limiting floor area is important to prevent the server being stressed incase a large TES max is requested.
```json
{
    "status": 404,
    "error": "The tes-max is set to: 4. This is either not a number, less than 0.1 m^3, or greater than 3.0m^3",
    "inputs": {
        "postcode": "CV47AL",
        "latitude": "52.3833",
        "longitude": "-1.5833",
        "occupants": "2",
        "temperature": "20",
        "space_heating": "3000",
        "floor_area": "60",
        "tes_max": "4"
    }
}
```
___
### Simulate Subdomain: Unhandled Error
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5

In the event that any unhandled error occurs, such as a bug in the WASM code, the following error is returned where INSERT_ERROR_HERE would be replaced by the unhandled error message.
```json
{
    "status": 404,
    "error": "An unhandled error occured. INSERT_ERROR_HERE",
}
```

___
### Simulate Subdomain: Timeout Error
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5

Simulations should take no more than a few seconds to run if the server is not processing any other requests. However in the event of heavy traffic a simulation may take longer. Once the server begins process a requests it is given 30s to process it before it returns a timeout error.
```json
{
    "status": 404,
    "error": "simulation exceeded allowed runtime: 30000 ms. Server may be busy.",
    "inputs": {
        "postcode": "CV47AL",
        "latitude": "52.3833",
        "longitude": "-1.5833",
        "occupants": "2",
        "temperature": "20",
        "space_heating": "3000",
        "floor_area": "60",
        "tes_max": "0.5"
    }
}
```
___
### Simulate Subdomain: Successful Simulation
https://customapi.heatmyhome.ninja/simulate?postcode=CV47AL&latitude=52.3833&longitude=-1.5833&occupants=2&temperature=20&space_heating=3000&floor_area=60&tes_max=0.5

Successful simulation returns the optimal properties per system. It also includes the calaculated thermal transmittance and demand values for the property, however these are not currently utilised by the website. If the user request to save the results the result key of the JSON object is what is saved in order to reload results later.
```json
{
    "status": 200,
    "inputs": {
        "postcode": "CV47AL",
        "latitude": "52.3833",
        "longitude": "-1.5833",
        "occupants": "2",
        "temperature": "20",
        "space_heating": "3000",
        "floor_area": "60",
        "tes_max": "0.5"
    },
    "result": {
        "thermal-transmittance": 1,
        "optimised-epc-demand": 2992,
        "npc-years": 20,
        "demand": {
            "boiler": {
                "hot-water": 1460,
                "space": 2737,
                "total": 4198,
                "peak-hourly": 9.7393
            },
            "heat-pump": {
                "hot-water": 1460,
                "space": 2845,
                "total": 4305,
                "peak-hourly": 1.6715
            }
        },
        "systems": {
            "electric-boiler": {
                "none": {
                    "pv-size": 0,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.2,
                    "operational-expenditure": 373,
                    "capital-expenditure": 949,
                    "net-present-cost": 6435,
                    "operational-emissions": 924094
                },
                "photovoltaic": {
                    "pv-size": 14,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 173,
                    "capital-expenditure": 3759,
                    "net-present-cost": 6308,
                    "operational-emissions": 515563
                },
                "flat-plate": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.2,
                    "operational-expenditure": 316,
                    "capital-expenditure": 3527,
                    "net-present-cost": 8182,
                    "operational-emissions": 774946
                },
                "evacuated-tube": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.2,
                    "operational-expenditure": 305,
                    "capital-expenditure": 3637,
                    "net-present-cost": 8129,
                    "operational-emissions": 746851
                },
                "flat-plate-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 168,
                    "capital-expenditure": 5896,
                    "net-present-cost": 8372,
                    "operational-emissions": 477528
                },
                "evacuated-tube-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 147,
                    "capital-expenditure": 6006,
                    "net-present-cost": 8172,
                    "operational-emissions": 424266
                },
                "photovoltaic-thermal-hybrid": {
                    "pv-size": 2,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.2,
                    "operational-expenditure": 300,
                    "capital-expenditure": 4957,
                    "net-present-cost": 9366,
                    "operational-emissions": 747550
                }
            },
            "air-source-heat-pump": {
                "none": {
                    "pv-size": 0,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 145,
                    "capital-expenditure": 6238,
                    "net-present-cost": 8369,
                    "operational-emissions": 355062
                },
                "photovoltaic": {
                    "pv-size": 14,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -107,
                    "capital-expenditure": 9318,
                    "net-present-cost": 7751,
                    "operational-emissions": -23068
                },
                "flat-plate": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 128,
                    "capital-expenditure": 8815,
                    "net-present-cost": 10703,
                    "operational-emissions": 324390
                },
                "evacuated-tube": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 124,
                    "capital-expenditure": 8925,
                    "net-present-cost": 10745,
                    "operational-emissions": 315712
                },
                "flat-plate-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -77,
                    "capital-expenditure": 11455,
                    "net-present-cost": 10319,
                    "operational-emissions": 6972
                },
                "evacuated-tube-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -90,
                    "capital-expenditure": 11565,
                    "net-present-cost": 10236,
                    "operational-emissions": -9912
                },
                "photovoltaic-thermal-hybrid": {
                    "pv-size": 2,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 111,
                    "capital-expenditure": 10245,
                    "net-present-cost": 11880,
                    "operational-emissions": 295010
                }
            },
            "ground-source-heat-pump": {
                "none": {
                    "pv-size": 0,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 90,
                    "capital-expenditure": 7938,
                    "net-present-cost": 9257,
                    "operational-emissions": 220896
                },
                "photovoltaic": {
                    "pv-size": 14,
                    "solar-thermal-size": 0,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -198,
                    "capital-expenditure": 11018,
                    "net-present-cost": 8104,
                    "operational-emissions": -163122
                },
                "flat-plate": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 77,
                    "capital-expenditure": 10515,
                    "net-present-cost": 11653,
                    "operational-emissions": 202183
                },
                "evacuated-tube": {
                    "pv-size": 0,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 74,
                    "capital-expenditure": 10625,
                    "net-present-cost": 11717,
                    "operational-emissions": 197829
                },
                "flat-plate-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -164,
                    "capital-expenditure": 13155,
                    "net-present-cost": 10746,
                    "operational-emissions": -123339
                },
                "evacuated-tube-and-photovoltaic": {
                    "pv-size": 12,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": -173,
                    "capital-expenditure": 13265,
                    "net-present-cost": 10720,
                    "operational-emissions": -133570
                },
                "photovoltaic-thermal-hybrid": {
                    "pv-size": 2,
                    "solar-thermal-size": 2,
                    "thermal-energy-storage-volume": 0.1,
                    "operational-expenditure": 60,
                    "capital-expenditure": 11945,
                    "net-present-cost": 12833,
                    "operational-emissions": 172818
                }
            },
            "hydrogen-boiler": {
                "grey": {
                    "operational-expenditure": 229,
                    "capital-expenditure": 2120,
                    "net-present-cost": 5482,
                    "operational-emissions": 1781634
                },
                "blue": {
                    "operational-expenditure": 434,
                    "capital-expenditure": 2120,
                    "net-present-cost": 8500,
                    "operational-emissions": 279838
                },
                "green": {
                    "operational-expenditure": 858,
                    "capital-expenditure": 2120,
                    "net-present-cost": 14744,
                    "operational-emissions": 1853926
                }
            },
            "hydrogen-fuel-cell": {
                "grey": {
                    "operational-expenditure": 224,
                    "capital-expenditure": 25158,
                    "net-present-cost": 28459,
                    "operational-emissions": 1749444
                },
                "blue": {
                    "operational-expenditure": 426,
                    "capital-expenditure": 25158,
                    "net-present-cost": 31423,
                    "operational-emissions": 274782
                },
                "green": {
                    "operational-expenditure": 843,
                    "capital-expenditure": 25158,
                    "net-present-cost": 37553,
                    "operational-emissions": 1820430
                }
            },
            "gas-boiler": {
                "operational-expenditure": 187,
                "capital-expenditure": 1620,
                "net-present-cost": 4364,
                "operational-emissions": 853506
            },
            "biomass-boiler": {
                "operational-expenditure": 192,
                "capital-expenditure": 9750,
                "net-present-cost": 12570,
                "operational-emissions": 419757
            }
        }
    }
}
```
