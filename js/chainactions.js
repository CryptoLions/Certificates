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
function processError(error_){

	var error = JSON.parse(error_);
	console.error(error);

	var errmsg = ""
	if (error.message)
	    errmsg = error.message
	if (error.error.details[0].message)
	    errmsg = error.error.details[0].message;
	
	showErrorMessage(errmsg, "topErrorMessage");
}

function regIssuer(){
	//console.log("OK");
	data = regIssuer_validate();
	if (!data) return false;
	
	//console.log(data);
	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.authorreg(account.name, JSON.stringify(data), "{}", "{}", { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			//console.log("OK");
			ProcessLocation();
		}).catch(function(error) {
			processError(error);
		});
	});

}

function updIssuer(){
	//console.log("OK");
	data = regIssuer_validate();
	if (!data) return false;
	
	console.log(data);
	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.authorupdate(account.name, JSON.stringify(data), "{}", "{}", { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			ProcessLocation();
		}).catch(function(error) {
		    processError(error);
		});
	});

}



function rmIssuer(){

	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.authorupdate(account.name, "", "", "", { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			//console.log("OK");
			ProcessLocation();
		}).catch(function(error) {
		    processError(error);
		});
	});

}


function issueCertificate(){

	var data = issueCertificate_validate(false);
	
	if ( !data ) return false;
	
	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.createntt(account.name, data.category, data.owner, JSON.stringify(data.idata), JSON.stringify(data.mdata), data.requireClaim, { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			var assetID;
			var traces = res.processed.action_traces[0].inline_traces
			for (var i in traces){
				if (traces[i].act.name == "createnttlog" ) {
					assetID = traces[i].act.data.assetid;
				}
				
			}
			
			console.log(res);
			
			if (data.requireClaim){				
				window.open("#certView/" + account.name + "/" + account.name + "/"+assetID, "_blank", "");
			} else {
				window.open("#certView/" + account.name + "/" + data.owner + "/"+assetID, "_blank", ""); //toolbar=yes,scrollbars=yes,resizable=yes,width=80%
			}
			
			//ProcessLocation();
		}).catch(function(error) {
		    processError(error);
		});
	});
	return false;
	
}



function claimCertificate_action(){
	
	var assetid = $("#btn_CertViewBlock_claim").val();
	console.log(assetid);
	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.claimntt(account.name, [assetid], { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			//console.log("OK");
			ProcessLocation();
			//window.location = "#home"
		}).catch(function(error) {
		    processError(error);
		});
	});
}


function burnCertificate_action(){
	//console.log($("#btn_CertViewBlock_burn").val())
	var assetid = $("#btn_CertViewBlock_burn").val();
	eos.contract(CONTRACT_SA, {accounts: [network]}).then(function( contractr ){
		contractr.burnntt(account.name, [assetid], "", { authorization:[`${account.name}@${account.authority}`] }).then( function(res)  {
			//console.log("OK");
			//ProcessLocation();
			window.location = "#home"
		}).catch(function(error) {
			console.error(error);
			showErrorMessage(error.message, "topErrorMessage");
		});
	});
}


//----------------------- Validation --------------------
function regIssuer_validate(){
	var isValid = true;
	
	var data = {};
	
	
	data.name = $("#inp_regI_institution").val();
	data.logo = $("#inp_regI_logourl").val();
	data.ctypes = [$("#inp_regI_category").val().toLowerCase()];
	data.url = $("#inp_regI_website").val();
	data.info = $("#inp_regI_info").val();
	

	
	if (data.logo.length > 0 && ! validURL(data.logo)){
		isValid = false;	
		setFeedBack("inp_regI_logourl", "Wrong URL to logo", 1)	
	} else {
		setFeedBack("inp_regI_logourl", "Looks good", 0)	
	}
	
	if ( data.ctypes != data.ctypes[0].replace(/[^a-z1-5.]/g,'') || data.ctypes[0].length > 12 || data.ctypes[0].length < 2){
		isValid = false;
		setFeedBack("inp_regI_category", "Wrong type name, no spaces (a-z.1-5  max 12)", 1)	
	} else {
		setFeedBack("inp_regI_category", "Looks good", 0)	
	}
	
	
	if (data.url.length > 0 && ! validURL(data.url)){
		isValid = false;	
		setFeedBack("inp_regI_website", "Wrong URL", 1)	
	} else {
		setFeedBack("inp_regI_website", "Looks good", 0)	
	}
	
	
	
	
	if (isValid )
		return data;
	
	
	return false;	
}




