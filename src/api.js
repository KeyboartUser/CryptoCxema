const Api_Key = `df62ebcd7d74d8da7ec2aa7193dbc75026d631c2206b36255993515a01959dd1`;

const tickersHandler = new Map();
// load ticker from the server
const loadTicker = () => {
  if (!tickersHandler.size) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandler.keys(),
    ].join(",")}&tsyms=USD&api_key=${Api_Key}`
  )
    .then((r) => r.json())
    .then((newr) => {
      const upPrices = Object.fromEntries(
        Object.entries(newr).map(([key, value]) => [key, value.USD])
      );

      Object.entries(upPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandler.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};
//load coinlist from the server
export const loadCoinlist = () =>
  fetch(`
https://min-api.cryptocompare.com/data/all/coinlist?summary=true`);
//subscribe features(pattern watcher)
export const subscribeOnTicker = (ticker, cb) => {
  const subscriber = tickersHandler.get(ticker) ?? [];
  tickersHandler.set(ticker, [...subscriber, cb]);
};

export const unsubscribeOnTicker = (ticker) => {
  tickersHandler.delete(ticker);
};

setInterval(loadTicker, 5000);
window.ticker = tickersHandler;
