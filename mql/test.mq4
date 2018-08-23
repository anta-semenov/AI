//+------------------------------------------------------------------+
//|                                                         test.mq4 |
//|                        Copyright 2018, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2018, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

#include <hash.mqh>
#include <json.mqh>

//+------------------------------------------------------------------+
//| Script program start function                                    |
//+------------------------------------------------------------------+
void OnStart()
  {
//---
   //closeAllOrders();
   string symbols[11] = {"AUDUSD", "EURUSD", "GBPUSD", "USDCHF", "USDCAD", "USDJPY", "BRENT", "GOLD", "#Wheat_U8", "#Soybean_U8", "#ExxonMobil"};
   JSONObject *symbolsData = new JSONObject();
   
   for(int i=0; i<11; i++) {
      string symbol = symbols[i];
      
      JSONObject *dayData = new JSONObject();
      
      for (int k=1; k<=43; k++) {
         JSONObject *symbolData = new JSONObject();
         
         symbolData.put("high", new JSONNumber(iHigh(symbol, PERIOD_D1, k)));
         symbolData.put("low", new JSONNumber(iLow(symbol, PERIOD_D1, k)));
         symbolData.put("open", new JSONNumber(iOpen(symbol, PERIOD_D1, k)));
         symbolData.put("close", new JSONNumber(iClose(symbol, PERIOD_D1, k)));
         symbolData.put("date", new JSONNumber(iTime(symbol, PERIOD_D1, k) * 1000));
         
         dayData.put(IntegerToString(k), symbolData);
      }
   
      
      
      symbolsData.put(symbol, dayData);
   }
   
   //printf(symbolsData.toString());
   int file = FileOpen("data.txt", FILE_WRITE);
   FileWriteString(file, symbolsData.toString());
  
  /*
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
   
   if (payload.getString("message") != "") {
      // there was an error
      return;
   }
   
   double deposit = AccountBalance();
   for(int i=0; i<11; i++) {
      string symbol = symbols[i];
      
      JSONObject *symbolResponse = payload.getObject(symbol);
      
      string action = symbolResponse.getString("deal");
      
      if (action != "nothing") {
         double sl = symbolResponse.getDouble("sl");
         int numberOfDeals = symbolResponse.getInt("numberOfDeals");
         openPosition(symbol, sl, numberOfDeals, action, deposit);
      }
   }*/

   
  }
//+------------------------------------------------------------------+

void openPosition(string symbol, double sl, int numberOfDeals, string action, double deposit) {
   int orderTicket = -1;
   int orderType = action == "buy" ? OP_BUY : OP_SELL;
   int slSign = action == "buy" ? -1 : 1;
   double slDiff = NormalizeDouble(sl * slSign, MarketInfo(symbol, MODE_DIGITS)); 
   double lot = getLotSize(symbol, sl, numberOfDeals, deposit, MarketInfo(symbol, MODE_ASK));
   
   while(orderTicket == -1) {
      double openPrice = action == "buy" ? MarketInfo(symbol, MODE_ASK) : MarketInfo(symbol, MODE_BID);
      orderTicket = OrderSend(symbol, orderType, lot, openPrice, 10, openPrice + slDiff, 0);         
   }
}

double getLotSize(string symbol, double sl, int numberOfDeals, double deposit, double price) {
   double minLot = MarketInfo(symbol, MODE_MINLOT);
   int leverage = AccountLeverage();
   double minLotSize = NormalizeDouble(MarketInfo(symbol, MODE_LOTSIZE) * minLot / leverage, 2);
   
   double volLot = NormalizeDouble(deposit * 0.1 * price / sl / leverage, 2);
   double maxLot = NormalizeDouble(deposit / numberOfDeals , 2);
   
   double lot = MathFloor(MathMax(volLot, maxLot) / minLotSize * minLot * 100) / 100;
   return lot;
}

void closeAllOrders() {
   for(int i = OrdersTotal(); i >= 0; i--) {
      if(OrderSelect(i,SELECT_BY_POS)==false) continue;
      
      bool success = false;
      while (success == false) {
         success = OrderClose(OrderTicket(), OrderLots(), OrderClosePrice(), 10); 
      }
   }
}