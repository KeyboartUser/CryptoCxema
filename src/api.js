const Api_key = `6268ba4f566c3245405fb2c04bef2f4aebc83896d96fd55cf93e4f041c0bc5de`;

const tickersHandler = new Map();
//websocket
const Aggregate_Index = "5";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${Api_key}`
);
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type != Aggregate_Index || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandler.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
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

window.ticker = tickersHandler;
