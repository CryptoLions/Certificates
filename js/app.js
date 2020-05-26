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


var net = {
	blockchain:'eos',
	chainId: CHAIN.chainId,
	host: CHAIN.hosts[CHAIN.chainHost].host,    //jungle.eosbcn.com:8080 jungle.atticlab.net:8888
	port: CHAIN.hosts[CHAIN.chainHost].port,
	protocol: CHAIN.hosts[CHAIN.chainHost].protocol,
	expireInSeconds: CHAIN.expireInSeconds,
	broadcast: true,
	verbose: true
}

ScatterJS.plugins( new ScatterEOS() );
var network = ScatterJS.Network.fromJson(net);


var scatter;
var eos;
var account;
var lastPage;
var dappinfo;
var myoffers = {};
var pageTitle = "Certificates HUB ";


var spinner = '<div class="spinner-border text-success" role="status"> <span class="sr-only">Loading...</span></div>';



window.onload = (event) => {
	init();
};


//window.addEventListener(orientationEvent, function() {  resizeScreen(); }, false);

function init(){

	try {
		ScatterJS.scatter.connect("certificates").then(function(connected) {

		if (!connected) return
		scatter = ScatterJS.scatter;
		scatterLogin();
		window.ScatterJS = null; // Don't forget to do this!

		});
	} catch (error) {
		//console.log(error);
		showErrorMessage(error, "topErrorMessage");
	}



	ProcessLocation();
	mainEvents();

				
	
				
	
}

function mainEvents(){
	$(window).on('hashchange', ProcessLocation);
	
	
	$("#btn_login").click(scatterLogin);
	$("#btn_logout").click(scatterLogout);
	$("#btn_CertViewBlock_print").click(function(){window.print();});
	
	$("#btn_issueCert_clear").click(CertViewClearForm);
	
	$("#btn_SeatchPage_search").click(initSearch);
	
	$( "#CertViewBlock_search_input" ).keypress(function(event) {
		if ( event.which == 13 ) {
			//alert($( "#chatInput" ).val() );
			initSearch();
			this.blur();
		}
	});
}


function ProcessLocation(){
	var location_hash = location.hash;
	var location_data = [];
	
	if (location_hash.indexOf("/")){
		location_data = location_hash.split("/");
		location_hash = location_data[0];
	}

	var selectedMenu = $('.active');
	selectedMenu.removeClass('active');
	
	hideLastPage();
	
	switch (location_hash) {
		default:
		case '#home':			
			$("#nav_home").addClass('active');
			
			HomePage();
			
			break;

		case '#regIssuer':
			$("#nav_regIssuer").addClass('active');
			regIssuerPage();
			break;

		case '#certIssue':
			$("#nav_issueCert").addClass('active');
			certIssuePage();
			break;

		case '#certSearch':
			$("#nav_searchCert").addClass('active');
			certSearchPage(location_data);
			break;

		case '#certView':
			//$("#nav_searchCert").addClass('active');
			certViewPage(location_data);
			break;

			


	}
}

//-- MENU PAGES ----------------------------------------------------
function setPageTitle( text ){
	window.document.title = pageTitle + " - " + text;
}

var knownAuthor = {};

async function HomePage(){
	$("#TopText").show();
	
	setPageTitle("Home");
	$("#HomePage_MyCerts_pending").hide();
	$("#HomePage_MyCerts").html("");
	
	knownAuthor = {};
	//showDefPage("Certificates HUB", "Welcome... Home page", "");	
	//
	showPage("#HomePage");
	var MyAssetsLoadMore = 0; //ID res.more==1:res.next_key
	certs_html = "";
	
	$("#HomePage_MyCerts_pending_data").html("");

	 
	


	
	if (account) {
		await showClaims(account.name, "HomePage_MyCerts");	
		$("#HomePage_MyCerts").html("");	
		
		myoffers_ = await getTable2 ("simpleassets", "simpleassets", "nttoffers", 2, "owner", "i64", account.name, account.name, 200);
		for (var i in myoffers_.rows)
			myoffers[myoffers_.rows[i].assetid] = myoffers_.rows[i];
		console.log(myoffers);
		
		await showLicenses (account.name, MyAssetsLoadMore, "HomePage_MyCerts");
		
	} else {
		$("#HomePage_MyCerts").html("Please log in"); 
		$("#HomePage_MyCerts_pending_data").html(" ");
		$("#HomePage_MyCerts_more").hide();
	}
	
	
}



