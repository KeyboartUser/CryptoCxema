<template>
  <head>
    <link rel="stylesheet" href="app.css">
    </link>
  </head>

  <body>
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <div class="container">
        <section>
          <div class="flex">
            <div class="max-w-xs">
              <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
              <div class="mt-1 relative rounded-md shadow-md">
                <input type="text" name="wallet" id="wallet"
                  v-model = ticker
                  @keydown.enter="add(ticker)"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например DOGE" />
              </div>
              <div v-if="offerlist.length" class="flex bg-white shadow-md p-1 rounded-md  flex-wrap">
                <span v-for="(offer,idx) in offerlist" 
                @click="offerCL(offer)"
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
                  {{ offer }}
                </span>
              </div>
              <div v-if = "chekTick(ticker)"  class="text-sm text-red-600">Такой тикер уже добавлен</div>
            </div>
          </div>
          <button type="button" 
            @click = "add(ticker)"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <!-- Heroicon name: solid/mail -->
            <svg class="-ml-0.5 mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="30" height="30"
              viewBox="0 0 24 24" fill="#ffffff">
              <path
                d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
              </path>
            </svg>
            Добавить
          </button>
        </section>
        <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button  @click="page > 1 ?  page = page -1 : page" class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Назад</button>
          <button v-if="page != validNext && filteredTickers.length>=6" @click="page < validNext? page =Number(page) + 1 : Number(page)" class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Вперед</button>
        </div>
         Фильтр:  <input v-model=filter type="text" id="filter"></input>
        </template>
        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div v-for="t in filteredTickers" 
            :class = "{'border-4' : sel?.name === t?.name ,
              'bg-red-200' : t.price === '-',
            }
            "
            @click=" select(t)"
            :key="t.name"  class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer">
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ t.name }} - USD
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{this.formatPrice(t.price)}}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button @click.stop="EraseSqua(t)"
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#718096"
                  aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"></path>
                </svg>Удалить
              </button>
            </div>
          </dl>
          <hr class="w-full border-t border-gray-600 my-4" />
      </template>
        <section v-if="sel" class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ sel.name }} - USD
          </h3>
          <div  class="flex items-end border-gray-600 border-b border-l h-64">
            <div v-for = "(t,index) in normalizeGraph" :style="{height: `${t}%`}" class="bg-purple-800 border w-10 "></div>
          </div>
          <button  type="button" 
          @click = "sel=null"
          class="absolute top-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="30" height="30" x="0" y="0"
              viewBox="0 0 511.76 511.76" style="enable-background:new 0 0 512 512" xml:space="preserve">
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096" data-original="#000000"></path>
              </g>
            </svg>
          </button>
        </section>
      </div>
    </div>
  </body>

</template>
<script>
import { loadCoinlist } from './api';
import { subscribeOnTicker } from './api';
import { unsubscribeOnTicker } from './api';

