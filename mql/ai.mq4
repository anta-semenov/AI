//+------------------------------------------------------------------+
//|                                                           ai.mq4 |
//|                        Copyright 2018, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2018, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

#include <hash.mqh>
#include <json.mqh>

datetime lastTime = 0;
bool shouldTradeToday = true;
input bool symbolSatelite;
input int magicNumber;
input double minLotCost = 50.0;
input int timeBeforeCloseTreshold = 2;

string symbols[11] = {"AUDUSD", "EURUSD", "GBPUSD", "USDCHF", "USDCAD", "USDJPY", "BRENT", "GOLD", "SILVER", "PLATINUM", "NAT.GAS"};
bool sendRequestToBackend = false;
bool tradeAUDUSD = false;
bool tradeEURUSD = false;
bool tradeGBPUSD = false;
bool tradeUSDCHF = false;
bool tradeUSDCAD = false;
bool tradeUSDJPY = false;
bool tradeBRENT = false;
bool tradeGOLD = false;
bool tradeSILVER = false;
bool tradePLATINUM = false;
bool tradeNAT_GAS = false;
bool closeOrdersToday = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//---

//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---

  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
//---
   if (MarketInfo(Symbol(), MODE_TRADEALLOWED) == 0) {
      Print("Trading not allowed");
      return;
   }

   if (Time[0] != lastTime) {
       Print("Start of a new day");
       lastTime = Time[0];
       shouldTradeToday = true;
       sendRequestToBackend = false;
       for(int i=0; i<11; i++) {
         setTradeFlagForSymbol(symbols[i], false);
       }
       closeOrdersToday = false;
   }
   //Print("Time current " + TimeCurrent() + " | " + Time[0]);

   if (TimeCurrent() > lastTime + 24 * 60 *60 - timeBeforeCloseTreshold * 60) {
      closeAllOrders();
      closeAllOrders();
   }
   bool allSymbolsAreSync = true;
   for(int i=0; i<11; i++) {
     string symbol = symbols[i];
     if (Time[0] != iTime(symbol, PERIOD_D1, 0)) {
       allSymbolsAreSync = false;
       // Print("Time[0]=" + Time[0] + " symbol " + symbol + " time=" + iTime(symbol, PERIOD_D1, 0));
     }
   }
   // Print("All symbols sync check = " + allSymbolsAreSync);
   if (!allSymbolsAreSync && TimeCurrent() < lastTime + 20 * 60) {
     return;
   }
   // Print("symbols are synced");

   if (TimeCurrent() > lastTime + 4 * 60 * 60 && shouldTradeToday) {
      if (getTradeFlagForSymbol(Symbol()) == false) {
         Print("Too late for trading: " + TimeCurrent() + " | " + (lastTime + 2 * 60 * 60));
      }
      shouldTradeToday = false;
      for(int i=0; i<11; i++) {
         setTradeFlagForSymbol(symbols[i], true);
      }
   }

   if (!shouldTradeToday) {
      return;
   }
   Print("trade");
   // shouldTradeToday = false;

   if (!closeOrdersToday) {
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeAllOrders();
      closeOrdersToday = true;
   }
   double deposit = AccountBalance();

   if (symbolSatelite == true) {
      if (getTradeFlagForSymbol(Symbol()) == false) {
         int backendDateFile = FileOpen("backendResponseLastDate.txt", FILE_READ);
         string requestDate = FileReadString(backendDateFile);
         FileClose(backendDateFile);
         if (TimeToString(Time[0], TIME_DATE) != requestDate) {
            sendErrorEmal("Error: " + Symbol() + " last date (" + TimeToString(Time[0], TIME_DATE) + ") not equal to backend request date (" + requestDate + ")");
            return;
         }

         int backandFile = FileOpen("backendResponse.txt", FILE_READ);
         string backendString = FileReadString(backandFile);
         FileClose(backandFile);
         if (backendString == "") {
            return;
         }

         JSONParser *fileParser = new JSONParser();
         JSONObject *backendData = fileParser.parse(backendString);

         JSONObject *symbolData = backendData.getObject(Symbol());

         string action = symbolData.getString("deal");

         if (action != "nothing") {
            double sl = symbolData.getDouble("sl");
            int numberOfDeals = symbolData.getInt("numberOfDeals");
            openPosition(Symbol(), sl, numberOfDeals, action, deposit);
         } else {
            setTradeFlagForSymbol(Symbol(), true);
         }

         delete fileParser;
         delete backendData;
      }

      return;
   }

   if (!sendRequestToBackend) {
      JSONObject *symbolsData = new JSONObject();

      for(int i=0; i<11; i++) {
         string symbol = symbols[i];

         JSONObject *symbolData = new JSONObject();
         int timeFrameIndex = 1;
         if (Time[0] != iTime(symbol, PERIOD_D1, 0) && Time[1] == iTime(symbol, PERIOD_D1, 0)) {
            timeFrameIndex = 0;
         }

         symbolData.put("high", new JSONNumber(iHigh(symbol, PERIOD_D1, timeFrameIndex)));
         symbolData.put("low", new JSONNumber(iLow(symbol, PERIOD_D1, timeFrameIndex)));
         symbolData.put("open", new JSONNumber(iOpen(symbol, PERIOD_D1, timeFrameIndex)));
         symbolData.put("close", new JSONNumber(iClose(symbol, PERIOD_D1, timeFrameIndex)));
         symbolData.put("date", new JSONNumber(iTime(symbol, PERIOD_D1, timeFrameIndex) * 1000));

         symbolsData.put(symbol, symbolData);
      }

      int timeout = 20000;
      char result[], post[];
      string url = "https://m8oa2tz290.execute-api.us-east-2.amazonaws.com/dev/predict";
      string responseHeader;
      StringToCharArray(symbolsData.toString(), post);


      int res = WebRequest("POST", url, NULL, timeout, post, result, responseHeader);
      // SendMail("from fx pro", "test message");
      sendRequestToBackend = true;
      delete symbolsData;

      JSONParser *parser = new JSONParser();
      JSONValue *response = parser.parse(CharArrayToString(result));

      if (response.isObject() == false) {
         // wrong payload
         sendErrorEmal("Wrong payload from backend. Error: " + GetLastError());
         for(int i=0; i<11; i++) {
            setTradeFlagForSymbol(symbols[i], true);
         }
         delete parser;
         delete response;
         return;
      }

      JSONObject *payload = response;

      if (res != 200 || StringFind(CharArrayToString(result), "message") != -1) {
         // there was an error
         sendErrorEmal("Error on backend. Error: " + CharArrayToString(result));
         for(int i=0; i<11; i++) {
            setTradeFlagForSymbol(symbols[i], true);
         }
         delete parser;
         delete response;
         return;
      }

      int file = FileOpen("backendResponse.txt", FILE_WRITE);
      FileWriteString(file, payload.toString());
      FileClose(file);

      int fileDate = FileOpen("backendResponseLastDate.txt", FILE_WRITE);
      FileWriteString(fileDate, TimeToString(Time[0], TIME_DATE));
      FileClose(fileDate);
      delete parser;
      delete response;
   }

   if (sendRequestToBackend == true) {
      int backandFile = FileOpen("backendResponse.txt", FILE_READ);
      string backendString = FileReadString(backandFile);
      FileClose(backandFile);
      if (backendString == "") {
         return;
      }

      JSONParser *fileParser = new JSONParser();
      JSONObject *payload = fileParser.parse(backendString);

      for(int i=0; i<11; i++) {
         string symbol = symbols[i];

         if (StringFind("BRENT_GOLD_SILVER_PLATINUM_NAT.GAS", symbol) != -1 || getTradeFlagForSymbol(symbol) == true) {
            continue;
         }

         JSONObject *symbolResponse = payload.getObject(symbol);

         string action = symbolResponse.getString("deal");

         if (action != "nothing") {
            double sl = symbolResponse.getDouble("sl");
            int numberOfDeals = symbolResponse.getInt("numberOfDeals");
            openPosition(symbol, sl, numberOfDeals, action, deposit);
         } else {
            setTradeFlagForSymbol(symbol, true);
         }
      }

      delete fileParser;
      delete payload;
   }


  }
