const Api_key = `6268ba4f566c3245405fb2c04bef2f4aebc83896d96fd55cf93e4f041c0bc5de`;

const tickersHandler = new Map();
//websocket
const Aggregate_Index = "5";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${Api_key}`
);
//messages that can be reseived
const Invalid_Sub = "INVALID_SUB";
let BTCprice = null;
//broadcast
const bc = new BroadcastChannel("main");
bc.addEventListener("message", (e) => {
  if (socket.readyState !== WebSocket.OPEN) {
    const {
      TYPE: type,
      FROMSYMBOL: currency,
      PRICE: newPrice,
      TOSYMBOL: sym,
    } = JSON.parse(e.data);
    if (type != Aggregate_Index || newPrice === undefined) {
      return;
    }
    //Broadcast changes if BTC->USD
    const handlers = tickersHandler.get(currency) ?? [];
    if (sym === "BTC") {
      handlers.forEach((fn) => fn(newPrice * BTCprice));
    } else {
      handlers.forEach((fn) => fn(newPrice));
    }
  }
});

//
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: param,
    TOSYMBOL: sym,
  } = JSON.parse(e.data);
  // if (type != Aggregate_Index || newPrice === undefined) {
  //   return;
  // }
  //+parce BTC->USD logic
  const handlers = tickersHandler.get(currency) ?? [];
  switch (type) {
    case "5":
      if (newPrice === undefined) {
        return;
      } else {
        if (sym === "USD") {
          if (currency === "BTC") {
            BTCprice = newPrice;
          }
          bc.postMessage(e.data);
          handlers.forEach((fn) => fn(newPrice));
        } else if (sym === "BTC") {
          bc.postMessage(e.data);
          handlers.forEach((fn) => fn(newPrice * BTCprice));
        }
      }
      break;
    case "500":
      if (message === Invalid_Sub) {
        const curType = param.split("~");
        console.log(curType);
        if (curType[3] === "BTC") {
          break;
        } else {
          subscribeOnTickerWs("BTC");
          subscribeOnTickerWs(curType[2], "BTC");
        }
      }
      break;
    default:
      break;
  }
});

//ws subscribe
function subscribeToWs(message) {
  const stringifyMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifyMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifyMessage);
    },
    { once: true }
  );
}
function subscribeOnTickerWs(ticker, tsym = "USD") {
  subscribeToWs({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${tsym}`],
  });
}
function unsubsctibeOnTickerWs(ticker, tsym = "USD") {
  subscribeToWs({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${tsym}`],
  });
}
//load coinlist from the server
export const loadCoinlist = () =>
  fetch(`
https://min-api.cryptocompare.com/data/all/coinlist?summary=true`);
//subscribe features(pattern watcher)
export const subscribeOnTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) ?? [];
  tickersHandler.set(ticker, [...subscriber, cb]);
  subscribeOnTickerWs(ticker);
};

export const unsubscribeOnTicker = (ticker) => {
  tickersHandler.delete(ticker);
  unsubsctibeOnTickerWs(ticker);
};

//just for check
window.ticker = tickersHandler;