//закончил на лоудинге тикеров 1.12.05 видос
export default{
  name: "App",
  data(){
    return{
      ticker: "",
      tickers: [],
      sel: null,
      pricelist: [],
      coinlist: [],
      offerlist: [],
      page: this.windowDataChecker().page,
      filter: this.windowDataChecker().filter,
    };
  },


    created(){
    //url save
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());
    this.page = windowData?.page ?? this.page;
    this.filter = windowData?.filter ?? this.filter;

    // local storage input after update
    // loacalStarage.clear();
    const localTicker = localStorage.getItem("crypto-list");
    if (localTicker.length){
      this.tickers = JSON.parse(localTicker);
      this.tickers.forEach(ticker =>{subscribeOnTicker(ticker.name,  subscribeOnTicker(ticker.name,(newPrice) => this.updateTickers(ticker.name,newPrice)))});
    }
    //PodpeScheke
    this.ldCoin();
  },

  
  watch: {
    ticker(newval,oldval){
      if (this.ticker != ""){
        this.offerlist = [];
        outer: for (let t of this.coinlist){
          if(t[0].includes(this.ticker[0])){
          if(t.includes(this.ticker)){
            if (this.offerlist.length < 4){
              this.offerlist.push(t);
            }else{
              break outer;
            }
          }
        }
      }
    }else{
      this.offerlist = [];
    }
  },


    filter(){
      this.page = 1;
    },


    pageProp(value){
      window.history.pushState(null,
      document.title,
      `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },

  computed: {
/// filter
    startIndex(){
      return (this.page - 1)*6;
    },

    endIndex(){
      return this.page * 6;
    },
    
    filteredTic(){
      return this.tickers.filter(ticker => ticker.name.includes(this.filter.toUpperCase()));
    },
    
    validNext(){
      return (this.filteredTic.length%6===0 ? Math.round(this.filteredTic.length/6) : Math.round(this.filteredTic.length/6)+1);
    },

    filteredTickers(){
      return this.filteredTic.slice(this.startIndex,this.endIndex);
    },

/// graph
    normalizeGraph(){
      let max = Math.max(...this.pricelist);
      let min = Math.min(...this.pricelist);
      if(min === max){
          return this.pricelist.map(() => 50);
        }else{
          return this.pricelist.map((i) => Math.max(((i-min)*100)/(max-min),10));
      }
    },

///URL save
    pageProp(){
      return {page: this.page, filter: this.filter};
    },
///


  },
  methods: {
    offerCL(offer){
      if(!this.chekTick(offer)){
        this.add(offer);
        this.offerlist =[];
      }
    },

     select(ticker){
       if(this.sel?.name != ticker.name){
        this.pricelist = [];
        this.sel = ticker;
       }
     },



     async ldCoin(){
          const f =await loadCoinlist();
          this.coinlist =await f.json();
          this.coinlist = this.coinlist.Data;
          let buff1 =[];
          for (let t of Object.values(this.coinlist)){
            buff1.push(t.Symbol);
          }
          this.coinlist = buff1;
     },


     updateTickers(tickerName,price){
      this.tickers.filter(t => t.name === tickerName).forEach(t => {t.price = price});
      if (this.sel && tickerName === this.sel.name ){
        if (this.pricelist.length < 20){
                  this.pricelist.push(price);
              }else { 
                this.pricelist.pop(0);
                this.pricelist.push(price);
            }
      }
     },

    formatPrice(price){
      if (price === "-"){
        return "-"
      }
      let newPrice = price ? price.toFixed(3) : "-";
      return newPrice;
    },
   
    windowDataChecker(){
      const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());
      return (windowData ?? {page: 1, filter: ""});
    },

    add(ticker){
      if (this.ticker != '' && !this.chekTick(ticker)){
        const SquAre = {name: ticker.trim().toUpperCase(), price: "-", id: null};
        this.tickers.push(SquAre); 
        //this.subscribeSells();
        localStorage.setItem("crypto-list",JSON.stringify(this.tickers));
        subscribeOnTicker(SquAre.name,(newPrice) => this.updateTickers(SquAre.name,newPrice));
        this.ticker = "";
        this.filter = "";
      }else{
        //this.ticker = "";
      }
    },

    EraseSqua(toRem){
    out: for(let i of this.tickers){
        if(i===toRem){
          //clearInterval(i.id);
          unsubscribeOnTicker(toRem.name);
          break out;
        }
      }
     if (toRem === this.sel){
      //clearInterval(this.sel.id);
      unsubscribeOnTicker(toRem.name);
      this.sel = null;
     }
     this.tickers =  this.tickers.filter(t=>t!=toRem);
     localStorage.setItem("crypto-list",JSON.stringify(this.tickers));
    },


     chekTick(ticker){
      for (let t of this.tickers){
        if(ticker.toUpperCase() === t.name){
          return true;
        }
      }
      return false;
    }
  },
}
</script>
<style src="./app.css"></style>