//+------------------------------------------------------------------+


void openPosition(string symbol, double sl, int numberOfDeals, string action, double deposit) {
   int orderTicket = -1;
   int orderType = action == "buy" ? OP_BUY : OP_SELL;
   int slSign = action == "buy" ? -1 : 1;
   double slDiff = NormalizeDouble(sl * slSign, MarketInfo(symbol, MODE_DIGITS));
   double lot = getLotSize(symbol, sl, numberOfDeals, deposit, MarketInfo(symbol, MODE_ASK));

   RefreshRates();
   double openPrice = action == "buy" ? MarketInfo(symbol, MODE_ASK) : MarketInfo(symbol, MODE_BID);
   orderTicket = OrderSend(symbol, orderType, lot, openPrice, 20, openPrice + slDiff, 0, NULL, magicNumber);
   if (lot == 0) {
     sendErrorEmal("Error while open position: " + symbol + " - " + action + " lot: " + lot + ". Error: lot is 0");
     setTradeFlagForSymbol(symbol, true);
     return;
   }
   if (orderTicket < 0) {
     int attempts = 0;
     while (orderTicket < 0 && GetLastError() == 136 && attempts < 5) {
         attempts = attempts + 1;
         RefreshRates();
         openPrice = action == "buy" ? MarketInfo(symbol, MODE_ASK) : MarketInfo(symbol, MODE_BID);
         orderTicket = OrderSend(symbol, orderType, lot, openPrice, 10, openPrice + slDiff, 0, NULL, magicNumber);
         if (orderTicket > 0) {
            setTradeFlagForSymbol(symbol, true);
            return;
         }
      }
      if (orderTicket < 0) {
         sendErrorEmal("Error while open position: " + symbol + " - " + action + " lot: " + lot + ". Error: " + GetLastError());
      } else {
         setTradeFlagForSymbol(symbol, true);
      }
   } else {
      setTradeFlagForSymbol(symbol, true);
   }
}