function issueCertificate_validate(dataValidationOnly){
	var isValid = true;
	
	var errorMessage= "";
	
	var data = {};
	data.idata = {};
	data.mdata = {};

	if ( ! dataValidationOnly	) {
		if ($("#inp_issueCert_name").val())
			data.idata.name = $("#inp_issueCert_name").val();
		
		if ($("#inp_issueCert_img").val())
			data.mdata.img  = $("#inp_issueCert_img").val();
		
		
		data.owner = $("#inp_issueCert_owner").val();
		if ( data.owner != data.owner.replace(/[^a-z1-5.]/g,'') || data.owner.length > 12 || data.owner.length < 2){
			isValid = false;
			setFeedBack("inp_issueCert_owner", "Wrong account name (a-z.1-5  max 12)", 1)	
		} else {
			setFeedBack("inp_issueCert_owner", "Looks good", 0)	
		}
		
		data.requireClaim = 1 * $("#issueCert_form input[type='radio']:checked").val();
		
		data.category = dappinfo.ctypes[0];
		
	

		if (data.mdata.img && data.mdata.img != "" &&  !validURL(data.mdata.img)) {
			isValid = false;
			setFeedBack("inp_issueCert_img", "Invalid URL for certificate image", 1)	
		} else {
			setFeedBack("inp_issueCert_img", "Looks good", 0)	
		}
	}	

	
	
	$('#idata').children('.form-row').each(function(  ) {		
		var id = $( this ).find('.idatak').attr('id');
		
		var key = $( this ).find('.idatak').val(); 
		var val = $( this ).find('.idatav').val(); 
	
		if (issueCertificate_validate_check_key( key, id, data )) {
			if (! isNaN(val)) val = val * 1;
			data.idata[key] = val				
		} else {
			isValid = false;
		}
	
		
	});

	$('#mdata').children('.form-row').each(function(  ) {		
		var id = $( this ).find('.mdatak').attr('id');
		
		var key = $( this ).find('.mdatak').val(); 
		var val = $( this ).find('.mdatav').val(); 
		
		if (issueCertificate_validate_check_key( key+"", id+"", data )){
			if (! isNaN(val))  val = val * 1;
			data.mdata[key] = val	
		} else {
			isValid = false;
		}	
		
	});

	
	
	//main inputs checks
	var key = $("#inp_issueCert_fixedadd_key").val(); 
	var val = $("#inp_issueCert_fixedadd_val").val(); 	
	var key_r = issueCertificate_validate_check_key( key, "inp_issueCert_fixedadd_key", data)
	if (key.length > 0  && key_r) {
		data.idata[key] = val;
	} else if (! key_r) {
		isValid = false;
	}

	var key = $("#inp_issueCert_mutableadd_key").val(); 
	var val = $("#inp_issueCert_mutableadd_val").val(); 		
	var key_r = issueCertificate_validate_check_key( key, "inp_issueCert_mutableadd_key", data)
	if (key.length > 0  && key_r) {
		data.mdata[key] = val;
	} else if (! key_r) {
		isValid = false;
	}
		
	
	//if ($('#issueCert_form')[0].checkValidity() === false) {
	//	isValid = false;	
    //}
     
	//setFormValidate("issueCert_form", 1);
	//setTimeout(function(){setFormValidate("issueCert_form", 0);}, 3000);
	
	if ( dataValidationOnly	) return isValid;
	
	if (isValid) return data;
	
	showErrorMessage("Please fix errors to issue certificate", "inp_issueCert_alertMsg");
	
	return false;
	
	
}

function issueCertificate_validate_check_key( key, obj_id, data ){
	var isValid = true;
	
	if ( key != key.replace(/[^a-zA-Z0-9_-]/g,'') || key.length > 32 ){
		isValid = false;
		console.log(obj_id);
		setFeedBack(obj_id, "No spaces, max 32, Chars allowed: A-Z a-z 0-9 _ - ", 1)	
	} else if ( data.idata.hasOwnProperty(key) || data.mdata.hasOwnProperty(key) ){
		isValid = false;
		setFeedBack(obj_id, "Field name already used", 1)	
	} else {
		setFeedBack(obj_id, "", 0)			
	}
	
	return isValid;

}




