//
//  DataSet.swift
//  AI
//
//  Created by Anton on 01/11/2017.
//  Copyright © 2017 Anton Semenov. All rights reserved.
//

import Foundation

struct DataSet {
    var learnData: [Symbol: [DayData]]
    var testData: [Symbol: [DayData]]
}

enum Symbol: String {
    case AUD
    case EUR
    case GBP
    case CHF
    case CAD
    case JPY
    case Brent
    case Gold
    case Weat
    case Soybean
    
    func toString() -> String {
        return String(self.rawValue)
    }
    
    static func getAll() -> [Symbol] {
        return [.AUD, .EUR, .GBP, .CHF, .CAD, .JPY, .Brent, .Gold, .Weat, .Soybean]
    }
}