double getLotSize(string symbol, double sl, int numberOfDeals, double deposit, double price) {
   double minLot = MarketInfo(symbol, MODE_MINLOT);
   int leverage = AccountLeverage();
   double minLotSize = NormalizeDouble(MarketInfo(symbol, MODE_LOTSIZE) * minLot / leverage, 2);

   double volLot = NormalizeDouble(deposit * 0.1 * price / sl / leverage, 2);
   double maxLot = NormalizeDouble(deposit / numberOfDeals , 2);

   double actualMinLotSize = minLotCost;
   if (symbol == "AUDUSD" || symbol == "EURUSD" || symbol == "GBPUSD") {
      actualMinLotSize = minLotCost * price;
   } else if (symbol == "GOLD") {
      actualMinLotSize = price * 50 / 1000;
   } else if (symbol == "SILVER") {
      actualMinLotSize = price * 50 / 10;
   } else if (symbol == "NAT.GAS") {
      actualMinLotSize = price * 10;
   } else if (symbol == "PLATINUM") {
      actualMinLotSize = price / 10;
   } else if (symbol == "BRENT") {
      actualMinLotSize = price;
   }

   double lot = MathFloor(MathMin(volLot, maxLot) / actualMinLotSize) * minLot;
   return lot;
}

void closeAllOrders() {
   for(int i = OrdersTotal(); i >= 0; i--) {
      if(OrderSelect(i,SELECT_BY_POS)==false) continue;
      if (OrderMagicNumber() != magicNumber) continue;

      RefreshRates();
      OrderClose(OrderTicket(), OrderLots(), OrderClosePrice(), 20);
   }
}

void sendErrorEmal(string message) {
   char post[], result[];
   string url = "https://m8oa2tz290.execute-api.us-east-2.amazonaws.com/dev/sendemail";
   string responseHeader;
   StringToCharArray(message, post);
   int timeout = 5000;


   int res = WebRequest("POST", url, NULL, timeout, post, result, responseHeader);
}

bool getTradeFlagForSymbol(string symbol) {
   if (symbol == "AUDUSD") return tradeAUDUSD;
   if (symbol == "EURUSD") return tradeEURUSD;
   if (symbol == "GBPUSD") return tradeGBPUSD;
   if (symbol == "USDCHF") return tradeUSDCHF;
   if (symbol == "USDCAD") return tradeUSDCAD;
   if (symbol == "USDJPY") return tradeUSDJPY;
   if (symbol == "BRENT") return tradeBRENT;
   if (symbol == "GOLD") return tradeGOLD;
   if (symbol == "SILVER") return tradeSILVER;
   if (symbol == "PLATINUM") return tradePLATINUM;
   if (symbol == "NAT.GAS") return tradeNAT_GAS;

   return true;
}

void setTradeFlagForSymbol(string symbol, bool value) {
   if (symbol == "AUDUSD") tradeAUDUSD = value;
   if (symbol == "EURUSD") tradeEURUSD = value;
   if (symbol == "GBPUSD") tradeGBPUSD = value;
   if (symbol == "USDCHF") tradeUSDCHF = value;
   if (symbol == "USDCAD") tradeUSDCAD = value;
   if (symbol == "USDJPY") tradeUSDJPY = value;
   if (symbol == "BRENT") tradeBRENT = value;
   if (symbol == "GOLD") tradeGOLD = value;
   if (symbol == "SILVER") tradeSILVER = value;
   if (symbol == "PLATINUM") tradePLATINUM = value;
   if (symbol == "NAT.GAS") tradeNAT_GAS = value;
}
