//
//  DataConverter.swift
//  AI
//
//  Created by Anton on 01/11/2017.
//  Copyright © 2017 Anton Semenov. All rights reserved.
//

import Foundation

func convertData() {
    var result = DataSet(learnData: [:], testData: [:])
    
    Symbol.getAll().forEach({symbol in
        let parsedData = parseFile(symbol: symbol)
        result.learnData[symbol] = parsedData.learnData
        result.testData[symbol] = parsedData.testData
    })
}

func parseFile(symbol: Symbol) -> TempFileDataSet {
    let path = Bundle.main.path(forResource: symbol.toString(), ofType: "json")
    let data = NSData.init(contentsOfFile: path!)
    
    let object = try? JSONSerialization.jsonObject(with: data! as Data, options: [])
    
    guard let priceData = (object as! [String: [String: Any]])["dataset"]!["data"] else {
        return TempFileDataSet(learnData: [], testData: [])
    }
    
    var minAbsolute: Float32 = 0
    var maxAbsolute: Float32 = 0
    var last20High: [Float32] = []
    var last20Low: [Float32] = []
    var learnData: [DayData] = []
    var testData: [DayData] = []
    
    let tempData = (priceData as! [[Any]]).map({ (dayData: [Any]) -> TempStructure in
        switch symbol {
        case .JPY:
            return TempStructure(
                date: convertDate(date: dayData[0] as! String),
                open: Float32(1000 / (dayData[1] as! Float)),
                high: Float32(1000 / (dayData[2] as! Float)),
                low: Float32(1000 / (dayData[3] as! Float)),
                close: parseFloat(float: dayData[4], symbol: symbol)
            )
        default:
            return TempStructure(
                date: convertDate(date: dayData[0] as! String),
                open: Float32(dayData[1] as! Float),
                high: Float32(dayData[2] as! Float),
                low: Float32(dayData[3] as! Float),
                close: parseFloat(float: dayData[4], symbol: symbol)
            )
            
        }
    }).sorted(by: {$0.date < $1.date})
    
    
    
    tempData.forEach({ (data: TempStructure) -> Void in
        minAbsolute = min(data.low, minAbsolute)
        maxAbsolute = max(data.high, maxAbsolute)
        last20Low.append(data.low)
        last20High.append(data.high)
        
        if (last20High.count > 20) {
            last20Low.removeFirst()
            last20High.removeFirst()
        }
        
        var close: Float32
        
        if (data.close != nil) {
            close = data.close!
        } else {
            let index = tempData.index(where: { $0.date == data.date})
            close = tempData[index! + 1].open
        }
        
        let dayData = DayData(
            date: data.date,
            open: data.open,
            high: data.high,
            low: data.low,
            close: close,
            min20: last20Low.min()!,
            max20: last20High.max()!,
            minAbsolute: minAbsolute,
            maxAbsolute: maxAbsolute
        )
        
        if (dayData.date < convertDate(date: "2008-01-01")) {
            learnData.append(dayData)
        } else {
            testData.append(dayData)
        }
    })
    
    return TempFileDataSet(learnData: learnData, testData: testData)
}

func convertDate(date: String) -> Date {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.date(from: date)!
}

func parseFloat(float: Any, symbol: Symbol) -> Float32? {
    let _float = float as? Float
    if (_float != nil) {
        switch symbol {
        case .JPY: return Float32(1000 / _float!)
        default: return Float32(_float!)
        }
    }
    
    return nil
}

struct TempStructure {
    let date: Date
    let open: Float32
    let high: Float32
    let low: Float32
    let close: Float32?
}

struct TempFileDataSet {
    let learnData: [DayData]
    let testData: [DayData]
}