async function showClaims( offeredto, outputid ){
	$("#" + outputid + "_pending_data").html("");
	var myclaims = await getTable2 ("simpleassets", "simpleassets", "nttoffers", 3, "offeredto", "i64", offeredto, offeredto, 20);
	
	//console.log(myclaims);
	
	if (myclaims && myclaims.rows && myclaims.rows.length > 0){
		$("#" + outputid + "_pending").show();
	
		cert = {mdata:{}, idata:{}}
		
		for (var o_ in myclaims.rows) {
			
			cert.id = myclaims.rows[o_].assetid;

			cert.issuer = myclaims.rows[o_].owner;	
			cert.category = "..";
			cert.owner = offeredto;

			//var cert_info_ = await getTable2 ("simpleassets", myclaims.rows[o_].owner, "snttassets", 1, "",  "i64", myclaims.rows[o_].assetid, "", 1);
			//if (cert_info_ && cert_info_.rows && cert_info_.rows[0]){
			//	console.log(cert_info_.rows[0])
			//}
			
			
			$("#" + outputid + "_pending_data").append(showLicenses_OneCert( cert ));
			
			//$("#HomePage_MyCert_" + myclaims.rows[o_].assetid).click( function () { window.open($("#"+this.id+"_link").attr('href'), "_blank", ""); return false;} )
			$("#HomePage_MyCert_" + myclaims.rows[o_].assetid).click( function () { window.location = $("#"+this.id+"_link").attr('href');} )
		}
	}		
}
	
	
	
	
async function showLicenses(scope, lBound, outputid ){

		
		$("#" + outputid).show();	
		
		
		var mycerts = await getTable2 ("simpleassets", scope, "snttassets", 1, "",  "i64", lBound, "", 5);
		//console.log(mycerts);
			
		for (var c in mycerts.rows) {
			
			cert = {};
			
			idata = JSON.parse(mycerts.rows[c].idata);
			mdata = JSON.parse(mycerts.rows[c].mdata);
			
			if (idata.name)	cert.name = idata.name;
			if (mdata.img)	cert.img = mdata.img;
		
			
			if (! knownAuthor[mycerts.rows[c].author] ) {
				knownAuthor[mycerts.rows[c].author] = await getIsuerInfo(mycerts.rows[c].author);
			}
			
			cert.id = mycerts.rows[c].id;
			cert.institution = knownAuthor[mycerts.rows[c].author].dappinfo.name;
			cert.issuer = mycerts.rows[c].author;	
			cert.category = mycerts.rows[c].category;
			cert.owner = scope
			
			$("#" + outputid).append(showLicenses_OneCert( cert ));
			
			qr_link = SITEURL + "#certView/" + cert.issuer + "/" + scope + "/" + cert.id;
			
			$("#HomePage_MyCert_qr_" + cert.id).qrcode({width: 256, height: 256, text: qr_link});
			//console.log(mycerts.rows[c]);
			
			//$("#HomePage_MyCert_" + cert.id).click( function () { window.open($("#"+this.id+"_link").attr('href'), "_blank", ""); } )
			$("#HomePage_MyCert_" + cert.id).click( function () { window.location = $("#"+this.id+"_link").attr('href');} )
			
		}	
		
		if ( mycerts.more ) {
			$("#" + outputid + "_more").val(mycerts.next_key);
			$("#" + outputid + "_more").unbind();
			$("#" + outputid + "_more").click(
				function(){	showLicenses(scope, $("#" + outputid + "_more").val(), outputid ) }
			);
			
			$("#" + outputid + "_more").show();
		} else {
			$("#" + outputid + "_more").hide();
		}
}
/*
function showLicenses_loadMore(){
	//console.log($("#HomePage_MyCerts_more").val())
	showLicenses($("#HomePage_MyCerts_more").val());
}
*/


