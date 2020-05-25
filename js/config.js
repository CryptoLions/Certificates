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
var SITEURL = "https://certs.cryptolions.io/"

var CHAIN = {};

CHAIN.name = "Jungle";
CHAIN.chainId = "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473";
CHAIN.expireInSeconds = 20;
CHAIN.chainHost = 0;

CHAIN.hosts = [
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
			]

CHAIN.V2 = 	[
				{host: "https://junglehistory.cryptolions.io", active: 1},
				{host: "https://jungle.eossweden.org", active: 1}
			]


var api_url = CHAIN.hosts[CHAIN.chainHost].protocol+"://"+CHAIN.hosts[CHAIN.chainHost].host+":"+CHAIN.hosts[CHAIN.chainHost].port;