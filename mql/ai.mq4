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
   if (Time[0] != lastTime) {
       lastTime = Time[0];
       shouldTradeToday = true;
   }

   if (TimeCurrent() > lastTime + 24 * 60 *60 - timeBeforeCloseTreshold * 60) {
      closeAllOrders();
   }
   if (TimeCurrent() > lastTime + 2 * 60 * 60) {
      shouldTradeToday = false;
   }

   if (!shouldTradeToday) {
      return;
   }
   shouldTradeToday = false;

   closeAllOrders();
   double deposit = AccountBalance();

   if (symbolSatelite == true) {

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
      }

      return;
   }

   string symbols[11] = {"AUDUSD", "EURUSD", "GBPUSD", "USDCHF", "USDCAD", "USDJPY", "BRENT", "GOLD", "SILVER", "PLATINUM", "NAT.GAS"};
   JSONObject *symbolsData = new JSONObject();

   for(int i=0; i<11; i++) {
      string symbol = symbols[i];

      JSONObject *symbolData = new JSONObject();

      symbolData.put("high", new JSONNumber(iHigh(symbol, PERIOD_D1, 1)));
      symbolData.put("low", new JSONNumber(iLow(symbol, PERIOD_D1, 1)));
      symbolData.put("open", new JSONNumber(iOpen(symbol, PERIOD_D1, 1)));
      symbolData.put("close", new JSONNumber(iClose(symbol, PERIOD_D1, 1)));
      symbolData.put("date", new JSONNumber(iTime(symbol, PERIOD_D1, 1) * 1000));

      symbolsData.put(symbol, symbolData);
   }

   int timeout = 20000;
   char result[], post[];
   string url = "https://m8oa2tz290.execute-api.us-east-2.amazonaws.com/dev/predict";
   string responseHeader;
   StringToCharArray(symbolsData.toString(), post);


   int res = WebRequest("POST", url, NULL, timeout, post, result, responseHeader);
   // SendMail("from fx pro", "test message");

   JSONParser *parser = new JSONParser();
   JSONValue *response = parser.parse(CharArrayToString(result));

   if (response.isObject() == false) {
      // wrong payload
      return;
   }

   JSONObject *payload = response;

   if (res != 200 || StringFind(CharArrayToString(result), "message") != -1) {
      // there was an error
      return;
   }

   int file = FileOpen("backendResponse.txt", FILE_WRITE);
   FileWriteString(file, payload.toString());
   FileClose(file);

   for(int i=0; i<11; i++) {
      string symbol = symbols[i];

      if (StringFind("BRENT_GOLD_SILVER_PLATINUM_NAT.GAS", symbol) != -1) {
         continue;
      }

      JSONObject *symbolResponse = payload.getObject(symbol);

      string action = symbolResponse.getString("deal");

      if (action != "nothing") {
         double sl = symbolResponse.getDouble("sl");
         int numberOfDeals = symbolResponse.getInt("numberOfDeals");
         openPosition(symbol, sl, numberOfDeals, action, deposit);
      }
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
   if (orderTicket < 0) {
     int attempts = 0;
     while (orderTicket < 0 && GetLastError() == 136 && attempts < 5) {
         attempts = attempts + 1;
         RefreshRates();
         openPrice = action == "buy" ? MarketInfo(symbol, MODE_ASK) : MarketInfo(symbol, MODE_BID);
         orderTicket = OrderSend(symbol, orderType, lot, openPrice, 10, openPrice + slDiff, 0, NULL, magicNumber);
         if (orderTicket > 0) {
            return;
         }
      }
      if (orderTicket < 0) {
         sendErrorEmal("Error while open position: " + symbol + " - " + action + ". Error: " + GetLastError());
      }
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

      bool success = false;
      while (success == false) {
         RefreshRates();
         success = OrderClose(OrderTicket(), OrderLots(), OrderClosePrice(), 20);
      }
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