function showLicenses_OneCert( data ){

	var url =  "#certView/" + cert.issuer + "/" + data.owner + "/" + cert.id;;

	var urlFullView = SITEURL + url;
	
	certName = "<BR>";
	certImg = "images/noimage.jpg";
	
	if (data.name) certName = 'Name of certificate: ' + escapeHtml(data.name) + '<BR>';
	if (data.img) certImg = data.img;
	
	
	var badge_awating_claim = "";	
	var badge_awating_claim_ = '<span class="badge badge-pill badge-warning">Offered for claim</span>'
	
	
	if (myoffers[data.id]) 
		badge_awating_claim = badge_awating_claim_;
	
	
	var oneLicRow = '\
		<div class="row  py-2 HomePage_MyCert_row" id="HomePage_MyCert_' + data.id + '">\
			<div class="col-md-2 text-center">\
				<img style="max-width:90%; max-height:80%" src="' + certImg + '" class="" alt="' + data.id + '" title="' +  certName +'">\
			</div>\
			<div class="col-md-8 align-middle">\
				<h5 class="mt-0"><a id="HomePage_MyCert_' + data.id + '_link" href="' + url + '"># ' + data.id + '</a>   ' + badge_awating_claim + '  </h5>\
				'+ certName +'\
				Institution: ' + escapeHtml(data.institution) + ' [ type: ' + escapeHtml(data.category)+ ' ]<BR>\
				Issuer: ' + data.issuer + '<BR>\
			</div>\
			<div class="col-md-2 align-items-center">\
				<BR>\
				<div class="thumbnail HomePage_MyCert_qr" id="HomePage_MyCert_qr_' + data.id + '"> </div>\
			</div>\
		</div>\
	'
	return oneLicRow;
	
}


async function regIssuerPage(){
	$("#TopText").hide();

	setPageTitle("Register as issuer");
	
	if (account) {
		var authorRes = await getTable ("simpleassets", "simpleassets", "authors", 1, "", "i64", account.name, account.name, 1);
		//console.log(authorRes);
		
		//$("#inp_regI_institution").val(account.name);
		//console.log(authorRes.rows.length);
		if (authorRes.rows.length > 0) {
			$("#btn_regIssuer").unbind();
			$("#btn_regIssuer").click(updIssuer);	 //rmIssuer
			$("#btn_regIssuer_edit").click(issuerEditBtn);
			$("#btn_regIssuer_remove").click(issuerRemoveBtn);
			
			dappinfo = JSON.parse(authorRes.rows[0].dappinfo);
			
			$("#issuerView_name").html(dappinfo.name);
			$("#issuerView_logo").attr({ "src": dappinfo.logo });
			$("#issuerView_info").html(dappinfo.info);
			$("#issuerView_cats").html(dappinfo.ctypes);
			$("#issuerView_url").html(dappinfo.url);
			$("#issuerView_url").attr("href", dappinfo.url);
			
			
			$("#issuerRegInfo").show();
			$("#issuerRegPageForm").hide();
			
		} else {
			$("#btn_regIssuer").unbind();
			$("#btn_regIssuer").click(regIssuer);	
			$("#issuerRegInfo").hide();
			$("#issuerRegPageForm").show();
			
		}

		showPage("#issuerRegPage");
	} else {
		$("#TopText").hide();
		showDefPage("Register as Issuer", "Please Log in . . .", "") ;					
	}
}


