const axios = require('axios');
const fs = require('fs');
const { Parser } = require('json2csv');

async function raceInfo(year, month) {
    try {
        // Fetch JSON data from the given URL with query parameters
        const response = await axios.get(
            "https://apis.data.go.kr/B551015/API22_1/startingTranning_1"
            , {
            params: {
                serviceKey:"E7hX4TvZyUwmCle8I4gMnsv9DZ7RaTWZvspw7HywF4EACSuYkh+p3jR7F22E/IOKm0UfK4dWLF1DgzQwRDXmtw==",
                tr_month:year+month,
                pageNo:1,
                numOfRows:3000,
                _type:"json",
            }
        });
       // console.log(response.data.response.body.items.item);
        const jsonData = response.data.response.body.items.item;

        // Convert JSON data to CSV format
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(jsonData);

        // CSV 파일로 저장
        fs.writeFile(year+"_"+month+".csv", csv, function(err) {
            if (err) throw err;
            console.log('CSV file saved.');
        });

        console.log(`CSV file has been created at 2022_02.csv`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

async function addjsonToCsv(year,month) {
    try {
        // Fetch JSON data from the given URL with query parameters
        const response = await axios.get(
            "https://apis.data.go.kr/B551015/API22_1/startingTranning_1"
            , {
                params: {
                    serviceKey:"E7hX4TvZyUwmCle8I4gMnsv9DZ7RaTWZvspw7HywF4EACSuYkh+p3jR7F22E/IOKm0UfK4dWLF1DgzQwRDXmtw==",
                    tr_month:year+month,
                    pageNo:1,
                    numOfRows:3000,
                    _type:"json",
                }
            });
        //console.log(response.data.response.body.items.item);
        const jsonData = response.data.response.body.items.item;

        // Convert JSON data to CSV format
        const newRows = jsonData.map(row => Object.values(row).join(',')).join('\r\n');

// 파일에 데이터 추가
        fs.appendFile("all.csv", `\r\n${newRows}`, function(err) {
            if (err) throw err;
            console.log('Data appended to file!');
        });

        console.log(`CSV file has been created at ${year}_${month}.csv`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Example usage:
// Replace 'your_url_here' with the URL of the JSON data
// Replace '2022_01.csv' with your desired output file path
// Set query parameters as needed
const queryParams = {
    param1: 'value1',
    param2: 'value2'
};

async function loopback(){
    for(let i = 2024; i>=2014;i--){
        for(let j = 1;j<=12;j++){
            const year = i.toString();
            let month = j.toString()
            if(j<10) {
                month = '0'+month;
            }
            await addjsonToCsv(year,month);
        }
    }
}


    console.log("Hello world");
    //raceInfo('2024','01');
    loopback();
   //addjsonToCsv();

