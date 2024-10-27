const Api_Key = `df62ebcd7d74d8da7ec2aa7193dbc75026d631c2206b36255993515a01959dd1`;
const Api_key1 = `6268ba4f566c3245405fb2c04bef2f4aebc83896d96fd55cf93e4f041c0bc5de`;

const tickersHandler = new Map();
//websocket
const Aggregate_Index = "5";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${Api_key1}`
);
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type != Aggregate_Index) {
    return;
  }
  const handlers = tickersHandler.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});
// load ticker from the server
// const loadTicker = () => {
//   if (!tickersHandler.size) {
//     return;
//   }

//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//       ...tickersHandler.keys(),
//     ].join(",")}&tsyms=USD&api_key=${Api_Key}`
//   )
//     .then((r) => r.json())
//     .then((newr) => {
//       const upPrices = Object.fromEntries(
//         Object.entries(newr).map(([key, value]) => [key, value.USD])
//       );

//       Object.entries(upPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandler.get(currency) ?? [];
//         handlers.forEach((fn) => fn(newPrice));
//       });
//     });
// };
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
function subscribeOnTickerWs(ticker) {
  subscribeToWs({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}
function unsubsctibeOnTickerWs(ticker) {
  subscribeToWs({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
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

//setInterval(loadTicker, 5000);
window.ticker = tickersHandler;