async function certIssuePage(){
	$("#TopText").hide();

	setPageTitle("Issue Certificate");

	if (account) {
		var authorRes = await getTable ("simpleassets", "simpleassets", "authors", 1, "", "i64", account.name, account.name+"a", 1);
		if (authorRes.rows.length > 0) {
			dappinfo = JSON.parse(authorRes.rows[0].dappinfo);
			$("#issueCert_institution").html(escapeHtml(dappinfo.name));
			$("#issueCert_type").html(escapeHtml(dappinfo.ctypes[0]));
		} else {
			showDefPage("Issue Certificate", "Please register as Issuer first.", "") ;
			return;
		}
		
		showPage("#issueCertPage");
	} else {
		$("#TopText").hide();
		showDefPage("Issue Certificate", "Please Log in . . .", "") ;					
		return;
	}
	
	var idata_inc = 1;	
	var mdata_inc = 1;

	$("#inp_issueCert_fixedadd").unbind();
	$("#inp_issueCert_fixedadd").click(function(){
			var idatak = $("#inp_issueCert_fixedadd_key").val();
			var idatav = $("#inp_issueCert_fixedadd_val").val();

			if (! issueCertificate_validate(true) ) 
				return;
		
			
			
			
			idata_row = '\
			<div class="form-row " id="idata_' + idata_inc + '">\
				<div class="form-group col-md-4">\
					<input type="text" class="form-control form-control-lg bg-light text-dark idatak" id="inp_issueCert_fixedadd_key_' + idata_inc + '" aria-describedby="inp_issueCert_fixedadd_key_' + idata_inc + '" value="' + idatak + '">\
					<div class="invalid-feedback" id="inp_issueCert_fixedadd_key_' + idata_inc + '_fb">  Looks good! </div>\
				</div>\
				<div class="form-group col-md-4">\
					<input type="text" class="form-control form-control-lg bg-light text-dark idatav" id="inp_issueCert_fixedadd_val_' + idata_inc + '" aria-describedby="inp_issueCert_fixedadd_val_' + idata_inc + '" value="' + idatav + '">\
					<div class="invalid-feedback" id="inp_issueCert_fixedadd_val_' + idata_inc + '_fb">  Looks good! </div>\
				</div>\
				<div class="form-group col-md-1 align-self-center">\
					<button type="button" class="btn btn-danger" id="inp_issueCert_fixeddel_' + idata_inc + '" value="idata_' + idata_inc + '"> Х </button>\
				</div>\
			</div>\
			';
			$("#idata").append(idata_row);
			
			$("#inp_issueCert_fixeddel_" + idata_inc).click(function(){  $("#"+this.value).remove(); })
		
			$("#inp_issueCert_fixedadd_key").val("");
			$("#inp_issueCert_fixedadd_val").val("");
		
			idata_inc++;
	});
	
	$("#inp_issueCert_mutabledadd").unbind();
	$("#inp_issueCert_mutabledadd").click(function(){
			var mdatak = $("#inp_issueCert_mutableadd_key").val();
			var mdatav = $("#inp_issueCert_mutableadd_val").val();

			if (! issueCertificate_validate(true) ) 
				return;
			
			mdata_row = '\
			<div class="form-row" id="mdata_' + mdata_inc + '">\
				<div class="form-group col-md-4">\
					<input type="text" class="form-control form-control-lg bg-light text-dark mdatak" id="inp_issueCert_mutableadd_key_' + mdata_inc + '" aria-describedby="inp_issueCert_mutableadd_key_' + mdata_inc + '" value="' + mdatak + '">\
					<div class="invalid-feedback" id="inp_issueCert_mutableadd_key_' + mdata_inc + '_fb">  Looks good! </div>\
				</div>\
				<div class="form-group col-md-4">\
					<input type="text" class="form-control form-control-lg bg-light text-dark mdatav" id="inp_issueCert_mutableadd_val_' + mdata_inc + '" aria-describedby="inp_issueCert_mutableadd_val_' + mdata_inc + '" value="' + mdatav + '">\
					<div class="invalid-feedback" id="inp_issueCert_mutableadd_val_' + mdata_inc + '_fb">  Looks good! </div>\
				</div>\
				<div class="form-group col-md-1 align-self-center">\
					<button type="button" class="btn btn-danger" id="inp_issueCert_mutabledel_' + mdata_inc + '" value="mdata_' + mdata_inc + '"> Х </button>\
				</div>\
			</div>\
			';
			$("#mdata").append(mdata_row);
			
			$("#inp_issueCert_mutabledel_" + mdata_inc).click(function(){  
				
				$("#"+this.value).remove(); 
				
			})
		
			$("#inp_issueCert_mutableadd_key").val("");
			$("#inp_issueCert_mutableadd_val").val("");
		
			mdata_inc++;
	});
	$("#btn_issueCert").unbind();
	$("#btn_issueCert").click(issueCertificate);	 //rmIssuer
}

