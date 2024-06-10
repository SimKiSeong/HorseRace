import { promises as fs } from 'fs';
import { parse } from 'csv-parse';
import { plainToClass } from 'class-transformer';
import { createObjectCsvWriter } from 'csv-writer';

class RaceData{
    age:number = 0;
    hrNo:number= 0;
    jkNo:number= 0;
    owNo:number= 0;
    rcDist:number= 0;
    sex:number= 0;
    trNo:number= 0;
    track:number= 0;
    weather:number= 0;
    wgHr:number= 0;
    winOdds:number= 0;
    rcNo:number= 0;
    rcDate:number= 0;
    rcTime:number= 0;
    hrName:string= "";
    predicted_time:number= 0;
}

class PredictData{
    realWinnerName:string= "";
    realWinnerTime:number= 0;
    predictWinnerName:string= "";
    predictWinnerTime:number= 0;
    winOdds:number= 0;
    isPredictSuccess: boolean = false;
    rcNo:number= 0;
    rcDate:number= 0;
    rcDist:number= 0;
    earnMoney:number= 0;
    leftMoney:number= 0;
}

async function readCSVFile(filePath: string): Promise<RaceData[]> {
    const data = await fs.readFile(filePath, 'utf8');
    return new Promise((resolve, reject) => {
        const raceDataList: RaceData[] = [];
        parse(data, {
            columns: true, // 첫 줄을 컬럼명으로 사용
            trim: true, // 공백 제거
        }, (err, rows) => {
            if (err) {
                return reject(err);
            }
            for (const row of rows) {
                const raceData = plainToClass(RaceData,row);
                raceDataList.push(raceData);
            }
            resolve(raceDataList);
        });
    });
}


async function writeCSVFile(predictDataList: PredictData[], filePath: string): Promise<void> {
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'realWinnerName', title: 'Real Winner Name' },
            { id: 'realWinnerTime', title: 'Real Winner Time' },
            { id: 'predictWinnerName', title: 'Predict Winner Name' },
            { id: 'predictWinnerTime', title: 'Predict Winner Time' },
            { id: 'winOdds', title: 'Win Odds' },
            { id: 'isPredictSuccess', title: 'Is Predict Success' },
            { id: 'rcNo', title: 'RC No' },
            { id: 'rcDate', title: 'RC Date' },
            { id: 'rcDist', title: 'RC Dist' },
            { id: 'earnMoney', title: 'Earn Money' },
            { id: 'leftMoney', title: 'Left Money' },
        ]
    });

    const records = predictDataList.map(data => ({
        realWinnerName: data.realWinnerName,
        realWinnerTime: data.realWinnerTime,
        predictWinnerName: data.predictWinnerName,
        predictWinnerTime: data.predictWinnerTime,
        winOdds: data.winOdds,
        isPredictSuccess: data.isPredictSuccess,
        rcNo: data.rcNo,
        rcDate: data.rcDate,
        rcDist: data.rcDist,
        earnMoney: data.earnMoney,
        leftMoney: data.leftMoney
    }));

    await csvWriter.writeRecords(records);
    //console.log('CSV file was written successfully');
}

