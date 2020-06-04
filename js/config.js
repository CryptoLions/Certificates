//****************************************************************
//*
//* Created by CryptoLions.io (2020)
//* For EOSIO Hackaton organised by B1
//* 
//* GIT: https://github.com/CryptoLions/Certificates
//*
//* Powered by SimpleAssets
//*  GIT: https://github.com/CryptoLions/SimpleAssets
//*  WEB: http://simpleassets.io
//*
//*****************************************************************/



var CONTRACT_SA = "simpleassets";
var selectedChain = "jungle";

var domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
var subdomains = domain.split(".");

switch (subdomains[0]) {
	default:
	case "jungle": 
		selectedChain = "jungle";
		break;
		
	case "eos": 
		selectedChain = "eos";
		break;
}



var MAINDOMAIN = "certs.cryptolions.io";
var SITEURL = "https://" + selectedChain + "." + MAINDOMAIN;

if ( selectedChain != subdomains[0] ) window.location = SITEURL;


var CHAINS = {
		
		jungle: {
			name : "JUNGLE",
			chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473",
			saContract: "simpleassets",
			expireInSeconds: 20, 
			chainHost: 0,
			
			hosts: [
				  {
						"protocol": "https",
						"host": "jungle2.cryptolions.io",
						"port": 443,
						"active": 1,
						"time": 0.065343
				  },
				  {
						"protocol": "https",
						"host": "jungle.eossweden.org",
						"port": 443,
						"active": 1,
						"time": 0.151274
				  }
			],

			V2: [
				{host: "https://junglehistory.cryptolions.io", active: 1},
				{host: "https://jungle.eossweden.org", active: 1}
			]
		}, 

		eos: {
			name : "EOS",
			chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
			saContract: "simpleassets",
			expireInSeconds: 20, 
			chainHost: 0,
			
			hosts: [
				  {
						"protocol": "https",
						"host": "bp.cryptolions.io",
						"port": 443,
						"active": 1,
						"time": 0.065343
				  },
				  {
						"protocol": "https",
						"host": "api.eossweden.org",
						"port": 443,
						"active": 1,
						"time": 0.151274
				  }
			],

			V2: [
				{host: "https://junglehistory.cryptolions.io", active: 1},
				{host: "https://jungle.eossweden.org", active: 1}
			]
		}
}

var CHAIN = CHAINS[selectedChain];

var api_url = CHAIN.hosts[CHAIN.chainHost].protocol+"://"+CHAIN.hosts[CHAIN.chainHost].host+":"+CHAIN.hosts[CHAIN.chainHost].port;