async function certViewPage(data){
	$("#TopText").hide();
	
	var isNotClaimed = false;
	var isOfferedTo = "";
	var certificate;
	var issuer;
	var dappinfo;
	
	$("#btn_CertViewBlock_claim").hide();
	$("#CertViewBlock_notClaimed").hide();
	$("#btn_CertViewBlock_burn").hide();
	$("#btn_CertViewBlock_offerCancel").hide();
	
	if (data.length > 2 ) {
		var author = data[1];
		var owner = data[2];
		var assetid = data[3];
	
		setPageTitle("View Certificate #" + assetid);
		
		var issuer = await getIsuerInfo(author);
				
		certificate = await getTable2 ("simpleassets", owner, "snttassets", 1, "", "i64", assetid, assetid, 1);		
		if ( !certificate ||  certificate.rows.length == 0 )
			certificate = await getTable2 ("simpleassets", author, "snttassets", 1, "", "i64", assetid, assetid, 1);
		
		
		if ( !certificate ||  certificate.rows.length == 0 )
			showErrorMessage("Certificate not found", "topErrorMessage");
		
		
		if ( certificate.rows.length > 0 ) {

			offer = await getTable2 ("simpleassets", "simpleassets", "nttoffers", 1, "", "i64", assetid, assetid, 1);
			
			if (offer && offer.rows && offer.rows.length > 0){
			
				isNotClaimed = true;
				
				$("#CertViewBlock_notClaimed").show();
				isOfferedTo = offer.rows[0].offeredto;
				if (account && account.name == isOfferedTo ) { 
					$("#btn_CertViewBlock_claim").unbind();
					$("#btn_CertViewBlock_claim").val(certificate.rows[0].id);					
					$("#btn_CertViewBlock_claim").click(claimCertificate_action);
					$("#btn_CertViewBlock_claim").show();
				} else 	if (account && account.name == offer.rows[0].owner ) { 
					$("#btn_CertViewBlock_burn").val(certificate.rows[0].id);
					$("#btn_CertViewBlock_offerCancel").unbind();
					$("#btn_CertViewBlock_offerCancel").click(burnCertificate);
					$("#btn_CertViewBlock_offerCancel").show();
				}
			}		

			$("#CertView_qr").html("");

			qr_link = SITEURL + "#certView/" + author + "/" + owner + "/" + assetid;
			$("#CertView_qr").qrcode(qr_link);
			
			mdata = JSON.parse(certificate.rows[0].mdata)
			idata = JSON.parse(certificate.rows[0].idata)
			
			if (isNotClaimed) {
				$("#CertViewBlock_owner").html(isOfferedTo);
			} else {
				$("#CertViewBlock_owner").html(certificate.rows[0].owner);
				if (account && certificate.rows[0].owner == account.name) {
					$("#btn_CertViewBlock_burn").unbind();
					$("#btn_CertViewBlock_burn").val(certificate.rows[0].id);
					$("#btn_CertViewBlock_burn").click(burnCertificate);
					$("#btn_CertViewBlock_burn").show();
				}
			}
			$("#CertViewBlock_cat").html(escapeHtml(certificate.rows[0].category));
			$("#CertViewBlock_name").html(escapeHtml(issuer.dappinfo.name));  //regautor table
			$("#CertViewBlock_url").attr("href", issuer.dappinfo.url);
			$("#CertViewBlock_url").html(issuer.dappinfo.url);
			$("#CertViewBlock_logo").attr("src", issuer.dappinfo.logo);
			$("#CertViewBlock_issuerinfo").html(issuer.dappinfo.info);
			
			
			$("#CertViewBlock_issuer").html(certificate.rows[0].author);

			
			parma_row = function(key, val) {
				return '<dt class="col-sm-5">' + key + ':</dt>\
						<dd class="col-sm-7">' + val + '  </dd>\
						'
			}
			
			idata_res = "";
			mdata_res = "";
			
			idata_res += parma_row("Certificate ID", certificate.rows[0].id);
			for (var key in idata ) {
				if (key == "name") {
					idata_res += parma_row("Name of certificate", escapeHtml(idata[key]));
					
				} else {					
					idata_res += parma_row(key, escapeHtml(idata[key]));
				}
			}
			
			var noImage = true;
			for (var key in mdata ) {
				if (key == "img") {
					$("#CertView_img").attr("src", mdata[key]);
					noImage = false;
				
				//} else if (key == "") {
				} else {
					mdata_res += parma_row(key, escapeHtml(mdata[key]));
				}
				//console.log(key)				
			}
			
			if (noImage) 
				$("#CertView_img").attr("src", "images/noimage.jpg") 

			$("#CertViewBlock_fixed").html(idata_res);
			$("#CertViewBlock_mutable").html(mdata_res);
			
			showPage("#certViewPage");
			
		} else {
			showDefPage("Certificate view", "Certificate not found", "") ;	
		}
	} else {
			certSearchPage(data);
	}
}
	