(async () => {
    //const filePath = path.resolve('./data.csv'); // 읽을 CSV 파일의 경로를 지정합니다.
    try {
        const raceDataList = await readCSVFile('./predict.csv');
        //console.log('CSV file successfully processed');
        //console.log(raceDataList); // 읽어온 데이터를 확인할 수 있습니다.

        raceDataList.sort((a,b) => {if(a.rcDate === b.rcDate){
            return a.rcNo - b.rcNo;
        }
        return a.rcDate - b.rcDate;
        })

        let individualRace:RaceData[] = [];
        let predictResult:PredictData[] = [];
        let leftMoney = 10000000;

        for(let i = 0; i<raceDataList.length; i++){
            if(raceDataList[i].rcTime==0){
                raceDataList[i].rcTime=9999
            }
            if(individualRace.length == 0 || individualRace.length-1 === i || (individualRace[0].rcDate === raceDataList[i].rcDate && individualRace[0].rcNo === raceDataList[i].rcNo)){
                individualRace.push(raceDataList[i]);
            }else{
                const nowResult = new PredictData();
                // 실제 순위별 정렬
                individualRace.sort((a,b) => a.rcTime - b.rcTime);
                nowResult.realWinnerName = individualRace[0].hrName;
                nowResult.realWinnerTime = individualRace[0].rcTime;
                nowResult.rcDate = individualRace[0].rcDate;
                nowResult.rcNo = individualRace[0].rcNo;
                nowResult.winOdds = individualRace[0].winOdds;

                // 예상 순위별 정렬
                individualRace.sort((a,b) =>
                a.winOdds - b.winOdds
/*
                {if(a.predicted_time == b.predicted_time){
                    return a.winOdds - b.winOdds
                }  return a.predicted_time - b.predicted_time}
*/
                );

                nowResult.predictWinnerName = individualRace[0].hrName;
                nowResult.predictWinnerTime = individualRace[0].predicted_time;
                if(nowResult.realWinnerName === nowResult.predictWinnerName){
                    nowResult.isPredictSuccess = true;
                    if(leftMoney>=100000){
                        nowResult.earnMoney = 100000 * nowResult.winOdds;
                        leftMoney += (nowResult.earnMoney-100000);
                        nowResult.leftMoney = leftMoney;
                    }else if(leftMoney > 0){
                        nowResult.earnMoney = leftMoney * nowResult.winOdds;
                        leftMoney += (nowResult.earnMoney-leftMoney);
                        nowResult.leftMoney = leftMoney;
                    }
                }else{
                    nowResult.isPredictSuccess = false;
                    if(leftMoney>=100000){
                        nowResult.earnMoney = 0;
                        leftMoney += -100000;
                        nowResult.leftMoney = leftMoney;
                    }else if(leftMoney > 0){
                        nowResult.earnMoney = leftMoney * nowResult.winOdds;
                        leftMoney = 0;
                        nowResult.leftMoney = 0;
                    }
                }
                predictResult.push(nowResult);
                //console.log(individualRace.length);
               // console.log(nowResult);
                individualRace = [raceDataList[i]];
            }

            //console.log(nowResult);



        }
        const nowResult = new PredictData();
        // 실제 순위별 정렬
        individualRace.sort((a,b) => a.rcTime - b.rcTime);
        nowResult.realWinnerName = individualRace[0].hrName;
        nowResult.realWinnerTime = individualRace[0].rcTime;
        nowResult.rcDate = individualRace[0].rcDate;
        nowResult.rcNo = individualRace[0].rcNo;
        nowResult.winOdds = individualRace[0].winOdds;

        // 예상 순위별 정렬
        individualRace.sort((a,b) =>
             a.winOdds - b.winOdds
/*
            {if(a.predicted_time == b.predicted_time){
                return a.winOdds - b.winOdds
            }  return a.predicted_time - b.predicted_time}


 */
        );
        nowResult.predictWinnerName = individualRace[0].hrName;
        nowResult.predictWinnerTime = individualRace[0].predicted_time;
        if(nowResult.realWinnerName === nowResult.predictWinnerName){
            nowResult.isPredictSuccess = true;
            if(leftMoney>=100000){
                nowResult.earnMoney = 100000 * nowResult.winOdds;
                leftMoney += (nowResult.earnMoney-100000);
                nowResult.leftMoney = leftMoney;
            }else if(leftMoney > 0){
                nowResult.earnMoney = leftMoney * nowResult.winOdds;
                leftMoney += (nowResult.earnMoney-leftMoney);
                nowResult.leftMoney = leftMoney;
            }
        }else{
            nowResult.isPredictSuccess = false;
            if(leftMoney>=100000){
                nowResult.earnMoney = 0;
                leftMoney += -100000;
                nowResult.leftMoney = leftMoney;
            }else if(leftMoney > 0){
                nowResult.earnMoney = leftMoney * nowResult.winOdds;
                leftMoney = 0;
                nowResult.leftMoney = 0;
            }
        }
        predictResult.push(nowResult);
        await writeCSVFile(predictResult, './gamble_result.csv');
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }
})();
