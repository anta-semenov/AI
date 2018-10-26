//+------------------------------------------------------------------+
//|                                                  sendDayData.mq4 |
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
      sendErrorEmal("Wrong payload from backend. Error: " + GetLastError());
      return;
   }

   JSONObject *payload = response;

   if (res != 200 || StringFind(CharArrayToString(result), "message") != -1) {
      // there was an error
      sendErrorEmal("Error on backend. Error: " + CharArrayToString(result));
      return;
   }

  }
//+------------------------------------------------------------------+


void sendErrorEmal(string message) {
   char post[], result[];
   string url = "https://m8oa2tz290.execute-api.us-east-2.amazonaws.com/dev/sendemail";
   string responseHeader;
   StringToCharArray(message, post);
   int timeout = 5000;


   int res = WebRequest("POST", url, NULL, timeout, post, result, responseHeader);
}