async function certSearchPage(data){
	$("#TopText").hide();
	$("#SeatchPage_Certs_data_pending").hide();
	
	setPageTitle("Certificate search");
	showPage("#certSearchPage");
	$("#SeatchPage_Certs_data_more").hide();
	$("#CertViewBlock_search_input").val("");
	
	if (data.length > 1 ) {
		var author = data[1];
		$("#CertViewBlock_search_input").val(author);
		startSearch()
	}
	$("#SeatchPage_Certs_data").html(" ");
	
	
}


function initSearch(){
	var serach_acc = $("#CertViewBlock_search_input").val();
	window.location.hash = "#certSearch/"+serach_acc;
}


function startSearch(){
	
	var serach_acc = $("#CertViewBlock_search_input").val();

	if (serach_acc) {
		$("#SeatchPage_Certs_data").html("");
		$("#HomePage_MyCerts").html("");
		$("#HomePage_MyCerts_pending_data").html(" ");
		$("#SeatchPage_Certs_data_pending").hide();
		$("#SeatchPage_Certs_data_pending_data").html(" ");
		//$("#SeatchPage_Certs_data").hide();
		showClaims(serach_acc, "SeatchPage_Certs_data")
		showLicenses(serach_acc, "", "SeatchPage_Certs_data" );
	}
	
}

//------------------------------------------------------------------

async function getTable(contract, scope, table, index_position, table_key, key_type, lbound, ubound, limit){
	var res = await eos.getTableRows({json:true, code:contract, scope: scope , table: table, limit: limit, table_key: table_key, key_type: key_type, lower_bound: lbound, upper_bound: ubound, index_position: index_position });

	return res;	
}


async function getTable2(contract, scope, table, index_position, table_key, key_type, lbound, ubound, limit){
		var res;
		
		var tableOptions = {
				json: true,
				code: contract,
				scope: scope,
				table:table,
				key_type: key_type,
				index_position: index_position,
				table_key: table_key,
				lower_bound: lbound,
				upper_bound: ubound,
				limit: limit
		}
		
		
		
		try {
			let res_ =  await makeRequest("POST", api_url + "/v1/chain/get_table_rows", JSON.stringify(tableOptions));
			res = JSON.parse(res_);
		} catch (e) {
			console.log(e);		
			showErrorMessage(e.message, "topErrorMessage");
			return false;
		}
		
		return res;
}




function onUserLogin(){
	$("#username").html(account.name + ",");

	ProcessLocation();
}
	




function scatterLogin(){
	scatter.getIdentity({accounts: [network]}).then(function(identity) {

		account = identity.accounts.find(x => x.blockchain === 'eos');

		const eosOptions = { expireInSeconds: 20, broadcast: true, verbose: true };
		eos = scatter.eos(network, Eos, net, eosOptions);

		
		onUserLogin();
		
				
		showUserInterface(true);

	}).catch(error => {
        $("#HomePage_MyCerts").html("Please Log in");
		showErrorMessage(error.message, "topErrorMessage");		
        
    });
	
}


function scatterLogout(){

	scatter.forgetIdentity().then(function(){
		showUserInterface(false);
		account = null;
		ProcessLocation();

	});

	return false;
}

//----------------------------------------------------------------





//------------
function setFormValidate(form, state){
	if (state){
		$('#'+form)[0].classList.add('was-validated');	
		
	} else {
		$('#'+form)[0].classList.remove('was-validated');		
		
	}
}

function setFeedBack(objectid, text_, isError){
	
	$('#'+objectid+"_fb").html(text_)
	if (isError) {
		$('#'+objectid).addClass("is-invalid");
		$('#'+objectid+"_fb").attr('class','invalid-feedback');
		
		
	} else {
		$('#'+objectid).removeClass("is-invalid");
		$('#'+objectid+"_fb").attr('class','valid-feedback');
	}
	
}




function showErrorMessage(msg, object){
	$("#"+object).html(msg);
	$("#"+object).show();
	
	setTimeout(function () {$("#"+object).hide()}, 5000);
	
}

function CertViewClearForm (){
	$("#inp_issueCert_name").val("");
	$("#inp_issueCert_img").val("");
	$("#inp_issueCert_owner").val("");
	$('#idata').html("");
	$('#mdata').html("");
	
	$("#inp_issueCert_mutableadd_key").val("");
	$("#inp_issueCert_mutableadd_val").val("");

	$("#inp_issueCert_fixedadd_key").val("");
	$("#inp_issueCert_fixedadd_val").val("");

	return false;
}





async function  getIsuerInfo(issuer){

	var issuerInfo = await getTable2 ("simpleassets", "simpleassets", "authors", 1, "", "i64", issuer, issuer, 1);		

	if (issuerInfo && issuerInfo.rows.length > 0 ){
		var dappinfo = JSON.parse(issuerInfo.rows[0].dappinfo);
		issuerInfo.rows[0].dappinfo = dappinfo;
		return issuerInfo.rows[0];
	}
	
	return false;
	
}
	
//-----------------------------------------------------------------
function hideLastPage () {
	$(lastPage).hide();
}

function showPage( pageID ){
	hideLastPage();
	$(pageID).show();
	lastPage = pageID;	
}


function showDefPage(title, content, footer){
	
	var html = " <h1 class='font-weight-light'>" +title + "</h1> \
				<p class='lead'> " + content + " </p> \
				<p class='lead mb-0'>" + footer + "</p> \
				"
	$("#defaultBlock_content").html(html);
	
	showPage("#defaultPage");
	
}


function showUserInterface(logged){
	
	//document.getElementById("topHeader_AccInfo").style.display = "initial";
			
	if (logged) {
		$("#btn_login").hide();		
		$("#btn_logout").css('display', 'block');
		$("#username").css('display', 'block');		
		$("#HomePage_MyCerts").html(spinner);		
		
	} else {
		
		$("#btn_login").show();
		$("#username").html("");
		$("#btn_logout").css('display', 'none');
		$("#username").css('display', 'none');

		
	}
	
	
}

function showModal(title, body, footer) {
	
	
	
	$("#modalWindow_title").html(title);
	$("#modalWindow_body").html(body);
	$("#modalWindow_footer").html(footer);
	$("#modalWindow").modal('show');
	
}


function confirmModal(title, body, cancelButtonTxt, okButtonTxt, callback) {
		
		footer =  '<button type="button" class="btn btn-secondary" data-dismiss="modal">' + cancelButtonTxt + '</button>'
		footer += '<button type="button" class="btn btn-primary" id="confirmButton" >' + okButtonTxt +  '</button>'
			
		showModal(title, body, footer);
		
		$("#modalWindow").find('#confirmButton').click(function(event) {
			callback();
			$("#modalWindow").modal('hide');
		});

		
  };

//-----------------------------------------------------


function issuerEditBtn(){
	
			
	$("#inp_regI_institution").val(dappinfo.name);
	$("#inp_regI_logourl").val(dappinfo.logo);
	$("#inp_regI_category").val(dappinfo.ctypes[0]);
	$("#inp_regI_website").val(dappinfo.url);
	$("#inp_regI_info").val(dappinfo.info);
	
	
	$("#issuerRegPageForm").show();
	
	return false;
}


function issuerRemoveBtn(){
	var heading = 'Warning ! Please Confirm Delete !';
    var question = 'Please confirm that you wish to remove issuer information.';
    var cancelButtonTxt = 'Cancel';
    var okButtonTxt = 'Confirm';

    var callback = function() {
		rmIssuer();  
    };

    confirmModal(heading, question, cancelButtonTxt, okButtonTxt, callback);

	return false;
}


function burnCertificate(){

	var heading = 'Warning ! Please confirm burning of certifacte  !';
    var question = 'Please confirm that you wish to rburn your certificate (no undo).';
    var cancelButtonTxt = 'Cancel';
    var okButtonTxt = 'Confirm';

    var callback = function() {
		burnCertificate_action();
		
    };

    confirmModal(heading, question, cancelButtonTxt, okButtonTxt, callback);

	return false;
	
}



///--------------------------- Utilites -----------------------------------------

function makeRequest(method, url, params) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(params);
    });
}


function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}


function isJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}


var entityMap = {
  '&': '&amp;',  '<': '&lt;',  '>': '&gt;',  '"': '&quot;',  "'": '&#39;',  '/': '&#x2F;',  '`': '&#x60;',  '=': '&#x3D;'
};
function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}
